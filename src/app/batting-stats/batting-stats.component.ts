import { Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../services/ball-by-ball.service';
import { AppService } from '../services/app.service';
import { InningsService } from '../components/innings-tab/innings.service';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import Enumerable from 'linq';
import { checkSR } from '../scripts/generic';
import { BattingStats, BattingStatsTest } from './batting-stats.interface';
import { DxDataGridModule } from 'devextreme-angular';
import { VideoService } from '../components/video/video.service';
import { VideoComponent } from "../components/video/video.component";

@Component({
  selector: 'app-batting-stats',
  standalone: true,
  imports: [DxDataGridModule, VideoComponent],
  templateUrl: './batting-stats.component.html',
  styleUrl: './batting-stats.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class BattingStatsComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);
  private InningService = inject(InningsService);
  private videoService = inject(VideoService);

  ballArray = signal<BallData[]>([]);
  matchDetails = signal<any>({});
  selctedInnings = 1;
  isTestMatch:boolean = false;
  Table_Inn:BattingStats[] =[];
  Table_Day:BattingStatsTest[] =[];
  Table_Session:BattingStatsTest[] =[];
  Table_BowlingType:BattingStats[] =[];


  ngOnInit(): void {
    this.appService.updateNavHeader('Batting Stats');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.generateBattingstats();
    })
    const InnSub = this.InningService.InningsObserver$.subscribe(updated =>{
      this.selctedInnings = updated;
    });
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
      this.isTestMatch = this.matchDetails()?.isLimitedOvers === 0?true:false;
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
       InnSub.unsubscribe();
    })
  }
  generateBattingstats(){
    this.Table_Inn = Enumerable.from(this.ballArray())
    .where(i => i.InningsId === this.selctedInnings)
    .groupBy(i => i.InningsId)
    .select(g => {
      const maiden = g.groupBy(i => i.OverId && i.ExtraTypeId===0)
            .count(over => over.sum(ball => ball.Bowlruns) === 0 && over.count() === 6);
      return {
        Innings:g.first().InningsId,
        BowlingType:null,
        Runs: g.sum(i => i.Batruns),
        Balls: g.sum(i => i.Batballs),
        Out: g.count(i => i.Dismissal===1),
        Maiden: maiden,
        BPD: checkSR(g.sum(i => i.Batballs)/g.count(i => i.Dismissal===1)),
        AVG: checkSR(g.sum(i => i.Batruns)/g.count(i => i.Dismissal===1)),
        strikeRate: checkSR((g.sum(i => i.Batruns) / g.count(i => i.Batballs===1)) * 100),
        dot: g.count(i => i.Batruns === 0),
        _1s: g.sum(i => (i.Batruns === 1 && i.ExtraTypeId === 0) ? 1 : 0),
        _2s: g.sum(i => (i.Batruns === 2 && i.ExtraTypeId === 0) ? 1 : 0),
        _3s: g.sum(i => (i.Batruns === 3 && i.ExtraTypeId === 0) ? 1 : 0),
        _4s: g.count(i => i.isFour === 1),
        _6s: g.count(i => i.isSix === 1),
        dotPer: checkSR((g.count(i => i.Batruns === 0) / g.count(i => i.Batballs===1)) * 100),
        bdryPer: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Batballs===1)) * 100),
      }
    }).toArray();

    this.Table_Day = Enumerable.from(this.ballArray())
    .where(i => i.InningsId === this.selctedInnings)
    .groupBy(i => i.Day)
    .select(g => {
      const maiden = g.groupBy(i => i.OverId && i.ExtraTypeId===0)
            .count(over => over.sum(ball => ball.Bowlruns) === 0 && over.count() === 6);
      return {
        Innings:g.first().InningsId,
        Runs: g.sum(i => i.Batruns),
        Day: g.first().Day,
        Session: g.first().Session,
        Balls: g.sum(i => i.Batballs),
        Out: g.count(i => i.Dismissal===1),
        Maiden: maiden,
        BPD: checkSR(g.sum(i => i.Batballs)/g.count(i => i.Dismissal===1)),
        AVG: checkSR(g.sum(i => i.Batruns)/g.count(i => i.Dismissal===1)),
        strikeRate: checkSR((g.sum(i => i.Batruns) / g.count(i => i.Batballs===1)) * 100),
        dot: g.count(i => i.Batruns === 0),
        _1s: g.sum(i => (i.Batruns === 1 && i.ExtraTypeId === 0) ? 1 : 0),
        _2s: g.sum(i => (i.Batruns === 2 && i.ExtraTypeId === 0) ? 1 : 0),
        _3s: g.sum(i => (i.Batruns === 3 && i.ExtraTypeId === 0) ? 1 : 0),
        _4s: g.count(i => i.isFour === 1),
        _6s: g.count(i => i.isSix === 1),
        dotPer: checkSR((g.count(i => i.Batruns === 0) / g.count(i => i.Batballs===1)) * 100),
        bdryPer: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Batballs===1)) * 100),
      }
    }).toArray();
    
    this.Table_Session = Enumerable.from(this.ballArray())
    .where(i => i.InningsId === this.selctedInnings)
    .groupBy(i => i.Session)
    .select(g => {
      const maiden = g.groupBy(i => i.OverId && i.ExtraTypeId===0)
            .count(over => over.sum(ball => ball.Bowlruns) === 0 && over.count() === 6);
      return {
        Innings:g.first().InningsId,
        Runs: g.sum(i => i.Batruns),
        Day: g.first().Day,
        Session: g.first().Session,
        Balls: g.sum(i => i.Batballs),
        Out: g.count(i => i.Dismissal===1),
        Maiden: maiden,
        BPD: checkSR(g.sum(i => i.Batballs)/g.count(i => i.Dismissal===1)),
        AVG: checkSR(g.sum(i => i.Batruns)/g.count(i => i.Dismissal===1)),
        strikeRate: checkSR((g.sum(i => i.Batruns) / g.count(i => i.Batballs===1)) * 100),
        dot: g.count(i => i.Batruns === 0),
        _1s: g.sum(i => (i.Batruns === 1 && i.ExtraTypeId === 0) ? 1 : 0),
        _2s: g.sum(i => (i.Batruns === 2 && i.ExtraTypeId === 0) ? 1 : 0),
        _3s: g.sum(i => (i.Batruns === 3 && i.ExtraTypeId === 0) ? 1 : 0),
        _4s: g.count(i => i.isFour === 1),
        _6s: g.count(i => i.isSix === 1),
        dotPer: checkSR((g.count(i => i.Batruns === 0) / g.count(i => i.Batballs===1)) * 100),
        bdryPer: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Batballs===1)) * 100),
      }
    }).toArray();

    this.Table_BowlingType = Enumerable.from(this.ballArray())
    .where(i => i.InningsId === this.selctedInnings && (i.SpinOrPace !== null && i.SpinOrPace !== 0))
    .groupBy(i => i.SpinOrPace)
    .select(g => {
      const maiden = g.groupBy(i => i.OverId && i.ExtraTypeId===0)
            .count(over => over.sum(ball => ball.Bowlruns) === 0 && over.count() === 6);
      return {
        BowlingType: g.first().SpinOrPace===1?'Pace':'Spin',
        Innings:g.first().InningsId,
        Runs: g.sum(i => i.Batruns),
        Balls: g.sum(i => i.Batballs),
        Out: g.count(i => i.Dismissal===1),
        Maiden: maiden,
        BPD: checkSR(g.sum(i => i.Batballs)/g.count(i => i.Dismissal===1)),
        AVG: checkSR(g.sum(i => i.Batruns)/g.count(i => i.Dismissal===1)),
        strikeRate: checkSR((g.sum(i => i.Batruns) / g.count(i => i.Batballs===1)) * 100),
        dot: g.count(i => i.Batruns === 0),
        _1s: g.sum(i => (i.Batruns === 1 && i.ExtraTypeId === 0) ? 1 : 0),
        _2s: g.sum(i => (i.Batruns === 2 && i.ExtraTypeId === 0) ? 1 : 0),
        _3s: g.sum(i => (i.Batruns === 3 && i.ExtraTypeId === 0) ? 1 : 0),
        _4s: g.count(i => i.isFour === 1),
        _6s: g.count(i => i.isSix === 1),
        dotPer: checkSR((g.count(i => i.Batruns === 0) / g.count(i => i.Batballs===1)) * 100),
        bdryPer: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Batballs===1)) * 100),
      }
    }).toArray();
  } 
  onCellClick(type:string,data:any){
    this.videoService.statsVideos(type,this.selctedInnings,data);
  }
}
