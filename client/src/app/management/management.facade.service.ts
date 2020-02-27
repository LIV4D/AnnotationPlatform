import { Injectable } from '@angular/core';
import { ModelFinderService } from '../shared/services/modelfinder.service';

@Injectable({
  providedIn: 'root'
})
export class ManagementFacadeService {


    constructor(private modelFinder: ModelFinderService) { }

    getAttributesForCreating(model: string) {
        this.modelFinder.getAttributesOf(model);
    }
}
