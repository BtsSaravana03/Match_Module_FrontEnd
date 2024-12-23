import { Component, DestroyRef, effect, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { GraphicsService } from '../graphics.service';
import { VideoService } from '../../components/video/video.service';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { CommonModule } from '@angular/common';
import { DxChartModule } from 'devextreme-angular';
import { InningsService } from '../../components/innings-tab/innings.service';
import _ from 'lodash';

@Component({
  selector: 'app-manhatten',
  standalone: true,
  imports: [DxChartModule,CommonModule],
  templateUrl: './manhatten.component.html',
  styleUrl: './manhatten.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class ManhattenComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private graphicServices = inject(GraphicsService);

  ballArray = signal<BallData[]>([]);
  matchDetails = signal<any>({});
  manhatten:any[] = [];
  selctedInnings = input.required<number>()
  clubName:string = '';

  constructor(){
    effect(()=>{
      if(this.ballArray() && this.selctedInnings()){
        this.setManhatten();
      }
    })
  }
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
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      filter.unsubscribe();
      matchSubscription.unsubscribe();
    })

  }
  customizeLabelText(pointInfo: any): string {
    return `${pointInfo.value}`;
  }
  setManhatten(){
    if(this.matchDetails().inningsData && this.matchDetails().inningsData.length>0){
      let club = this.matchDetails().inningsData[this.selctedInnings() - 1].BattingClubID;
      this.clubName = this.matchDetails().inningsData[this.selctedInnings() - 1].BattingClubPrefix;
      let filteredBalls = this.graphicServices.applyFilter(this.ballArray());
      let totalOvers = this.matchDetails().MatchOvers;
      if(totalOvers === 0 && this.ballArray().length>0){
        totalOvers = _.last(this.ballArray())?.OverId ?? 0;
      }
      this.manhatten = Array.from({ length: totalOvers }, (_, index) => {
      const overId = index + 1;
      const overData = filteredBalls.filter(i => i.BattingClubID === club && i.OverId === overId);
      const runs = overData.reduce((sum, i) => sum + (i.Runs || 0), 0);
      const wickets = overData.filter(i => i.Dismissal === 1).length;
          return {
              Over: overId,
              Runs: runs,
              Wickets: wickets,
          };
      });
      this.manhatten.push({
        Over:0,
        Runs: 0,
        Wickets:0
    })
    }

  }
}
