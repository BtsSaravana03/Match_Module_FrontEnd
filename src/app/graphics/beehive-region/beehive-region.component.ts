import { ChangeDetectorRef, Component, DestroyRef, effect, ElementRef, HostListener, inject, input, Renderer2, signal } from '@angular/core';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { VideoService } from '../../components/video/video.service';
import { GraphicsService } from '../graphics.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import { checkInfNum, checkInfNumSR, getGradientColor } from '../../scripts/generic';
import { CommonModule } from '@angular/common';
import { VideoComponent } from '../../components/video/video.component';

@Component({
  selector: 'app-beehive-region',
  standalone: true,
  imports: [CommonModule,VideoComponent],
  templateUrl: './beehive-region.component.html',
  styleUrl: './beehive-region.component.scss'
})
export class BeehiveRegionComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private videoService = inject(VideoService);
  private graphicServices = inject(GraphicsService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private cdr = inject(ChangeDetectorRef);
  matchDetails = signal<any>({});
  ballArray = input.required<BallData[]>();

  bh_Width = 494;
    bh_Height = 348.6;
    scale = 1;
    Regions:any = {};
    regionPositions: Record<string, { x: number; y: number }> = {
        "Stump_1": { x: 244.8, y: 62.4 },
        "Stump_2": { x: 244.8, y: 140 },
        "Stump_3": { x: 244.8, y: 217.7 },
        "Stump_4": { x: 244.8, y: 295.3 },

        "Left_1": { x: 58.25, y: 62.4 },
        "Left_2": { x: 118.9, y: 62.4 },
        "Left_3": { x: 181.9, y: 62.4 },
        "Left_4": { x: 58.25, y: 140 },
        "Left_5": { x: 118.9, y: 140 },
        "Left_6": { x: 181.9, y: 140 },
        "Left_7": { x: 58.25, y: 217.7 },
        "Left_8": { x: 118.9, y: 217.7 },
        "Left_9": { x: 181.9, y: 217.7 },
        "Left_10": { x: 58.25, y: 295.3 },
        "Left_11": { x: 118.9, y: 295.3 },
        "Left_12": { x: 181.9, y: 295.3 },

        "Right_1": { x: 307.8, y: 62.4 },
        "Right_2": { x: 370.7, y: 62.4 },
        "Right_3": { x: 433.2, y: 62.4 },
        "Right_4": { x: 307.8, y: 140 },
        "Right_5": { x: 370.7, y: 140 },
        "Right_6": { x: 433.2, y: 140 },
        "Right_7": { x: 307.8, y: 217.7 },
        "Right_8": { x: 370.7, y: 217.7 },
        "Right_9": { x: 433.2, y: 217.7 },
        "Right_10": { x: 307.8, y: 295.3 },
        "Right_11": { x: 370.7, y: 295.3 },
        "Right_12": { x: 433.2, y: 295.3 }
      };


    @HostListener('window:resize')
      onResize() {
          let scale = this.graphicServices.getScaling(this.bh_Width,this.bh_Height,window.innerWidth,window.innerHeight);
          setTimeout(() => {
            this.scale = scale;
            this.cdr.detectChanges();
          }, 0);
      }
   constructor(){
       effect(()=>{
         if(this.ballArray()){
           this.setBeehive();
         }
       })
     }
     ngOnInit(): void {
        Object.keys(this.regionPositions).forEach(regionKey => {
            this.Regions[regionKey] = { Runs: 0, Balls: 0, Dismissals: 0, SR: 0, Eco: 0, BallsPer: 0,ballArr:[] };
        });
        this.onResize();
       const filter = this.graphicServices.filterObservable.subscribe(updated => {
         this.setBeehive();
       })
       const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated => {
           this.matchDetails.set(updated);
         })
       this.destroyRef.onDestroy(()=>{
         filter.unsubscribe();
       })
     }
    setBeehive() {
        this.Regions = {}; // Initialize empty object for dynamic regions
        let filtered_balls = this.graphicServices.applyFilter(this.ballArray());

        const ballRadius = 5;
        const width = this.bh_Width;
        const height = this.bh_Height;
        const beehive_width = 200;
        const beehive_height = 200;

        // Scaling factors
        const scaling_x = parseFloat((width / beehive_width).toFixed(4));
        const scaling_y = parseFloat((height / beehive_height).toFixed(4));
        // const svgElement = this.el.nativeElement.querySelector('#beehiveContainer');
        // **Step 1: Initialize Regions Dynamically**
        Object.keys(this.regionPositions).forEach(regionKey => {
            this.Regions[regionKey] = { Runs: 0, Balls: 0, Dismissals: 0, SR: 0, Eco: 0, BallsPer: 0, ballArr:[] };
        });

        // **Step 2: Process Each Ball**
        let TotalBalls = 0;
        filtered_balls.forEach(i => {
            if (i.SZ_X_CM !== null && i.SZ_Y_CM !== null) {
                const _x = (i.SZ_X_CM * scaling_x);
                const _y = (i.SZ_Y_CM * scaling_y) - ballRadius;
                const cx = -_x;
                const cy = -_y;
                // const circle = this.renderer.createElement('circle', 'svg');
                // this.renderer.setAttribute(circle,'class','beehive-ball');
                // this.renderer.setAttribute(circle, 'cx', (cx).toString());
                // this.renderer.setAttribute(circle, 'cy', (cy).toString());
                // this.renderer.setAttribute(circle, 'r', ballRadius.toString());
                // this.renderer.setAttribute(circle, 'stroke', '#fff');
                // this.renderer.setAttribute(circle, 'stroke-width', '0.5px');
                // this.renderer.setAttribute(circle, 'fill', this.graphicServices.getItemColor(i.Dismissal,i.Runs));
                // if(cy <= 0 ){
                //     this.renderer.appendChild(svgElement, circle);
                // }
                TotalBalls = filtered_balls.length;
                this.updateRegionStats(cx,cy,i,TotalBalls);
            }
        });
    }
    updateRegionStats(cx: number, cy: number, i: BallData, TotalBalls: number) {
        if (cx >= -221.38 && cx <= -161.38 && cy >= -284.6 && cy <= -206.6) {
            this.updateRegion("Left_1", i, TotalBalls);
        }
        else if (cx >= -161.37 && cx <= -98.38 && cy >= -284.6 && cy <= -206.6) {
            this.updateRegion("Left_2", i, TotalBalls);
        }
        else if (cx >= -98.37 && cx <= -33.87 && cy >= -284.6 && cy <= -206.6) {
            this.updateRegion("Left_3", i, TotalBalls);
        }
        else if (cx >= -221.38 && cx <= -161.38 && cy >= -206.5 && cy <= -128.5) {
            this.updateRegion("Left_4", i, TotalBalls);
        }
        else if (cx >= -161.37 && cx <= -98.38 && cy >= -206.5 && cy <= -128.5) {
            this.updateRegion("Left_5", i, TotalBalls);
        }
        else if (cx >= -98.37 && cx <= -33.87 && cy >= -206.5 && cy <= -128.5) {
            this.updateRegion("Left_6", i, TotalBalls);
        }
        else if (cx >= -221.38 && cx <= -161.38 && cy >= -128.4 && cy <= -50.4) {
            this.updateRegion("Left_7", i, TotalBalls);
        }
        else if (cx >= -161.37 && cx <= -98.38 && cy >= -128.4 && cy <= -50.4) {
            this.updateRegion("Left_8", i, TotalBalls);
        }
        else if (cx >= -98.37 && cx <= -33.87 && cy >= -128.4 && cy <= -50.4) {
            this.updateRegion("Left_9", i, TotalBalls);
        }
        else if (cx >= -221.38 && cx <= -161.38 && cy >= -50.3 && cy <= 27.6) {
            this.updateRegion("Left_10", i, TotalBalls);
        }
        else if (cx >= -161.37 && cx <= -98.38 && cy >= -50.3 && cy <= 27.6) {
            this.updateRegion("Left_11", i, TotalBalls);
        }
        else if (cx >= -98.37 && cx <= -33.87 && cy >= -50.3 && cy <= 27.6) {
            this.updateRegion("Left_12", i, TotalBalls);
        }
        else if (cx >= 29.88 && cx <= 93.88 && cy >= -284.6 && cy <= -206.6) {
            this.updateRegion("Right_1", i, TotalBalls);
        }
        else if (cx >= 93.89 && cx <= 158.32 && cy >= -284.6 && cy <= -206.6) {
            this.updateRegion("Right_2", i, TotalBalls);
        }
        else if (cx >= 158.33 && cx <= 221.32 && cy >= -284.6 && cy <= -206.6) {
            this.updateRegion("Right_3", i, TotalBalls);
        }
        else if (cx >= 29.88 && cx <= 93.88 && cy >= -206.5 && cy <= -128.5) {
            this.updateRegion("Right_4", i, TotalBalls);
        }
        else if (cx >= 93.89 && cx <= 158.32 && cy >= -206.5 && cy <= -128.5) {
            this.updateRegion("Right_5", i, TotalBalls);
        }
        else if (cx >= 158.33 && cx <= 221.32 && cy >= -206.5 && cy <= -128.5) {
            this.updateRegion("Right_6", i, TotalBalls);
        }
        else if (cx >= 29.88 && cx <= 93.88 && cy >= -128.4 && cy <= -50.4) {
            this.updateRegion("Right_7", i, TotalBalls);
        }
        else if (cx >= 93.89 && cx <= 158.32 && cy >= -128.4 && cy <= -50.4) {
            this.updateRegion("Right_8", i, TotalBalls);
        }
        else if (cx >= 158.33 && cx <= 221.32 && cy >= -128.4 && cy <= -50.4) {
            this.updateRegion("Right_9", i, TotalBalls);
        }
        else if (cx >= 29.88 && cx <= 93.88 && cy >= -50.3 && cy <= 27.6) {
            this.updateRegion("Right_10", i, TotalBalls);
        }
        else if (cx >= 93.89 && cx <= 158.32 && cy >= -50.3 && cy <= 27.6) {
            this.updateRegion("Right_11", i, TotalBalls);
        }
        else if (cx >= 158.33 && cx <= 221.32 && cy >= -50.3 && cy <= 27.6) {
            this.updateRegion("Right_12", i, TotalBalls);
        }
        else if (cx >= -32.87 && cx <= 29.87 && cy >= -284.6 && cy <= -206.6) {
            this.updateRegion("Stump_1", i, TotalBalls);
        }
        else if (cx >= -32.87 && cx <= 29.87 && cy >= -206.5 && cy <= -128.5) {
            this.updateRegion("Stump_2", i, TotalBalls);
        }
        else if (cx >= -32.87 && cx <= 29.87 && cy >= -128.4 && cy <= -50.4) {
            this.updateRegion("Stump_3", i, TotalBalls);
        }
        else if (cx >= -32.87 && cx <= 29.87 && cy >= -50.3 && cy <= 27.6) {
            this.updateRegion("Stump_4", i, TotalBalls);
        }
    }
    updateRegion(region: string, i: BallData, TotalBalls: number) {
        this.Regions[region].Runs += i.Runs;
        this.Regions[region].Balls += 1;
        this.Regions[region].Dismissals += i.Dismissal;
        this.Regions[region].SR = checkInfNumSR((this.Regions[region].Runs * 100) / this.Regions[region].Balls);
        this.Regions[region].BallsPer = checkInfNum((this.Regions[region].Balls * 100) / TotalBalls);
        this.Regions[region].Eco = checkInfNum((this.Regions[region].Runs / this.Regions[region].Balls) * 6);
        this.Regions[region].ballArr.push(i);
    }
    setGradient(percentage:number){
        let color = '#a9d1a1';
        return getGradientColor(color,percentage);
      }
      onRegionClick(region:string){
        let Balls = this.Regions[region].ballArr;
        this.videoService.PlayBallsArrVideos(Balls);
      }
}
