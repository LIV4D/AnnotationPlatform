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
        // Check here for errors (like the ['error'])
        this.storePropertyTypes(properties.get('propertyTypes') as string[]);
        this.storeInstantiatedModel(properties.get('instantiatedModel') as object);
        return properties.get('propertyNames') as string[];
    }

    public storePropertyTypes(propertyTypes: Array<any>): void {
        this.managementCreation.storePropertyTypes(propertyTypes);
    }

    public storeInstantiatedModel(instantiatedModel: object): void {
        this.managementCreation.storeInstantiatedModel(instantiatedModel);
    }

    public sendCreationEvent(properties: string[], propertyValues: string[]): string {
        return this.managementCreation.sendCreationEvent(properties, propertyValues);
    }
}
