import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class ModelFinderService {

    constructor() { }
    async getAttributesOf(model: string) {
        const modelPath = `${model}.model`;
        const modelCapitalized = model.charAt(0).toUpperCase() + model.slice(1);

        console.log('test');
        const modelImport = await import(`../models/${modelPath}`);

        const testTask = new Task();
        const instantiatedModel = new (modelImport as any)[modelCapitalized]();
        let properties = Object.getOwnPropertyDescriptors(instantiatedModel);
        console.log(properties === undefined || properties.length === 0);
        // properties.forEach(property => {
        //     console.log(property);
        // });

        properties = Object.getOwnPropertyDescriptors(testTask);

        console.log(properties === undefined || properties.length === 0);
        // properties.forEach(property => {
        //     console.log(property);
        // });
        console.log('other test');
    }
}
