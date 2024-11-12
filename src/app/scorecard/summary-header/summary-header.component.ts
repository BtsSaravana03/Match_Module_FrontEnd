import { Component, effect, input } from '@angular/core';
import { BattingCardSummary, MatchData } from '../batting-card/batting-card.interface';
import { CommonModule } from '@angular/common';
import Enumerable from 'linq';

interface TeamSummary{
  TeamID:number,
  Total:number,
  Dismissal:number,
  isCurrentInn:boolean,
  Overs:number
};
@Component({
  selector: 'app-summary-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-header.component.html',
  styleUrl: './summary-header.component.scss'
})
export class SummaryHeaderComponent {
  summary = input.required<BattingCardSummary[]>();
  matchDetails = input.required<MatchData>();
  selctedInnings = input.required<number>();
  currentInnings = input.required<number|undefined>();
  isMobile = input.required<boolean>();
  TeamASummary:TeamSummary[]|[]= [];
  TeamBSummary:TeamSummary[]|[]= [];

  constructor(){
    effect(()=>{
      if(this.summary() && this.matchDetails()){
        this.updateSummary();
      }
    })
  }
  updateSummary(){
    this.TeamASummary = [];
    this.TeamBSummary = [];
    if(this.matchDetails().inningsData && this.matchDetails().inningsData.length>0){
      this.TeamASummary = Enumerable.from(this.summary())
      .where(i=> i.BattingClubId === this.matchDetails()?.inningsData[0]?.BattingClubID)
      .groupBy(i=> `${i.BattingClubId}-${i.Innings}`).select(g=>{
        return{
          TeamID: g.first()?.BattingClubId,
          Total:g.first()?.TeamTotal,
          Dismissal:g.first()?.Dismissals,
          isCurrentInn:g.first().Innings===this.currentInnings()?true:false,
          Overs:g.first()?.Overs
        }
      }).toArray();
      this.TeamBSummary = Enumerable.from(this.summary())
      .where(i=> i.BattingClubId === this.matchDetails()?.inningsData[0]?.BowlingClubID)
      .groupBy(i=> `${i.BattingClubId}-${i.Innings}`).select(g=>{
        return{
          TeamID: g.first()?.BattingClubId,
          Total:g.first()?.TeamTotal,
          Dismissal:g.first()?.Dismissals,
          isCurrentInn:g.first().Innings===this.currentInnings()?true:false,
          Overs:g.first()?.Overs
        }
      }).toArray();
    }
    
  }
}
