import { ChangeDetectorRef, Component, DestroyRef, effect, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { DxDataGridModule, DxTabsModule } from 'devextreme-angular';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import { Partnership } from '../partnership/partnership.interface';
import { BallByBallService } from '../services/ball-by-ball.service';
import Enumerable from 'linq';
import { VideoService } from '../components/video/video.service';
import { VideoComponent } from "../components/video/video.component";
import { InningServiceService } from '../services/inning-service.service';
import { CommonModule } from '@angular/common';
import { MatchData } from '../scorecard-v2/batting-card/batting-card.interface';

@Component({
  selector: 'app-wto',
  standalone: true,
  imports: [DxDataGridModule, DxTabsModule, CommonModule, VideoComponent],
  templateUrl: './wto.component.html',
  styleUrl: './wto.component.scss'
})
export class WtoComponent {
    private inningService = inject(InningServiceService);
 private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private videoService = inject(VideoService);
  private cdr = inject(ChangeDetectorRef);
  private InningService = inject(InningServiceService);
  ballArrayFilteredWTO:BallData[] = [];

  constructor(){
    effect(() =>{
        this.generateBallByBallWTO(this.selctedInnings());
    })
  }

  ballArray = signal<BallData[]>([]);
  matchDetails = input.required<MatchData>();
  selctedInnings = input.required<number>();
  
  ngOnInit(): void {
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
       this.generateBallByBallWTO(this.selctedInnings());
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
    })
  }

   generateBallByBallWTO(innings:number){
    debugger;
      const Data = (this.ballArray());
       
      // this.ballArrayFilteredWTO = Data;
      const runningBalls: { [key: string]: number } = {};

       const Data2 = Data.map(ball => {
        const key = `${ball.InningsId}_${ball.StrikerID}`;
    
        if (!runningBalls[key]) {
          runningBalls[key] = 0;
        }
    
        runningBalls[key] += ball.Batruns ?? 0;
    
        return {
          ...ball,
          BatrunsRunning: runningBalls[key]
        };
      });
      
        const totals: Record<string, number> = {};
        for (const b of Data2) {
          const key = `${b.InningsId}_${b.StrikerID}`;
          totals[key] = (totals[key] || 0) + (b.Batruns ?? 0);
        }
      
        // 2) attach the SAME total to every matching row
        const Data3 = Data2.map(b => {
          const key = `${b.InningsId}_${b.StrikerID}`;
          return {
            ...b,
            FinalBatrunsRunning: totals[key] ?? 0   // matches your grid's dataField
          };
        });

      this.ballArrayFilteredWTO = Enumerable.from(Data3)
      .where(i => i.InningsId === innings && (i.FieldType == 1 || i.FieldType == 2 || i.FieldType == 5 )).toArray();

      
    }


    getTeamScore(rowData: any) {
      // Handle nulls or undefined values safely
      const runs = rowData.TeamRuns ?? 0;
      const wickets = rowData.TeamWickets ?? 0;
      return `${runs} / ${wickets}`;
    }

   
      onCellClick(index:number,rowData?:BallData){
    this.videoService.PlaySingleball(index,this.selctedInnings(),rowData?.BallId);
  }
}
