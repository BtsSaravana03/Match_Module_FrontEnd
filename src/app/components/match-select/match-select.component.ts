import { Component, DestroyRef, inject, model, OnInit, ViewEncapsulation } from '@angular/core';
import { DxPopupModule, DxSelectBoxModule } from 'devextreme-angular';
import { DxButtonTypes } from 'devextreme-angular/ui/button';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { HttpServices } from '../../services/http.service';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { AppService } from '../../services/app.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-match-select',
  standalone: true,
  imports: [DxPopupModule,DxSelectBoxModule,CommonModule],
  templateUrl: './match-select.component.html',
  styleUrl: './match-select.component.scss'
})
export class MatchSelectComponent implements OnInit {
  private ballService = inject(BallByBallService);
  private httpService = inject(HttpServices);
  private appService = inject(AppService);
  resizeObservable$!:Observable<Event>;
  resizeSubscription$!: Subscription;
  destroyRef = inject(DestroyRef);
  width:string = '700px';
  height:string = '200px';
  showPopup = model(false);
  selectedComp!:number;
  CompDataSource:any[] = [];
  selectedMatch!:number;
  MatchDataSource:any[] = [];
  generateButton: DxButtonTypes.Properties = {
    width: 300,
    text: 'Submit',
    type: 'default',
    stylingMode: 'contained',
    onClick: async () => {
      if(this.selectedComp && this.selectedMatch){
        this.ballService.generate_ballbyball(this.selectedComp,this.selectedMatch);
        await this.ballService.getCurrentMatchDetails(this.selectedMatch);
      }
      this.appService.toggleMatchSelection(false);
    },
  };
  constructor(private route:ActivatedRoute){
    if(sessionStorage.getItem('currentMatchId')){
        let matchid = parseInt(sessionStorage.getItem('currentMatchId')!);
        sessionStorage.removeItem('currentMatchId');
        this.setSessionMatch(matchid);
    }
    this.route.queryParamMap.subscribe(params => {
        let matchid = params.get('matchid');
        if(matchid){
            let matchid = parseInt(sessionStorage.getItem('currentMatchId')!);
            this.setSessionMatch(matchid);
        }
      });
  }
  setSessionMatch(id:number){
    this.ballService.generate_ballbyball(null,id);
    this.ballService.getCurrentMatchDetails(id);
    this.appService.toggleMatchSelection(false);
  }
  async ngOnInit (){
    this.resizeObservable$ = fromEvent(window,'resize');
    this.resizeSubscription$ = this.resizeObservable$.subscribe(e => {
     this.onResize();
    })
    this.onResize();
    this.destroyRef.onDestroy(()=>{
      this.resizeSubscription$.unsubscribe();
    })

        this.getCompetitions();


    //const res = await this.ballService.getDismissalTypes();
  }
  onResize(){
    if(window.innerWidth < 750){
      this.width = '99%';
      this.height = '300px';
    }
    else{
      this.width = '700px';
      this.height = '200px';
    }
  }
  async getCompetitions(){
    this.MatchDataSource = [];
    this.selectedMatch;
    const res = await this.httpService.getData(`home/getCompetitions`);
    this.CompDataSource = res;
  }
  async getMatches(e:any){
    this.selectedComp = e.selectedItem.ID;
    if(this.selectedComp){
      const res = await this.httpService.getData(`home/getMatches/${this.selectedComp}`);
      this.MatchDataSource = res;
    }
  }
  onMatchSelected(e:any){
    if(e.selectedItem){
      this.selectedMatch = e.selectedItem.ID;
    }
  }
}
