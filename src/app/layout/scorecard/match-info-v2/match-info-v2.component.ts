import { Component, effect, input, OnChanges, SimpleChanges } from '@angular/core';
import { MatchData } from '../../../scorecard-v2/batting-card/batting-card.interface';
import {isTestMatch} from '../../../scripts/cricket_gen'
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
    TestMatch:boolean = false;
    constructor(){
        effect(()=>{
            const matchInfo = this.matchInfo();
            this.TestMatch = isTestMatch(matchInfo.MatchTypeID);
        })
    }
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
