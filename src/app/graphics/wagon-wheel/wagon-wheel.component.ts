import { Component, DestroyRef, ElementRef, HostListener, inject, Renderer2, signal, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { AppService } from '../../services/app.service';
import { VideoService } from '../../components/video/video.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { GraphicsService } from '../graphics.service';

@Component({
  selector: 'app-wagon-wheel',
  standalone: true,
  imports: [],
  templateUrl: './wagon-wheel.component.html',
  styleUrl: './wagon-wheel.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class WagonWheelComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);
  private videoService = inject(VideoService);
  private graphicServices = inject(GraphicsService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ballArray = signal<BallData[]>([]);
  ww_Width = 602;
  ww_Height = 650;
  @HostListener('window:resize')
  onResize() {
      let scale = this.graphicServices.getScaling(this.ww_Width,this.ww_Height,window.innerWidth,window.innerHeight);
      const container = this.el.nativeElement.querySelector('#WagonWheel');
      container.style.transform = `scale(${scale})`;
      container.style.transformOrigin = "top center"; 
  }
  ngAfterViewInit(): void {
    this.onResize();
  }

  // ballAray_D = signal([
  //   {Angle:0,Length:75,Runs:1,Dismissal:0},
  //   {Angle:90,Length:125,Runs:6,Dismissal:0},
  //   {Angle:180,Length:45,Runs:6,Dismissal:0},
  //   {Angle:270,Length:67,Runs:6,Dismissal:0},
  //   {Angle:39,Length:32,Runs:6,Dismissal:0}
  // ])

  ngOnInit(): void {
    this.appService.updateNavHeader('Wagon wheel');
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.setWagonwheel();
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
    })
  }

  setWagonwheel(){
    let filtered_balls = this.ballArray();
    const x1 =0,y1=0;
    const circleRadius = 300;
    const svgContainer = this.el.nativeElement.querySelector('#WW_Lines');
    filtered_balls.forEach(i => {
      if(i.WW_Angle && i.WW_Distance){
        const radian = i.WW_Angle * (Math.PI/180);
        const DistanceToPx = (i.WW_Distance/100) * circleRadius;
        const x2 = x1 + DistanceToPx * (Math.cos(radian));
        const y2 = y1 + DistanceToPx * (Math.sin(radian));
        //Plot Line
        const line = this.renderer.createElement('line','svg');
        this.renderer.setAttribute(line,'x1', x1.toString());
        this.renderer.setAttribute(line, 'y1', y1.toString());
        this.renderer.setAttribute(line,'x2',x2.toFixed(2));
        this.renderer.setAttribute(line,'y2',y2.toFixed(2));
        this.renderer.setAttribute(line,'stroke',this.graphicServices.getItemColor(i.Dismissal,i.Runs));
        this.renderer.setAttribute(line,'stroke-width','2');
        this.renderer.setAttribute(line,'class', 'animated-line');
        svgContainer.appendChild(line);
        const circle = this.renderer.createElement('circle','svg');
        this.renderer.setAttribute(circle, 'cx', x2.toFixed(2));
        this.renderer.setAttribute(circle, 'cy', y2.toFixed(2));
        this.renderer.setAttribute(circle, 'fill', this.graphicServices.getItemColor(i.Dismissal,i.Runs));
        this.renderer.setAttribute(circle, 'r', '3');
        svgContainer.appendChild(circle);
      }
    })
  }
}
