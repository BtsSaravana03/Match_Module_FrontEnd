import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,SidebarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  private appService = inject(AppService);
  private destroyRef = inject(DestroyRef);
  visibility = input<boolean>(true);
  sidebarVisible:boolean = false;
  Header = '';
  ngOnInit(): void {
    const subscription = this.appService.navbarHeader_observable$.subscribe(updated=>{
      this.Header = updated;
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
    })
  }
  setHeader(h:string){
    this.Header = h;
  }
  onMatchSelection(){
    this.appService.toggleMatchSelection(true);
  }
}
