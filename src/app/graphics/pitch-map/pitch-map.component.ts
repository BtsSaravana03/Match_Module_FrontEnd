import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, ElementRef, HostListener, inject, OnInit, Renderer2, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { AppService } from '../../services/app.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { check, checkInf } from '../../scripts/generic';
import { VideoComponent } from "../../components/video/video.component";
import { VideoService } from '../../components/video/video.service';
import { DxPopoverModule } from 'devextreme-angular';

interface Range {
  Balls:number;
  Runs: number;
  Avg:string;
  SR:string;
  Wickets:number;
  y:number;
}

@Component({
  selector: 'app-pitch-map',
  standalone: true,
  imports: [VideoComponent,DxPopoverModule],
  templateUrl: './pitch-map.component.html',
  styleUrl: './pitch-map.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class PitchMapComponent implements OnInit,AfterViewInit {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);
  private videoService = inject(VideoService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  
  ballArray = signal<BallData[]>([]);
  rangeDefault:Range = {Balls:0,Runs: 0,Avg:'0',SR:'0',Wickets:0,y:0}
  range2M:Range = this.rangeDefault;
  range4M:Range = this.rangeDefault;
  range6M:Range = this.rangeDefault;
  range8M:Range = this.rangeDefault;
  range10M:Range = this.rangeDefault;
  pm_width: number = 296;
  pm_height:number = 594;
  navbarHeight = 100;
  _2mLine_y = 0;
  _4mLine_y = 0;
  _6mLine_y = 0;
  _8mLine_y = 0;
  _10mLine_y = 0;
  tooltipTarget:string|undefined;
  targetBall:BallData|undefined;

  constructor(private cdr: ChangeDetectorRef) {}
  @HostListener('window:resize')
  onResize() {
    const text_Container = 150;
    const imageWidth = this.pm_width + text_Container;
    const imageHeight = this.pm_height;
    const aspectRatio = imageWidth / imageHeight;
    const availableWidth = window.innerWidth- this.navbarHeight;
    const availableHeight = window.innerHeight - this.navbarHeight;
    let scale;
    if (availableWidth / aspectRatio <= availableHeight) {
        scale = availableWidth / imageWidth;
    } else {
        scale = availableHeight / imageHeight;
    }
      const container = this.el.nativeElement.querySelector('#pitchmap-container');
      container.style.transform = `scale(${scale})`;
      container.style.transformOrigin = "top center"; 
  }

  ngOnInit(): void {
    this.appService.updateNavHeader('PitchMap');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.setPitchmap();
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
    })
  }
  ngAfterViewInit(): void {
    this.onResize();
  }
  setPitchmap(){
    this.range2M = {Balls:0,Runs: 0,Avg:'0',SR:'0',Wickets:0,y:0};
    this.range4M = {Balls:0,Runs: 0,Avg:'0',SR:'0',Wickets:0,y:0};
    this.range6M = {Balls:0,Runs: 0,Avg:'0',SR:'0',Wickets:0,y:0};
    this.range8M = {Balls:0,Runs: 0,Avg:'0',SR:'0',Wickets:0,y:0};
    this.range10M = {Balls:0,Runs: 0,Avg:'0',SR:'0',Wickets:0,y:0};
    let filtered_balls = this.ballArray();
    const _beforeGreece = 37.79;
    const ballRadius = 5;
    //PitchMap SVG Dimensions
    const width = this.pm_width;
    const height = this.pm_height;
    //Cricket Pitch Dimensions(in cm)
    const pitchWidth = 264; 
    const pitchLength = 1500;
    // PX/CM Ratio
    const scaling_x = parseFloat((width / pitchWidth).toFixed(4));
    const scaling_y = parseFloat((height / pitchLength).toFixed(4));
    //Meter Lines
    this._2mLine_y = (scaling_y * 200) + _beforeGreece;
    this._4mLine_y = (scaling_y * 400) + _beforeGreece;
    this._6mLine_y = (scaling_y * 600) + _beforeGreece;
    this._8mLine_y = (scaling_y * 800) +_beforeGreece;
    this._10mLine_y = (scaling_y * 1000) + _beforeGreece;
    //For Text Container
    this.range2M.y = this._2mLine_y - 50;
    this.range4M.y = this._4mLine_y - 50;
    this.range6M.y = this._6mLine_y - 50;
    this.range8M.y = this._8mLine_y - 50;
    this.range10M.y = this._10mLine_y - 50;
    const svgElement = this.el.nativeElement.querySelector('#pitchmapSVG');
    //Clearing previous balls
    svgElement.innerHTML = '';
    filtered_balls.forEach(i => {
      if(i.PM_X && i.PM_Y){
        const pitchReg_x = i.PM_X_CM * scaling_x;
        const pitchReg_y = (i.PM_Y_CM * scaling_y) - ballRadius;
        const circle = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(circle,'class','pitchmap-ball');
        this.renderer.setAttribute(circle, 'cx', (-(pitchReg_x)).toString());
        this.renderer.setAttribute(circle, 'cy', (pitchReg_y).toString());
        this.renderer.setAttribute(circle, 'r', '5');
        this.renderer.setAttribute(circle, 'stroke', '#fff');
        this.renderer.setAttribute(circle, 'stroke-width', '0.5px');
        this.renderer.setAttribute(circle, 'id', 'circle'+i.AutoId);
        this.renderer.setAttribute(circle, 'title', 'BowlerName:' );
        //Set ball color
        if(i.Dismissal === 1){
          this.renderer.setAttribute(circle, 'fill', '#B7B7B7');
        }
        else{
          switch(i.Runs){
            case 0:
               this.renderer.setAttribute(circle, 'fill', '#000');
              break;
            case 1:
              this.renderer.setAttribute(circle, 'fill', '#E8BF09');
              break;
            case 2:
              this.renderer.setAttribute(circle, 'fill', '#1C8EEE');
              break;
            case 3:
              this.renderer.setAttribute(circle, 'fill', '#38C500');
              break;
            case 4:
              this.renderer.setAttribute(circle, 'fill', '#00068D');
              break;
            case 5:
              this.renderer.setAttribute(circle, 'fill', '#DA6E00');
              break;
            case 6:
              this.renderer.setAttribute(circle, 'fill', '#DE1623');
              break;
          }
        }
        this.renderer.listen(circle, 'click', () => {
          this.onBallClick(i);
        });
        this.renderer.listen(circle, 'mouseover', (event: Event) => {
          const target = event.target as SVGElement;
          const id = target.getAttribute('id');
          if(id){
            this.tooltipTarget = '#'+id;
            this.targetBall = i;
            this.cdr.detectChanges();
          }
        });
        this.renderer.listen(circle,'mouseleave',(event:Event) => {
          this.tooltipTarget;
        })
        this.renderer.appendChild(svgElement, circle);

        //Meter stats calculation
        const _y_greece = pitchReg_y + _beforeGreece - ballRadius;
        //#2M Region
        if((_y_greece > 0) && (_y_greece < this._2mLine_y)){
          this.range2M.Balls += i.Batballs;
          this.range2M.Runs += i.Runs;
          this.range2M.Wickets += i.Dismissal;
          this.range2M.SR = checkInf((this.range2M.Runs * 100)/this.range2M.Balls);
          this.range2M.Avg = check(this.range2M.Runs / this.range2M.Wickets);
        }
        //#4M Region
        else if((_y_greece > this._2mLine_y) && (_y_greece < this._4mLine_y)){
          this.range4M.Balls += i.Batballs;
          this.range4M.Runs += i.Runs;
          this.range4M.Wickets += i.Dismissal;
          this.range4M.SR = checkInf((this.range4M.Runs * 100)/this.range4M.Balls);
          this.range4M.Avg = check(this.range4M.Runs / this.range4M.Wickets);
        }
        //#6M Region
        else if((_y_greece > this._4mLine_y) && (_y_greece < this._6mLine_y)){
          this.range6M.Balls += i.Batballs;
          this.range6M.Runs += i.Runs;
          this.range6M.Wickets += i.Dismissal;
          this.range6M.SR = checkInf((this.range6M.Runs * 100)/this.range6M.Balls);
          this.range6M.Avg = check(this.range6M.Runs / this.range6M.Wickets);
        }
        //#8M Region
        else if((_y_greece > this._6mLine_y) && (_y_greece < this._8mLine_y)){
          this.range8M.Balls += i.Batballs;
          this.range8M.Runs += i.Runs;
          this.range8M.Wickets += i.Dismissal;
          this.range8M.SR = checkInf((this.range8M.Runs * 100)/this.range8M.Balls);
          this.range8M.Avg = check(this.range8M.Runs / this.range8M.Wickets);
        }
        //#10M Region
        else if((_y_greece > this._8mLine_y) && (_y_greece < this._10mLine_y)){
          this.range10M.Balls += i.Batballs;
          this.range10M.Runs += i.Runs;
          this.range10M.Wickets += i.Dismissal;
          this.range10M.SR = checkInf((this.range10M.Runs * 100)/this.range10M.Balls);
          this.range10M.Avg = check(this.range10M.Runs / this.range10M.Wickets);
        }
      }
    })
  }
  onBallClick(i:BallData){
    this.videoService.PlayGraphicsVideos(i.BallId,i.InningsId);
  }
}
