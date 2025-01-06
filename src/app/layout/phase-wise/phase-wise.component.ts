import { Component, effect, inject, input, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import Enumerable from 'linq';
import { checkSR } from '../../scripts/generic';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-phase-wise',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './phase-wise.component.html',
  styleUrl: './phase-wise.component.scss'
})
export class PhaseWiseComponent implements OnInit {
    private appServices = inject(AppService);
   selctedInnings = input.required<number>();
     ballArray = input.required<BallData[]>();
     phaseWise:any[] = [];
     isMobile = false;
     constructor(){
       effect(()=>{
           this.generatePhaseWise(this.ballArray(),this.selctedInnings());
       })
     }
     ngOnInit(): void {
         this.isMobile = this.appServices.isMobile();
     }
     generatePhaseWise(balls:BallData[],Innings:number){
        this.phaseWise = Enumerable.from(balls).
        where(i => i.InningsId === Innings)
        .groupBy(i => i.PhaseofPlay)
        .select(g => {
            return {
                Phase: g.first().PhaseofPlay,
                Runs: g.sum(i => i.Runs + i.Extras + i.Penalty + i.BLExtras),
                Wkts: g.count(i => i.Dismissal === 1),
                SR : checkSR(((g.sum(i => i.Runs + i.Extras)*100)/(g.sum(i => i.Bowlballs)))),
                Dots: g.count(i => i.Runs === 0 && i.ExtraTypeId !== 2),
                ['4s/6s']: g.count(i => i.isFour === 1) +'/'+ g.count(i => i.isSix === 1),
                ['1s/2s/3s']: g.count(i => i.Runs === 1) + '/'+ g.count(i => i.Runs === 2) + '/'+ g.count(i => i.Runs === 2),
                ['Bdry%']: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Bowlballs===1)) * 100),
                ['Dot%']: checkSR((g.count(i => i.Bowlruns === 0) / g.count(i => i.Bowlballs===1)) * 100),
                ['Wd/Nb']: g.count(i => i.isWide === 1) +'/'+g.count(i => i.isNoBall === 1),
                TeamScore: g.max(i => i.TeamRuns) +"/"+ g.max(i => i.TeamWickets)
            }
        }).toArray();
     }
}
