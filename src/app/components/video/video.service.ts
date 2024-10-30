import { DestroyRef, inject, Injectable, OnInit, signal } from '@angular/core';
import { HttpServices } from '../../services/http.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import Enumerable from 'linq';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { VideoComponent } from './video.component';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  videoArray = signal <any[]> ([]);
  currentVideoIndex = signal <number> (0);
  ballArray = signal<BallData[]|[]>([]);
  videoComponent:VideoComponent|undefined;
  constructor(){
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      console.log(updated);
      this.ballArray.set(updated);
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe()
    })
  }
  setComponent(component:VideoComponent){
    this.videoComponent = component;
  }
  playVideo(){
    if(this.videoComponent){
      this.videoComponent.show();
      this.videoComponent.videoPopup = true;
    }
  }
  LibraryBallVideo(PlayerID:number, type:any, inningsId:number) {
    let videos = Enumerable.from(this.ballArray())
      .where((x: BallData) => this.checkBallVideoFilter(x, PlayerID, type) && x.InningsId === inningsId)
      .groupBy(
        (x: BallData) => `${x.MatchId}-${x.BowlingClubID}-${x.deviceTime_Start}-${x.deviceTime_End}-${x.MatchId}-${x.StrikerName}-${x.InningsId}-${x.BallId}-${x.hlsPath}-${x.Overs}-${x.BowlerName}-${x.Runs}`
      )
      .select((group) => {
        const maxByField = <T>(field: keyof T) => group.max((item: any) => item[field]);

        return {
          MatchID: group.first().MatchId,
          MatchName: group.first().StrikerName,
          BowlingStyle: group.first().DeliveryStyle,
          DeliveryStyleID: group.first().DeliveryStyle,
          StrikerName: group.first().StrikerName,
          StrikerID: group.first().StrikerID,
          BowlerName: group.first().BowlerName,
          BowlerID: group.first().BowlerID,
          Runs: group.first().Runs,
          competitionid: group.first().BowlingClubID,
          InningsID: group.first().InningsId,
          VideoPath: group.first().hlsPath,
          BallID: group.first().BallId,
          Overs: group.first().Overs,
          StartTimeTrim: group.first().deviceTime_Start,
          EndTimeTrim: group.first().deviceTime_End,
          StrokeName: maxByField('StrokeType'),
          StrokeID: group.first().StrokeType,
          DeliveryStyleName: maxByField('DeliveryStyle'),
          VenueName: maxByField('BowlingEnd'),
          Dismissal: maxByField('Dismissal'),
          TeamScore: maxByField('TeamRuns'),
          BatsmenScore: maxByField('Batruns'),
          ReplayVideo: maxByField('hlsPath'),
          Ballspeed: maxByField('Penalty'),
          VideoNA: group.first().isNoBall,
          VideoMode: group.first().VideoMode,
        };
      })
      .toArray();
      this.videoArray.set(videos);
      this.playVideo();
}
  setTab(type:'Bat'|'Bowl'){
    if(type && this.videoComponent){
      this.videoComponent.currentTab = type;
    }
  }
  checkBallVideoFilter(ball:BallData, PlayerID:number, type:string) {
    if (type == 'Ball') {
     
      if (ball.StrikerID == PlayerID) {
        this.setTab('Bat');
        return true;
      }
    } else if (type == 'Dots') {
      
      if (ball.StrikerID === PlayerID && ball.Runs === 0 && ball.Batballs === 1) {
        this.setTab('Bat');
        return true;
      }
    } 
    else if (type == 'Fours') {
      if (ball.StrikerID == PlayerID && ball.isFour == 1) {
        this.setTab('Bat');
        return true;
      }
    } else if (type == 'Sixs') {
      if (ball.StrikerID == PlayerID && ball.isSix == 1) {
        this.setTab('Bat');
        return true;
      }
    } else if (type == 'Runs') {
      if (ball.StrikerID == PlayerID && ball.Runs > 0 && ball.Batballs === 1) {
        this.setTab('Bat');
        return true;
      }
    } else if (type == 'Ones') {
      if (ball.StrikerID == PlayerID && ball.Runs == 1 && ball.Batballs === 1) {
        this.setTab('Bat');
        return true;
      }
    } else if (type == 'Twos') {
      if (ball.StrikerID == PlayerID && ball.Runs == 2 && ball.Batballs === 1) {
        this.setTab('Bat');
        return true;
      }
    } else if (type == 'Threes') {
      if (ball.StrikerID == PlayerID && ball.Runs == 3 && ball.Batballs === 1) {
        this.setTab('Bat');
        return true;
      }
    } else if (type == 'BatsmanWickets') {
      if (ball.DismissedBatter == PlayerID && ball.StrikerID === PlayerID && ball.Dismissal === 1) {
        this.setTab('Bat');
        return true;
      }
    }
    ///
    else if (type === 'Runss') {
      if (ball.BowlerID === PlayerID && ball.Runs > 0) {
        this.setTab('Bowl');
        return true;
      }
    } else if (type === 'Overs') {
      if (ball.BowlerID === PlayerID) {
        this.setTab('Bowl');
        return true;
      }
    } else if (type === 'OverID') {
      if (ball.BowlerID === PlayerID) {
        this.setTab('Bowl');
        return true;
      }
    } else if (type === 'Maiden') {
      if (ball.BowlerID === PlayerID && ball.Maiden === 1) {
        this.setTab('Bowl');
        return true;
      }
    } else if (type === 'Wickets') {
      if (ball.BowlerID === PlayerID && ball.Dismissal === 1) {
        this.setTab('Bowl');
        return true;
      }
    } else if (type == 'Extras') {

      if (ball.BowlerID === PlayerID && ball.ExtraTypeId !== 0) {
        this.setTab('Bowl');
        return true;
      }
    } else if (type === 'Wide') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.isWide === 1)
        return true;
    } else if (type === 'NB') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.isNoBall === 1 )
        return true;
    } else if (type === 'SixsB') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.isSix === 1)
        return true;
    } else if (type === 'FoursB') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.isFour === 1)
        return true;
    } else if (type === 'ThreesB') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.Runs === 3)
        return true;
    } else if (type === 'TwosB') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.Runs === 2)
        return true;
    } else if (type === 'OnesB') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.Runs === 1)
        return true;
    } else if (type === 'LegByeB') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.ExtraTypeId === 1)
        return true;
    } else if (type === 'ByeB') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.ExtraTypeId === 1)
        return true;
    } else if (type == 'DotP') {
      this.setTab('Bowl');
      if (ball.BowlerID === PlayerID && ball.Runs === 0 && ball.Bowlballs===1) {
        return true;
      }
    }

    return false;
  }
}
