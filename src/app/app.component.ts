import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HeaderComponent } from './components/header/header.component';
import { LoaderComponent } from './components/loader/loader.component';
import { GlobalFooterComponent } from './components/global-footer/global-footer.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, HeaderComponent, LoaderComponent, GlobalFooterComponent],
})
export class AppComponent {
  constructor() {}
}
