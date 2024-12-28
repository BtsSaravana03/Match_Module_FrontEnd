import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CardComponent } from '../sharedComponents/card/card.component';
import { BallByBallComponent } from "../../ball-by-ball/ball-by-ball.component";
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../sharedComponents/tabs/tabs.component';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { InningServiceService } from '../../services/inning-service.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { BattingCardSummary } from '../../scorecard-v2/batting-card/batting-card.interface';
import { DxTabsModule } from 'devextreme-angular';
import { BasicBallByBallComponent } from "./basic-ball-by-ball/basic-ball-by-ball.component";

@Component({
  selector: 'app-ballbyball',
  standalone: true,
  imports: [CardComponent, BallByBallComponent, CommonModule, TabsComponent, DxTabsModule, BasicBallByBallComponent],
  templateUrl: './ballbyball.component.html',
  styleUrl: './ballbyball.component.scss'
})
export class BallbyballComponent {
    private ballbyballService = inject(BallByBallService);
    private inningService = inject(InningServiceService);
    private destroyRef = inject(DestroyRef);
    setInningValue:number|undefined;
    Tabs = ['BallByBall','Adv BallByBall'];
    TabSelected = 'BallByBall';
    isMobile = signal(false);
    ballArray = signal<BallData[]>([]);
    summary:[]|BattingCardSummary[] = [];
    matchDetails = signal<any>({});
    totalInnings = signal<any[]>([]);
    selctedInnings:number = 1;
    currentInnings:number|undefined;
    ngOnInit(): void {
        const subscription = this.ballbyballService.ballObservable$.subscribe(updated => {
            this.ballArray.set(updated);
            this.currentInnings = this.ballArray()[this.ballArray().length - 1]?.InningsId || undefined;
        })
        const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated => {
            this.matchDetails.set(updated);
            this.totalInnings.set(this.matchDetails()?.inningsData || []);
            if(this.totalInnings().length > 0){
                this.setInningValue = 1;
            }
        })
        const InnSub = this.inningService.InningsObserver$.subscribe(updated =>{
            this.selctedInnings = updated;
        })
        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
            matchSubscription.unsubscribe();
        })
    }
    onInningsChange(e:any){
        this.selctedInnings = e.InningsID;
        this.inningService.selectedInnings.set(e.InningsID);
        this.inningService.currentInningData = e;
      }
      onTabChange(e:any){
        this.TabSelected = e.addedItems[0];
    }
}
