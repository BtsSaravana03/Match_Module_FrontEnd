import { Component, effect, inject, input } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { HttpServices } from '../../../services/http.service';
import { MatchData } from '../../../scorecard-v2/batting-card/batting-card.interface';
import { BallData } from '../../../ball-by-ball/ball-by-ball.interface';
import { isTestMatch } from '../../../scripts/cricket_gen';
import Enumerable from 'linq';
import { checkSR } from '../../../scripts/generic';
import { DxDataGridModule } from 'devextreme-angular';
import { DxTabsModule } from 'devextreme-angular';


@Component({
  selector: 'app-over-comparison',
  standalone: true,
  imports: [DxDataGridModule, DxTabsModule],
  templateUrl: './over-comparison.component.html',
  styleUrl: './over-comparison.component.scss'
})
export class OverComparisonComponent {
 private appServices = inject(AppService);
    private httpServices = inject(HttpServices);
     matchDetails = input.required<MatchData>();
     ballArray = input.required<BallData[]>();
     overComparison:any[] = [];
     isMobile = false;
         Tabs = ['1st & 2nd Innings','3rd & 4th Innings'];
    TabSelected1 = '1st & 2nd Innings';

     isTestMatch:boolean = false;
     TeamA:string = '';
     TeamB:string = '';
     constructor(){
       effect(()=>{
            let ball = this.ballArray();
            let match = this.matchDetails()
           this.generatePhaseWise();
       })
     }
     ngOnInit(): void {
         this.isMobile = this.appServices.isMobile();
     }
     async generatePhaseWise(){
        let innings = this.matchDetails().inningsData;
        this.isTestMatch = isTestMatch(this.matchDetails().MatchTypeID);
        if(innings.length > 1){
            this.TeamA = innings.filter(i => i.InningsID === 1)[0].BowlingClubPrefix;
            this.TeamB = innings.filter(i => i.InningsID === 2)[0].BowlingClubPrefix;
        }
        if(!this.isTestMatch){
            const res = await this.httpServices.getData(`home/getOverComparison/${this.matchDetails().ID}`);
            this.overComparison = res;
        }else{
            if(this.TabSelected1 == '1st & 2nd Innings'){
                 const res = await this.httpServices.getData(`home/getOverComparison/${this.matchDetails().ID}`);
                 this.overComparison = res;
            }else{ 
                if(innings.length > 2){
                    this.TeamA = innings.filter(i => i.InningsID === 3)[0].BowlingClubPrefix;
                    this.TeamB = innings.filter(i => i.InningsID === 4)[0].BowlingClubPrefix;
                }
                 const res = await this.httpServices.getData(`home/getOverComparisonTest3rd4th/${this.matchDetails().ID}`);
                 this.overComparison = res;
            }
          
        }

     }

     
    async onTabChangeF(e:any){
        this.TabSelected1 = e.addedItems[0];
        let innings = this.matchDetails().inningsData;
          if(this.TabSelected1 == '1st & 2nd Innings'){
             this.TeamA = innings.filter(i => i.InningsID === 1)[0].BowlingClubPrefix;
            this.TeamB = innings.filter(i => i.InningsID === 2)[0].BowlingClubPrefix;
                 const res = await this.httpServices.getData(`home/getOverComparison/${this.matchDetails().ID}`);
                 this.overComparison = res;
            }else{ 
                 this.TeamA = innings.filter(i => i.InningsID === 3)[0].BowlingClubPrefix;
                    this.TeamB = innings.filter(i => i.InningsID === 4)[0].BowlingClubPrefix;
                   const res = await this.httpServices.getData(`home/getOverComparisonTest3rd4th/${this.matchDetails().ID}`);
                   this.overComparison = res;
            }
    }
}
