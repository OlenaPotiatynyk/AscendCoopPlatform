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
import {MenuController} from "@ionic/angular";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class MenuService {
  constructor(
    public authService: AuthService,
    public menuCtrl: MenuController,
  ) {}

  async onEnter() {
    const isLoggedIn = this.authService.isLoggedIn;
    if (isLoggedIn) {
      await this.menuCtrl.enable(false, "guest");
      await this.menuCtrl.enable(true, "user");
    } else {
      await this.menuCtrl.enable(false, "user");
      await this.menuCtrl.enable(true, "guest");
    }
  }
}
