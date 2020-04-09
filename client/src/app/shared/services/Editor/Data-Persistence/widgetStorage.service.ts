import { Widget } from './../../../models/serverModels/widget.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
  export class WidgetStorageService {

    private widgets: Widget[] = [];

    constructor() {
    }

    public setWidgets(widgets: Widget[]){
        this.widgets = widgets;
    }
    
    public getWidgets(): Widget[] {
        return this.widgets;
    }

  }