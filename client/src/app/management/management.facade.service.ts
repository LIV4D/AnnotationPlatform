import { Injectable } from '@angular/core';
import { ModelFinderService } from '../shared/services/modelfinder.service';
import { ManagementCreationService } from '../shared/services/management-creation.service';

@Injectable({
  providedIn: 'root'
})
export class ManagementFacadeService {


    constructor(private modelFinder: ModelFinderService, private managementCreation: ManagementCreationService) { }

    public async getAttributesForCreating(model: string): Promise<string[]> {
        const properties = await this.modelFinder.getAttributesOf(model);
        this.storePropertyTypes(properties.get('propertyTypes'));
        return properties.get('propertyNames');
    }

    public storePropertyTypes(propertyTypes: Array<any>) {
        this.managementCreation.storePropertyTypes(propertyTypes);
    }
}
