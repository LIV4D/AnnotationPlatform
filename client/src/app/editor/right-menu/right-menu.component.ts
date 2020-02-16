import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent implements OnInit {

  saveText: string;
  public loading: boolean;
  public keyEventsEnabled: boolean;
  public localEditing = false;

  constructor() { }

  ngOnInit(): void {
  }

}
