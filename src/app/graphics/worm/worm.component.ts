import { Component, DestroyRef, inject, signal } from '@angular/core';
import Enumerable from 'linq';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { VideoService } from '../../components/video/video.service';
import { GraphicsService } from '../graphics.service';
import { DxChartModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { InningsService } from '../../components/innings-tab/innings.service';
import _ from 'lodash';

@Component({
  selector: 'app-worm',
  standalone: true,
  imports: [DxChartModule,CommonModule],
  templateUrl: './worm.component.html',
  styleUrl: './worm.component.scss'
})
export class WormComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private videoService = inject(VideoService);
  private graphicServices = inject(GraphicsService);
  private InningService = inject(InningsService);

  ballArray = signal<BallData[]>([]);
  matchDetails = signal<any>({});
  worm:any[] = [];
  selctedInnings:number = 1;
  clubName:string = '';

  ngOnInit(): void {
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.setManhatten();
    })
    const filter = this.graphicServices.filterObservable.subscribe(updated => {
      this.setManhatten();
    });
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
      this.setManhatten();
    });
    const InnSub = this.InningService.InningsObserver$.subscribe(updated =>{
      this.selctedInnings = updated;
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      filter.unsubscribe();
      matchSubscription.unsubscribe();
      InnSub.unsubscribe();
    })

  }
  customizeLabelText = (pointInfo: any) => {
    return pointInfo.value !== 0 ? pointInfo.value.toString() : '';
};
  setManhatten() {
    if (this.matchDetails().inningsData && this.matchDetails().inningsData.length > 0) {
        let club = this.matchDetails().inningsData[this.selctedInnings - 1].BattingClubID;
        this.clubName = this.matchDetails().inningsData[this.selctedInnings - 1].BattingClubPrefix;
        let filteredBalls = this.graphicServices.applyFilter(this.ballArray());
        let totalOvers = this.matchDetails().MatchOvers;
        if (totalOvers === 0 && this.ballArray().length > 0) {
            totalOvers = _.last(this.ballArray())?.OverId ?? 0;
        }
        this.worm = Array.from({ length: totalOvers }, (_, index) => {
            const overId = index + 1;
            const overData = filteredBalls.filter(i => i.BattingClubID === club && i.OverId === overId && i.InningsId===this.selctedInnings);
            // const runs = overData.length > 0
            //     ? overData.reduce((sum, i) => sum + (i.TeamRuns || 0), 0)
            //     : null; // Set runs to null if no data for this over
            const runs = overData.length > 0?overData[overData.length-1].TeamRuns: null
            const wickets = overData.filter(i => i.Dismissal === 1).length;
            return {
                Over: overId,
                Runs: runs,
                Wickets: wickets,
            };
        });
        if (this.worm.length > 0) {
            this.worm.push({
                Over:0,
                Runs: 0,
                Wickets:0
            })
        }

    }
  }

}
