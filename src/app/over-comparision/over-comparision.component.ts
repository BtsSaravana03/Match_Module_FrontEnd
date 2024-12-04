import { AfterContentInit, AfterViewInit, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AppService } from '../services/app.service';
import { BallByBallService } from '../services/ball-by-ball.service';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import Enumerable from 'linq';
import { OverComparisionData } from './over-comparision.interface';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-over-comparision',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './over-comparision.component.html',
  styleUrl: './over-comparision.component.scss'
})
export class OverComparisionComponent implements OnInit{
  private appService = inject(AppService);
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  ballArray = signal<BallData[]>([]);
  matchDetails = signal<any>({});
  OverStats: OverComparisionData[] = [];

  ngOnInit(): void {
    this.appService.updateNavHeader('Over Comparison');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.generateStat();
    })
    
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      matchSubscription.unsubscribe();
    })
    this.generateStat();
  }
  generateStat(){
    const teamAId = this.matchDetails()?.ClubA;
    const teamBId = this.matchDetails()?.ClubB;

    this.OverStats = Enumerable.from(this.ballArray())
      .groupBy(i => i.OverId)
      .select((g) => {
        const teamARuns = g.where(i => i.BattingClubID === teamAId).sum(i => i.Runs);
        const teamAWickets = g.where(i => i.BattingClubID === teamAId).count(i => i.Dismissal > 0);
        const teamABoundary = g.where(i => i.BattingClubID === teamAId && (i.isFour===1 || i.isSix===1)).count();
        const teamATotal = g.where(i => i.BattingClubID === teamAId).lastOrDefault()?.TeamRuns;
        const teamADismissal = g.where(i => i.BattingClubID === teamAId).lastOrDefault()?.TeamWickets;


        const teamBRuns = g.where(i => i.BattingClubID === teamBId).sum(i => i.Runs);
        const teamBWickets = g.where(i => i.BattingClubID === teamBId).count(i => i.Dismissal > 0);
        const teamBBoundary = g.where(i => i.BattingClubID === teamBId  && (i.isFour===1 || i.isSix===1)).count();
        const teamBTotal = g.where(i => i.BattingClubID === teamBId).lastOrDefault()?.TeamRuns;
        const teamBDismissal = g.where(i => i.BattingClubID === teamBId).lastOrDefault()?.TeamWickets;

        return {
          OverNumber: g.first().OverId,
          TeamAName: this.matchDetails()?.ClubAPrefix,
          TeamARuns: teamARuns,
          TeamAWickets: teamAWickets,
          TeamABoundary: teamABoundary,
          TeamAScore: (teamATotal)?`${teamATotal}/${teamADismissal||0}`:'',

          TeamBName: this.matchDetails()?.ClubBPrefix,
          TeamBRuns: teamBRuns,
          TeamBWickets: teamBWickets,
          TeamBBoundary: teamBBoundary,
          TeamBScore: (teamBTotal)?`${teamBTotal}/${teamBDismissal||0}`:'',
        };
    }).toArray();
  }
}
