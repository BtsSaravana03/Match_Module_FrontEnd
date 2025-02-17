import { inject, Injectable } from '@angular/core';
import { Filter } from './filter.interface';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { InningsService } from '../innings-tab/innings.service';
import { ReturnStatement } from '@angular/compiler';


@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private InningService = inject(InningsService);
  Filter:Filter = {
    innings: 1,
    ball: {from: null,to: null},
    over: { from:null,to: null},
    runs: {_0: false,_1: false,_2: false, _3: false, _4: false,_6: false,wickets: false},
    phase: {
      Powerplay: false,
      MiddleOvers: false,
      DeathOvers: false
    }
  }

  filterBallData(data: BallData[], MatchDetails: any): BallData[] {
    let filter = this.Filter;
    this.InningService.ChangeInnings(filter.innings);
    return data.filter(ball => {
      // Ball Filter
      if (filter.ball.from !== null && ball.BallId < filter.ball.from) return false;
      if (filter.ball.to !== null && ball.BallId > filter.ball.to) return false;
      // Overs Filter
      if (filter.over.from !== null && ball.Overs < filter.over.from) return false;
      if (filter.over.to !== null && ball.Overs > filter.over.to) return false;
      // Runs Filter
      const selectedRuns: Record<number, boolean> = {
        0: filter.runs._0,
        1: filter.runs._1,
        2: filter.runs._2,
        3: filter.runs._3,
        4: filter.runs._4,
        6: filter.runs._6,
      };
      const noRunsSelected = !filter.runs._0 && !filter.runs._1 && !filter.runs._2 &&
                             !filter.runs._3 && !filter.runs._4 && !filter.runs._6;
      if (filter.runs.wickets && noRunsSelected) {
        if (ball.Dismissal <= 0) return false;
      } else if (noRunsSelected && !filter.runs.wickets) {
        // Continue to Phase of Play filter
      } else {
        if (filter.runs.wickets && ball.Dismissal === 0) return false;
        if (selectedRuns[ball.Runs] === false) return false;
        if (filter.runs.wickets && ball.Dismissal > 0 && selectedRuns[ball.Runs]) {
          // Continue to Phase of Play filter
        }
      }
      // Phase of Play Filter
      const phases = filter.phase;
      const phaseFilters = [
        { key: 'Powerplay', range: [0, MatchDetails.MatchOvers === 20 ? 6 : 10] },
        { key: 'MiddleOvers', range: [MatchDetails.MatchOvers === 20 ? 6.1 : 10.1, MatchDetails.MatchOvers === 20 ? 15 : 40] },
        { key: 'DeathOvers', range: [MatchDetails.MatchOvers === 20 ? 15.1 : 40.1, MatchDetails.MatchOvers] },
      ];
      const phaseMatch = phaseFilters.some(phase =>
        phases[phase.key as keyof typeof phases] && ball.Overs >= phase.range[0] && ball.Overs <= phase.range[1]
      );
      if (Object.values(phases).some(v => v) && !phaseMatch) return false;
      return true;
    });
  }



}
