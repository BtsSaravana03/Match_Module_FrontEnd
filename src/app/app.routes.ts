import { Routes } from '@angular/router';
import { BallByBallComponent } from './ball-by-ball/ball-by-ball.component';
import { ScorecardComponent } from './scorecard/scorecard.component';

export const routes: Routes = [
    {path:'ballbyball',component:BallByBallComponent},
    {path:'scorecard',component:ScorecardComponent},
    {path:'',redirectTo:'ballbyball',pathMatch:'full'}
];
