import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpServices } from './http.service';
import { BehaviorSubject, catchError, from, interval, retry, startWith, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import { FilterService } from '../components/filter/filter.service';
import { MatchData } from '../scorecard-v2/batting-card/batting-card.interface';

@Injectable({
  providedIn: 'root'
})
export class BallByBallService implements OnDestroy {
  private httpService = inject(HttpServices);
  private filterService = inject(FilterService);

  private ballByBall$ = new BehaviorSubject<BallData[]>([]);
  private matchDetails$ = new BehaviorSubject<MatchData | {}>({});
  ballObservable$ = this.ballByBall$.asObservable();
  matchObservable$ = this.matchDetails$.asObservable();
  matchDetails: MatchData | null = null;
  dismissalTypes: any[] = [];
  competitionID!: number | null;
  matchID!: number;
  private destroy$ = new Subject<void>();
  generate_ballbyball(compid: number | null, matchid: number) {
    this.competitionID = compid;
    this.matchID = matchid;
    this.destroy$.next();

    if (this.matchDetails && 'result' in this.matchDetails && this.matchDetails.result.length > 0) {
      // Fetch data only once if the match is complete
      from(this.httpService.getData(`ballbyball/${this.matchID}`)).subscribe({
        next: (res: any) => {
          if (res.status === 200) {
            const filteredData = this.filterService.filterBallData(res.data, this.matchDetails);
            console.log("this is the filtered data", filteredData)
            this.ballByBall$.next(filteredData);
          }
        },
        error: (err) => console.error('Error fetching match data:', err),
      });
    } else {
      // Poll data every 30 seconds if the match is not complete
      interval(30000)
        .pipe(
          startWith(0),
          switchMap(() =>
            from(this.httpService.getData(`ballbyball/${this.matchID}`)).pipe(
              retry(3),
              catchError(err => {
                console.error('Polling error:', err);
                return []; // Return an empty array to continue polling even if an error occurs
              })
            )
          ),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (res: any) => {
            if (res.status === 200) {
              const filteredData = this.filterService.filterBallData(res.data, this.matchDetails);
              this.ballByBall$.next(filteredData);
            }
          },
          error: (err) => console.error('Polling subscription error:', err),
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  async getCurrentMatchDetails(matchid: number) {
    const res = await this.httpService.getData(`home/getMatchDetails/${matchid}`);
    this.matchDetails = res[0] ?? {};
    this.matchDetails$.next(res ? res[0] : null);
  }
  async getDismissalTypes() {
    const res = await this.httpService.getData(`home/getDismissalTypeMaster`);
    this.dismissalTypes = res;
  }
}
