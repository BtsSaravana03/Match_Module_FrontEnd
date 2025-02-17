import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DxTabsModule } from 'devextreme-angular';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { BattingCardSummary } from '../../scorecard-v2/batting-card/batting-card.interface';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { BattingCardComponent } from "../../scorecard-v2/batting-card/batting-card.component";
import { FallOfWicketsComponent } from "../../scorecard-v2/fall-of-wickets/fall-of-wickets.component";
import { BowlingCardComponent } from "../../scorecard-v2/bowling-card/bowling-card.component";
import { Router } from '@angular/router';
import { PartnershipComponent } from "../../partnership/partnership.component";
import { WormComponent } from "../../graphics/worm/worm.component";
import { ManhattenComponent } from "../../graphics/manhatten/manhatten.component";
import { CardComponent } from "../sharedComponents/card/card.component";
import { VideoComponent } from "../../components/video/video.component";
import Enumerable from 'linq';
import { calculateOvers } from '../../scripts/cricket_gen';
import { checkInf } from '../../scripts/generic';
import { CommonModule } from '@angular/common';
import { AppService } from '../../services/app.service';
import { TabsComponent } from "../sharedComponents/tabs/tabs.component";
import { InningServiceService } from '../../services/inning-service.service';
import { MatchInfoV2Component } from "./match-info-v2/match-info-v2.component";


@Component({
  selector: 'app-scorecard',
  standalone: true,
  imports: [DxTabsModule, BattingCardComponent, FallOfWicketsComponent, BowlingCardComponent, PartnershipComponent, WormComponent, ManhattenComponent, CardComponent, VideoComponent, CommonModule, TabsComponent, MatchInfoV2Component],
  templateUrl: './scorecard.component.html',
  styleUrl: './scorecard.component.scss'
})
export class ScorecardComponent implements OnInit{
    private ballbyballService = inject(BallByBallService);
    private appServices = inject(AppService);
    private inningService = inject(InningServiceService);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    isMobile = signal(false);
    ballArray = signal<BallData[]>([]);
    summary:[]|BattingCardSummary[] = [];
    matchDetails = signal<any>({});
    totalInnings = signal<any[]>([]);
    selctedInnings:number = 1;
    currentInnings:number|undefined;
    resizeObservable$!:Observable<Event>;
    Tabs = ['Scorecard','Partnership','Worm','Manhattan','MatchInfo'];
    TabSelected:string = 'Scorecard';

    ngOnInit(): void {
      this.router.navigate(['/v2/scorecard'],{fragment: this.TabSelected})
      const subscription = this.ballbyballService.ballObservable$.subscribe(updated => {
        this.ballArray.set(updated);
        this.currentInnings = this.ballArray()[this.ballArray().length - 1]?.InningsId || undefined;
        this.generateSummary();
      })
      const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated => {
        this.matchDetails.set(updated);
        this.totalInnings.set(this.matchDetails()?.inningsData || []);
      })
      this.resizeObservable$ = fromEvent(window, 'resize');
      const resizeSubscription: Subscription = this.resizeObservable$.subscribe(() => {})
      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
        matchSubscription.unsubscribe();
        resizeSubscription.unsubscribe();
      })
      this.isMobile.set(this.appServices.isMobile());
    }
    onTabChange(e:any){
        this.TabSelected = e.addedItems[0];
        this.router.navigate(['/v2/scorecard'],{fragment: this.TabSelected})
    }
    generateSummary(){
        this.summary = Enumerable.from(this.ballArray())
          .groupBy(i => i.InningsId).select(g => {
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
              Dismissals: g.count(i => (i.Dismissal === 1) || (i.NonBallType === 9) || (i.NonBallType === 11)),
              Overs: overs,
              BattingClubId:g.first().BattingClubID,
              RunRate:checkInf(TeamTotal / overs)
            }
          }).orderBy(i=> i.Innings).toArray();
      }
      onInningsChange(e:any){
        this.selctedInnings = e.InningsID;
        this.inningService.selectedInnings.set(e.InningsID);
        this.inningService.currentInningData = e;
        this.inningService.ChangeInnings(e.InningsID);
        this.generateSummary();
      }
}
