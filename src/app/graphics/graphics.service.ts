import { inject, Injectable } from '@angular/core';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';
import { BowlingTypes, GraphicsFilter } from './graphics.interface';
import { HttpServices } from '../services/http.service';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class GraphicsService {
  private HttpServices = inject(HttpServices);
  filter:GraphicsFilter= {
    Innings: 1,
    BowlingType:[],
    BattingType:[],
    Batsman:[],
    Bowlers:[]
  };
  private triggerFilter$ = new Subject <void>();
  filterObservable = this.triggerFilter$.asObservable();
  navbarHeight = 130;
  triggerFilter(){
    this.triggerFilter$.next();
  }
  applyFilter(balls:BallData[]):BallData[]{
    let filtered = balls;
    filtered = balls.filter(i => {
      if(i.InningsId !== this.filter.Innings) return false;
      if(this.filter.BattingType.length> 0){
        if(i.StBattingTypeID === null || !this.filter.BattingType.includes(i.StBattingTypeID)) return false
      }
      if(this.filter.BowlingType.length> 0){
        if(i.BwBowlingTypeID === null || !this.filter.BowlingType.includes(i.BwBowlingTypeID)) return false
      }
      if(this.filter.Batsman.length >0){
        if(!this.filter.Batsman.includes(i.StrikerID)) return false;
      }
      if(this.filter.Bowlers.length >0){
        if(!this.filter.Bowlers.includes(i.BowlerID)) return false;
      }
      return true;
    })
    return filtered;
  }

  getScaling(svg_W:number,svg_H:number,window_W:number,window_H:number):number{
    const imageWidth = svg_W;
    const imageHeight = svg_H;
    const aspectRatio = imageWidth / imageHeight;
    const availableWidth = window_W- this.navbarHeight;
    const availableHeight = window_H - this.navbarHeight;
    let scale;
    if (availableWidth / aspectRatio <= availableHeight) {
        scale = availableWidth / imageWidth;
    } else {
        scale = availableHeight / imageHeight;
    }
    return scale;
  }
  getItemColor(Dismissal:number,Runs:number):string{
    let color = '#000';
    if(Dismissal === 1){
      color = '#B7B7B7';
    }
    else{
      switch(Runs){
        case 0:
           color = '#000';
          break;
        case 1:
          color = '#E8BF09';
          break;
        case 2:
          color = '#1C8EEE';
          break;
        case 3:
          color = '#38C500';
          break;
        case 4:
          color = '#00068D';
          break;
        case 5:
          color = '#DA6E00';
          break;
        case 6:
          color = '#DE1623';
          break;
      }
    }
    return color;
  }
  async getBowlingTypes():Promise<BowlingTypes[]>{
    let response = await this.HttpServices.getData('home/getBowlingTypes');
    return response;
  }
}
