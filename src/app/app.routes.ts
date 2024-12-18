import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './layout/overview/overview.component';
import { ScorecardComponent } from './layout/scorecard/scorecard.component';
import { GraphicsComponent } from './layout/graphics/graphics.component';
import { BallbyballComponent } from './layout/ballbyball/ballbyball.component';

export const routes: Routes = [
    // {path:'ballbyball',component:BallByBallComponent},
    // {path:'scorecard',component:ScorecardComponent},
    // {path:'partnership',component:PartnershipComponent},
    // {path:'graphics',component:GraphicsComponent,
    //     children: [
    //     {
    //         path: '',
    //         redirectTo: 'pitchmap',
    //         pathMatch: 'full'
    //     },
    //     {
    //       path: 'pitchmap',
    //       component: PitchMapComponent,
    //     },
    //     {
    //       path: 'wagonwheel',
    //       component: WagonWheelComponent,
    //     },
    //     {
    //         path: 'beehive',
    //         component: BeehiveComponent,
    //     },
    //     {
    //         path: 'manhatten',
    //         component: ManhattenComponent,
    //     },
    //     {
    //         path: 'worm',
    //         component: WormComponent,
    //     }
    //   ],
    // },
    // {path:'battingstats',component:BattingStatsComponent},
    // {path:'bowlingstats',component:BowlingStatsComponent},
    // {path:'fielding',component:FieldingComponent, canActivate:[MatchType]},
    // {path:'overcomparison',component:OverComparisionComponent, canActivate:[MatchType]},
    // {path:'login',component:LoginComponent},
    // {path:'matchoverview',component:MatchInfoComponent , canActivate:[MatchType]},
    {path:'login',component:LoginComponent},
    {path:'v2/overview',component:OverviewComponent},
    {path:'v2/scorecard',component:ScorecardComponent},
    {path:'v2/graphics',component:GraphicsComponent},
    {path:'v2/ballbyball',component:BallbyballComponent},
    {path:'',redirectTo:'login',pathMatch:'full'}
];
