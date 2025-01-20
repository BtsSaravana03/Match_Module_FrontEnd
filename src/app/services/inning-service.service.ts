import { Injectable, OnInit, signal } from '@angular/core';
import { InningsData } from '../components/filter/filter.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InningServiceService {
  currentInningData:InningsData|undefined;
  selectedInnings = signal<number>(1);
  private Innings$ = new BehaviorSubject(this.selectedInnings());
  InningsObserver$ = this.Innings$.asObservable();

  ChangeInnings(ID:number){
    this.Innings$.next(ID);
  }
}
