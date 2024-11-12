import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { VideoService } from './video.service';
import { CommonModule } from '@angular/common';
import { DxPopupModule } from 'devextreme-angular';
import { VideoBalls } from './video.interface';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { api_url } from '../../variable';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule,DxPopupModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss',
})
export class VideoComponent {
  private videoService = inject(VideoService); 
  @ViewChild('videoPlayer', { static: true }) videoElement!: HTMLVideoElement;
  selctedInnings = input.required<number>();
  matchInfo = input.required<any>()
  videos = signal<VideoBalls[]|[]>([]);
  videoSrc = signal<string>("");
  videoIndex = signal<number>(0);
  Trim = false;
  trimEnd:number = 0;
  videoPopup:boolean = false;
  currentTab:"Bat"|"Bowl" = "Bat";
  width:string = '80%'
  height:string = '80%';
  resizeObservable$!:Observable<Event>;
  resizeSubscription$!: Subscription;
  currentTittle:string = '';
  constructor(){
    this.videoService.setComponent(this);
    this.resizeObservable$ = fromEvent(window,'resize');
    this.resizeSubscription$ = this.resizeObservable$.subscribe(e => {
     this.onResize();
    })
    this.onResize();
    
  }
  onResize(){
    if(window.innerWidth < 1200){
      this.width = '100%';
      this.height = '100%';
    }
    else{
      this.width = '70%';
      this.height = '70%';
    }
  }
 async show(index?:number) {
    //console.log(this.matchInfo());
    let i =index?index:0;
    this.videoIndex.set(i);
    this.videoService.currentVideoIndex.set(i);
    this.videos.set(this.videoService.videoArray());
    if(this.currentTab==='Bowl'){
      this.currentTittle =this.videos()[i]?.StrikerName||'';
    }else{
      this.currentTittle =this.videos()[i]?.BowlerName||'';
    }
    if(this.videos().length>0){
      this.onVideoClick(this.videos()[i]?.VideoPath,i);
    }else{
      this.currentTittle = '';
    }
  }
  hide(){
    this.videoElement?.pause();
  }
  formatDate(inputDate:string){
    const date = new Date(inputDate);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(2)}`;
  }
  onVideoClick(link: string, index: number) {
    this.videoIndex.set(index);
    let ball = this.videos()[index];
    this.videoService.currentVideoIndex.set(index);
    if(ball.VideoMode === 1){
      let _p = api_url +link;
      this.videoSrc.set(_p)
    }
    else if(ball.VideoMode === 2){
      let folder = this.matchInfo().MtcVideos+' '+this.formatDate(this.matchInfo()?.Date)+ball.InningsID;
      let _p = api_url +folder+'/'+folder+'_'+ball.BallID+'.mp4';
      this.videoSrc.set(_p);
    }
    else{
      this.videoSrc.set('');
    }
    //this.videoSrc.set(link);
    const startTrim = ball.StartTimeTrim;
  
    if (this.Trim && startTrim) {
      if (this.videoElement) {
        //this.videoElement.nativeElement.currentTime = startTrim; 
        this.videoElement.load();
      }
      this.trimEnd = parseFloat(ball.EndTimeTrim);
    }
  }
  playNext(){
    let currentIndex = this.videoIndex();
    if(!this.videos()[currentIndex+1]){
      return;
    }
    this.onVideoClick(this.videos()[currentIndex+1].VideoPath,currentIndex+1)
  }
  onTrimChange(element:HTMLInputElement){
    this.Trim = element.checked;
  }
  onVideoProgress(video: HTMLVideoElement) {
    if(!this.videoElement) this.videoElement = video;
    if (this.trimEnd && this.Trim && video.currentTime >= this.trimEnd) {
      video.currentTime = this.trimEnd;
      this.playNext();
    }
  }
}
