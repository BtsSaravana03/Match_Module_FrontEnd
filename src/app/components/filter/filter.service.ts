import { inject, Injectable } from '@angular/core';
import { Filter } from './filter.interface';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { InningsService } from '../innings-tab/innings.service';


@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private InningService = inject(InningsService);
  Filter:Filter = {
    innings: 1,
    ball: {from: null,to: null},
    over: { from:null,to: null},
    runs: {_0: false,_1: false,_2: false, _3: false, _4: false,_6: false,wickets: false}
  }
  filterBallData(data: BallData[]): BallData[] {
    let filter = this.Filter;
    this.InningService.ChangeInnings(filter.innings);
    return data.filter(ball => {  
      //Balls Filter
      if (filter.ball.from !== null && ball.BallId < filter.ball.from) {
        return false;
      }
      if (filter.ball.to !== null && ball.BallId > filter.ball.to) {
        return false;
      }
      
      //Overs Filter
      if (filter.over.from !== null && ball.Overs < filter.over.from) {
        return false;
      }
      if (filter.over.to !== null && ball.Overs > filter.over.to) {
        return false;
      }
    
    //Wickets Filter
    if (filter.runs.wickets && ball.Dismissal === 0) {
      return false;
    }

    ///Runs Filter
    const selectedRuns:any = {
      0:filter.runs._0,
      1:filter.runs._1,
      2:filter.runs._2,
      3:filter.runs._3,
      4:filter.runs._4,
      6:filter.runs._6
    };

    if (!filter.runs._0 && !filter.runs._1 && !filter.runs._2 && !filter.runs._3 && !filter.runs._4 && !filter.runs._6) {
      return true;
    } else if(selectedRuns[ball.Runs] === false){
      return false;
    }

      return true;
    });
  }
}
