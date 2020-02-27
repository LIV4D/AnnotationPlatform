import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModelFinderService {

    constructor() { }
    async getAttributesOf(model: string) {
        const modelPath = `${model}.model`;

        const properties = import(`../models/${modelPath}`).then(() => {
            console.log('test');
            const instantiatedModel = new (global as any)[model]();
            return Object.getOwnPropertyNames(instantiatedModel);
        });
        // const instantiatedModel = Object.create(window['../models/' + model].prototype);

        // const propertiesOf = <TObj>(obj: (TObj | undefined) = undefined) => <T extends keyof TObj>(name: T): T => name;
        // const properties = propertiesOf(instantiatedModel);
        console.log(`${properties} and the final test`);

    }
}
