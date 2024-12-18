import { Component, DestroyRef, effect, HostListener, inject, OnInit, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../services/ball-by-ball.service';
import { AppService } from '../services/app.service';
import { BattingCardComponent } from './batting-card/batting-card.component';
import { DxTabsModule } from 'devextreme-angular';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { BowlingCardComponent } from "./bowling-card/bowling-card.component";
import { FallOfWicketsComponent } from "./fall-of-wickets/fall-of-wickets.component";
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import Enumerable from 'linq';
import { calculateOvers } from '../scripts/cricket_gen';
import { BattingCardSummary } from './batting-card/batting-card.interface';
import { SummaryHeaderComponent } from "./summary-header/summary-header.component";
import { VideoComponent } from "../components/video/video.component";
import { CommonModule } from '@angular/common';
import { InningsTabComponent } from "../components/innings-tab/innings-tab.component";
import { InningsService } from '../components/innings-tab/innings.service';
import { checkInf, checkSR } from '../scripts/generic';

@Component({
  selector: 'app-scorecard-v2',
  standalone: true,
  imports: [BattingCardComponent, DxTabsModule, BowlingCardComponent, FallOfWicketsComponent, VideoComponent, CommonModule],
  templateUrl: './scorecard-v2.component.html',
  styleUrl: './scorecard-v2.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class ScorecardV2Component implements OnInit {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);
  private InningService = inject(InningsService);

  ballArray = signal<BallData[]>([]);
  summary:[]|BattingCardSummary[] = [];
  matchDetails = signal<any>({});
  totalInnings = signal<any[]>([]);
  selctedInnings:number = 1;
  currentInnings:number|undefined;
  isMobile:boolean = false;
  resizeObservable$!:Observable<Event>;

  ngOnInit(): void {
    this.appService.updateNavHeader('');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.currentInnings = this.ballArray()[this.ballArray().length-1]?.InningsId||undefined;
      this.generateSummary();
    })
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
      this.selctedInnings = 1;
      this.totalInnings.set(this.matchDetails()?.inningsData||[]);
      this.onWindowResize();
    })
    this.resizeObservable$ = fromEvent(window,'resize');
    const resizeSubscription:Subscription = this.resizeObservable$.subscribe(()=>{
      this.onWindowResize();
    })
    // const InnSub = this.InningService.InningsObserver$.subscribe(updated =>{
    //   this.selctedInnings = updated;
    // })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      matchSubscription.unsubscribe();
      resizeSubscription.unsubscribe();
      //InnSub.unsubscribe();
    })
  }
  onWindowResize(){
    if(window.innerWidth < 773){
      this.isMobile = true;
    }
    else{
      this.isMobile = false;
    }
  }
  generateSummary(){
    this.summary = Enumerable.from(this.ballArray())
      .groupBy(i => i.InningsId === this.selctedInnings).select(g => {
        const extrasByType = {
          overstep: g.where(i => i.ExtraTypeId === 1 || i.ExtraTypeId === 5 || i.ExtraTypeId === 6)
            .sum(i => i.ExtraTypeId === 1 ? i.Extras : 1),
          wide: g.where(i => i.ExtraTypeId === 2).sum(i => i.Extras),
          legbyes: g.where(i => i.ExtraTypeId === 3 || i.ExtraTypeId === 6)
            .sum(i => i.ExtraTypeId === 3 ? i.Extras : i.Extras - 1),
          byes: g.where(i => i.ExtraTypeId === 4 || i.ExtraTypeId === 5)
            .sum(i => i.ExtraTypeId === 4 ? i.Extras : i.Extras - 1)
        };
        const extrasBreakupParts = [];
        if (extrasByType.overstep > 0) extrasBreakupParts.push(`NB: ${extrasByType.overstep}`);
        if (extrasByType.wide > 0) extrasBreakupParts.push(`W: ${extrasByType.wide}`);
        if (extrasByType.legbyes > 0) extrasBreakupParts.push(`LB: ${extrasByType.legbyes}`);
        if (extrasByType.byes > 0) extrasBreakupParts.push(`B: ${extrasByType.byes}`);
        const extrasBreakup = extrasBreakupParts.length > 0 ? extrasBreakupParts.join(', ') : '';
        const TeamTotal = g.last() ?.TeamRuns ?? 0;
        const overs = parseFloat(calculateOvers(g.count(i => i.Bowlballs === 1)));
        return {
          Innings: g.first().InningsId,
          TeamTotal: TeamTotal,
          ExtrasTotal: Object.values(extrasByType).reduce((acc, val) => acc + val, 0),
          ExtrasBreakup: extrasBreakup,
          Dismissals: g.count(i => i.Dismissal === 1),
          Overs: overs,
          BattingClubId:g.first().BattingClubID,
          RunRate:checkInf(TeamTotal / overs)
        }
      }).orderBy(i=> i.Innings).toArray();
  }
  onInningsChange(e:number){
    this.selctedInnings = e;
  }
}
