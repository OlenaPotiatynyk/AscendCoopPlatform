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
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {IonicModule} from "@ionic/angular";
import {MenuService} from "../../../../core/services/menu.service";
import {GroupsService} from "../../../../core/services/groups.service";
import {ActivatedRoute} from "@angular/router";
import {Group} from "../../../../models/group.model";

@Component({
  selector: "app-group-profile",
  templateUrl: "./group-profile.page.html",
  styleUrls: ["./group-profile.page.scss"],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class GroupProfilePage implements OnInit {
  groupId: string | null;
  group: Group | any;
  constructor(
    private route: ActivatedRoute,
    private menuService: MenuService,
    private groupsService: GroupsService,
  ) {
    this.groupId = this.route.snapshot.paramMap.get("groupId");
  }

  ngOnInit() {
    this.getGroup();
  }

  ionViewWillEnter() {
    this.menuService.onEnter();
  }

  ionViewWillLeave() {}

  getGroup() {
    this.groupsService
      .getGroup(this.groupId)
      .then((group) => {
        this.group = group;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
