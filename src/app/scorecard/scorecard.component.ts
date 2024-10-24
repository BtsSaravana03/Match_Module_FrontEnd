import { Component, DestroyRef, effect, HostListener, inject, OnInit, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../services/ball-by-ball.service';
import { AppService } from '../services/app.service';
import { BattingCardComponent } from './batting-card/batting-card.component';
import { DxTabsModule } from 'devextreme-angular';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { BowlingCardComponent } from "./bowling-card/bowling-card.component";
import { FallOfWicketsComponent } from "./fall-of-wickets/fall-of-wickets.component";

@Component({
  selector: 'app-scorecard',
  standalone: true,
  imports: [BattingCardComponent, DxTabsModule, BowlingCardComponent, FallOfWicketsComponent],
  templateUrl: './scorecard.component.html',
  styleUrl: './scorecard.component.scss',
  encapsulation:ViewEncapsulation.ShadowDom
})
export class ScorecardComponent implements OnInit {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);

  ballArray = signal<any[]>([]);
  matchDetails = signal<any>({});
  totalInnings = signal<any[]>([]);
  currentInnings:number = 1;
  selectedIndex:number = 0;
  tabWidth:any = '200px';
  resizeObservable$!:Observable<Event>;

  ngOnInit(): void {
    this.appService.updateNavHeader('Scorecard');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
    })
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
      this.totalInnings.set(this.matchDetails()?.inningsData);
      this.currentInnings = 1;
      this.onWindowResize();
    })
    this.resizeObservable$ = fromEvent(window,'resize');
    const resizeSubscription:Subscription = this.resizeObservable$.subscribe(()=>{
      this.onWindowResize();
    })

    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      matchSubscription.unsubscribe();
      resizeSubscription.unsubscribe();
    })
  }
  onWindowResize(){
    if(window.innerWidth < 567){
      this.tabWidth = '100%';
    }
    else{
      this.tabWidth = `${(this.totalInnings()?.length||2)*100}px`;
    }
  }
  onInningsChange(e?:any){
    this.currentInnings = e?.addedItems[0]?.InningsID||1;
    this.selectedIndex = e?.addedItems[0]?.InningsID - 1||0 ;
  }
}
