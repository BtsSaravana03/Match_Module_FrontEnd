import { inject, Injectable } from '@angular/core';
import { HttpServices } from './http.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BallByBallService {
  private httpService = inject(HttpServices);
  private ballByBall$ = new BehaviorSubject<any[]>([]);
  private matchDetails$ = new BehaviorSubject<any[]>([]);
  ballObservable$ = this.ballByBall$.asObservable();
  matchObservable$ = this.matchDetails$.asObservable();
  dismissalTypes:any[] = [];
  competitionID!:number;
  matchID!:number;

  async generate_ballbyball(compid:number,matchid:number){
    this.competitionID = compid;
    this.matchID = matchid;
    const res = await this.httpService.getData(`ballbyball/${matchid}`);
    if(res.status === 200){
      this.ballByBall$.next(res.data);
    }
  }
  async getCurrentMatchDetails(matchid:number){
    const res = await this.httpService.getData(`home/getMatchDetails/${matchid}`);
    this.matchDetails$.next(res?res[0]:[]);
  }
  async getDismissalTypes(){
    const res = await this.httpService.getData(`home/getDismissalTypeMaster`);
    this.dismissalTypes = res;
  }
}
