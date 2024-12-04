import { Component, DestroyRef, inject, signal, ViewEncapsulation } from '@angular/core';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import { BallByBallService } from '../services/ball-by-ball.service';
import { AppService } from '../services/app.service';
import { InningsService } from '../components/innings-tab/innings.service';
import Enumerable from 'linq';
import { checkSR } from '../scripts/generic';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-match-info',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './match-info.component.html',
  styleUrl: './match-info.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class MatchInfoComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);
  private InningService = inject(InningsService);

  ballArray = signal<BallData[]>([]);
  info:any[] = [];
  matchDetails = signal<any>({});
  totalInnings = signal<any[]>([]);
  selctedInnings:number = 1;
  ClubAName:string = '';
  ClubBName:string = '';
  MatchInfo:any[] = [];
  Phase:any[] = [{PowerPlay:[]},{Middle:[]},{Death:[]}];
  powerplayRange:[from:number,to:number] = [0,0];
  middleOverRange:[from:number,to:number] = [0,0];
  deathOverRange:[from:number,to:number] = [0,0];

  ngOnInit(): void {
    this.appService.updateNavHeader('Match Overview');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      //this.generateInfo();
      this.generateTotalMatchInfo();
    })
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
      this.generateTotalMatchInfo();
    })
    const InnSub = this.InningService.InningsObserver$.subscribe(updated =>{
      this.selctedInnings = updated;
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      matchSubscription.unsubscribe();
      InnSub.unsubscribe();
    })
  }
  generateTeamInfo(clubID:number){
    let data = Enumerable.from(this.ballArray())
    .where(i => i.BattingClubID === clubID)
    .groupBy(i=> i.BattingClubID)
    .select((g,i)=>{
      return{
        Runs: g.sum(i => i.Runs),
        Wickets: g.count(i => i.Dismissal===1),
        Fours : g.count(i => i.isFour === 1),
        Six : g.count(i => i.isSix === 1),
        Dots : g.count(i => i.Bowlballs === 1 && i.Bowlruns===0),
        _1s: g.sum(i => (i.Bowlruns === 1 && i.ExtraTypeId === 0) ? 1 : 0),
        _2s: g.sum(i => (i.Bowlruns === 2 && i.ExtraTypeId === 0) ? 1 : 0),
        _3s: g.sum(i => (i.Bowlruns === 3 && i.ExtraTypeId === 0) ? 1 : 0),
        Wides: g.count(i => i.ExtraTypeId === 2),
        NoBall : g.count (i => i.isNoBall === 1),
        Byes : g.count(i => i.ExtraTypeId === 4),
        LegByes: g.count(i => i.ExtraTypeId === 3),
        FullToss: g.count(i => i.DeliveryStyle === 16),
        Yorkers: g.count(i => i.DeliveryStyle === 5 || i.DeliveryStyle === 28),
        RunsOfYorker: g.sum(i => (i.DeliveryStyle === 5 || i.DeliveryStyle === 28) ? i.Runs : 0),
        NoOfBouncer: g.count(i => i.DeliveryStyle === 4|| i.DeliveryStyle === 23),
        RunsOfBouncer: g.sum(i => (i.DeliveryStyle === 4|| i.DeliveryStyle === 23) ? i.Runs : 0),
        NoOfSlowBouncer: g.count(i => i.DeliveryStyle === 23),
        RunsOfSlowBouncer: g.sum(i => (i.DeliveryStyle === 23) ? i.Runs : 0),
        FirstBallBoundary: g.count(i => (i.isFour===1 || i.isSix===1) && i.OverBallNo===1),
        LastBallBoundary: g.count(i => (i.isFour===1 || i.isSix===1) && i.OverBallNo===6)
      }
    }).toArray();
    return data;
  }
  generatePhaseInfo(range:[from:number,to:number],clubID:number){
    let data = Enumerable.from(this.ballArray())
    .where(i => i.BattingClubID=== clubID && (i.Overs >= range[0] && i.Overs <= range[1]))
    .groupBy(i=> i.BattingClubID)
    .select((g,i)=>{

      return{
        ['Runs/Wkts']: g.sum(i => i.Runs) +'/'+ g.count(i => i.Dismissal===1),
        Dots : g.count(i => i.Bowlballs === 1 && i.Bowlruns===0),
        ['Dots%']: checkSR((g.count(i => i.Bowlruns === 0) / g.count(i => i.Bowlballs===1)) * 100),
        ['4/6'] : g.count(i => i.isFour === 1) +'/'+g.count(i => i.isSix === 1),
      }
    }).toArray()
    return data;
  }

  generateTotalMatchInfo(){
    this.Phase = [{PowerPlay:[]},{Middle:[]},{Death:[]}];
    if(this.matchDetails().inningsData && this.matchDetails().inningsData.length > 0){
      this.powerplayRange =  this.matchDetails().MatchOvers === 20?[0,6]:[0,10];
      this.middleOverRange = this.matchDetails().MatchOvers === 20?[6.1,15]:[10.1,40];
      this.deathOverRange = this.matchDetails().MatchOvers === 20?[15.1,20]:[40.1,50];
      let ClubA = this.matchDetails().inningsData[0].BattingClubID;
      let ClubB = this.matchDetails().inningsData[0].BowlingClubID;
      this.ClubAName = this.matchDetails().inningsData[0].BattingClubPrefix;
      this.ClubBName = this.matchDetails().inningsData[0].BowlingClubPrefix;
      let TeamAData = this.generateTeamInfo(ClubA);
      let TeamBData = this.generateTeamInfo(ClubB);
      const keys_matchinfo = ['Runs', 'Wickets', 'Fours', 'Six', 'Dots', '_1s', '_2s', '_3s', 'Wides', 'NoBall', 'Byes', 'LegByes', 
        'FullToss', 'Yorkers', 'RunsOfYorker', 'NoOfBouncer', 'RunsOfBouncer', 'NoOfSlowBouncer', 'RunsOfSlowBouncer', 
        'FirstBallBoundary', 'LastBallBoundary'];
      this.MatchInfo =keys_matchinfo.map((key:string) => {
        return {
          [this.ClubAName]: TeamAData.length>0?TeamAData[0][key as keyof typeof TeamAData[0]]:'',
          key: key,
          [this.ClubBName]: TeamBData.length>0?TeamBData[0][key as keyof typeof TeamBData[0]]:'',
        };
      });
      let PowerplayA =  this.generatePhaseInfo(this.powerplayRange,ClubA);
      let PowerplayB =  this.generatePhaseInfo(this.powerplayRange,ClubB);
      let MiddleOverA = this.generatePhaseInfo(this.middleOverRange,ClubA);
      let MiddleOverB = this.generatePhaseInfo(this.middleOverRange,ClubB);
      let DeathOverA = this.generatePhaseInfo(this.deathOverRange,ClubA);
      let DeathOverB = this.generatePhaseInfo(this.deathOverRange,ClubB);
      const keys = ['Runs/Wkts', 'Dots', 'Dots%', '4/6'];
      this.Phase = [
        { 
          PowerPlay: keys.map((key: string) => ({
            [this.ClubAName]: PowerplayA.length > 0 ? PowerplayA[0][key as keyof typeof PowerplayA[0]] : '',
            key: key,
            [this.ClubBName]: PowerplayB.length > 0 ? PowerplayB[0][key as keyof typeof PowerplayB[0]] : '',
          }))
        },
        { 
          Middle: keys.map((key: string) => ({
            [this.ClubAName]: MiddleOverA.length > 0 ? MiddleOverA[0][key as keyof typeof MiddleOverA[0]] : '',
            key: key,
            [this.ClubBName]: MiddleOverB.length > 0 ? MiddleOverB[0][key as keyof typeof MiddleOverB[0]] : '',
          }))
        },
        { 
          Death: keys.map((key: string) => ({
            [this.ClubAName]: DeathOverA.length > 0 ? DeathOverA[0][key as keyof typeof DeathOverA[0]] : '',
            key: key,
            [this.ClubBName]: DeathOverB.length > 0 ? DeathOverB[0][key as keyof typeof DeathOverB[0]] : '',
          }))
        }
      ];      
    }
  }
  onInningsChange(e:number){
    this.selctedInnings = e;
  }
}
