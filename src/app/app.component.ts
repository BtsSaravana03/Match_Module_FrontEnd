import { Component, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { licenseKey } from '../devextreme-license';
import config from 'devextreme/core/config';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatchSelectComponent } from './components/match-select/match-select.component';
import { AppService } from './services/app.service';
config({licenseKey})
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NavbarComponent,MatchSelectComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  private appService = inject(AppService);
  private destroy = inject(DestroyRef);
  navbarVisible!:boolean;
  generateMatches:boolean = false;


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
  }
}
