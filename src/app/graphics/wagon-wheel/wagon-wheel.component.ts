import { ChangeDetectorRef, Component, DestroyRef, effect, ElementRef, HostListener, inject, input, Renderer2, signal, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { AppService } from '../../services/app.service';
import { VideoService } from '../../components/video/video.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { GraphicsService } from '../graphics.service';
import { VideoComponent } from "../../components/video/video.component";
import { BallDetailsPopoverComponent } from "../ball-details-popover/ball-details-popover.component";
import { saveSvgAsPng } from 'save-svg-as-png';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wagon-wheel',
  standalone: true,
  imports: [VideoComponent, BallDetailsPopoverComponent,CommonModule],
  templateUrl: './wagon-wheel.component.html',
  styleUrl: './wagon-wheel.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class WagonWheelComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private videoService = inject(VideoService);
  private graphicServices = inject(GraphicsService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private cdr = inject(ChangeDetectorRef);

  ballArray = input.required<BallData[]>();
  ww_Width = 602;
  ww_Height = 650;
  tooltipTarget:string|undefined;
  targetBall:BallData|undefined;
  scale = 1;
  LeftSideData:string = '0 (0)';
  RightSideData:string = '0 (0)';
  isFlipped = false;
  LeftSideName = 'OFF';
  RightSideName = 'LEG'

  @HostListener('window:resize')
  onResize() {
      let scale = this.graphicServices.getScaling(this.ww_Width,this.ww_Height,window.innerWidth,window.innerHeight);
      const container = this.el.nativeElement.querySelector('#WW_Wrap');
      container.style.transform = `scale(${scale})`;
      container.style.transformOrigin = "top center";
      setTimeout(() => {
        this.scale = scale;
        this.cdr.detectChanges();
      }, 0);
  }
  ngAfterViewInit(): void {
    this.onResize();
  }


  ngOnInit(): void {
    // const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
    //   this.ballArray.set(updated);
    //   this.setWagonwheel();
    // })
    const filter = this.graphicServices.filterObservable.subscribe(updated => {
      this.setWagonwheel();
    })
    this.destroyRef.onDestroy(()=>{
      //subscription.unsubscribe();
      filter.unsubscribe();
    })
  }
  constructor(){
    effect(()=>{
      if(this.ballArray()){
        this.setWagonwheel();
      }
    })
  }

  setWagonwheel(){
    let filtered_balls = this.graphicServices.applyFilter(this.ballArray());
    let BattingTypes = new Set();
    filtered_balls.forEach(i =>{
        if( i.StBattingTypeID){
            BattingTypes.add(i.StBattingTypeID)
        }
    })
    const x1 =0,y1=0;
    const circleRadius = 300;
    this.isFlipped = false;
    let LeftBalls = 0,LeftRuns = 0,RightBalls = 0,RightRuns = 0;
    const svgContainer = this.el.nativeElement.querySelector('#WW_Lines');
    svgContainer.innerHTML = '';
    filtered_balls.forEach(i => {
      //let circleRadius = Math.sqrt(i.wa)
      let Angle = i.WW_Angle;
      if(BattingTypes.size === 2){
        this.isFlipped = true;
        this.LeftSideName = 'OFF';
        this.RightSideName = 'LEG (Flipped)';
      }
      else if (BattingTypes.size === 1 && BattingTypes.has(1)){
        this.LeftSideName = 'OFF';
        this.RightSideName = 'LEG'
      }else if(BattingTypes.size === 1 && BattingTypes.has(2)){
        this.LeftSideName = 'LEG';
        this.RightSideName = 'OFF';
      }
      if(Angle !== null && i.WW_DistancePercentage !== null){
        if(i.StBattingTypeID === 2 && this.isFlipped){
            Angle = 360 - i.WW_Angle;
        }
        const radian = (Angle - 90) * (Math.PI/180);
        let DistancePer = i.WW_DistancePercentage;
        if(i.isFour===1){
          DistancePer = 100;
        }
        const DistanceToPx = (DistancePer/100) * circleRadius;
        const x2 = (x1 + DistanceToPx * (Math.cos(radian)));
        const y2 = y1 + DistanceToPx * (Math.sin(radian));
        //Plot Line
        const line = this.renderer.createElement('line','svg');
        this.renderer.setAttribute(line,'x1', x1.toString());
        this.renderer.setAttribute(line, 'y1', '-30');
        this.renderer.setAttribute(line,'x2',(x2).toFixed(2));
        this.renderer.setAttribute(line,'y2',y2.toFixed(2));
        this.renderer.setAttribute(line,'stroke',this.graphicServices.getItemColor(i.Dismissal,i.Runs));
        this.renderer.setAttribute(line,'stroke-width','1');
        this.renderer.setAttribute(line,'class', 'animated-line');
        this.renderer.setAttribute(line, 'id', 'line'+i.AutoId);
        this.renderer.setAttribute(line, 'data-angle', Angle.toString());
        this.renderer.listen(line, 'click', () => {
          this.onBallClick(i);
        });
        this.renderer.listen(line, 'mouseover', (event: Event) => {
          const target = event.target as SVGElement;
          const id = target.getAttribute('id');
          if(id){
            this.tooltipTarget = '#'+id;
            this.targetBall = i;
            this.cdr.detectChanges();
          }
        });
        this.renderer.listen(line,'mouseleave',() => {
          this.tooltipTarget;
        })
        svgContainer.appendChild(line);
        const circle = this.renderer.createElement('circle','svg');
        this.renderer.setAttribute(circle, 'cx', (x2).toFixed(2));
        this.renderer.setAttribute(circle, 'cy', y2.toFixed(2));
        this.renderer.setAttribute(circle, 'fill', this.graphicServices.getItemColor(i.Dismissal,i.Runs));
        this.renderer.setAttribute(circle, 'r', '2');
        this.renderer.listen(circle, 'click', () => {
          this.onBallClick(i);
        });
        svgContainer.appendChild(circle);
        if(Angle >= 0 && Angle <= 180){
            RightBalls += i.Batballs;
            RightRuns += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        }else if(Angle >= 181 && Angle <= 360){
            LeftBalls += i.Batballs;
            LeftRuns += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        }
      }
      this.RightSideData = `${RightRuns} (${RightBalls})`;
      this.LeftSideData = `${LeftRuns} (${LeftBalls})`;
    })
  }
  onBallClick(i:BallData){
    this.videoService.PlayGraphicsVideos(i.BallId,i.InningsId);
  }

}
