import {Component, Input} from "@angular/core";
import {ModalController, IonicModule} from "@ionic/angular";
import {ImageUploadService} from "../../../core/services/image-upload.service"; // Adjust the path to your service
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: "app-image-upload-modal",
  templateUrl: "./image-upload-modal.component.html",
  styleUrls: ["./image-upload-modal.component.scss"],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ImageUploadModalComponent {
  @Input() collectionName!: string;
  @Input() docId!: string;
  @Input() firestoreLocation!: string; // e.g. 'users/userId/profileImage'
  @Input() imageHeight!: number;
  @Input() imageWidth!: number;
  imagePreview!: SafeUrl | string | ArrayBuffer;
  selectedFile: File | null = null;

  constructor(
    private imageUploadService: ImageUploadService,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
  ) {}

  get imagePreviewString(): string {
    return this.imagePreview as string;
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    this.selectedFile = file;
    const reader = new FileReader();

    reader.onload = () => {
      const unsafeImageUrl = reader.result as string;
      this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
    };

    reader.readAsDataURL(file);
  }

  async uploadImage() {
    try {
      if (this.selectedFile) {
        const downloadURL = await this.imageUploadService.uploadImage(
          this.selectedFile,
          this.firestoreLocation,
          this.collectionName,
          this.docId,
          this.imageWidth,
          this.imageHeight,
        );
        this.modalCtrl.dismiss(downloadURL);
      } else {
        console.error("No file selected for upload.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
