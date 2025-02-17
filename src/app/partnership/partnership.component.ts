import { ChangeDetectorRef, Component, DestroyRef, effect, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { DxDataGridModule, DxTabsModule } from 'devextreme-angular';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import { Partnership } from './partnership.interface';
import { BallByBallService } from '../services/ball-by-ball.service';
import Enumerable from 'linq';
import { CommonModule } from '@angular/common';
import { VideoService } from '../components/video/video.service';
import { InningServiceService } from '../services/inning-service.service';

@Component({
  selector: 'app-partnership',
  standalone: true,
  imports: [DxDataGridModule, DxTabsModule, CommonModule],
  templateUrl: './partnership.component.html',
  styleUrl: './partnership.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class PartnershipComponent implements OnInit {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private videoService = inject(VideoService);
  private cdr = inject(ChangeDetectorRef);
  private InningService = inject(InningServiceService);

  ballArray = signal<BallData[]>([]);
  Partnership = signal<Partnership[]>([]);
  //totalInnings = input.required<any[]>();
  matchDetails = input.required<any>();
  selctedInnings = signal<number>(1);
  ngOnInit(): void {
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.generatePartnership();
    })
    const InnSub = this.InningService.InningsObserver$.subscribe(updated=>{
        this.selctedInnings.set(this.InningService.selectedInnings());
        this.generatePartnership();
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      InnSub.unsubscribe();
    })
  }
  generatePartnership(){
    //let Partnership = 0;
    const data:Partnership[] = Enumerable.from(this.ballArray())
    .where(i => i.InningsId === this.selctedInnings())
    .groupBy(i=> `${i.Partnerid}-${i.PartnerWktOrder}`)
    .select(g =>{
      const Striker = g.first().StrikerID;
      const NonStriker = g.first().NonStrikerID;
      //Partnership++;
      let Partnership = g.first().PartnerWktOrder;
      if(!Partnership){
        Partnership = g.max(i => i.PartnerWktOrder) + 1;
      }
      return{
        PartnershipID:g.first().Partnerid,
        Player_1_Name:g.first().StrikerName,
        Player_2_Name:g.first().NonStrikerName,
        Player_1_0s:g.count(i=>i.Batruns === 0 && i.StrikerID===Striker),
        Player_2_0s:g.count(i=>i.Batruns === 0 && i.StrikerID===NonStriker),
        Player_1_1s:g.sum(i=>i.Batruns === 1 && i.StrikerID===Striker?1:0),
        Player_2_1s:g.sum(i=>i.Batruns === 1 && i.StrikerID===NonStriker?1:0),
        Player_1_2s:g.sum(i=>i.Batruns === 2 && i.StrikerID===Striker?1:0),
        Player_2_2s:g.sum(i=>i.Batruns === 2 && i.StrikerID===NonStriker?1:0),
        Player_1_3s:g.sum(i=>i.Batruns === 3 && i.StrikerID===Striker?1:0),
        Player_2_3s:g.sum(i=>i.Batruns === 3 && i.StrikerID===NonStriker?1:0),
        Player_1_4s:g.sum(i=>i.isFour === 1 && i.StrikerID===Striker?1:0),
        Player_2_4s:g.sum(i=>i.isFour === 1 && i.StrikerID===NonStriker?1:0),
        Player_1_6s:g.sum(i=>i.isSix === 1 && i.StrikerID===Striker?1:0),
        Player_2_6s:g.sum(i=>i.isSix === 1 && i.StrikerID===NonStriker?1:0),
        Wicket: g.first().PartnerWktOrder,
        Runs:g.sum(i=> i.Runs + i.Extras + i.Penalty + i.BLExtras) + ` (${g.sum(i => i.Batballs)})`
      }
    }).toArray();
    this.Partnership.set(data);
  }
//   onInningsChange(e:any){
//     this.selctedInnings = e;
//     this.generatePartnership();
//   }
  onCellClick(data:Partnership){
    this.videoService.PlayPartnershipVideos(data.PartnershipID,this.selctedInnings(),data.Wicket);
  }
}
