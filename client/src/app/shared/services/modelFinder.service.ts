import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ModelFinderService {

    constructor() { }
    async getAttributesOf(model: string): Promise<string[]> {
        const modelPath = `${model}.model`;
        const modelCapitalized = model.charAt(0).toUpperCase() + model.slice(1);

        // Need to add check here to see if file exists before doing it (fs doesn't work)
        const modelImport = await import(`../models/${modelPath}`);

        const instantiatedModel = new (modelImport as any)[modelCapitalized]();
        const properties = Object.getOwnPropertyNames(instantiatedModel);

        return properties;
        // const propertiesOf = <TObj>(obj: (TObj | undefined) = undefined) => <T extends keyof TObj>(name: T): T => name;
        // const properties3 = propertiesOf(instantiatedModel);
    }
}
