import { Routes } from '@angular/router';
import { BallByBallComponent } from './ball-by-ball/ball-by-ball.component';
import { ScorecardComponent } from './scorecard/scorecard.component';
import { PartnershipComponent } from './partnership/partnership.component';
import { PitchMapComponent } from './graphics/pitch-map/pitch-map.component';

export const routes: Routes = [
    {path:'ballbyball',component:BallByBallComponent},
    {path:'scorecard',component:ScorecardComponent},
    {path:'partnership',component:PartnershipComponent},
    {path:'graphics/pitchmap',component:PitchMapComponent},
    {path:'',redirectTo:'scorecard',pathMatch:'full'}
];
