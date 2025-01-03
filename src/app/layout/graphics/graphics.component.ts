import { ChangeDetectorRef, Component, DestroyRef, effect, inject, OnChanges, signal, SimpleChanges } from '@angular/core';
import { DxTabsModule } from 'devextreme-angular';
import { PitchMapComponent } from '../../graphics/pitch-map/pitch-map.component';
import { WagonWheelComponent } from '../../graphics/wagon-wheel/wagon-wheel.component';
import { BeehiveComponent } from '../../graphics/beehive/beehive.component';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../sharedComponents/tabs/tabs.component';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { InningServiceService } from '../../services/inning-service.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { BattingCardSummary } from '../../scorecard-v2/batting-card/batting-card.interface';
import Enumerable from 'linq';
import { FilterComponent } from "../../graphics/filter/filter.component";
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [DxTabsModule, PitchMapComponent, WagonWheelComponent, BeehiveComponent, CommonModule, TabsComponent, FilterComponent],
  templateUrl: './graphics.component.html',
  styleUrl: './graphics.component.scss'
})
export class GraphicsComponent {
    private ballbyballService = inject(BallByBallService);
    private inningService = inject(InningServiceService);
    private destroyRef = inject(DestroyRef);
    private appServices = inject(AppService);
    isMobile = signal(false);
    ballArray = signal<BallData[]>([]);
    ballArrayFiltered = signal<BallData[]>([]);
    matchDetails = signal<any>({});
    totalInnings = signal<any[]>([]);
    selctedInnings = signal(1);
    currentInnings:number|undefined;
    setInningValue:number|undefined;
    Tabs = ['Pitchmap','Wagonwheel','Beehive'];
    TabSelected = 'Pitchmap';

    filterData(){
        const data = Enumerable.from(this.ballArray()).where(i=> i.InningsId === this.selctedInnings()).toArray();
        this.ballArrayFiltered.set(data);
    }

    onTabChange(e:any){
        this.TabSelected = e.addedItems[0];
    }
    ngOnInit(): void {
        const isMobile = this.appServices.isMobile();
        this.isMobile.set(isMobile);
        const subscription = this.ballbyballService.ballObservable$.subscribe(updated => {
            this.ballArray.set(updated);
            this.currentInnings = this.ballArray()[this.ballArray().length - 1]?.InningsId || undefined;
            this.filterData();
        })
        const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated => {
            this.matchDetails.set(updated);
            this.totalInnings.set(this.matchDetails()?.inningsData || []);
            this.filterData();
            if(this.totalInnings().length > 0){
                this.setInningValue = 1;
            }
        })
        const InnSub = this.inningService.InningsObserver$.subscribe(updated =>{
            this.selctedInnings.set(updated);
            this.filterData();
        })
        this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
            matchSubscription.unsubscribe();
        })
    }
    onInningsChange(e:any){
        this.selctedInnings.set(e.InningsID);
        this.inningService.selectedInnings.set(e.InningsID);
        this.inningService.currentInningData = e;
        this.filterData();
      }
}
