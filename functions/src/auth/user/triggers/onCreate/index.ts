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
import {Timestamp} from "firebase-admin/firestore";

// Initialize the Firebase admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Reference to the Firestore database
const db = admin.firestore();

// Triggered when a new user is created in Firebase Authentication
export const createUserProfile = functions.auth
  .user()
  .onCreate(async (user) => {
    try {
      await saveAccountToFirestore(user, "user"); // Specify 'user' for user profiles
      logger.info(`User profile for ${user.uid} saved successfully.`);
    } catch (error) {
      logger.error(`Error saving user profile for ${user.uid}:`, error);
      throw error;
    }
  });

/**
 * Saves an account to Firestore in the 'accounts' collection.
 * @param {admin.auth.UserRecord} user - The user record from Firebase Authentication.
 * @param {string} type - The type of the account ('user' or 'group').
 * @return {Promise<void>} - A promise that resolves when the operation is complete.
 */
async function saveAccountToFirestore(
  user: admin.auth.UserRecord,
  type: "user" | "group",
): Promise<void> {
  const accountRef = db.collection("accounts").doc(user.uid);

  const accountData = {
    id: user.uid,
    type: type,
    name: user.displayName || "New User",
    createdAt: Timestamp.now(),
    createdBy: user.uid,
    lastLoginAt: Timestamp.now(),
    lastModifiedAt: Timestamp.now(),
    lastModifiedBy: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    phone: {countryCode: "", number: user.phoneNumber || "", type: ""},
    language: "",
    associations: {accounts: [], feedback: []},
    privacySetting: "public",
    iconImage: user.photoURL || "default_icon.png",
    heroImage: "default_hero.png",
    description: "",
    tagline: "",
    address: {
      name: "",
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
      formatted: "",
      geopoint: "",
    },
    // User specific fields
    userDetails:
      type === "user"
        ? {
            dateOfBirth: Timestamp.now(),
            firstName: "",
            lastName: "",
            username: user.displayName || user.uid,
          }
        : null,
    // Group specific fields
    groupDetails:
      type === "group"
        ? {
            admins: [user.uid],
            dateFounded: Timestamp.now(),
            supportedLanguages: [],
          }
        : null,
  };

  await accountRef.set(accountData);
}
