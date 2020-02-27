import { Injectable } from '@angular/core';
import { ModelFinderService } from '../shared/services/modelfinder.service';

@Injectable({
  providedIn: 'root'
})
export class ManagementFacadeService {


    constructor(private modelFinder: ModelFinderService) { }

    public async getAttributesForCreating(model: string): Promise<string[]> {
        return await this.modelFinder.getAttributesOf(model);
    }
}
