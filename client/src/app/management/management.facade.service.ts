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

        this.storeValues(properties.get('instantiatedModel') as object, model);
        return properties.get('propertyNames') as string[];
    }

    public storeValues(instantiatedModel: object, model: string): void {
        this.managementCreation.setInstantiatedModel(instantiatedModel);
        this.managementCreation.setModelName(model);
    }

    public sendCreationEvent(properties: string[], propertyValues: string[]): string {
        return this.managementCreation.sendCreationEvent(properties, propertyValues);
    }

    public async getModelNames(): Promise<string[]> {
        return await this.modelFinder.getModelNames();
    }
}
