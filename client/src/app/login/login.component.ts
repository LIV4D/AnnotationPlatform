import { Component, OnInit } from '@angular/core';
import { FacadeService } from '../shared/facade.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isAuthenticated: boolean;

  constructor(private facadeService: FacadeService) { }

  ngOnInit() {
    this.isAuthenticated = this.facadeService.isAuthenticated();
  }

}
