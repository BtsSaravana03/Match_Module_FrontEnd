import { Component, input } from '@angular/core';
import { CardComponent } from "../../sharedComponents/card/card.component";
import { MatchData } from '../../../scorecard-v2/batting-card/batting-card.interface';
import moment from 'moment';

@Component({
  selector: 'app-match-info-v2',
  standalone: true,
  imports: [],
  templateUrl: './match-info-v2.component.html',
  styleUrl: './match-info-v2.component.scss'
})
export class MatchInfoV2Component {
    matchInfo = input.required<MatchData>();
    get dayOrNight(){
        if(this.matchInfo().inningsData.length>0){
            return this.matchInfo().inningsData[0].DayOrNight===1?'Day':'Night';
        }else{
            return 'Day'
        }
    }
    get getFormattedDate(){
        if(this.matchInfo().info?.Date){
            return moment(this.matchInfo().info?.Date).format('DD MMMM YYYY');
        }else{
            return '';
        }

    }
}
