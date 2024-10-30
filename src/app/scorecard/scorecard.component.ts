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

@Component({
  selector: 'app-scorecard',
  standalone: true,
  imports: [BattingCardComponent, DxTabsModule, BowlingCardComponent, FallOfWicketsComponent, SummaryHeaderComponent, VideoComponent],
  templateUrl: './scorecard.component.html',
  styleUrl: './scorecard.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class ScorecardComponent implements OnInit {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);

  ballArray = signal<BallData[]|[]>([]);
  summary:[]|BattingCardSummary[] = [];
  matchDetails = signal<any>({});
  totalInnings = signal<any[]>([]);
  currentInnings:number = 1;
  selectexIndex:number = 0;
  tabWidth:any = '200px';
  resizeObservable$!:Observable<Event>;

  ngOnInit(): void {
    this.appService.updateNavHeader('Scorecard');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.generateSummary()
    })
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
      this.currentInnings = 1;
      this.totalInnings.set(this.matchDetails()?.inningsData||[]);
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
  generateSummary(){
    this.summary = Enumerable.from(this.ballArray())
      .groupBy(i => i.InningsId === this.currentInnings).select(g => {
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
        if (extrasByType.overstep > 0) extrasBreakupParts.push(`Overstep: ${extrasByType.overstep}`);
        if (extrasByType.wide > 0) extrasBreakupParts.push(`Wide: ${extrasByType.wide}`);
        if (extrasByType.legbyes > 0) extrasBreakupParts.push(`Legbyes: ${extrasByType.legbyes}`);
        if (extrasByType.byes > 0) extrasBreakupParts.push(`Byes: ${extrasByType.byes}`);
        const extrasBreakup = extrasBreakupParts.length > 0 ? extrasBreakupParts.join(', ') : '';

        return {
          Innings: g.first().InningsId,
          TeamTotal: g.last() ?.TeamRuns ?? 0,
          ExtrasTotal: Object.values(extrasByType).reduce((acc, val) => acc + val, 0),
          ExtrasBreakup: extrasBreakup,
          Dismissals: g.count(i => i.Dismissal === 1),
          Overs: parseFloat(calculateOvers(g.count(i => i.Batballs === 1))),
          BattingClubId:g.first().BattingClubID,
        }
      }).orderBy(i=> i.Innings).toArray();
  }
  onInningsChange(e:any){
    if(e.addedItems.length>0){
      this.currentInnings = e?.addedItems[0]?.InningsID||1;
    }
  }
}
