/**
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
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize the Firebase admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
// Reference to the Firestore database
const db = admin.firestore();

// Triggered when a group is updated in Firestore
export const onGroupUpdate = functions.firestore
  .document("groups/{groupId}")
  .onUpdate(handleGroupUpdate);

/**
 * Asynchronously handles the update of groups in the database.
 * This function updates all associated relationships for the updated group.
 * @param {Object} change - Contains before and after states of the updated group document.
 * @param {Object} context - The context in which the function is run, including event context.
 * @return {Promise<void>} - Returns a promise that resolves when the operation is complete
 */
async function handleGroupUpdate(
  change: functions.Change<functions.firestore.DocumentSnapshot>,
  context: any,
) {
  try {
    const groupId = context.params.groupId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if tagline, name, or iconImage fields have changed
    if (
      beforeData?.tagline !== afterData?.tagline ||
      beforeData?.name !== afterData?.name ||
      beforeData?.iconImage !== afterData?.iconImage
    ) {
      // Query for relationships where the relatedIds field contains the groupId
      const querySnapshot = await db
        .collection("relationships")
        .where("relatedIds", "array-contains", groupId)
        .get();

      // Create a batch to handle the update of all associated relationships
      const batch = db.batch();

      querySnapshot.forEach((doc) => {
        // Update the relationship fields.
        if (doc.data().senderId === groupId) {
          batch.update(doc.ref, {
            senderTagline: afterData?.tagline,
            senderName: afterData?.name,
            senderImage: afterData?.iconImage,
          });
        } else if (doc.data().receiverId === groupId) {
          batch.update(doc.ref, {
            receiverTagline: afterData?.tagline,
            receiverName: afterData?.name,
            receiverImage: afterData?.iconImage,
          });
        }
      });

      // Commit the batch
      await batch.commit();
    }
  } catch (error) {
    logger.error("Error updating associated relationships: ", error);
    // Just log the error. Throwing an error in a Firestore trigger won't propagate it to the client.
  }
}
