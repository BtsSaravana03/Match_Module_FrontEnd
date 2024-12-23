import { Component, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { licenseKey } from '../devextreme-license';
import config from 'devextreme/core/config';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatchSelectComponent } from './components/match-select/match-select.component';
import { AppService } from './services/app.service';
import { TabsComponent } from "./layout/sharedComponents/tabs/tabs.component";
import { CardComponent } from "./layout/sharedComponents/card/card.component";
import { fromEvent, Observable, Subscription } from 'rxjs';
import { CommonModule, ViewportScroller } from '@angular/common';
config({licenseKey})
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, MatchSelectComponent, TabsComponent, CardComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  private appService = inject(AppService);
  private destroy = inject(DestroyRef);
  private route = inject(Router);
  navbarVisible!:boolean;
  generateMatches:boolean = false;
  resizeObservable$!:Observable<Event>;
  Tabs = [
    {name:'Overview',value:'overview'},
    {name:'Scorecard',value:'scorecard'},
    {name:'Ball by ball',value:'ballbyball'},
    {name:'Graphics',value:'graphics'}
  ]

  constructor(viewport: ViewportScroller) {
    viewport.setOffset([0, 56]);
  }

  ngOnInit(): void {
    const navSubscription = this.appService.nav_observable$.subscribe(updated=>{
      this.navbarVisible = updated;
    })
    const matchSelection = this.appService.matchSelection_observable$.subscribe(updated=>{
      this.generateMatches = updated;
    })
    this.destroy.onDestroy(()=>{
      navSubscription.unsubscribe();
      matchSelection.unsubscribe();
    })
    this.resizeObservable$ = fromEvent(window,'resize');
        const resizeSubscription:Subscription = this.resizeObservable$.subscribe(()=>{
          this.onWindowResize();
    })
    this.onWindowResize();
  }
  onWindowResize(){
    if(window.innerWidth < 773){
      this.appService.isMobile.set(true);
    }
    else{
        this.appService.isMobile.set(false);
    }
  }
  onTabChange(e:any){
    this.route.navigate(['v2',e.value]);
  }
}
