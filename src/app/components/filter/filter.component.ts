import { Component, DestroyRef, inject, input, OnInit, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxRadioGroupModule } from 'devextreme-angular';
import { DxPopoverComponent, DxPopoverModule } from 'devextreme-angular/ui/popover';
import { BallByBallService } from '../../services/ball-by-ball.service';
import { Filter, InningsData } from './filter.interface';
import { FilterService } from './filter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [DxPopoverModule,DxRadioGroupModule,DxCheckBoxModule,DxButtonModule,FormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class FilterComponent implements OnInit {
  private ballbyballService = inject(BallByBallService);
  private filterService = inject(FilterService);
  private destroyRef = inject(DestroyRef);
  
  popoverComponent = viewChild<DxPopoverComponent>('filterPopover');
  target = input.required<string>();
  matchDetails = signal<any>({});
  totalInnings = signal<InningsData[]>([]);
  appliedFilters: Filter = {
    innings: 1,
    ball: {from: null,to: null},
    over: { from:null,to: null},
    runs: {_0: false,_1: false,_2: false, _3: false, _4: false,_6: false,wickets: false},
    phase: {
      Powerplay: false,
      MiddleOvers: false,
      DeathOvers: false
    }
  };
  mobile_view = input.required<boolean>();
  slideAnimation = {
    show: {
      type: 'slide' as 'slide',
      from: { opacity: 0, top: '100%' },
      to: { opacity: 1, position: { my: "top", at: "bottom", of: this.target } }
    }
  };

  ngOnInit(): void {
    const matchSubscription = this.ballbyballService.matchObservable$.subscribe(updated=>{
      this.matchDetails.set(updated);
      this.totalInnings.set(this.matchDetails()?.inningsData||[]);
      this.appliedFilters = {
        innings: 1,
        ball: {from: null,to: null},
        over: { from:null,to: null},
        runs: {_0: false,_1: false,_2: false, _3: false, _4: false,_6: false,wickets: false},
        phase: {
          Powerplay: false,
          MiddleOvers: false,
          DeathOvers: false
        }
      }
      this.applyFilter();
    })
    this.destroyRef.onDestroy(()=>{
      matchSubscription.unsubscribe();
    });
  }
  applyFilter(){
    this.filterService.Filter = this.appliedFilters;
    if(this.matchDetails().ID){
      this.ballbyballService.generate_ballbyball(this.matchDetails().CompetitionID,this.matchDetails().ID);
    }
    if(this.popoverComponent()?.instance)
    this.popoverComponent()?.instance.hide();
  }
}
