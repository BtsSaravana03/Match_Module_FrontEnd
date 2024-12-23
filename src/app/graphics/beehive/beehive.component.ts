import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, effect, ElementRef, HostListener, inject, input, OnInit, Renderer2, signal, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { AppService } from '../../services/app.service';
import { VideoService } from '../../components/video/video.service';
import { GraphicsService } from '../graphics.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { VideoComponent } from "../../components/video/video.component";
import { BallDetailsPopoverComponent } from "../ball-details-popover/ball-details-popover.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-beehive',
  standalone: true,
  imports: [VideoComponent, BallDetailsPopoverComponent,CommonModule],
  templateUrl: './beehive.component.html',
  styleUrl: './beehive.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class BeehiveComponent implements OnInit,AfterViewInit {
  //private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private videoService = inject(VideoService);
  private graphicServices = inject(GraphicsService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private cdr = inject(ChangeDetectorRef);

  ballArray = input.required<BallData[]>();
  bh_Width = 493;
  bh_Height = 355;
  tooltipTarget:string|undefined;
  targetBall:BallData|undefined;
  scale = 1;
  constructor(){
    effect(()=>{
      if(this.ballArray()){
        this.setBeehive();
      }
    })
  }
  ngOnInit(): void {
    // const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
    //   this.ballArray.set(updated);
    //   this.setBeehive();
    // })
    const filter = this.graphicServices.filterObservable.subscribe(updated => {
      this.setBeehive();
    })
    this.destroyRef.onDestroy(()=>{
      //subscription.unsubscribe();
      filter.unsubscribe();
    })
  }
  @HostListener('window:resize')
  onResize() {
      let scale = this.graphicServices.getScaling(this.bh_Width,this.bh_Height,window.innerWidth,window.innerHeight);
      const container = this.el.nativeElement.querySelector('#beehive-container');
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
  setBeehive(){
    let filtered_balls = this.graphicServices.applyFilter(this.ballArray());
    const ballRadius = 5;
    //PitchMap SVG Dimensions
    const width = this.bh_Width;
    const height = this.bh_Height;
    //Cricket Pitch Dimensions(in cm)
    const beehive_width = 200;
    const beehive_height = 200;
    // PX/CM Ratio
    const scaling_x = parseFloat((width / beehive_width).toFixed(4));
    const scaling_y = parseFloat((height / beehive_height).toFixed(4));
    const svgElement = this.el.nativeElement.querySelector('#beehiveContainer');
    //Clearing previous balls
    svgElement.innerHTML = '';
    filtered_balls.forEach(i => {
      if(i.SZ_X_CM !== null && i.SZ_Y_CM !== null){
        const _x = i.SZ_X_CM * scaling_x;
        const _y = (i.SZ_Y_CM * scaling_y) - ballRadius;
        const circle = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(circle,'class','beehive-ball');
        this.renderer.setAttribute(circle, 'cx', (-(_x)).toString());
        this.renderer.setAttribute(circle, 'cy', (-_y).toString());
        this.renderer.setAttribute(circle, 'r', ballRadius.toString());
        this.renderer.setAttribute(circle, 'stroke', '#fff');
        this.renderer.setAttribute(circle, 'stroke-width', '0.5px');
        this.renderer.setAttribute(circle, 'id', 'circle'+i.AutoId);
        this.renderer.setAttribute(circle, 'title', 'BowlerName:' );
        this.renderer.setAttribute(circle, 'fill', this.graphicServices.getItemColor(i.Dismissal,i.Runs));
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
        this.renderer.listen(circle,'mouseleave',() => {
          this.tooltipTarget;
        })
        this.renderer.appendChild(svgElement, circle);

      }
    })
  }
  onBallClick(i:BallData){
    this.videoService.PlayGraphicsVideos(i.BallId,i.InningsId);
  }
}
