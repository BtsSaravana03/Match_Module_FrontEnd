import { Component, effect, input } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { checkSR } from '../../scripts/generic';
import { getDismissalString } from '../../scripts/cricket_gen';
import Enumerable from 'linq';

@Component({
  selector: 'app-batting-card',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './batting-card.component.html',
  styleUrl: './batting-card.component.scss'
})
export class BattingCardComponent {
  currentInnings = input.required<number>();
  ballArray = input.required<any[]>();
  battingCard:any[] = [];
  nonStrikerDismissal:any = {};
  constructor(){
    effect(()=>{
      if(this.ballArray() && this.currentInnings()){
        this.generateBattingCard();
      }
    })
  }
  generateBattingCard(){
    this.nonStrikerDismissal = [];
    this.battingCard = Enumerable.from(this.ballArray())
      .where(i => i.InningsId === this.currentInnings())
      .groupBy(i => `${i.StrikerID}##${i.StrikerName}`)
      .select(g => {
        const [striker_id, striker_name] = g.key().split('##');
        return {
            strikerID: striker_id,
            strikerName: striker_name,
            runs: g.sum(i => i.Batruns),
            balls: g.count(i => i.Batballs),
            strikeRate: checkSR((g.sum(i => i.Batruns) / g.count(i => i.Batballs)) * 100),
            dot: g.count(i => i.Batruns === 0),
            _1s: g.sum(i => (i.Batruns === 1 && i.ExtraTypeID === 0) ? 1 : 0),
            _2s: g.sum(i => (i.Batruns === 2 && i.ExtraTypeID === 0) ? 1 : 0),
            _3s: g.sum(i => (i.Batruns === 3 && i.ExtraTypeID === 0) ? 1 : 0),
            _4s: g.count(i => i.isFour === 1),
            _6s: g.count(i => i.isSix === 1),
            dotPer: checkSR((g.count(i => i.Batruns === 0) / g.count(i => i.Batballs)) * 100),
            bdryPer: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Batballs)) * 100),
            wkt: g.count(i => i.Dismissal === 1),
            dismissalSts: g.count(i => i.Dismissal === 1)===0?'Not Out': this.setDismissal(g.first(i => i.Dismissal === 1))
        };
    }).toArray();
    ///For Non-Striker Dismissals
    for (let i = 0; i < this.battingCard.length; i++) {
      let element = this.battingCard[i];
      if(this.nonStrikerDismissal[element.strikerID]){
        element.dismissalSts = getDismissalString(this.nonStrikerDismissal[element.strikerID]);
      }
    }
  }
  setDismissal(ball:any){
    if(ball.DismissedBatter !== ball.StrikerID){
      this.nonStrikerDismissal[ball.StrikerID] = ball;
      return null
    }
    return getDismissalString(ball);
  }
}
