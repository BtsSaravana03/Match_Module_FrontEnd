import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppService } from '../../services/app.service';
import { FilterComponent } from "../filter/filter.component";
import { fromEvent, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FilterComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  private appService = inject(AppService);
  private destroyRef = inject(DestroyRef);
  
  visibility = input<boolean>(true);
  sidebarVisible:boolean = false;
  isMobile:boolean = false;
  resizeObservable$!:Observable<Event>;
  Header = '';
  ngOnInit(): void {
    const subscription = this.appService.navbarHeader_observable$.subscribe(updated=>{
      this.Header = updated;
    })
    this.resizeObservable$ = fromEvent(window,'resize');
    const resizeSubscription:Subscription = this.resizeObservable$.subscribe(()=>{
      this.onWindowResize();
    })
    this.onWindowResize();
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      resizeSubscription.unsubscribe();
    })
  }
  setHeader(h:string){
    this.Header = h;
  }
  onMatchSelection(){
    this.appService.toggleMatchSelection(true);
  }
  onWindowResize(){
    if(window.innerWidth < 567){
      this.isMobile = true;
    }
    else{
      this.isMobile = false;
    }
  }
}
