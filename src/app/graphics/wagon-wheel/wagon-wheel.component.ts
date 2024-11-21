import { ChangeDetectorRef, Component, DestroyRef, ElementRef, HostListener, inject, Renderer2, signal, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { AppService } from '../../services/app.service';
import { VideoService } from '../../components/video/video.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { GraphicsService } from '../graphics.service';
import { VideoComponent } from "../../components/video/video.component";
import { BallDetailsPopoverComponent } from "../ball-details-popover/ball-details-popover.component";
import { saveSvgAsPng } from 'save-svg-as-png';

@Component({
  selector: 'app-wagon-wheel',
  standalone: true,
  imports: [VideoComponent, BallDetailsPopoverComponent],
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

  ballArray = signal<BallData[]>([]);
  ww_Width = 602;
  ww_Height = 650;
  tooltipTarget:string|undefined;
  targetBall:BallData|undefined;

  @HostListener('window:resize')
  onResize() {
      let scale = this.graphicServices.getScaling(this.ww_Width,this.ww_Height,window.innerWidth,window.innerHeight);
      const container = this.el.nativeElement.querySelector('#WW_Wrap');
      container.style.transform = `scale(${scale})`;
      container.style.transformOrigin = "top center"; 
  }
  ngAfterViewInit(): void {
    this.onResize();
  }


  ngOnInit(): void {
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
      this.setWagonwheel();
    })
    const filter = this.graphicServices.filterObservable.subscribe(updated => {
      this.setWagonwheel();
    })
    this.destroyRef.onDestroy(()=>{
      subscription.unsubscribe();
      filter.unsubscribe();
    })
  }

  setWagonwheel(){
    let filtered_balls = this.graphicServices.applyFilter(this.ballArray());
    const x1 =0,y1=0;
    const circleRadius = 300;
    const svgContainer = this.el.nativeElement.querySelector('#WW_Lines');
    svgContainer.innerHTML = '';
    filtered_balls.forEach(i => {
      if(i.WW_Angle && i.WW_DistancePercentage){
        const radian = i.WW_Angle * (Math.PI/180);
        let DistancePer = i.WW_DistancePercentage;
        if(i.isFour===1){
          DistancePer = 100;
        }
        const DistanceToPx = (DistancePer/100) * circleRadius;
        const x2 = x1 + DistanceToPx * (Math.cos(radian));
        const y2 = y1 + DistanceToPx * (Math.sin(radian));
        //Plot Line
        const line = this.renderer.createElement('line','svg');
        this.renderer.setAttribute(line,'x1', x1.toString());
        this.renderer.setAttribute(line, 'y1', y1.toString());
        this.renderer.setAttribute(line,'x2',x2.toFixed(2));
        this.renderer.setAttribute(line,'y2',y2.toFixed(2));
        this.renderer.setAttribute(line,'stroke',this.graphicServices.getItemColor(i.Dismissal,i.Runs));
        this.renderer.setAttribute(line,'stroke-width','1');
        this.renderer.setAttribute(line,'class', 'animated-line');
        this.renderer.setAttribute(line, 'id', 'line'+i.AutoId);
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
        this.renderer.setAttribute(circle, 'cx', x2.toFixed(2));
        this.renderer.setAttribute(circle, 'cy', y2.toFixed(2));
        this.renderer.setAttribute(circle, 'fill', this.graphicServices.getItemColor(i.Dismissal,i.Runs));
        this.renderer.setAttribute(circle, 'r', '2');
        this.renderer.listen(circle, 'click', () => {
          this.onBallClick(i);
        });
        svgContainer.appendChild(circle);
      }
    })
  }
  onBallClick(i:BallData){
    this.videoService.PlayGraphicsVideos(i.BallId,i.InningsId);
  }

}
