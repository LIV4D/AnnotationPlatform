import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-zoomngx',
  templateUrl: './zoomngx.component.html',
  styleUrls: ['./zoomngx.component.scss']
})
export class ZoomngxComponent implements OnInit {

  myThumbnail = '/Users/v44ti/Documents/Projet4/db114-06.jpg';
  myFullresImage = '/Users/v44ti/Documents/Projet4/db114-06.jpg';

  constructor() { }

  ngOnInit(): void {
    this.myThumbnail =
    // tslint:disable-next-line: max-line-length
    'https://st4.depositphotos.com/17400922/21926/i/1600/depositphotos_219268188-stock-photo-chefchaouen-medina-morocco-africa-chefchaouen.jpg';

    this.myFullresImage =
    // tslint:disable-next-line: max-line-length
    'https://st4.depositphotos.com/17400922/21926/i/1600/depositphotos_219268188-stock-photo-chefchaouen-medina-morocco-africa-chefchaouen.jpg';
  }

}
