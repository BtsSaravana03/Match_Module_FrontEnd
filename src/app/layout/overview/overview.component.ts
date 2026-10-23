import { Component, DestroyRef, inject, signal } from '@angular/core';
import { SummaryHeaderComponent } from "../../scorecard-v2/summary-header/summary-header.component";
import { BallByBallService } from '../../services/ball-by-ball.service';
import { Router } from '@angular/router';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { BattingCardSummary } from '../../scorecard-v2/batting-card/batting-card.interface';
import { calculateOvers, calculateOversPrecise, isTestMatch } from '../../scripts/cricket_gen';
import { checkInf } from '../../scripts/generic';
import Enumerable from 'linq';
import { CardComponent } from "../sharedComponents/card/card.component";
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../sharedComponents/tabs/tabs.component';
import { InningServiceService } from '../../services/inning-service.service';
import { OverByOverComponent } from "./over-by-over/over-by-over.component";
import { DxTabsModule } from 'devextreme-angular';
import { AppService } from '../../services/app.service';
import { PhaseWiseComponent } from "../phase-wise/phase-wise.component";
import { OverComparisonComponent } from './over-comparison/over-comparison.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [SummaryHeaderComponent, CardComponent, CommonModule, TabsComponent, OverByOverComponent, DxTabsModule, PhaseWiseComponent, OverComparisonComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  private ballbyballService = inject(BallByBallService);
  private inningService = inject(InningServiceService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);
  ballArray = signal<BallData[]>([]);
  summary: [] | BattingCardSummary[] = [];
  matchDetails = signal<any>(undefined);
  totalInnings = signal<any[]>([]);
  selctedInnings: number = 1;
  currentInnings: number | undefined;
  Tabs = ['OverByOver', 'PhaseWise', 'OverComparison'];
  TabSelected: string = 'OverByOver';
  isMobile = false;
  isTestMatch = false;

  ngOnInit(): void {
    this.isMobile = this.appService.isMobile();
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated => {
      this.ballArray.set(updated);
      this.currentInnings = this.ballArray()[this.ballArray().length - 1]?.InningsId || undefined;
      this.generateSummary();
    })
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated => {
      this.matchDetails.set(updated);
      this.selctedInnings = 1;
      this.totalInnings.set(this.matchDetails().inningsData || []);
      this.isTestMatch = isTestMatch(this.matchDetails().MatchTypeID);
      if (this.isTestMatch) {
        this.Tabs = ['OverByOver', 'PhaseWise', 'OverComparison'];
      } else {
        this.Tabs = ['OverByOver', 'PhaseWise', 'OverComparison'];
      }
    })
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
      matchSubscription.unsubscribe();
    })
  }
  onTabChange(e: any) {
    this.TabSelected = e.addedItems[0];
  }
  generateSummary() {
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
        const TeamTotal = Math.max(g.max(i => i.TeamRuns) || 0, g.sum(i => i.Runs + i.Penalty + i.Extras + i.BLExtras));
        const overs = calculateOversPrecise(g.toArray());
        return {
          Innings: g.first().InningsId,
          TeamTotal: TeamTotal,
          ExtrasTotal: Object.values(extrasByType).reduce((acc, val) => acc + val, 0),
          ExtrasBreakup: extrasBreakup,
          Dismissals: g.count(i => (i.Dismissal === 1) || (i.NonBallType === 9) || (i.NonBallType === 11) || (i.NonBallType === 16) || (i.DismissalTypeID === 16) || (i.DismissalTypeID === 9)),
          Overs: overs,
          BattingClubId: g.first().BattingClubID,
          RunRate: checkInf(TeamTotal / overs)
        }
      }).orderBy(i => i.Innings).toArray();
  }
  onInningsChange(e: any) {
    this.selctedInnings = e.InningsID;
    this.inningService.selectedInnings.set(e.InningsID);
    this.inningService.currentInningData = e;
    this.inningService.ChangeInnings(e.InningsID)
  }
}
