import { Component, effect, inject, input } from '@angular/core';
import Enumerable from 'linq';
import { checkSR } from '../../scripts/generic';
import { calculateOvers, calculateOversPrecise } from '../../scripts/cricket_gen';
import { DxDataGridModule } from 'devextreme-angular';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { BowlingCard } from './bowling-card.interface';
import { VideoService } from '../../components/video/video.service';

@Component({
  selector: 'app-bowling-card',
  standalone: true,
  imports: [DxDataGridModule],
  templateUrl: './bowling-card.component.html',
  styleUrl: './bowling-card.component.scss'
})
export class BowlingCardComponent {
  private video = inject(VideoService);
  selctedInnings = input.required<number>();
  ballArray = input.required<BallData[]>();
  bowlingCard:BowlingCard[]|[] = [];
  constructor(){
    effect(()=>{
      if(this.ballArray() && this.selctedInnings()){
        this.generateBowlingCard();
      }
    })
  }
  generateBowlingCard(){
    this.bowlingCard = Enumerable.from(this.ballArray())
      .where(i => i.InningsId === this.selctedInnings())
      .groupBy(i => `${i.BowlerID}##${i.BowlerName}`)
      .select(g => {
        const [bowler_id, bowler_name] = g.key().split('##');
        const maiden = g.where(i => i.Maiden===1).sum(i => i.EndOver)
        return {
            bowlerId: parseInt(bowler_id),
            bowlerName: bowler_name,
            balls: g.count(i=> i.Bowlballs===1),
            runs: g.sum(i=> i.Bowlruns),
            overs: (calculateOversPrecise(g.toArray())),
            maiden: maiden,
            wkt: g.count(i=>i.Bowlwkts===1),
            economy: checkSR((g.sum(i => i.Bowlballs)/g.sum(i=>i.Bowlballs))*6),
            economy1: Math.floor(((g.sum(i => i.Bowlruns)/g.count(i=> i.Bowlballs===1))*6)*10)/10 ,
            wide: g.count(i=>i.isWide===1),
            nb: g.count(i=>i.isNoBall===1),
            byes: g.count(i=>i.ExtraTypeId===4),
            legByes: g.count(i=>i.ExtraTypeId===3),
            dot: g.sum(i => (i.Bowlruns === 0 && i.ExtraTypeId === 0) ? 1 : 0),
            _1s: g.sum(i => (i.Bowlruns === 1 && i.ExtraTypeId === 0) ? 1 : 0),
            _2s: g.sum(i => (i.Bowlruns === 2 && i.ExtraTypeId === 0) ? 1 : 0),
            _3s: g.sum(i => (i.Bowlruns === 3 && i.ExtraTypeId === 0) ? 1 : 0),
            _4s: g.count(i => i.isFour === 1),
            _6s: g.count(i => i.isSix === 1),
            dotPer: checkSR((g.count(i => i.Bowlruns === 0) / g.count(i => i.Bowlballs===1)) * 100),
            bdryPer: checkSR(((g.sum(i => (i.isFour === 1 ? 4 : 0)) + (g.sum(i => (i.isSix === 1 ? 6 : 0)))) / g.count(i => i.Bowlballs===1)) * 100),
        };
    }).toArray();
  }
  onCellClick(event: any) {
    const clickedColumn = event.column.dataField;
    const clickedRowData:BowlingCard = event.data;
    const innings = this.selctedInnings();
    switch (clickedColumn) {
      case 'overs':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'Overs',innings);
        break;
      case 'maiden':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'Maiden',innings);
        break;
      case 'runs':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'Runss',innings);
        break;
      case 'wkt':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'Wickets',innings);
        break;
      case 'wide':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'Wide',innings);
        break;
      case 'nb':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'NB',innings);
        break;
      case 'dot':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'DotP',innings);
        break;
      case '_1s':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'OnesB',innings);
        break;
      case '_2s':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'TwosB',innings);
        break;
      case '_3s':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'ThreesB',innings);
        break;
      case '_4s':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'FoursB',innings);
        break;
      case '_6s':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'SixsB',innings);
        break;
      case 'byes':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'ByeB',innings);
        break;
      case 'legByes':
        this.video.LibraryBallVideo(clickedRowData.bowlerId,'LegByeB',innings);
        break;
      default:
        console.log('No specific handler for this cell');
    }
  }
}
