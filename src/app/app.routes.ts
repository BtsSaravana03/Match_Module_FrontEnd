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
import { FieldingComponent } from './fielding/fielding.component';
import { MatchType } from './Guards/matchType.guard';
import { OverComparisionComponent } from './over-comparision/over-comparision.component';
import { ManhattenComponent } from './graphics/manhatten/manhatten.component';
import { WormComponent } from './graphics/worm/worm.component';
import { MatchInfoComponent } from './match-info/match-info.component';

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
        {
            path: 'manhatten',
            component: ManhattenComponent,
        },
        {
            path: 'worm',
            component: WormComponent,
        }
      ],
    },
    {path:'battingstats',component:BattingStatsComponent},
    {path:'bowlingstats',component:BowlingStatsComponent},
    {path:'fielding',component:FieldingComponent, canActivate:[MatchType]},
    {path:'overcomparison',component:OverComparisionComponent, canActivate:[MatchType]},
    {path:'login',component:LoginComponent},
    {path:'matchoverview',component:MatchInfoComponent , canActivate:[MatchType]},
    {path:'',redirectTo:'login',pathMatch:'full'}
];
