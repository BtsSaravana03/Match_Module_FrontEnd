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
  private lastUpdated: string | null = null;
  private currentRawBallData: BallData[] = [];

  async generate_ballbyball(compid: number | null, matchid: number): Promise<void> {
    this.competitionID = compid;
    this.matchID = matchid;
    this.destroy$.next();

    if (this.matchDetails && 'result' in this.matchDetails && this.matchDetails.result.length > 0) {
      // Fetch data only once if the match is complete
      try {
        const res: any = await this.httpService.getData(`ballbyball/${this.matchID}`);
        if (res && res.status === 200) {
          this.currentRawBallData = res.data || [];
          const filteredData = this.filterService.filterBallData(this.currentRawBallData, this.matchDetails);
          console.log("this is the filtered data", filteredData);
          this.ballByBall$.next(filteredData);
        }
      } catch (err) {
        console.error('Error fetching match data:', err);
      }
    } else {
      // Step 1: Initial full fetch of ballbyball data
      try {
        const res: any = await this.httpService.getData(`ballbyball/${this.matchID}`);
        if (res && res.status === 200) {
          this.currentRawBallData = res.data || [];
          // Format current system timestamp for lastupdated query parameter (YYYY-MM-DD HH:mm:ss.SSSSSSS)
          this.lastUpdated = this.formatDateToSql(new Date());

          const filteredData = this.filterService.filterBallData(this.currentRawBallData, this.matchDetails);
          this.ballByBall$.next(filteredData);
          console.log("this is the filtered data", filteredData);
          // Step 2: Start polling scorecard logs every 2 seconds
          this.startLogPolling();
        }
      } catch (err) {
        console.error('Error fetching initial ball data:', err);
      }
    }
  }

  private startLogPolling() {
    interval(2000)
      .pipe(
        switchMap(() => {
          const url = this.lastUpdated
            ? `ballbyball/getScorecarlogs/${this.matchID}?lastupdated=${encodeURIComponent(this.lastUpdated)}`
            : `ballbyball/getScorecarlogs/${this.matchID}`;
          return from(this.httpService.getData(url)).pipe(
            retry(3),
            catchError(err => {
              console.error('Scorecard logs polling error:', err);
              return [];
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: async (res: any) => {
          if (res && res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
            const logs = res.data;
            let updatedAny = false;

            // Fetch details for each changed ball in the logs
            for (const log of logs) {
              const { MatchId, InningsId, BallID } = log;
              if (MatchId && InningsId && BallID) {
                try {
                  const ballRes: any = await this.httpService.getData(`ballbyball/${MatchId}/${InningsId}/${BallID}`);
                  if (ballRes && ballRes.status === 200 && Array.isArray(ballRes.data) && ballRes.data.length > 0) {
                    const fetchedBall: BallData = ballRes.data[0];

                    // Find if ball already exists in current raw dataset
                    const index = this.currentRawBallData.findIndex(
                      b => b.MatchId === fetchedBall.MatchId && b.InningsId === fetchedBall.InningsId && b.BallId === fetchedBall.BallId
                    );

                    if (index !== -1) {
                      // Update existing ball
                      this.currentRawBallData[index] = fetchedBall;
                    } else {
                      // Insert new ball
                      this.currentRawBallData.push(fetchedBall);
                    }
                    updatedAny = true;
                  }
                } catch (err) {
                  console.error(`Error fetching ball detail for MatchId: ${MatchId}, InningsId: ${InningsId}, BallID: ${BallID}`, err);
                }
              }
            }

            // Update lastUpdated timestamp to the time when data was received
            this.lastUpdated = this.formatDateToSql(new Date());

            if (updatedAny) {
              this.currentRawBallData.sort((a, b) => (a.AutoId || 0) - (b.AutoId || 0) || (a.InningsId || 0) - (b.InningsId || 0) || (a.BallId || 0) - (b.BallId || 0));
              const filteredData = this.filterService.filterBallData(this.currentRawBallData, this.matchDetails);
              this.ballByBall$.next(filteredData);
            }
          }
        },
        error: (err) => console.error('Polling subscription error:', err)
      });
  }

  private formatDateToSql(date: Date): string {
    const pad = (n: number, z = 2) => ('00' + n).slice(-z);
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const ms = pad(date.getMilliseconds(), 3);

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.${ms}0000`;
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
