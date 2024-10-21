import { Routes } from '@angular/router';
import { BallByBallComponent } from './ball-by-ball/ball-by-ball.component';

export const routes: Routes = [
    {path:'ballbyball',component:BallByBallComponent},
    {path:'',redirectTo:'ballbyball',pathMatch:'full'}
];
