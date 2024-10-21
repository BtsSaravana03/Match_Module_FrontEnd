import { Component, inject, OnInit } from '@angular/core';
import { HttpServices } from '../../services/http.services';

@Component({
  selector: 'app-ball-by-ball',
  standalone: true,
  imports: [],
  templateUrl: './ball-by-ball.component.html',
  styleUrl: './ball-by-ball.component.scss'
})
export class BallByBallComponent implements OnInit {
  private httpServices = inject(HttpServices);
  ngOnInit(): void {
    this.getBallByBall();
  }
  async getBallByBall() {
    
  }
}
