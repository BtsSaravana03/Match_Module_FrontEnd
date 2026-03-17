import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CardComponent } from "../sharedComponents/card/card.component";
import { FieldingComponent } from "../../fielding/fielding.component";
import { InningServiceService } from '../../services/inning-service.service';
import { TabsComponent } from '../sharedComponents/tabs/tabs.component';
import { CommonModule } from '@angular/common';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { PartnershipComponent } from "../../partnership/partnership.component";
import { DxTabsModule } from 'devextreme-angular';
import { WtoComponent } from "../../wto/wto.component";

@Component({
  selector: 'app-fielding-view',
  standalone: true,
  imports: [CardComponent, FieldingComponent, TabsComponent, CommonModule, WtoComponent, WtoComponent, DxTabsModule],
  templateUrl: './fielding-view.component.html',
  styleUrl: './fielding-view.component.scss'
})
export class FieldingViewComponent {
    private inningService = inject(InningServiceService);
    private destroyRef = inject(DestroyRef);
    private ballbyballService = inject(BallByBallService);
    Tabs = ['Fielding','WTO'];
    TabSelected = 'Fielding';
    selctedInnings:number = 1;
    matchDetails = signal<any>({});
    totalInnings = signal<any[]>([]);
    setInningValue:number|undefined;
    ngOnInit(): void {
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
            matchSubscription.unsubscribe();
        })
    }
    onInningsChange(e:any){
        this.selctedInnings = e.InningsID;
        this.inningService.selectedInnings.set(e.InningsID);
        this.inningService.currentInningData = e;
      }

    onTabChangeF(e:any){
        this.TabSelected = e.addedItems[0];
    }
}
