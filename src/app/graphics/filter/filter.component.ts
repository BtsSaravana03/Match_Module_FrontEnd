import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, effect, inject, input, OnInit, SimpleChange, viewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxPopoverComponent, DxPopoverModule, DxTabsModule } from 'devextreme-angular';
import { BowlingTypes, GraphicsFilter } from '../graphics.interface';
import { GraphicsService } from '../graphics.service';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';
import Enumerable from 'linq';
import { BallByBallService } from '../../services/ball-by-ball.service';

@Component({
  selector: 'app-graphics-filter',
  standalone: true,
  imports: [DxPopoverModule,CommonModule,DxButtonModule,DxTabsModule,DxCheckBoxModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent implements OnInit,AfterViewInit {
  private GraphicService = inject(GraphicsService);
  private ballbyballService = inject(BallByBallService);
  private destroyRef = inject(DestroyRef);

  ballArray = input.required<BallData[]>();
  SelectedInnings = input.required<number>();
  BowlingTypes:BowlingTypes[] = [];
  selectedTabIndex = 0;
  mobile_view = input.required<boolean>();
  target = input<string>();
  popoverComponent = viewChild<DxPopoverComponent>('filterPopover');
  Batsman:{Id:number,Name:string}[] = [];
  Bowler:{Id:number,Name:string}[] = [];
  shotTypes = [
  { id: 1, label: 'Attacking' },
  { id: 2, label: 'Defensive' },
  { id: 3, label: 'Left Alone' },
  { id: 5, label: 'Beaten' },
  { id: 6, label: 'Rotating' },
  { id: 7, label: 'Play & Miss' }
];
creaseMovementTypes = [
  { id: 2, label: 'Front Foot' },
  { id: 3, label: 'Back Foot' },
  { id: 4, label: 'Charging' },
  { id: 5, label: 'Ducked' },
  { id: 13, label: 'Walking Across' },
  { id: 14, label: 'Creating Room' }
];

  tabsWithIcon = [
    {
      id: 0,
      icon: 'fa-solid fa-filter fa-xs',
    },
    {
      id: 1,
      icon: 'fa-solid fa-user fa-xs',
    },
    {
      id: 2,
      icon: 'fa-solid fa-baseball fa-xs',
    }
  ];
  appliedFilters:GraphicsFilter = {
    Innings: 1,
    BowlingType:[],
    BattingType:[],
    Batsman:[],
    Bowlers:[],
    BatSubject:[],
    CreaseMovement:[],
    uncomfortable: 0
  };
  slideAnimation = {
    show: {
      type: 'slide' as 'slide',
      from: { opacity: 0, top: '100%' },
      to: { opacity: 1, position: { my: "top", at: "bottom", of: this.target } }
    }
  };
  ngOnChanges(changes:any){
    if(changes['ballArray'] && changes['ballArray'].previousValue?.length === 0 && changes['ballArray'].currentValue.length > 0){
      this.refreshPlayers();
    }
    if(changes['SelectedInnings']){
      this.refreshPlayers();
      this.GraphicService.filter.Innings = this.SelectedInnings();
      this.GraphicService.triggerFilter();
    }
  }
  async ngOnInit() {
    this.BowlingTypes = await this.GraphicService.getBowlingTypes();
  }
  ngAfterViewInit(): void {
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.refreshPlayers();
    });
    this.destroyRef.onDestroy(()=>{
      matchSubscription.unsubscribe();
    })
  }
  onTabSelectionChange(e: any) {
    this.selectedTabIndex = e.itemIndex;
  }
  onCheckboxChange(filterName: keyof Omit<GraphicsFilter,'Innings'|'uncomfortable'>, id: number, isChecked: boolean): void {
    const filterArray = this.appliedFilters[filterName];
    if (isChecked) {
      if (!filterArray.includes(id)) {
        filterArray.push(id);
      }
    } else {
      this.appliedFilters[filterName] = filterArray.filter(item => item !== id);
    }
    this.apply();
  }
  refreshPlayers() {
    this.appliedFilters.Batsman = [];
    this.appliedFilters.Bowlers = [];
    this.Batsman = Enumerable.from(this.ballArray())
      .where(i => i.InningsId === this.SelectedInnings())
      .groupBy(g => g.StrikerID)
      .select(g => {
        return {
          Id: g.key(),
          Name: g.first().StrikerName,
        }
      }).toArray();

    this.Bowler = Enumerable.from(this.ballArray())
      .where(i => i.InningsId === this.SelectedInnings())
      .groupBy(g => g.BowlerID)
      .select(g => {
        return {
          Id: g.key(),
          Name: g.first()?.BowlerName
        }
      }).toArray();
  }
  apply(){
    this.GraphicService.filter = this.appliedFilters;
    this.GraphicService.triggerFilter();
  }
}
