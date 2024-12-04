import { Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { GraphicsService } from '../graphics.service';
import { VideoService } from '../../components/video/video.service';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import Enumerable from 'linq';
import { CommonModule } from '@angular/common';
import { DxChartModule } from 'devextreme-angular';
import { InningsService } from '../../components/innings-tab/innings.service';

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
  private videoService = inject(VideoService);
  private graphicServices = inject(GraphicsService);
  private InningService = inject(InningsService);

  ballArray = signal<BallData[]>([]);
  matchDetails = signal<any>({});
  manhatten:any[] = [];
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
    })
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
  customizeLabelText(pointInfo: any): string {
    return `${pointInfo.value}`; 
  }
  setManhatten(){
    if(this.matchDetails().inningsData && this.matchDetails().inningsData.length>0){
      let club = this.matchDetails().inningsData[this.selctedInnings - 1].BattingClubID;
      this.clubName = this.matchDetails().inningsData[this.selctedInnings - 1].BattingClubPrefix;
      let filteredBalls = this.graphicServices.applyFilter(this.ballArray());
      
      this.manhatten = Enumerable.from(filteredBalls)
        .where(i => i.BattingClubID===club)
        .groupBy(i => `${i.OverId}`)
        .select((g, i) => {
          return {
            Over: g.first().OverId,
            Runs: g.lastOrDefault()?.TeamRuns || 0,
            Wickets: g.count(i => i.Dismissal === 1),
          };
        })
        .toArray();
    }
    
  }
}
