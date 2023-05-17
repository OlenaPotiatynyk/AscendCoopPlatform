import {enableProdMode, importProvidersFrom} from "@angular/core";
import {bootstrapApplication} from "@angular/platform-browser";
import {RouteReuseStrategy, provideRouter} from "@angular/router";
import {IonicModule, IonicRouteStrategy} from "@ionic/angular";
import {defineCustomElements} from "@ionic/pwa-elements/loader";

import {routes} from "./app/app.routes";
import {AppComponent} from "./app/app.component";
import {environment} from "./environments/environment";
import {initializeApp} from "firebase/app";
import {AuthService} from "./app/services/auth.service";

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);

if (environment.production) {
  enableProdMode();
}

// Initialize Firebase before the application has been bootstrapped
initializeApp(environment.firebaseConfig);

bootstrapApplication(AppComponent, {
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    importProvidersFrom(IonicModule.forRoot({})),
    provideRouter(routes),
    AuthService,
  ],
});
