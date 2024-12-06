import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
import { DxTabsModule } from 'devextreme-angular';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { InningsService } from './innings.service';

@Component({
  selector: 'app-innings-tab',
  standalone: true,
  imports: [DxTabsModule,CommonModule],
  templateUrl: './innings-tab.component.html',
  styleUrl: './innings-tab.component.scss'
})
export class InningsTabComponent implements OnInit {
  private ballbyballService = inject(BallByBallService);
  private InningService = inject(InningsService);
  private destroyRef = inject(DestroyRef);

  totalInnings = signal<any[]>([]);
  matchDetails = signal<any>({});
  selctedInnings:number = 1;
  tabWidth:any = '200px';
  isMobile:boolean = false;
  resizeObservable$!: Observable<Event>;
  inningsChange = output<number>();

  ngOnInit(): void {
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
      this.selctedInnings = 1;
      this.totalInnings.set(this.matchDetails()?.inningsData||[]);
      this.onWindowResize();
    })
    this.resizeObservable$ = fromEvent(window,'resize');
    const resizeSubscription:Subscription = this.resizeObservable$.subscribe(()=>{
      this.onWindowResize();
    })
    // const InnSub = this.InningService.InningsObserver$.subscribe(updated =>{
    //   this.selctedInnings = updated;
    // })
    this.destroyRef.onDestroy(()=>{
      matchSubscription.unsubscribe();
      resizeSubscription.unsubscribe();
      //InnSub.unsubscribe();
    })
  }
  onWindowResize(){
    if(window.innerWidth < 773){
      this.tabWidth = '100%';
      this.isMobile = true;
    }
    else{
      this.tabWidth = `${(this.totalInnings()?.length||2)*230}px`;
      this.isMobile = false;
    }
  }
  onInningsChange(e:any){
    if(e.addedItems.length>0){
      this.selctedInnings = e?.addedItems[0]?.InningsID||1;
      this.inningsChange.emit(this.selctedInnings);
    }
  }
}
