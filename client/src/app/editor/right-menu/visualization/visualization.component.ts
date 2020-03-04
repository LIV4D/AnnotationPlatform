import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BackgroundCanvas } from './../../../shared/models/background-canvas.model';

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

  @Input() canvas: BackgroundCanvas;
  @Output() flip: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
