import { AfterViewInit, Component, effect, ElementRef, inject, input, OnChanges, OnInit, signal, SimpleChanges, TemplateRef, ViewChild, viewChild } from '@angular/core';
import { BattingCardSummary, MatchData } from '../batting-card/batting-card.interface';
import { CommonModule } from '@angular/common';
import Enumerable from 'linq';
import moment from 'moment';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import _, { isNative, last } from 'lodash';
import { calculateOvers, getCurrentBallDescription, oversToBalls } from '../../scripts/cricket_gen';
import { splitName } from '../../scripts/generic';
import { AppService } from '../../services/app.service';

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
export class SummaryHeaderComponent implements OnChanges{
  private appServices = inject(AppService);
  overContainerDiv = viewChild<ElementRef>('overContainer')
  ballArray = input.required<BallData[]>();
  summary = input.required<BattingCardSummary[]>();
  matchDetails = input.required<MatchData>();
  selctedInnings = input.required<number>();
  currentInnings = input.required<number|undefined>();
  isMobile = signal<boolean>(false);
  MatchDateFormatted:string = '-';
  TeamASummary:TeamSummary[]|[]= [];
  TeamBSummary:TeamSummary[]|[]= [];
  CurrentOver:number|null = null;
  CurrentOverRuns:any[] = [];
  strikerData:any[] = [];
  nonStrikerData:any[] = [];
  bowlerData:any[] = [];
  description:string = '';
  MatchStartMsg:string = 'Yet to start';
  expand:boolean = true;

