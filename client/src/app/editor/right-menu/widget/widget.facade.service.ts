import { Injectable } from '@angular/core';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';
import { widgetStorageService } from 'src/app/shared/services/Editor/Data-Persistence/widgetStorage.service';

@Injectable({
  providedIn: 'root'
})
export class WidgetFacadeService {


    constructor(private widgetStorage: widgetStorageService) { }

    public getWidgets() : Widget[] {
        return this.widgetStorage.getWidgets();
    }
}
