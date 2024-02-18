/***********************************************************************************************
* Nonprofit Social Networking Platform: Allowing Users and Organizations to Collaborate.
* Copyright (C) 2023  ASCENDynamics NFP
*
* This file is part of Nonprofit Social Networking Platform.
*
* Nonprofit Social Networking Platform is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published
* by the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.

* Nonprofit Social Networking Platform is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.

* You should have received a copy of the GNU Affero General Public License
* along with Nonprofit Social Networking Platform.  If not, see <https://www.gnu.org/licenses/>.
***********************************************************************************************/
import {CommonModule} from "@angular/common";
import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {IonicModule} from "@ionic/angular";
import {
  Account,
  Email,
  PhoneNumber,
} from "../../../../../../models/account.model";
import {StoreService} from "../../../../../../core/services/store.service";

@Component({
  selector: "app-group-registration",
  templateUrl: "./group-registration.component.html",
  styleUrls: ["./group-registration.component.scss"],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class GroupRegistrationComponent implements OnChanges {
  @Input() account?: Partial<Account>;
  public maxEmails = 5;
  public maxLinks = 10;
  public maxPhoneNumbers = 5;

  editAccountForm = this.fb.group({
    description: [""],
    tagline: ["", Validators.required],
    name: ["", Validators.required],
    webLinks: this.fb.array([this.createWebLinkFormGroup()]),
    contactInformation: this.fb.group({
      emails: this.fb.array([this.createEmailFormGroup()]),
      phoneNumbers: this.fb.array([this.createPhoneNumberFormGroup()]),
      address: this.fb.group({
        name: [""],
        street: ["", Validators.pattern("^[a-zA-Z0-9\\s,]*$")],
        city: ["", Validators.pattern("^[a-zA-Z\\s]*$")],
        state: ["", Validators.pattern("^[a-zA-Z\\s]*$")],
        zipcode: ["", Validators.pattern("^[0-9]*$")],
        country: ["", Validators.pattern("^[a-zA-Z\\s]*$")],
        // Include formatted and geopoint if needed here, or handle them in your backend logic
      }),
      preferredMethodOfContact: ["Email"],
    }),
    groupDetails: this.fb.group({
      groupType: [],
    }),
  });

  constructor(private fb: FormBuilder, private storeService: StoreService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["account"]) {
      this.loadFormData();
    }
  }

  get phoneNumbersFormArray(): FormArray {
    return this.editAccountForm.get(
      "contactInformation.phoneNumbers",
    ) as FormArray;
  }

  get emailsFormArray(): FormArray {
    return this.editAccountForm.get("contactInformation.emails") as FormArray;
  }

  /**
   * Returns the FormArray for the webLinks control in the editAccountForm.
   * @returns {FormArray} The FormArray for the webLinks control.
   */
  get webLinksFormArray(): FormArray {
    return this.editAccountForm.get("webLinks") as FormArray;
  }

  onSubmit() {
    // Call the API to save changes
    if (this.account) {
      // Prepare the account object with form values
      const formValue = this.editAccountForm.value;

      // Prepare the account object for update
      const updatedAccount: Partial<Account> = {
        ...this.account,
        ...formValue,
        name: formValue.name!,
        tagline: formValue.tagline!,
        description: formValue.description ?? "",
        type: "group",
        webLinks:
          formValue.webLinks?.map((link) => {
            return {
              name: link.name!,
              url: link.url!,
              category: link.category ?? "",
            };
          }) ?? [],
        groupDetails: {
          ...formValue.groupDetails,
          // Only convert dateFounded to Timestamp if it exists and is a valid date string
          // dateFounded: formValue.groupDetails?.dateFounded
          //   ? Timestamp.fromDate(new Date(formValue.groupDetails.dateFounded))
          //   : Timestamp.fromDate(new Date()), // Handle null or undefined appropriately
          // supportedLanguages: formValue.groupDetails?.supportedLanguages
          //   ? [...formValue.groupDetails.supportedLanguages]
          //   : ["en"], // Use an empty array as fallback
          groupType: formValue.groupDetails?.groupType || "Nonprofit",
        },
        contactInformation: {
          ...formValue.contactInformation,
          emails:
            formValue.contactInformation!.emails?.map(
              (email: Partial<Email>) => ({
                name: email.name ?? null,
                email: email.email!,
              }),
            ) ?? [],
          phoneNumbers: formValue.contactInformation!.phoneNumbers?.map(
            (phone: Partial<PhoneNumber>) => ({
              countryCode: phone.countryCode ?? null,
              number: phone.number ?? null,
              type: phone.type ?? null,
              isEmergencyNumber: phone.isEmergencyNumber || false,
            }),
          ) ?? [
            {
              countryCode: null,
              number: null,
              type: null,
              isEmergencyNumber: false,
            },
          ],
          address: formValue.contactInformation!.address,
          preferredMethodOfContact: "Email",
        },
      };

      // Now update the document with the updatedAccount
      this.storeService.updateDoc("accounts", updatedAccount);
      // .then(() => {
      //   console.log("Group updated successfully");
      //   this.toGroupPage(); // Navigate to the group page or show a success message
      // }).catch(error => {
      //   console.error("Error updating group:", error);
      // });
    }
  }

  loadFormData() {
    if (!this.account) return;
    // Reset the form arrays to ensure clean state
    while (this.webLinksFormArray.length !== 0) {
      this.webLinksFormArray.removeAt(0);
    }
    while (this.emailsFormArray.length !== 0) {
      this.emailsFormArray.removeAt(0);
    }
    while (this.phoneNumbersFormArray.length !== 0) {
      this.phoneNumbersFormArray.removeAt(0);
    }

    // If there are webLinks, create a FormGroup for each
    this.account.webLinks?.forEach((webLink) => {
      this.webLinksFormArray.push(
        this.fb.group({
          name: [webLink.name],
          url: [webLink.url],
          category: [webLink.category],
        }),
      );
    });

    // If after loading there are no webLinks, add a blank one
    if (this.webLinksFormArray.length === 0) {
      this.addWebLink();
    }

    // Dynamically load emails and phone numbers from the account, or add a blank one if none exist
    this.account.contactInformation?.emails?.forEach((email) => {
      this.emailsFormArray.push(
        this.fb.group({
          name: [email.name],
          email: [email.email, Validators.email],
        }),
      );
    });
    if (this.emailsFormArray.length === 0) {
      this.addEmail();
    }

    this.account.contactInformation?.phoneNumbers?.forEach((phone) => {
      this.phoneNumbersFormArray.push(
        this.fb.group({
          countryCode: [phone.countryCode, [Validators.pattern("^[0-9]*$")]],
          number: [phone.number, [Validators.pattern("^\\d{10}$")]],
          type: [phone.type],
          isEmergencyNumber: [phone.isEmergencyNumber],
        }),
      );
    });
    if (this.phoneNumbersFormArray.length === 0) {
      this.addPhoneNumber();
    }

    // Load other form data as before
    this.editAccountForm.patchValue({
      name: this.account.name,
      description: this.account.description,
      tagline: this.account.tagline,
      contactInformation: {
        emails: this.account.contactInformation?.emails?.map((email) => ({
          name: email.name,
          email: email.email,
        })) || [this.createEmailFormGroup()],
        phoneNumbers: this.account.contactInformation?.phoneNumbers?.map(
          (phone) => ({
            countryCode: phone.countryCode,
            number: phone.number,
            type: phone.type,
            isEmergencyNumber: phone.isEmergencyNumber,
          }),
        ) || [this.createPhoneNumberFormGroup()],
        address: this.account.contactInformation?.address || {},
      },
      // Add other necessary field updates here
    });
  }

  /**
   * Adds a new email form group to the emails form array, up to a max of maxEmails.
   * This allows an additional email input to be displayed in the form.
   */
  addEmail(): void {
    if (this.emailsFormArray.length < this.maxEmails) {
      this.emailsFormArray.push(this.createEmailFormGroup());
    }
  }

  removeEmail(index: number): void {
    this.emailsFormArray.removeAt(index);
  }

  private createEmailFormGroup(): FormGroup {
    return this.fb.group({
      name: [""],
      email: ["", [Validators.email]],
    });
  }

  createPhoneNumberFormGroup(): FormGroup {
    return this.fb.group({
      countryCode: ["", [Validators.pattern("^[0-9]*$")]],
      number: ["", [Validators.pattern("^\\d{10}$")]],
      type: [""],
      isEmergencyNumber: [false],
    });
  }

  addPhoneNumber(): void {
    if (this.phoneNumbersFormArray.length < this.maxPhoneNumbers) {
      this.phoneNumbersFormArray.push(this.createPhoneNumberFormGroup());
    }
  }

  removePhoneNumber(index: number): void {
    // Remove the phone number form group at the given index
    this.phoneNumbersFormArray.removeAt(index);
  }

  createWebLinkFormGroup(): FormGroup {
    return this.fb.group({
      name: ["", []],
      url: ["", []],
      category: [""],
    });
  }

  addWebLink(): void {
    if (this.webLinksFormArray.length < this.maxLinks) {
      this.webLinksFormArray.push(this.createWebLinkFormGroup());
    }
  }

  removeWebLink(index: number): void {
    // Remove the phone number form group at the given index
    this.webLinksFormArray.removeAt(index);
  }
}
