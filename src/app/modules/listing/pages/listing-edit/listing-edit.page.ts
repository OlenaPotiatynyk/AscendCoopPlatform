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
import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators, FormArray} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {Observable, take} from "rxjs";
import {Listing} from "../../../../models/listing.model";
import * as ListingActions from "../../../../state/actions/listings.actions";
import {Timestamp} from "firebase/firestore";
import {selectAuthUser} from "../../../../state/selectors/auth.selectors";
import {AuthUser} from "../../../../models/auth-user.model";

@Component({
  selector: "app-listing-edit",
  templateUrl: "./listing-edit.page.html",
  styleUrls: ["./listing-edit.page.scss"],
})
export class ListingEditPage implements OnInit {
  authUser$!: Observable<AuthUser | null>;
  listingForm: FormGroup;
  listing$!: Observable<Listing | null>;
  listingTypes = ["volunteer", "job", "internship", "gig"];
  skillLevels = ["beginner", "intermediate", "advanced"];

  constructor(
    private fb: FormBuilder,
    private store: Store<{listings: {selectedListing: Listing | null}}>,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.authUser$ = this.store.select(selectAuthUser);
    this.listingForm = this.fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      type: ["volunteer", Validators.required],
      organization: ["", Validators.required],
      remote: [false],
      location: this.fb.group({
        street: [""],
        city: [""],
        state: [""],
        country: [""],
        postalCode: [""],
      }),
      skills: this.fb.array([]),
      timeCommitment: this.fb.group({
        hoursPerWeek: ["", Validators.required],
        duration: [""],
        schedule: [""],
        startDate: ["", Validators.required],
        endDate: [""],
        isFlexible: [false],
      }),
      requirements: this.fb.array([]),
      responsibilities: this.fb.array([]),
      benefits: this.fb.array([]),
      contactInformation: this.fb.group({
        email: ["", Validators.email],
        phone: [""],
        website: [""],
      }),
      status: ["active"],
    });
    this.listing$ = this.store.select(
      (state) => state.listings.selectedListing,
    );
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.store.dispatch(ListingActions.loadListingById({id}));
      this.listing$.subscribe((listing) => {
        if (listing) {
          this.listingForm.patchValue(listing);
        }
      });
    }
  }

  addSkill() {
    const skillForm = this.fb.group({
      name: ["", Validators.required],
      level: ["beginner"],
      required: [true],
    });
    (this.listingForm.get("skills") as FormArray).push(skillForm);
  }

  addArrayItem(arrayName: string) {
    const control = this.fb.control("", Validators.required);
    (this.listingForm.get(arrayName) as FormArray).push(control);
  }

  removeArrayItem(arrayName: string, index: number) {
    (this.listingForm.get(arrayName) as FormArray).removeAt(index);
  }

  getFormArray(arrayName: string) {
    return this.listingForm.get(arrayName) as FormArray;
  }

  onSubmit() {
    if (this.listingForm.valid) {
      this.authUser$.pipe(take(1)).subscribe((user) => {
        const formValue = this.listingForm.value;
        const listing = {
          ...formValue,
          createdAt: Timestamp.now(),
          createdBy: user?.uid,
          lastModifiedAt: Timestamp.now(),
          lastModifiedBy: user?.uid,
          timeCommitment: {
            ...formValue.timeCommitment,
            startDate: Timestamp.fromDate(
              new Date(formValue.timeCommitment.startDate),
            ),
            endDate: Timestamp.fromDate(
              new Date(formValue.timeCommitment.endDate),
            ),
          },
        };

        this.store.dispatch(ListingActions.createListing({listing}));
        this.router.navigate(["/listings"]);
      });
    }
  }
}
