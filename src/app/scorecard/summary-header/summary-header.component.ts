import { Component, effect, input, OnInit } from '@angular/core';
import { BattingCardSummary, MatchData } from '../batting-card/batting-card.interface';
import { fromEvent, Observable } from 'rxjs';

@Component({
  selector: 'app-summary-header',
  standalone: true,
  imports: [],
  templateUrl: './summary-header.component.html',
  styleUrl: './summary-header.component.scss'
})
export class SummaryHeaderComponent implements OnInit {
  summary = input.required<BattingCardSummary[]>();
  currentInningsSummary:BattingCardSummary[]|[] = []
  matchDetails = input.required<MatchData>();
  currentInnings = input.required<number>();
  currentInningsData:any[] = []
  width:string = '500px'
  resizeObservable$!:Observable<Event>;

  constructor(){
    effect(()=>{
      if(this.summary() && this.matchDetails()){
        this.updateSummary();
      }
    })
  }
  
  ngOnInit(): void {
    this.resizeObservable$ = fromEvent(window,'resize');
    const sub = this.resizeObservable$.subscribe(()=>{
      this.onResize()
    })
    this.onResize();
  }

  onResize(){
    if(window.innerWidth < 510){
      this.width = '100%';
    }else{
      this.width = '500px';
    }
  }
  updateSummary(){
    if(this.currentInnings){
      this.currentInningsData = this.matchDetails()?.inningsData?.filter(i =>{
        return i.InningsID === this.currentInnings()
      });
      this.currentInningsSummary = this.summary()?.filter(i =>{
        return i.Innings === this.currentInnings()
      })
    }
   
  }
}
