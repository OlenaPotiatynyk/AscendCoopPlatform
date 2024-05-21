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
import {Component, Input} from "@angular/core";
import {CommonModule} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {MutualAidCommunityEngagement} from "../../../../../../models/account.model";

@Component({
  selector: "app-mutual-aid-community-info",
  templateUrl: "./mutual-aid-community-info.component.html",
  styleUrls: ["./mutual-aid-community-info.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class MutualAidCommunityInfoComponent {
  @Input() mutualAidCommunityEngagement?: MutualAidCommunityEngagement;

  constructor() {}
}
