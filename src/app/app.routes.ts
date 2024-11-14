import { Routes } from '@angular/router';
import { BallByBallComponent } from './ball-by-ball/ball-by-ball.component';
import { ScorecardComponent } from './scorecard/scorecard.component';
import { PartnershipComponent } from './partnership/partnership.component';
import { PitchMapComponent } from './graphics/pitch-map/pitch-map.component';
import { WagonWheelComponent } from './graphics/wagon-wheel/wagon-wheel.component';

export const routes: Routes = [
    {path:'ballbyball',component:BallByBallComponent},
    {path:'scorecard',component:ScorecardComponent},
    {path:'partnership',component:PartnershipComponent},
    {path:'graphics/pitchmap',component:PitchMapComponent},
    {path:'graphics/wagonwheel',component:WagonWheelComponent},
    {path:'',redirectTo:'scorecard',pathMatch:'full'}
];
