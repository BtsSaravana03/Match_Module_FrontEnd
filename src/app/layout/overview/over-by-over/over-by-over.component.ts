import { Component, effect, input } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import { BallData } from '../../../ball-by-ball/ball-by-ball.interface';
import Enumerable from 'linq';

@Component({
  selector: 'app-over-by-over',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './over-by-over.component.html',
  styleUrl: './over-by-over.component.scss'
})
export class OverByOverComponent {
    ballArray = input.required<BallData[]>();
    selctedInnings = input.required<number>();
    overByOverData:any[] = [];
    constructor(){
        effect(()=>{
          if(this.ballArray() && this.selctedInnings()){
            this.generateOverByOver();
          }
        })
      }
    generateOverByOver(){
        this.overByOverData = Enumerable.from(this.ballArray())
        .where(i => i.InningsId === this.selctedInnings())
        .groupBy(i => i.OverId)
        .select(g => {
            return{
                Over: g.first().OverId,
                ["Bowler(Over#)"]: `${g.first().BowlerName}(${this.getBowlerOvers(g.first().BowlerID)})`,
                Runs: g.sum(i => i.Runs + i.Extras + i.Penalty + i.BLExtras),
                Wkts: g.count(i=>i.Bowlwkts===1),
                Dots: g.sum(i => (i.Bowlruns === 0 && i.ExtraTypeId === 0) ? 1 : 0),
                ["4s"]: g.count(i => i.isFour === 1),
                ["6s"]: g.count(i => i.isSix === 1),
                Bs: g.count(i => i.isFour === 1) + g.count(i => i.isSix === 1),
                Extras: g.sum(i => i.Extras + i.BLExtras)
            }
        }).toArray();
     }
     getBowlerOvers(Bowlerid:number):number{
        let Total = 0;
        Total = Enumerable.from(this.ballArray()).where(i => i.BowlerID === Bowlerid)
        .groupBy(i => i.OverId).count();
        return Total;
     }
     onRowPrepared(event: any): void {
        if (event.rowType === 'data' && event.data.Bs === 0) {
          event.rowElement.classList.add('no-boundary-row');
        }
      }

}
