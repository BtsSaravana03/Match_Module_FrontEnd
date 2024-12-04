import { Component, DestroyRef, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { InningsTabComponent } from "../components/innings-tab/innings-tab.component";
import { AppService } from '../services/app.service';
import { BallByBallService } from '../services/ball-by-ball.service';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import { Fielding } from './fielding.interface';
import { DxDataGridModule } from 'devextreme-angular';
import Enumerable from 'linq';
import { count } from 'rxjs';

@Component({
  selector: 'app-fielding',
  standalone: true,
  imports: [InningsTabComponent,DxDataGridModule],
  templateUrl: './fielding.component.html',
  styleUrl: './fielding.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class FieldingComponent implements OnInit {
  private appService = inject(AppService);
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  ballArray = signal<BallData[]>([]);
  FieldingStats:Fielding[] = [];
  selctedInnings:number = 1;

  ngOnInit(): void {
    this.appService.updateNavHeader('Fielding');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.generateStat();
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
    })
  }
  onInningsChange(e:number){
    this.selctedInnings = e;
    this.generateStat();
  }
  generateStat(){
    this.FieldingStats = Enumerable.from(this.ballArray())
    .where(i => i.FielderId !== null && i.FielderId !== 0 && i.InningsId === this.selctedInnings)
    .groupBy(i => i.FielderId)
    .select((g,index) => {
      const catchesTaken = this.getTotalCatches(g.key());
      const catchesDropped = g.count(i => i.FieldType === 1);
      const totalAttempts = catchesTaken + catchesDropped;
      const runoutSuccess = this.getRunouts(g.key());
      const runoutMissed = g.count(i => i.FieldType === 2);
      const runoutsAttempted = runoutSuccess + runoutMissed;
      return {
        SrNo:index +1,
        PlayerName: g.first().FielderName,
        RunsSaved: g.sum(i => i.SaveRun),
        RunsMissed: g.sum(i => i.MissRun),
        NetRunsSaved : g.sum(i => i.SaveRun) - g.sum(i => i.MissRun),
        CatchesTaken : catchesTaken,
        CatchesDropped: catchesDropped,
        CatchEfficiency: (totalAttempts>0?(catchesTaken / totalAttempts)*100:null),
        RunoutSuccess: runoutSuccess,
        RunoutMissed:runoutMissed,
        RunoutEfficiency: (runoutsAttempted >0)?((runoutSuccess / runoutsAttempted)*100):null,
        Touches: g.count()
      }
    }).toArray()
  }
  getTotalCatches(id: number | null): number {
    if (id) {
      return Enumerable.from(this.ballArray())
        .where(i => i.Dismissal > 0 && i.DismissalFielderID1 === id)
        .count();
    }
    return 0;
  }
  getRunouts(id: number | null): number {
    if (id) {
      return Enumerable.from(this.ballArray())
        .where(i => i.Dismissal > 0 && 
          (i.DismissalFielderID2 === id || (i.DismissalFielderID2 == null && i.DismissalFielderID1 === id)))
        .count();
    }
    return 0;
  }
}
