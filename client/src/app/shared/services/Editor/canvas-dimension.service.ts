import { WidgetStorageService } from './Data-Persistence/widgetStorage.service';
import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { LayersService } from './layers.service';
import { Router } from '@angular/router';
import { BackgroundCanvas } from './Tools/background-canvas.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GalleryService } from '../Gallery/gallery.service';
import { BiomarkerService } from './biomarker.service';
declare const Buffer;

// Min and max values for zooming
const ZOOM = {
  MIN: 1.0,
  MAX: 16.0,
};

const PREPROCESSING_TYPE = 1; // Eventually there could be more.

@Injectable({
  providedIn: 'root',
})
export class CanvasDimensionService {
  backgroundCanvas: BackgroundCanvas;


  // public biomarkersService: BiomarkersService,

  constructor(
    private http: HttpClient,
    public layersService: LayersService,
    public galleryService: GalleryService,
    public router: Router,
    private biomarkerService: BiomarkerService,
  ) {
  }
}
