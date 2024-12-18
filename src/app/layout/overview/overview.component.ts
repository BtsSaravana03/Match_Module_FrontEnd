import { Component, DestroyRef, inject, signal } from '@angular/core';
import { SummaryHeaderComponent } from "../../scorecard-v2/summary-header/summary-header.component";
import { BallByBallService } from '../../services/ball-by-ball.service';
import { InningsService } from '../../components/innings-tab/innings.service';
import { Router } from '@angular/router';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { BattingCardSummary } from '../../scorecard-v2/batting-card/batting-card.interface';
import { calculateOvers } from '../../scripts/cricket_gen';
import { checkInf } from '../../scripts/generic';
import Enumerable from 'linq';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [SummaryHeaderComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {
    private ballbyballService = inject(BallByBallService);
    private inningService = inject(InningsService);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    ballArray = signal<BallData[]>([]);
    summary:[]|BattingCardSummary[] = [];
    matchDetails = signal<any>({});
    totalInnings = signal<any[]>([]);
    selctedInnings:number = 1;
    currentInnings:number|undefined;

    ngOnInit(): void {
        const subscription = this.ballbyballService.ballObservable$.subscribe(updated => {
            this.ballArray.set(updated);
            this.currentInnings = this.ballArray()[this.ballArray().length - 1]?.InningsId || undefined;
            this.generateSummary();
        })
        const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated => {
            this.matchDetails.set(updated);
            this.selctedInnings = 1;
            this.totalInnings.set(this.matchDetails()?.inningsData || []);
        })
        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
            matchSubscription.unsubscribe();
        })
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
}
