import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CardComponent } from '../sharedComponents/card/card.component';
import { DxDataGridModule, DxTabsModule } from 'devextreme-angular';
import { TabsComponent } from '../sharedComponents/tabs/tabs.component';
import { CommonModule } from '@angular/common';
import { InningServiceService } from '../../services/inning-service.service';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { HttpServices } from '../../services/http.service';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-spell-wise',
  standalone: true,
  imports: [CardComponent,TabsComponent,CommonModule,DxDataGridModule],
  templateUrl: './spell-wise.component.html',
  styleUrl: './spell-wise.component.scss'
})
export class SpellWiseComponent {
private inningService = inject(InningServiceService);
    private destroyRef = inject(DestroyRef);
    private ballbyballService = inject(BallByBallService);
    private httpService = inject(HttpServices);
    private appService = inject(AppService)
    selctedInnings:number = 1;
    matchDetails = signal<any>({});
    totalInnings = signal<any[]>([]);
    setInningValue:number|undefined;
    SpellWiseData:any[] = [];
    isMobile = false;
    ngOnInit(): void {
        this.isMobile = this.appService.isMobile();
        const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated => {
            this.matchDetails.set(updated);
            this.totalInnings.set(this.matchDetails()?.inningsData || []);
            this.generateStats();
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
        this.generateStats();
      }
      async generateStats(){
        this.SpellWiseData = [];
        if(this.matchDetails().ID){
            const res = await this.httpService.getData(`home/getSpellWise/${this.matchDetails().ID}/${this.selctedInnings}`);
           this.SpellWiseData = res;
        }
      }
}
