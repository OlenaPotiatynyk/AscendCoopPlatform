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
import {Injectable} from "@angular/core";
import {FirestoreService} from "./firestore.service";
import {
  doc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  addDoc,
  and,
  or,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import {AppRelationship} from "../../models/relationship.model";
import {
  prepareDataForCreate,
  prepareDataForUpdate,
} from "../utils/firebase.util";
import {LoadingController} from "@ionic/angular";
import {ErrorHandlerService} from "./error-handler.service";
import {SuccessHandlerService} from "./success-handler.service";
import {AuthStoreService} from "./auth-store.service";

@Injectable({
  providedIn: "root",
})
export class RelationshipsCollectionService {
  private collectionName = "relationships";

  constructor(
    private authStoreService: AuthStoreService,
    private errorHandler: ErrorHandlerService,
    private firestoreService: FirestoreService,
    private loadingController: LoadingController,
    private successHandler: SuccessHandlerService,
  ) {}

  async sendRequest(requestData: Partial<AppRelationship>) {
    const loading = await this.loadingController.create();
    await loading.present();
    return await addDoc(
      collection(this.firestoreService.firestore, this.collectionName),
      prepareDataForCreate(
        requestData,
        this.authStoreService.getCurrentUser()?.uid,
      ),
    )
      .then((docRef) => {
        this.successHandler.handleSuccess("Request sent successfully!");
        return docRef.id;
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
        this.errorHandler.handleFirebaseAuthError(error);
        return null;
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async updateRelationship(
    id: string | null,
    relationship: Partial<AppRelationship>,
  ) {
    if (!id) throw new Error("Id must be provided");
    const loading = await this.loadingController.create();
    await loading.present();
    await updateDoc(
      doc(this.firestoreService.firestore, this.collectionName, id),
      prepareDataForUpdate(
        relationship,
        this.authStoreService.getCurrentUser()?.uid,
      ),
    )
      .then(() => {
        this.successHandler.handleSuccess(
          "Request status updated successfully!",
        );
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
        this.errorHandler.handleFirebaseAuthError(error);
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async getRequestsByReceiverId(receiverId: string) {
    const loading = await this.loadingController.create();
    await loading.present();
    return await getDocs(
      query(
        collection(this.firestoreService.firestore, this.collectionName),
        where("receiverId", "==", receiverId),
      ),
    )
      .then((querySnapshot) => {
        return this.processFirebaseData(querySnapshot);
      })
      .catch((error) => {
        this.errorHandler.handleFirebaseAuthError(error);
        return [];
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async getRelationships(senderOrReceiverId: string | null) {
    if (!senderOrReceiverId) {
      this.errorHandler.handleFirebaseAuthError({
        code: "",
        message: "Id must be provided",
      });
      return [];
    }
    const loading = await this.loadingController.create();
    await loading.present();
    return await getDocs(
      query(
        collection(this.firestoreService.firestore, this.collectionName),
        and(
          where("status", "in", ["pending", "accepted"]),
          or(
            where("senderId", "==", senderOrReceiverId),
            where("receiverId", "==", senderOrReceiverId),
          ),
        ),
      ),
    )
      .then((querySnapshot) => {
        return this.processFirebaseData(querySnapshot);
      })
      .catch((error) => {
        this.errorHandler.handleFirebaseAuthError(error);
        return [];
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  deleteRelationship(id: string | null) {
    if (!id) throw new Error("Id must be provided");
    return this.firestoreService
      .deleteDocument(this.collectionName, id)
      .then(() => {
        this.successHandler.handleSuccess("Relationship deleted successfully!");
        return true;
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
        this.errorHandler.handleFirebaseAuthError(error);
        return null;
      });
  }

  processFirebaseData(querySnapshot: QuerySnapshot | DocumentSnapshot): any {
    if (querySnapshot instanceof QuerySnapshot) {
      // Processing for array of documents
      const documents: Partial<AppRelationship>[] = [];
      querySnapshot.forEach((doc) => {
        let data = doc.data() as Partial<AppRelationship>;
        data = {...data, id: doc.id};
        documents.push(data);
      });
      return documents;
    } else if (querySnapshot instanceof DocumentSnapshot) {
      // Processing for single document
      if (querySnapshot.exists()) {
        let data = querySnapshot.data() as Partial<AppRelationship>;
        data = {...data, id: querySnapshot.id};
        return data;
      }
    }
    return null;
  }
}
