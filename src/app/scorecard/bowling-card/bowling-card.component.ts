import { Component, effect, input } from '@angular/core';
import Enumerable from 'linq';
import { checkSR } from '../../scripts/generic';
import { calculateOvers } from '../../scripts/cricket_gen';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-bowling-card',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './bowling-card.component.html',
  styleUrl: './bowling-card.component.scss'
})
export class BowlingCardComponent {
  currentInnings = input.required<number>();
  ballArray = input.required<any[]>();
  bowlingCard:any[] = [];
  constructor(){
    effect(()=>{
      if(this.ballArray() && this.currentInnings()){
        this.generateBowlingCard();
      }
    })
  }
  generateBowlingCard(){
    this.bowlingCard = Enumerable.from(this.ballArray())
      .where(i => i.InningsId === this.currentInnings())
      .groupBy(i => `${i.BowlerID}##${i.BowlerName}`)
      .select(g => {
        const [bowler_id, bowler_name] = g.key().split('##');
        const maiden = g.groupBy(i => i.OverId && i.ExtraTypeID===0)
            .count(over => over.sum(ball => ball.Bowlruns) === 0 && over.count() === 6);
        return {
            bowlerId: bowler_id,
            bowlerName: bowler_name,
            balls: g.count(i=> i.Bowlballs===1),
            runs: g.sum(i=> i.Bowlruns),
            overs: calculateOvers(g.sum(i=> i.Bowlballs===1?1:0)),
            maiden: maiden,
            wkt: g.count(i=>i.Bowlwkts===1),
            economy: checkSR((g.sum(i => i.Bowlballs)/g.sum(i=>i.Bowlballs))*6),
            wide: g.count(i=>i.isWide===1),
            nb: g.count(i=>i.isNoBall===1),
            byes: g.count(i=>i.ExtraTypeID===4),
            legByes: g.count(i=>i.ExtraTypeID===3),
            dot: g.sum(i => (i.Bowlruns === 0 && i.ExtraTypeID === 0) ? 1 : 0),
            _1s: g.sum(i => (i.Bowlruns === 1 && i.ExtraTypeID === 0) ? 1 : 0),
            _2s: g.sum(i => (i.Bowlruns === 2 && i.ExtraTypeID === 0) ? 1 : 0),
            _3s: g.sum(i => (i.Bowlruns === 3 && i.ExtraTypeID === 0) ? 1 : 0),
            _4s: g.count(i => i.isFour === 1),
            _6s: g.count(i => i.isSix === 1),
            dotPer: checkSR((g.count(i => i.Bowlruns === 0) / g.count(i => i.Bowlballs)) * 100),
            bdryPer: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Bowlballs)) * 100),
        };
    }).toArray();
  }
}
