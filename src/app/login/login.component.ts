import { Component, inject, OnInit } from '@angular/core';
import { AppService } from '../services/app.service';
import { LoginServices } from './login.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private appService = inject(AppService);
  private loginServices = inject(LoginServices);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  LoginForm!: FormGroup;
  errorMessage:string|null = null;

  ngOnInit(): void {
    this.LoginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.appService.toggleMatchSelection(false);
    this.appService.toggleNavbar(false);
  }
  async onSubmit(){
    this.errorMessage = null;
    if (this.LoginForm.valid) {
      const { username, password } = this.LoginForm.value;
      const res = await this.loginServices.login(username, password);
      if (res) {
        window.location.href = '/scorecard';
        
      } else {
        this.errorMessage = 'Username or Password is Incorrect';
      }
    }
  }
}
