  import { CommonModule } from '@angular/common';
  import { Component, HostListener, model, output } from '@angular/core';
  import { RouterLink, RouterLinkActive } from '@angular/router';
  import { trigger, state, style, animate, transition } from '@angular/animations';
  import { DxDrawerModule } from 'devextreme-angular';

  @Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [DxDrawerModule,RouterLink,CommonModule,RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
    animations: [
      trigger('slideInOut', [
        state('in', style({
          width: '{{ sidebarWidth }}',
          opacity: 1
        }), { params: { sidebarWidth: '300px' }}),
        state('out', style({
          width: '0',
          opacity: 0
        })),
        transition('in => out', [
          animate('300ms ease-in-out')
        ]),
        transition('out => in', [
          animate('300ms ease-in-out')
        ])
      ])
    ]
  })
  export class SidebarComponent {
    visible = model();
    header = output<string>()
    sidebarWidth: string = '300px';
    navigation = [
      {path:'/scorecard', icon: 'fa-solid fa-credit-card-front', name:'Scorecard'},
      {path:'/ballbyball', icon: 'fa-solid fa-tennis-ball', name:'Ball By Ball'},
      {path:'/partnership', icon: 'fa-duotone fa-solid fa-handshake-simple', name:'Partnership'},
      {path:'/graphics', icon: 'fa-sharp fa-regular fa-chart-radar', name:'Graphics'},
      {path:'/battingstats', icon: 'fa-solid fa-chart-line-up', name:'Batting Stats'},
      {path:'/bowlingstats', icon: 'fa-solid fa-chart-simple', name:'Bowling Stats'},
      // {path:'/graphics/pitchmap', icon: 'fa-sharp fa-solid fa-light-switch', name:'Pitch Map'},
      // {path:'/graphics/wagonwheel', icon: 'fa-sharp fa-regular fa-chart-radar', name:'Wagon Wheel'},
      // {path:'/graphics/beehive', icon: 'fa-brands fa-hive', name:'Beehive'}
    ];
    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
      const screenWidth = (event.target as Window).innerWidth;
  
      if (screenWidth <= 300) {
        this.sidebarWidth = '100%';
      } else {
        this.sidebarWidth = '300px';
      }
    }
    setHeader(name:string){
      this.header.emit(name);
      this.visible.set(false);
    }
  }
