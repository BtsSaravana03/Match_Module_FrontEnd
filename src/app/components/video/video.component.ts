import { Component, ElementRef, inject, input, signal, viewChild, ViewChild } from '@angular/core';
import { VideoService } from './video.service';
import { CommonModule } from '@angular/common';
import { DxPopupModule } from 'devextreme-angular';
import { VideoBalls } from './video.interface';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { api_url, ip } from '../../variable';
import { HttpServices } from '../../services/http.service';
import Hls from 'hls.js';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule,DxPopupModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss',
})
export class VideoComponent {
  private videoService = inject(VideoService);
//   @ViewChild('videoPlayer', { static: true }) videoElement!: HTMLVideoElement;
  videoElement = viewChild<ElementRef>('videoPlayer');
  selctedInnings = input<number>();
  matchInfo = input<any>();
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
  hlsStartFrame:number = 0;
  hlsEndFrame:number = 0;
  isHls:boolean = false;
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
      this.currentTittle =this.videos()[i]?.BowlerName||'';
    }else{
      this.currentTittle =this.videos()[i]?.StrikerName||'';
    }
    if(this.videos().length>0){
      this.onVideoClick(this.videos()[i]?.VideoPath,i);
    }else{
      this.currentTittle = '';
    }
  }
  hide(){
    this.videoElement()?.nativeElement.pause();
  }
  formatDate(inputDate:string){
    const date = new Date(inputDate);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(2)}`;
  }
  async onVideoClick(link: string, index: number) {
    this.isHls = false;
    this.videoIndex.set(index);
    let ball = this.videos()[index];
    this.videoService.currentVideoIndex.set(index);
    let rootFolder = ball.VideoPath;
    // if(ball.VideoMode === 1){

    //   let _p = api_url +link;
    //   this.videoSrc.set(_p)
    // }
    if(ball.VideoMode === 3){
        this.isHls = true;
        this.hlsStartFrame = ball.StartFrame;
        this.hlsEndFrame = ball.EndFrame;
        const videoElement = this.videoElement()?.nativeElement;
        const hlsUrl = `http://${ip}/hls/`+ball.hlsPath;
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(hlsUrl);
            hls.attachMedia(videoElement);
            // hls.on(Hls.Events.MANIFEST_PARSED, () => {

            //     videoElement.play().catch(console.error);
            // });
            videoElement.currentTime = this.hlsStartFrame;
            videoElement.load()
            videoElement.play();
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = hlsUrl;
            videoElement.load();
            videoElement.play().catch(console.error);
        } else {
            console.error('HLS is not supported in this browser.');
        }
        //let _p = 'http://localhost/hls/'+ball.hlsPath;
        //const encoded = encodeURIComponent(_p);
        //this.isHls = true;
        // this.videoSrc.set(_p);
        // this.hlsStartFrame = ball.StartFrame;
        // this.hlsEndFrame = ball.EndFrame;
        // if(this.videoElement()){
        //     this.videoElement()!.nativeElement.currentTime = this.hlsStartFrame;
        //     this.videoElement()?.nativeElement.load();
        // }
    }
    else if(ball.InVideoMode === 1 || ball.InVideoMode === 2){
      let folder = this.matchInfo().MtcVideos+' '+this.formatDate(this.matchInfo()?.Date)+ball.InningsID;
      let _p = rootFolder +'/' + folder +'/'+ folder+'_'+ball.BallID+'.mp4';
      const encoded = encodeURIComponent(_p);
      let blob = await this.convertToBlob(encoded,ball.VideoMode);
      this.videoSrc.set(blob);
    }

    else{
      this.videoSrc.set('');
    }
    //this.videoSrc.set(link);
    // const startTrim = ball.StartTimeTrim;

    // if (this.Trim && startTrim) {
    //   if (this.videoElement) {
    //     //this.videoElement.nativeElement.currentTime = startTrim;
    //     this.videoElement.load();
    //   }
    //   this.trimEnd = parseFloat(ball.EndTimeTrim);
    // }
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
    //if(!this.videoElement) this.videoElement = video;
    // if (this.trimEnd && this.Trim && video.currentTime >= this.trimEnd) {
    //   video.currentTime = this.trimEnd;
    //   this.playNext();
    // }
    if(this.isHls && video.currentTime >= this.hlsEndFrame){
        video.currentTime = this.trimEnd;
        this.playNext();
    }
  }
  setCurrentTab(type:"Bat"|"Bowl"){
    this.currentTab = type;
  }
  async convertToBlob(filePath:string,videotype:number){
    //let video = await this.httpServices.getData('video/getBlobURL/'+filePath);
    // var URL = window.URL || window.webkitURL;
    // URL.createObjectURL(video);
    //return video.blob();
    let response = await fetch(api_url+ 'video/getBlobURL/'+filePath+'/'+videotype);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const videoBlob = await response.blob();
    const videoURL = URL.createObjectURL(videoBlob);
    return videoURL;
  }
}
