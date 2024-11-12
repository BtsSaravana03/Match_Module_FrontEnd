import { Component, DestroyRef, effect, inject, input, OnInit } from '@angular/core';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { checkSR } from '../../scripts/generic';
import { getDismissalString } from '../../scripts/cricket_gen';
import Enumerable from 'linq';
import { BattingCard, BattingCardSummary } from './batting-card.interface';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { VideoService } from '../../components/video/video.service';
import { CommonModule } from '@angular/common';
import { fromEvent, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-batting-card',
  standalone: true,
  imports: [DxDataGridModule,CommonModule],
  templateUrl: './batting-card.component.html',
  styleUrl: './batting-card.component.scss'
})

export class BattingCardComponent{
  private videoService = inject(VideoService);
  selctedInnings = input.required<number>();
  ballArray = input.required<BallData[]>();
  summary = input.required<BattingCardSummary[]>();
  battingCard:BattingCard[]|[] = [];
  nonStrikerDismissal:any = {};
  isMobile = input.required<boolean>();
  
  
  constructor(){
    effect(()=>{
      if(this.ballArray() && this.selctedInnings()){
        this.generateBattingCard();
      }
    })
  }
  
  generateBattingCard(){
    this.nonStrikerDismissal = [];
    this.battingCard = Enumerable.from(this.ballArray())
      .where(i => i.InningsId === this.selctedInnings())
      .groupBy(i => `${i.StrikerID}##${i.StrikerName}`)
      .select(g => {
        const [striker_id, striker_name] = g.key().split('##');
        return {
            strikerID: parseInt(striker_id),
            strikerName: striker_name,
            runs: g.sum(i => i.Batruns),
            balls: g.count(i => i.Batballs===1),
            strikeRate: checkSR((g.sum(i => i.Batruns) / g.count(i => i.Batballs===1)) * 100),
            dot: g.count(i => i.Batruns === 0),
            _1s: g.sum(i => (i.Batruns === 1 && i.ExtraTypeId === 0) ? 1 : 0),
            _2s: g.sum(i => (i.Batruns === 2 && i.ExtraTypeId === 0) ? 1 : 0),
            _3s: g.sum(i => (i.Batruns === 3 && i.ExtraTypeId === 0) ? 1 : 0),
            _4s: g.count(i => i.isFour === 1),
            _6s: g.count(i => i.isSix === 1),
            dotPer: checkSR((g.count(i => i.Batruns === 0) / g.count(i => i.Batballs===1)) * 100),
            bdryPer: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Batballs===1)) * 100),
            wkt: g.count(i => i.Dismissal === 1),
            dismissalSts: g.count(i => i.Dismissal === 1)===0?'Not Out': this.setDismissal(g.first(i => i.Dismissal === 1))
        };
    }).toArray();
    ///For Non-Striker Dismissals
    for (let i = 0; i < this.battingCard.length; i++) {
      let element = this.battingCard[i];
      if(this.nonStrikerDismissal[element.strikerID]){
        element.dismissalSts = getDismissalString(this.nonStrikerDismissal[element.strikerID]);
      }
    }
  }
  setDismissal(ball:any){
    if(ball.DismissedBatter !== ball.StrikerID){
      this.nonStrikerDismissal[ball.StrikerID] = ball;
      return null
    }
    return getDismissalString(ball);
  }
  onCellClick(event:any,clickedColumn:string){
    //const clickedColumn = event.column.dataField;
    const clickedRowData:BattingCard = event.data;
    const innings = this.selctedInnings();
    switch (clickedColumn) {
      case 'dismissalSts':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'BatsmanWickets',innings);
        break;
      case 'runs':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'Runs',innings);
        break;
      case 'balls':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'Ball',innings);
        break;
      case 'dot':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'Dots',innings);
        break;

      case '_1s':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'Ones',innings);
        break;

      case '_2s':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'Twos',innings);
        break;

      case '_3s':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'Threes',innings);
        break;

      case '_4s':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'Fours',innings);
        break;

      case '_6s':
        this.videoService.LibraryBallVideo(clickedRowData.strikerID,'Sixs',innings);
        break;
      default:
        break;
    }
  }
  setExtras(): (info: any) => string {
    return (info: any) => {
        return `Extras: ${this.summary()[0]?.ExtrasBreakup || ''}`;
    };
  }

  addCustomRows() {
    // setTimeout(() => {
    //   const gridElement = document.querySelector('.custom-data-grid .dx-datagrid-rowsview .dx-datagrid-table tbody');
    //   if (gridElement) {
    //     // Create custom row 1
    //     const customRow1 = document.createElement('tr');
    //     customRow1.classList.add('custom-footer-row');
    //     customRow1.innerHTML = `
    //       <td class="gridcell">Extras</td>
    //       <td class="gridcell"></td>
    //       <td class="gridcell" colspan='12'></td>
    //     `;
  
    //     // Create custom row 2
    //     const customRow2 = document.createElement('tr');
    //     customRow2.classList.add('custom-footer-row');
    //     customRow2.innerHTML = `
    //        <td class="gridcell">Extras</td>
    //       <td class="gridcell"></td>
    //       <td class="gridcell" colspan='12'></td>
    //     `;
  
    //     gridElement.appendChild(customRow1);
    //     gridElement.appendChild(customRow2);
    //   }
    // }, 100);
  }  
  isLastRow(data: any): boolean {
    return this.battingCard[this.battingCard.length - 1] === data;
  }
}

