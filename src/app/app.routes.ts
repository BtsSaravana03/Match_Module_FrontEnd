import { Routes } from '@angular/router';
import { BallByBallComponent } from './ball-by-ball/ball-by-ball.component';
import { ScorecardComponent } from './scorecard/scorecard.component';
import { PartnershipComponent } from './partnership/partnership.component';
import { PitchMapComponent } from './graphics/pitch-map/pitch-map.component';
import { WagonWheelComponent } from './graphics/wagon-wheel/wagon-wheel.component';
import { BeehiveComponent } from './graphics/beehive/beehive.component';
import { GraphicsComponent } from './graphics/graphics.component';
import { BattingStatsComponent } from './batting-stats/batting-stats.component';
import { BowlingStatsComponent } from './bowling-stats/bowling-stats.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path:'ballbyball',component:BallByBallComponent},
    {path:'scorecard',component:ScorecardComponent},
    {path:'partnership',component:PartnershipComponent},
    {path:'graphics',component:GraphicsComponent,
        children: [
        {
            path: '',
            redirectTo: 'pitchmap',
            pathMatch: 'full'
        },
        {
          path: 'pitchmap',
          component: PitchMapComponent,
        },
        {
          path: 'wagonwheel',
          component: WagonWheelComponent, 
        },
        {
            path: 'beehive',
            component: BeehiveComponent, 
          },
        ],
    },
    {path:'battingstats',component:BattingStatsComponent},
    {path:'bowlingstats',component:BowlingStatsComponent},
    {path:'login',component:LoginComponent},
    {path:'',redirectTo:'login',pathMatch:'full'}
];
