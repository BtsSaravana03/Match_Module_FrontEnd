import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { BallByBallService } from '../services/ball-by-ball.service';

@Injectable({
  providedIn: 'root',
})
export class MatchType implements CanActivate {
    private ballbyballService = inject(BallByBallService);
    private router = inject(Router);
    constructor() {}

  canActivate(next: ActivatedRouteSnapshot,state: RouterStateSnapshot): boolean {
    const Match = this.ballbyballService.matchDetails;
    const condition = Match.isLimitedOvers;
    if (condition) {
      return true;
    } else {
        this.router.navigate(['/scorecard']);
      return false;
    }
  }
}
