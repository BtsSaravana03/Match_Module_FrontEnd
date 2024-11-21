import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DxTabsModule } from 'devextreme-angular';
import { AppService } from '../services/app.service';
import { FilterComponent } from "./filter/filter.component";
import { filter, fromEvent, Observable, Subscription } from 'rxjs';
import { InningsService } from '../components/innings-tab/innings.service';
import { BowlingTypes, GraphicsFilter } from './graphics.interface';
import { GraphicsService } from './graphics.service';
import { BallByBallService } from '../services/ball-by-ball.service';
import { BallData } from '../ball-by-ball/ball-by-ball.interface';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [DxTabsModule, RouterOutlet, FilterComponent],
  templateUrl: './graphics.component.html',
  styleUrl: './graphics.component.scss'
})
export class GraphicsComponent {
  private route =  inject(ActivatedRoute);
  private router =  inject(Router);
  private ballbyballService = inject(BallByBallService);
  private appService = inject(AppService);
  private InningService = inject(InningsService);
  private GraphicService = inject(GraphicsService);
  private destroyRef = inject(DestroyRef);

  ballArray = signal<BallData[]>([]);
  appliedFilters:GraphicsFilter = {
    Innings:1,
    BowlingType:[],
    BattingType:[],
    Batsman:[],
    Bowlers:[]
  }
  selectedIndex: number = 0;
  isMobile:boolean = false;
  tabs = [
    { text: 'Pitch Map', route: 'pitchmap' },
    { text: 'Wagon Wheel', route: 'wagonwheel' },
    { text: 'Beehive', route: 'beehive' },
  ];
  resizeObservable$!:Observable<Event>;
  currentChildRoute:string|null = null;

  ngOnInit() {
    this.appService.updateNavHeader('Graphics');
    this.resizeObservable$ = fromEvent(window,'resize');
    const resizeSubscription:Subscription = this.resizeObservable$.subscribe(()=>{
      this.onWindowResize();
    });
    const subscription = this.ballbyballService.ballObservable$.subscribe(updated =>{
      this.ballArray.set(updated);
    })
    const InningSub = this.InningService.InningsObserver$.subscribe((updated)=>{
      this.appliedFilters.Innings = updated;
    })
    this.destroyRef.onDestroy(()=>{
      InningSub.unsubscribe();
      subscription.unsubscribe();
    });
    this.router.events
    .pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe(() => {
        this.currentChildRoute = this.getCurrentChildRoute();
    });
    this.currentChildRoute = this.getCurrentChildRoute();
    this.onWindowResize();
    
  }
  getCurrentChildRoute(): string | null {
    let child = this.route.firstChild;
    while (child?.firstChild) {
        child = child.firstChild;
    }
    return child?.snapshot.url.map(segment => segment.path).join('/') || null;
}
  onWindowResize(){
    if(window.innerWidth < 773){
      this.isMobile = true;
    }
    else{
      this.isMobile = false;
    }
  }
  navigateToTab(event: any): void {
    const selectedTab = this.tabs[event.itemIndex];
    this.router.navigate([selectedTab.route], { relativeTo: this.route });
  }
  downloadSvg(){
    if(this.currentChildRoute)
      this.GraphicService.downloadSvg(this.currentChildRoute);
  }
}