  constructor(){
    effect(()=>{
      if(this.summary() && this.matchDetails()){
        this.updateSummary();
        setTimeout(() => {
            if(this.overContainerDiv()){
                this.overContainerDiv()!.nativeElement.scrollLeft = this.overContainerDiv()!.nativeElement.scrollWidth;
            }
        }, 0);
      }
    });
    this.isMobile.set(this.appServices.isMobile());
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes['ballArray']){
        this.updateIndividualScores();
        this.generateEquation();
        if(this.overContainerDiv()){
            this.overContainerDiv()!.nativeElement.scrollLeft = this.overContainerDiv()!.nativeElement.scrollWidth;
        }
      }
  }
  updateSummary(){
    //This is summary Header for Scores
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
    //This is for venue and other details
    this.MatchDateFormatted = this.matchDetails().Date?moment(this.matchDetails().Date).format('dddd Do MMMM YYYY, HH:mm'):'-';
  }
  updateIndividualScores(){
    let balls = this.ballArray();
    let lastBall = _.last(balls);
    if(lastBall){
        this.CurrentOver = lastBall.Overs;
        this.CurrentOverRuns = Enumerable.from(balls)
        .where(i => i.InningsId === lastBall.InningsId)
        .takeFromLast(50)
        .groupBy(i => `${i.OverId}`)
        .select((g)=>{
            return {
                overId: g.first().OverId,
                overBalls: g.select(ball => ({
                    four: ball.isFour === 1 ? true : false,
                    six: ball.isSix === 1 ? true : false,
                    run: getCurrentBallDescription(ball),
                    wicket: ball.Dismissal === 1 ? true : false
                })).toArray()
            };
        }).toArray();
        let [striker,nonStriker] = lastBall.Partnerid.split('-');
        this.strikerData = Enumerable.from(balls).where(i => i.StrikerID === parseInt(striker))
        .groupBy(i => `${i.Partnerid}-${i.StrikerID}-${i.NonStrikerID}`)
        .select(g =>{
            const {firstname,lastname} = splitName(g.first().StrikerName);
            const strikerID = g.first().StrikerID;
            return{
                FirstName:firstname,
                LastName:lastname,
                Runs:g.sum(i => i.Batruns),
                Balls: g.sum(i => i.Batballs),
                isStriker: strikerID === lastBall.StrikerID?true:false
            }
        }).toArray();
        this.nonStrikerData = Enumerable.from(balls).where(i => i.StrikerID === parseInt(nonStriker))
        .groupBy(i => `${i.StrikerID}`)
        .select(g =>{
            const {firstname,lastname} = splitName(g.first().StrikerName);
            const strikerID = g.first().StrikerID;
            return{
                FirstName:firstname,
                LastName:lastname,
                Runs:g.sum(i => i.Batruns),
                Balls: g.sum(i => i.Batballs),
                isStriker: strikerID === lastBall.StrikerID?true:false
            }
        }).toArray();
        this.bowlerData = Enumerable.from(balls).where(i => i.BowlerID === lastBall.BowlerID)
        .groupBy(i => `${i.BowlerID}`)
        .select(g =>{
            const {firstname,lastname} = splitName(g.first().BowlerName);
            const BowlerID = g.first().BowlerID;
            return{
                FirstName:firstname,
                LastName:lastname,
                Runs:g.sum(i => i.Bowlruns),
                Overs: parseFloat(calculateOvers(g.sum(i=> i.Bowlballs===1?1:0))),
                Wickets: g.count(i=>i.Bowlwkts===1)
            }
        }).toArray();
    }
  }
  generateEquation(): void {
    this.description = '';
    const matchDetails = this.matchDetails();
    const inningsData = matchDetails?.inningsData ?? [];
    const currentInningIndex = this.currentInnings()! - 1;
    if(inningsData.length > 0){
        if(this.matchDetails().MatchComplete){
            let teamWon = this.matchDetails().result.find(i => i.Won === 1);
            if(teamWon){
                let addon = (teamWon?.DuckWorthLewis === 1)?'(DLS method)':'';
                addon = (teamWon?.SuperOver === 1)?'(one-over eliminator)':'';
                this.description = `${teamWon?.ClubName} ${teamWon?.Result} ${addon}`;
            }
        }
        else{
            if (inningsData.length > 0 && this.currentInnings() === 1) {
                const tossWinner = inningsData.find(i => i.TossWin === 1);
                if (tossWinner) {
                    if (tossWinner.WinTeam === tossWinner.BattingClubID) {
                        this.description = `${tossWinner.BattingClubName} elected to bat`;
                    } else if (tossWinner.WinTeam === tossWinner.BowlingClubID) {
                        this.description = `${tossWinner.BowlingClubName} elected to bowl`;
                    }
                }
            }
            if (matchDetails.isLimitedOvers === 1) {
                 if (inningsData.length > 0 && this.currentInnings() === 2) {
                    // Second Innings Description for Limited overs
                    const inning2data = this.summary()[1] ?? null;
                    if (inning2data) {
                        const TeamName = matchDetails.inningsData[1].BattingClubName;
                        const inning1data = this.summary()[0];
                        let neededRuns = inning1data.TeamTotal - inning2data.TeamTotal;
                        let remainingBalls = oversToBalls(matchDetails.MatchOvers) - oversToBalls(inning2data.Overs);
                        let revisedOvers = matchDetails.inningsData[1].RevisedOvers;
                        let revisedTarget = matchDetails.inningsData[1].RevisedTarget;
                        if (revisedOvers) {
                            remainingBalls = oversToBalls(revisedOvers) - oversToBalls(inning2data.Overs);
                        }
                        if (revisedTarget) {
                            neededRuns = revisedTarget - inning2data.TeamTotal;
                        }
                        this.description = `${TeamName} needed ${neededRuns} to win from ${remainingBalls}`;
                    }
                }
            } else {
                if(typeof(this.currentInnings()) === 'number'){
                    const currentInning = inningsData[currentInningIndex] ?? {};
                    const opponentInning = inningsData[currentInningIndex % 2 === 0 ? currentInningIndex + 1 : currentInningIndex - 1] ?? {};
                    const summary = this.summary();
                    // Extract relevant totals
                    const currentTeamName = currentInning.BattingClubName;
                    const currentTeamTotal = summary[currentInningIndex].TeamTotal ?? 0;
                    const opponentTotal1 = summary[0]?.TeamTotal ?? 0; // Team A's 1st Innings
                    const opponentTotal2 = summary[2]?.TeamTotal ?? 0; // Team A's 2nd Innings
                    const opponentOverallTotal = opponentTotal1 + opponentTotal2;
                    const currentTotal1 = summary[1]?.TeamTotal ?? 0; // Team B's 1st Innings
                    const currentTotal2 = summary[3]?.TeamTotal ?? 0; // Team B's 2nd Innings
                    const currentOverallTotal = currentTotal1 + currentTotal2;

                    // Follow-On Check
                    if (matchDetails.isFollowOn === 1 && currentInningIndex === 2) {
                        // Follow-on scenario, 3rd Innings
                        this.description = `${currentTeamName} are batting in the 3rd innings after following on`;
                    } else if (matchDetails.isFollowOn === 1 && currentInningIndex === 3) {
                        // Follow-on scenario, 4th Innings
                        const neededRuns = opponentOverallTotal - currentOverallTotal + 1;
                        this.description = `${currentTeamName} need ${neededRuns} runs to win in the 4th innings`;
                    } else {
                        // Non-follow-on scenario
                        if (currentInningIndex === 1) {
                            if (currentTeamTotal > opponentTotal1) {
                                const leadBy = currentTeamTotal - opponentTotal1;
                                this.description = `${currentTeamName} lead by ${leadBy} runs in the 1st innings`;
                            } else if (currentTeamTotal < opponentTotal1) {
                                const trailBy = opponentTotal1 - currentTeamTotal;
                                this.description = `${currentTeamName} trail by ${trailBy} runs in the 1st innings`;
                            } else {
                                this.description = `${currentTeamName} are level with ${inningsData[0]?.BattingClubName}`;
                            }
                        } else if (currentInningIndex === 2 || currentInningIndex === 3) {
                            // Lead or Chase for 3rd and 4th Innings
                            if (currentInningIndex === 2) {
                                const leadBy = currentOverallTotal - opponentTotal1;
                                if (leadBy > 0) {
                                    this.description = `${currentTeamName} lead by ${leadBy} runs in the 3rd innings`;
                                } else {
                                    this.description = `${currentTeamName} trail by ${Math.abs(leadBy)} runs in the 3rd innings`;
                                }
                            } else if (currentInningIndex === 3) {
                                const neededRuns = opponentOverallTotal - currentOverallTotal + 1;
                                if (neededRuns > 0) {
                                    this.description = `${currentTeamName} need ${neededRuns} runs to win in the 4th innings`;
                                } else {
                                    const leadBy = Math.abs(neededRuns);
                                    this.description = `${currentTeamName} lead by ${leadBy} runs in the 4th innings`;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ///FOR BEFORE MATCH DESCRIPTION
    else{
        const date = moment(new Date());
        const matchDate = moment(this.matchDetails().Date);
        const diff = moment.duration(matchDate.diff(date));

        if (diff.asMilliseconds() < 0) {
            this.description = 'Match not covered in live';
            this.MatchStartMsg = 'Not covered';
        } else if (diff.asMilliseconds() >= 0) {
            this.MatchStartMsg = 'Yet to start';

            const days = Math.floor(diff.asDays());
            const hours = Math.floor(diff.asHours() % 24);
            const minutes = Math.floor(diff.asMinutes() % 60);

            if (days > 0) {
                this.description = `Match starts in ${days}d ${hours}h ${minutes}m`;
            } else if (hours > 0) {
                this.description = `Match starts in ${hours}h ${minutes}m`;
            } else {
                this.description = `Match starts in ${minutes}m`;
            }
        }
    }
  }
}
