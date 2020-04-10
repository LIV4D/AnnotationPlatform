import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-non-existent-page',
  templateUrl: './non-existent-page.component.html',
  styleUrls: ['./non-existent-page.component.scss']
})
export class NonExistentPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
