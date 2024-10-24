import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private navbar$ = new BehaviorSubject<boolean>(true);
  private matchSelection$ = new BehaviorSubject<boolean>(true);
  private navHeaderText$ = new BehaviorSubject<string>('');
  nav_observable$ = this.navbar$.asObservable();
  matchSelection_observable$ = this.matchSelection$.asObservable();
  navbarHeader_observable$ = this.navHeaderText$.asObservable();

  toggleNavbar(b:boolean){
    this.navbar$.next(b);
  }
  toggleMatchSelection(b:boolean){
    this.matchSelection$.next(b);
  }
  updateNavHeader(headerText:string){
    this.navHeaderText$.next(headerText);
  }
}
