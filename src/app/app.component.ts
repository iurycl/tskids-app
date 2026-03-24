import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  menuOutline, searchOutline, alertCircleOutline,
  pricetagOutline, folderOutline, cubeOutline, calendarOutline,
  arrowBackOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, RouterOutlet],
  template: `<ion-app><router-outlet></router-outlet></ion-app>`,
})
export class AppComponent {
  constructor() {
    addIcons({
      menuOutline, searchOutline, alertCircleOutline,
      pricetagOutline, folderOutline, cubeOutline, calendarOutline,
      arrowBackOutline,
    });
  }
}
