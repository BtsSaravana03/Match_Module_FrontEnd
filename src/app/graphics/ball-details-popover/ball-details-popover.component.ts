import { Component, input } from '@angular/core';
import { DxPopoverModule } from 'devextreme-angular';
import { BallData } from '../../ball-by-ball/ball-by-ball.interface';

@Component({
  selector: 'app-ball-details-popover',
  standalone: true,
  imports: [DxPopoverModule],
  templateUrl: './ball-details-popover.component.html',
  styleUrl: './ball-details-popover.component.scss'
})
export class BallDetailsPopoverComponent {
  target = input<string>();
  targetBall = input<BallData>();
}
