import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  // ok so, need a function to load a model.
  // need a function to put that model into text fields.
  // so for each attribute of the interface, create a text field.
  // need a function to send the text fields chosen to the database so it can be created.
}
