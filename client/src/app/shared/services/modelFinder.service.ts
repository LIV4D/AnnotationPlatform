import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModelFinderService {

    constructor() { }
    getAttributesOf(model: string) {
        const instantiatedModel = Object.create(window[model].prototype);

        const propertiesOf = <TObj>(obj: (TObj | undefined) = undefined) => <T extends keyof TObj>(name: T): T => name;
        const properties = propertiesOf(instantiatedModel);
        console.log(properties);
    }
}
