import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent implements OnInit {

  autoContrastChecked = false;
  minBrightness = -100;
  maxBrightness = 100;
  brightness = 0;

  minContrast = -255;
  maxContrast = 255;
  contrast = 0;

  localEditing = false;
  preprocessingChecked = false;

  constructor() { }

  ngOnInit(): void {
  }

}
