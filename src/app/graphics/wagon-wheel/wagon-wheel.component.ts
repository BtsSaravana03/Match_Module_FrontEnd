import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
  signal,
  ViewEncapsulation
} from '@angular/core';
import {
  BallByBallService
} from '../../services/ball-by-ball.service';
import {
  AppService
} from '../../services/app.service';
import {
  VideoService
} from '../../components/video/video.service';
import {
  BallData
} from '../../ball-by-ball/ball-by-ball.interface';
import {
  GraphicsService
} from '../graphics.service';
import {
  VideoComponent
} from "../../components/video/video.component";
import {
  BallDetailsPopoverComponent
} from "../ball-details-popover/ball-details-popover.component";
import {
  saveSvgAsPng
} from 'save-svg-as-png';
import {
  CommonModule
} from '@angular/common';
import { checkSR } from '../../scripts/generic';

@Component({
  selector: 'app-wagon-wheel',
  standalone: true,
  imports: [VideoComponent, BallDetailsPopoverComponent, CommonModule],
  templateUrl: './wagon-wheel.component.html',
  styleUrl: './wagon-wheel.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class WagonWheelComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private videoService = inject(VideoService);
  private graphicServices = inject(GraphicsService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private cdr = inject(ChangeDetectorRef);

  ballArray = input.required < BallData[] > ();
  matchDetails = signal<any>({});
  ww_Width = 602;
  ww_Height = 650;
  tooltipTarget: string | undefined;
  targetBall: BallData | undefined;
  scale = 1;
  LeftSideData: string = '0 (0)';
  RightSideData: string = '0 (0)';
  isFlipped = false;
  LeftSideName = 'OFF';
  RightSideName = 'LEG'
  Region = {_1: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_2: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_3: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_4: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_5: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_6: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_7: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_8: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0}}

  @HostListener('window:resize')
  onResize() {
    let scale = this.graphicServices.getScaling(this.ww_Width, this.ww_Height, window.innerWidth, window.innerHeight);
    // const container = this.el.nativeElement.querySelector('#WW_Wrap');
    // container.style.transform = `scale(${scale})`;
    // container.style.transformOrigin = "top center";
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
    // this.ballArray.set(updated);
    // this.setWagonwheel();
    // })
    const filter = this.graphicServices.filterObservable.subscribe(updated => {
      this.setWagonwheel();
    })
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated => {
        this.matchDetails.set(updated);
      })
    this.destroyRef.onDestroy(() => {
      //subscription.unsubscribe();
      filter.unsubscribe();
    })
  }
  constructor() {
    effect(() => {
      if (this.ballArray()) {
        this.setWagonwheel();
      }
    })
  }

  setWagonwheel() {
    this.Region = {_1: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_2: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_3: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_4: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_5: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_6: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_7: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0},_8: {  Runs: 0,  Balls: 0,  Percentage: 0,  SR: 0}}
    let filtered_balls = this.graphicServices.applyFilter(this.ballArray());
    let BattingTypes = new Set();
    let TotalRuns = 0;
    filtered_balls.forEach(i => {
      TotalRuns += i.Runs + i.Penalty + i.BLExtras + i.Extras;
      if (i.StBattingTypeID) {
        BattingTypes.add(i.StBattingTypeID)
      }
    })

    const x1 = 0,
    y1 = 0;
    const circleRadius = 300;
    this.isFlipped = false;
    let LeftBalls = 0,LeftRuns = 0,RightBalls = 0,RightRuns = 0;
    const svgContainer = this.el.nativeElement.querySelector('#WW_Lines');
    svgContainer.innerHTML = '';
    filtered_balls.forEach(i => {
      //let circleRadius = Math.sqrt(i.wa)
      let Angle = i.WW_Angle;
      if (BattingTypes.size === 2) {
        this.isFlipped = true;
        this.LeftSideName = 'OFF';
        this.RightSideName = 'LEG';
      } else if (BattingTypes.size === 1 && BattingTypes.has(1)) {
        this.LeftSideName = 'OFF';
        this.RightSideName = 'LEG'
      } else if (BattingTypes.size === 1 && BattingTypes.has(2)) {
        this.LeftSideName = 'LEG';
        this.RightSideName = 'OFF';
      }
      if (Angle !== null && i.WW_DistancePercentage !== null) {
        if (i.StBattingTypeID === 2 && this.isFlipped) {
          Angle = 360 - i.WW_Angle;
        }
        const radian = (Angle - 90) * (Math.PI / 180);
        let DistancePer = i.WW_DistancePercentage;
        if (i.isFour === 1) {
          DistancePer = 100;
        }
        const DistanceToPx = (DistancePer / 100) * circleRadius;
        const x2 = (x1 + DistanceToPx * (Math.cos(radian)));
        const y2 = y1 + DistanceToPx * (Math.sin(radian));
        //Plot Line
        const line = this.renderer.createElement('line', 'svg');
        this.renderer.setAttribute(line, 'x1', x1.toString());
        this.renderer.setAttribute(line, 'y1', '-30');
        this.renderer.setAttribute(line, 'x2', (x2).toFixed(2));
        this.renderer.setAttribute(line, 'y2', y2.toFixed(2));
        this.renderer.setAttribute(line, 'stroke', this.graphicServices.getItemColor(i.Dismissal, i.Runs));
        this.renderer.setAttribute(line, 'stroke-width', '1');
        this.renderer.setAttribute(line, 'class', 'animated-line');
        this.renderer.setAttribute(line, 'id', 'line' + i.AutoId);
        this.renderer.setAttribute(line, 'data-angle', Angle.toString());
        this.renderer.listen(line, 'click', () => {
          this.onBallClick(i);
        });
        this.renderer.listen(line, 'mouseover', (event: Event) => {
          const target = event.target as SVGElement;
          const id = target.getAttribute('id');
          if (id) {
            this.tooltipTarget = '#' + id;
            this.targetBall = i;
            this.cdr.detectChanges();
          }
        });
        this.renderer.listen(line, 'mouseleave', () => {
          this.tooltipTarget;
        })
        svgContainer.appendChild(line);
        const circle = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(circle, 'cx', (x2).toFixed(2));
        this.renderer.setAttribute(circle, 'cy', y2.toFixed(2));
        this.renderer.setAttribute(circle, 'fill', this.graphicServices.getItemColor(i.Dismissal, i.Runs));
        this.renderer.setAttribute(circle, 'r', '2');
        this.renderer.listen(circle, 'click', () => {
          this.onBallClick(i);
        });
        svgContainer.appendChild(circle);
        if (Angle >= 0 && Angle <= 180) {
          RightBalls += i.Batballs;
          RightRuns += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        } else
        if (Angle >= 181 && Angle <= 360) {
          LeftBalls += i.Batballs;
          LeftRuns += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        }
      }
      this.RightSideData = `${RightRuns} (${RightBalls})`;
      this.LeftSideData = `${LeftRuns} (${LeftBalls})`;
      ///SET REGION VALUES
      if(Angle >= 1 && Angle <= 45){
        this.Region._1.Balls += i.Batballs;
        this.Region._1.Runs += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        this.Region._1.SR = this.Region._1.Balls!==0?parseFloat(((this.Region._1.Runs / this.Region._1.Balls) * 100).toFixed(1)):0;
        this.Region._1.Percentage = TotalRuns!==0?parseFloat(((this.Region._1.Runs / TotalRuns)*100).toFixed(1)):0;
      }
      else if(Angle >= 46 && Angle <= 90){
        this.Region._2.Balls += i.Batballs;
        this.Region._2.Runs += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        this.Region._2.SR = this.Region._2.Balls!==0?parseFloat(((this.Region._2.Runs / this.Region._2.Balls) * 100).toFixed(1)):0;
        this.Region._2.Percentage = TotalRuns!==0?parseFloat(((this.Region._2.Runs / TotalRuns)*100).toFixed(1)):0;
      }
      else if(Angle >= 91 && Angle <= 135){
        this.Region._3.Balls += i.Batballs;
        this.Region._3.Runs += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        this.Region._3.SR = this.Region._3.Balls!==0?parseFloat(((this.Region._3.Runs / this.Region._3.Balls) * 100).toFixed(1)):0;
        this.Region._3.Percentage = TotalRuns!==0?parseFloat(((this.Region._3.Runs / TotalRuns)*100).toFixed(1)):0;
      }
      else if(Angle >= 136 && Angle <= 180){
        this.Region._4.Balls += i.Batballs;
        this.Region._4.Runs += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        this.Region._4.SR = this.Region._4.Balls!==0?parseFloat(((this.Region._4.Runs / this.Region._4.Balls) * 100).toFixed(1)):0;
        this.Region._4.Percentage = TotalRuns!==0?parseFloat(((this.Region._4.Runs / TotalRuns)*100).toFixed(1)):0;
      }
      else if(Angle >= 181 && Angle <= 225){
        this.Region._5.Balls += i.Batballs;
        this.Region._5.Runs += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        this.Region._5.SR = this.Region._5.Balls!==0?parseFloat(((this.Region._5.Runs / this.Region._5.Balls) * 100).toFixed(1)):0;
        this.Region._5.Percentage = TotalRuns!==0?parseFloat(((this.Region._5.Runs / TotalRuns)*100).toFixed(1)):0;
      }
      else if(Angle >= 226 && Angle <= 270){
        this.Region._6.Balls += i.Batballs;
        this.Region._6.Runs += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        this.Region._6.SR = this.Region._6.Balls!==0?parseFloat(((this.Region._6.Runs / this.Region._6.Balls) * 100).toFixed(1)):0;
        this.Region._6.Percentage = TotalRuns!==0?parseFloat(((this.Region._6.Runs / TotalRuns)*100).toFixed(1)):0;
      }
      else if(Angle >= 271 && Angle <= 315){
        this.Region._7.Balls += i.Batballs;
        this.Region._7.Runs += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        this.Region._7.SR = this.Region._7.Balls!==0?parseFloat(((this.Region._7.Runs / this.Region._7.Balls) * 100).toFixed(1)):0;
        this.Region._7.Percentage = TotalRuns!==0?parseFloat(((this.Region._7.Runs / TotalRuns)*100).toFixed(1)):0;
      }
      else if(Angle >= 316 && Angle <= 360){
        this.Region._8.Balls += i.Batballs;
        this.Region._8.Runs += i.Runs + i.Penalty + i.BLExtras + i.Extras;
        this.Region._8.SR = this.Region._8.Balls!==0?parseFloat(((this.Region._8.Runs / this.Region._8.Balls) * 100).toFixed(1)):0;
        this.Region._8.Percentage = TotalRuns!==0?parseFloat(((this.Region._8.Runs / TotalRuns)*100).toFixed(1)):0;
      }
    })
  }
  onBallClick(i: BallData) {
    this.videoService.PlayGraphicsVideos(i.BallId, i.InningsId);
  }
}
