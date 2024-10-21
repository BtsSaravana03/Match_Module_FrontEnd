import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { licenseKey } from '../devextreme-license';
import config from 'devextreme/core/config';
import { NavbarComponent } from './components/navbar/navbar.component';
config({licenseKey})
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  navbarVisible:boolean = true;
}
