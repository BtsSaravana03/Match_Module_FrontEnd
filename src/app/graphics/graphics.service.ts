import { Injectable } from '@angular/core';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';

@Injectable({
  providedIn: 'root'
})
export class GraphicsService {
  navbarHeight = 100;

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
}
