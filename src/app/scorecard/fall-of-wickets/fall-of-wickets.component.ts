import { Component, effect, inject, input } from '@angular/core';
import Enumerable from 'linq';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { VideoService } from '../../components/video/video.service';

@Component({
  selector: 'app-fall-of-wickets',
  standalone: true,
  imports: [],
  templateUrl: './fall-of-wickets.component.html',
  styleUrl: './fall-of-wickets.component.scss'
})
export class FallOfWicketsComponent {
  currentInnings = input.required<number>();
  private video = inject(VideoService);
  ballArray = input.required<BallData[]|[]>();
  wicketsCard:any[] = [];
  constructor(){
    effect(()=>{
      if(this.ballArray() && this.currentInnings()){
        this.generateFallOfWickets();
      }
    })
  }
  generateFallOfWickets(){
    this.wicketsCard = [];
    const filteredBalls = Enumerable.from(this.ballArray())
    .where(w => w.InningsId === this.currentInnings() && w.Dismissal===1)
    .select((e,i)=>{
      this.wicketsCard.push({
        teamRuns:e.TeamRuns,
        //order:e.DismissedOrder||(i+1),
        order:(i+1),
        strikerName:e.DismissedBatterName,
        over:e.Overs,
        ballId:e.BallId,
        strikerId:e.StrikerID
      })
    })
    .toArray()
  }
  onClick(e:any){
    this.video.LibraryBallVideo(e.strikerId,'BatsmanWickets',this.currentInnings());
  }
}
