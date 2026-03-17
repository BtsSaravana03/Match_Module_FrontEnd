import { Component, ElementRef, inject, input, signal, viewChild, ViewChild } from '@angular/core';
import { VideoService } from './video.service';
import { CommonModule } from '@angular/common';
import { DxPopupModule } from 'devextreme-angular';
import { VideoBalls } from './video.interface';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { api_url, ip, videoFolder } from '../../../variable';
import Hls from 'hls.js';
import { MatchData } from '../../scorecard-v2/batting-card/batting-card.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule,DxPopupModule, FormsModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss',
})
export class VideoComponent {
  private videoService = inject(VideoService);
//   @ViewChild('videoPlayer', { static: true }) videoElement!: HTMLVideoElement;
  videoElement = viewChild<ElementRef>('videoPlayer');
  selctedInnings = input<number>();
  matchInfo = input.required<any>();
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
  isChecked = false; // default value
  selectedCam: string | null = null;
  currentIndexVideo:number = 0;
showCam1 = false;
showCam2 = false;

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

onCheckboxClick(cam: string, event: Event) {
  event.preventDefault(); // prevent default toggle behavior

  // If clicking on a different cam, switch selection
  if (this.selectedCam !== cam) {
    this.selectedCam = cam;
  }
  this.onVideoClick1('',this.currentIndexVideo);
  // else, do nothing (keeps it checked)
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
    debugger;
    this.isHls = false;
    this.videoIndex.set(index);
    let ball = this.videos()[index];
    this.videoService.currentVideoIndex.set(index);
    let rootFolder = ball.VideoPath;

    this.currentIndexVideo = index;
    // if(ball.VideoMode === 1){

    //   let _p = api_url +link;
    //   this.videoSrc.set(_p)
    // }
    if(ball.VideoMode === 3){
        this.isHls = true;
        this.hlsStartFrame = ball.StartFrame;

        const videoElement = this.videoElement()?.nativeElement;
        const hlsUrl = videoFolder + ball.hlsPath;
        console.log('HLS URL:', hlsUrl);
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(hlsUrl);
            hls.attachMedia(videoElement);
            // hls.on(Hls.Events.MANIFEST_PARSED, () => {
            //     videoElement.play().catch(console.error);
            // });
            let currentInn = ball.InningsID;
            let syncTime = 0;
            if(this.matchInfo()!.inningsData[currentInn-1]){
             syncTime = this.matchInfo()!.inningsData[currentInn-1]['SyncTime'];
            }
            this.hlsEndFrame = ball.EndFrame + syncTime;
            videoElement.currentTime = this.hlsStartFrame + syncTime;
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
    //else if(true){
    else if(ball.VideoMode === 2){
      let folder = this.matchInfo().MtcVideos+' '+this.formatDate(this.matchInfo()?.Date)+ball.InningsID;
      let outerFoldetr = ball.MatchID+'_'+this.matchInfo().MtcVideos+' '+this.formatDate(this.matchInfo()?.Date);
      let _p =  ball.hlsPath+'/' +outerFoldetr +'/'+ folder +'/'+ folder+'_'+ball.BallID+'.mp4';
      // normalize = _p.replace(/\\/g, '/');
      let blob = await this.convertToBlob(_p);
      this.videoSrc.set(blob);
    }
    else if(ball.VideoMode === 1){
      let folder = this.matchInfo().MtcVideos+' '+this.formatDate(this.matchInfo()?.Date)+ball.InningsID;
      let outerFoldetr = ball.MatchID+'_'+this.matchInfo().MtcVideos+' '+this.formatDate(this.matchInfo()?.Date);


      //Cam1
      let _p =  ball.hlsPath+'/' +outerFoldetr +'/'+ folder +'/'+ folder+'_'+ball.BallID+'_cam1.mp4'; //'D:\\kadamba\\tempdata\\MU Vs MM 12-10-251_1_cam1.mp4'; 
      _p = _p.replace(/\t/g, '').trim();
      const normalizedPath = _p.replace(/\\/g, '/');  
       
      const encoded = encodeURIComponent(normalizedPath);
      console.log(api_url+ 'video/getBlobURL/'+encoded);
      let response = await fetch(api_url+ 'video/getBlobURL/'+encoded);
      if (!response.ok) {
          console.log("video1 Error");
          this.showCam1 = false;
      }else{
          console.log("Video1 Success");
          this.showCam1 = true;
          // this.selectedCam = 'cam1'; 
      }
 

      // //Cam2
      let _p2 =  ball.hlsPath+'/' +outerFoldetr +'/'+ folder +'/'+ folder+'_'+ball.BallID+'_cam2.mp4'; ///'D:\\kadamba\\tempdata\\MU Vs MM 12-10-251_2_cam2.mp4'; 
      _p2 = _p2.replace(/\t/g, '').trim();
      const normalizedPath2 = _p2.replace(/\\/g, '/');
      const encoded2 = encodeURIComponent(normalizedPath2);
      console.log(api_url+ 'video/getBlobURL/'+encoded2);
      let response2 = await fetch(api_url+ 'video/getBlobURL/'+encoded2);
      if (!response2.ok) {
          console.log("video2 Error");
          this.showCam2 = false;
      }else{
          console.log("Video2 Success");
          this.showCam2 = true;
          // this.selectedCam = 'cam2'; 
      }

      //Videoplay
      if(this.showCam1 === true && this.showCam2 === true){
        this.selectedCam = 'cam1'; 
         let blob = await this.convertToBlob(normalizedPath);
         this.videoSrc.set(blob);
      }else if(this.showCam1===true){
        this.selectedCam = 'cam1'; 
         let blob = await this.convertToBlob(normalizedPath);
         this.videoSrc.set(blob);
      }else if(this.showCam2 === true){
        this.selectedCam = 'cam2'; 
         let blob = await this.convertToBlob(normalizedPath2);
         this.videoSrc.set(blob);
      }

     
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


   async onVideoClick1(link: string, index: number) {
    debugger;
    this.isHls = false;
    this.videoIndex.set(index);
    let ball = this.videos()[index];
    this.videoService.currentVideoIndex.set(index);
    let rootFolder = ball.VideoPath;

    this.currentIndexVideo = index;
     
    if(ball.VideoMode === 1){
      let folder = this.matchInfo().MtcVideos+' '+this.formatDate(this.matchInfo()?.Date)+ball.InningsID;
      let outerFoldetr = ball.MatchID+'_'+this.matchInfo().MtcVideos+' '+this.formatDate(this.matchInfo()?.Date);


      //Cam1
      let _p =  ball.hlsPath+'/' +outerFoldetr +'/'+ folder +'/'+ folder+'_'+ball.BallID+'_cam1.mp4'; ///'D:\\kadamba\\tempdata\\MU Vs MM 12-10-251_1_cam1.mp4'; 
      _p = _p.replace(/\t/g, '').trim();
      const normalizedPath = _p.replace(/\\/g, '/');  
       
      const encoded = encodeURIComponent(normalizedPath);
      console.log(api_url+ 'video/getBlobURL/'+encoded);
      let response = await fetch(api_url+ 'video/getBlobURL/'+encoded);
      if (!response.ok) {
          console.log("video1 Error");
          this.showCam1 = false;
      }else{
          console.log("Video1 Success");
          this.showCam1 = true;
          // this.selectedCam = 'cam1'; 
      }
  
      // //Cam2
      let _p2 =  ball.hlsPath+'/' +outerFoldetr +'/'+ folder +'/'+ folder+'_'+ball.BallID+'_cam2.mp4';  ////'D:\\kadamba\\tempdata\\MU Vs MM 12-10-251_2_cam2.mp4'; 
      _p2 = _p2.replace(/\t/g, '').trim();
      const normalizedPath2 = _p2.replace(/\\/g, '/');
      const encoded2 = encodeURIComponent(normalizedPath2);
      console.log(api_url+ 'video/getBlobURL/'+encoded2);
      let response2 = await fetch(api_url+ 'video/getBlobURL/'+encoded2);
      if (!response2.ok) {
          console.log("video2 Error");
          this.showCam2 = false;
      }else{
          console.log("Video2 Success");
          this.showCam2 = true;
          // this.selectedCam = 'cam2'; 
      }

      //Videoplay
      if(this.selectedCam === 'cam1'){
         let blob = await this.convertToBlob(normalizedPath);
         this.videoSrc.set(blob);
      }else if(this.selectedCam === 'cam2'){
         let blob = await this.convertToBlob(normalizedPath2);
         this.videoSrc.set(blob);
      }

     
    }
    else{
      this.videoSrc.set('');
    }
   
  }


  playNext(){
    const videoElement = this.videoElement()?.nativeElement;
    let currentIndex = this.videoIndex();
    if(!this.videos()[currentIndex+1]){
      videoElement.pause();
      return;
    }
    this.onVideoClick(this.videos()[currentIndex+1].VideoPath,currentIndex+1)
  }
  onTrimChange(element:HTMLInputElement){
    this.Trim = element.checked;
  }
  convertPathToUrl(filePath: string): string {
    return filePath.replace(/^[A-Z]:/, videoFolder).replace(/\\/g, '/');
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
  async convertToBlob(filePath:string){
    //let video = await this.httpServices.getData('video/getBlobURL/'+filePath);
    // var URL = window.URL || window.webkitURL;
    // URL.createObjectURL(video);
    //return video.blob();
    const encoded = encodeURIComponent(filePath);
    console.log(api_url+ 'video/getBlobURL/'+encoded);
    let response = await fetch(api_url+ 'video/getBlobURL/'+encoded);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const videoBlob = await response.blob();
    const videoURL = URL.createObjectURL(videoBlob);
    return videoURL;
  }
}
