import { Injectable } from '@angular/core';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';
import { WidgetStorageService } from 'src/app/shared/services/Editor/Data-Persistence/widgetStorage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WidgetFacadeService {


    constructor(private widgetStorage: WidgetStorageService) { }

    public getWidgets() : Observable<Widget[]> {
        return this.widgetStorage.getWidgets();
    }
}
