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
import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {
  Account,
  VolunteerPreferences,
} from "../../../../../../models/account.model";
import {StoreService} from "../../../../../../core/services/store.service";
import {areasOfInterestOptions} from "../../../../../../core/data/options";

@Component({
  selector: "app-volunteer-preference-info",
  templateUrl: "./volunteer-preference-info.component.html",
  styleUrls: ["./volunteer-preference-info.component.scss"],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class VolunteerPreferenceInfoComponent implements OnInit {
  @Input() account?: Partial<Account>;
  volunteerPreferencesForm: FormGroup;
  areasOfInterestOptions: string[] = areasOfInterestOptions;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
  ) {
    this.volunteerPreferencesForm = this.fb.group({
      areasOfInterest: [[], Validators.required],
      availability: ["", Validators.required],
      preferredVolunteerRoles: ["", Validators.required],
      previousVolunteerExperience: [""],
      willingnessToTravel: [false],
      desiredLevelOfCommitment: ["", Validators.required],
    });
  }

  ngOnInit() {
    if (this.account?.volunteerPreferences) {
      this.loadFormData();
    }
  }

  loadFormData() {
    if (this.account?.volunteerPreferences) {
      this.volunteerPreferencesForm.patchValue({
        areasOfInterest:
          this.account.volunteerPreferences.areasOfInterest || [],
        availability: this.account.volunteerPreferences.availability || "",
        preferredVolunteerRoles: (
          this.account.volunteerPreferences.preferredVolunteerRoles || []
        ).join(", "),
        previousVolunteerExperience:
          this.account.volunteerPreferences.previousVolunteerExperience || "",
        willingnessToTravel:
          this.account.volunteerPreferences.willingnessToTravel || false,
        desiredLevelOfCommitment:
          this.account.volunteerPreferences.desiredLevelOfCommitment || "",
      });
    }
  }

  onSubmit() {
    if (this.volunteerPreferencesForm.valid) {
      const formValue = this.volunteerPreferencesForm.value;
      const updatedVolunteerPreferences: VolunteerPreferences = {
        ...formValue,
        preferredVolunteerRoles: formValue.preferredVolunteerRoles
          .split(",")
          .map((role: string) => role.trim()),
      };
      const updatedAccount: Partial<Account> = {
        ...this.account,
        volunteerPreferences: updatedVolunteerPreferences,
      };

      this.storeService.updateDoc("accounts", updatedAccount);
    }
  }
}
