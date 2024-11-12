import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InningsService {
  innings = signal<number>(1);
  private Innings$ = new BehaviorSubject(1);
  InningsObserver$ = this.Innings$.asObservable();

  ChangeInnings(ID:number){
    this.Innings$.next(ID);
  }
}
