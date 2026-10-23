import { Component, DestroyRef, inject, model, OnInit, ViewEncapsulation } from '@angular/core';
import { DxLoadPanelModule, DxPopupModule, DxSelectBoxModule } from 'devextreme-angular';
import { DxButtonTypes } from 'devextreme-angular/ui/button';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { HttpServices } from '../../services/http.service';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { AppService } from '../../services/app.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InningServiceService } from '../../services/inning-service.service';

@Component({
  selector: 'app-match-select',
  standalone: true,
  imports: [DxPopupModule, DxSelectBoxModule, DxLoadPanelModule, CommonModule],
  templateUrl: './match-select.component.html',
  styleUrl: './match-select.component.scss'
})
export class MatchSelectComponent implements OnInit {
  private ballService = inject(BallByBallService);
  private httpService = inject(HttpServices);
  private appService = inject(AppService);
  private inningsService = inject(InningServiceService);
  private routes = inject(Router)
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
  isLoading: boolean = false;
  generateButton: DxButtonTypes.Properties = {
    width: 300,
    text: 'Submit',
    type: 'default',
    stylingMode: 'contained',
    onClick: async () => {
      if(this.selectedComp && this.selectedMatch){
        try {
          this.isLoading = true;
          await this.ballService.getCurrentMatchDetails(this.selectedMatch);
          await this.ballService.generate_ballbyball(this.selectedComp, this.selectedMatch);
          sessionStorage.setItem('currentMatchId', this.selectedMatch.toString());
        } catch (error) {
          console.error('Error loading match ball by ball data:', error);
        } finally {
          this.isLoading = false;
        }
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
      console.log(res);
      this.MatchDataSource = res;
    }
  }
  onMatchSelected(e:any){
    if(e.selectedItem){
      this.selectedMatch = e.selectedItem.ID;
      this.inningsService.ChangeInnings(1);

    }
  }

}
