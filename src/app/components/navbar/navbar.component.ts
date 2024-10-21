import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,SidebarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  visibility = input<boolean>(true);
  sidebarVisible:boolean = false;
  Header = 'Ball by Ball';
  setHeader(h:string){
    this.Header = h;
  }
}
