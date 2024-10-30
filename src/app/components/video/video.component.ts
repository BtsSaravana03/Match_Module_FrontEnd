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
  @ViewChild('video', { static: true }) videoElement!: ElementRef;
  currentInnings = input.required<number>();
  videos = signal<VideoBalls[]|[]>([]);
  videoSrc = signal<string>("");
  videoIndex = signal<number>(0);
  Trim = true;
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
    if(window.innerWidth < 1150){
      this.width = '100%';
      this.height = '100%';
    }
    else{
      this.width = '80%';
      this.height = '80%';
    }
  }
 async show() {
    this.videoIndex.set(0);
    this.videoService.currentVideoIndex.set(0);
    this.videos.set(this.videoService.videoArray());
    if(this.currentTab==='Bowl'){
      this.currentTittle =this.videos()[0]?.StrikerName||'';
    }else{
      this.currentTittle =this.videos()[0]?.BowlerName||'';
    }
    if(this.videos().length>0){
      this.onVideoClick(this.videos()[0]?.VideoPath,0);
    }else{
      this.currentTittle = '';
    }
  }
  hide(){
    this.videoElement?.nativeElement.pause();
  }
  onVideoClick(link: string, index: number) {
    this.videoIndex.set(index);
    this.videoService.currentVideoIndex.set(index);
    if(this.videos()[index].VideoMode === 1){
      let _p = api_url + 'MatchVideos/' +link;
      this.videoSrc.set(_p)
    }
    else if(this.videos()[index].VideoMode === 2){
      
      let _p = api_url + 'MatchVideos/'
    }
    else{
      this.videoSrc.set('');
    }
    //this.videoSrc.set(link);
    const startTrim = this.videos()[index].StartTimeTrim;
  
    if (this.Trim && startTrim) {
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.currentTime = startTrim; 
        this.videoElement.nativeElement.load();
      }
      this.trimEnd = parseFloat(this.videos()[index].EndTimeTrim);
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
    if (this.trimEnd && this.Trim && video.currentTime >= this.trimEnd) {
      video.currentTime = this.trimEnd;
      this.playNext();
    }
  }
}
