import { Component, effect, input } from '@angular/core';
import Enumerable from 'linq';

@Component({
  selector: 'app-fall-of-wickets',
  standalone: true,
  imports: [],
  templateUrl: './fall-of-wickets.component.html',
  styleUrl: './fall-of-wickets.component.scss'
})
export class FallOfWicketsComponent {
  currentInnings = input.required<number>();
  ballArray = input.required<any[]>();
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
        order:e.DismissedOrder||(i+1),
        strikerName:e.DismissedBatterName,
        over:e.Overs,
        ballId:e.BallId,
        strikerId:e.StrikerID
      })
    })
    .toArray()
    console.log(this.wicketsCard);
  }
}
