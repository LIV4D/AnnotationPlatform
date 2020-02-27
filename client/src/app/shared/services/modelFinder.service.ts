import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModelFinderService {

    constructor() { }
    public async getAttributesOf(model: string): Promise<string[]> {
        model = model.charAt(0).toLowerCase() + model.slice(1);
        const modelPath = `${model}.model`;
        const modelCapitalized = model.charAt(0).toUpperCase() + model.slice(1);

        try {
            const modelImport = await import(`../models/${modelPath}`);

            const instantiatedModel = new (modelImport as any)[modelCapitalized]();
            const properties = Object.getOwnPropertyNames(instantiatedModel);
            console.log(this.getAllPropertyTypes(instantiatedModel));

            return properties;
        } catch (error) {
            console.error('There was a problem while retrieving the requested model : ' + error);
            return ['error'];
        }
    }

    public getAllPropertyTypes(object) {
        const propertyTypes = new Array();
        Object.getOwnPropertyNames(object).forEach(propertyName => {
            propertyTypes.push(this.getPropertyType(object, propertyName));
        });
        return propertyTypes;
    }

    public getPropertyType(object, name) {
        return typeof object[name];
    }
}
