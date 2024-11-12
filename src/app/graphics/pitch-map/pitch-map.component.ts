import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, OnInit, Renderer2, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { AppService } from '../../services/app.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';

@Component({
  selector: 'app-pitch-map',
  standalone: true,
  imports: [],
  templateUrl: './pitch-map.component.html',
  styleUrl: './pitch-map.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class PitchMapComponent {
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);
  private appService = inject(AppService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ballArray = signal<BallData[]>([]);
  pm_width: number = 296;
  pm_height:number = 594;

  @HostListener('window:resize')
  onResize() {
    const imageWidth = this.pm_width; // Original width of the image
    const imageHeight = this.pm_height; // Original height of the image

    // Calculate aspect ratio
    const aspectRatio = imageWidth / imageHeight;

    // Get the available width and height from the window
    const availableWidth = window.innerWidth-100;
    const availableHeight = window.innerHeight -100;

    // Variables for the rendered width and height
    let renderWidth, renderHeight;

    // Check which dimension to scale based on the available space
    if (availableWidth / aspectRatio <= availableHeight) {
      // Fit based on width
      renderWidth = availableWidth;
      renderHeight = availableWidth / aspectRatio;
    } else {
      // Fit based on height
      renderHeight = availableHeight;
      renderWidth = availableHeight * aspectRatio;
    }

    // Variables for the scaling factor (zoom level)
    let scale;

    // Check which dimension to scale based on the available space
    if (availableWidth / aspectRatio <= availableHeight) {
        // Fit based on width
        scale = availableWidth / imageWidth;
    } else {
        // Fit based on height
        scale = availableHeight / imageHeight;
    }
    const svgElement = this.el.nativeElement.querySelector('#pitchmap-container');
    svgElement.style.transform = `scale(${scale})`;
    svgElement.style.transformOrigin = "top center"; 
    // Log the results for debugging
    console.log(`Render Width: ${renderWidth}`);
    console.log(`Render Height: ${renderHeight}`);
    console.log(`Available Width: ${availableWidth}`);
    console.log(`Available Height: ${availableHeight}`);

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
  setPitchmap(){
    let filtered_balls = this.ballArray();
    const width = this.pm_width;
    const height = this.pm_height;
    const pitchWidth = 264; //IN CM
    const pitchLength = 1500; //IN CM

    const scaling_x = parseFloat((width / pitchWidth).toFixed(4));
    const scaling_y = parseFloat((height / pitchLength).toFixed(4));

    const svgElement = this.el.nativeElement.querySelector('#pitchmapSVG');
    const pitchballs = svgElement.querySelectorAll('.pitchmap-ball');
    pitchballs.forEach((element: Element) => {
      element.remove();
    });
    filtered_balls.forEach(i => {
      if(i.PM_X && i.PM_Y){
        const circle = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(circle,'class','pitchmap-ball');
        this.renderer.setAttribute(circle, 'cx', (-(i.PM_X_CM * scaling_x)).toString());
        this.renderer.setAttribute(circle, 'cy', ((i.PM_Y_CM * scaling_y)-5).toString());
        // this.renderer.setAttribute(circle, 'cx', ((43.529970984097 * scaling_x)).toString());
        // this.renderer.setAttribute(circle, 'cy', ((677.404824214585 * scaling_y)).toString());
        this.renderer.setAttribute(circle, 'r', '5');
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
        this.renderer.appendChild(svgElement, circle);
      }
    })
  }
  
}
