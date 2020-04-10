import { Injectable } from '@angular/core';
import { Revision } from '../../models/revision';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class RevisionService {

    public revision: Revision;
    constructor() { }

    public setDataImages(types: string[], imageDatas: string[]) {
     
        for(let i = 0; i < types.length && i < imageDatas.length; i++) {
            this.revision.biomarkers.forEach(revision => {
                this.setDataImageRecursive(revision, types[i], imageDatas[i]);
            });
        }
    }

    /**
     * Checks to see if a pair of type and dataImage exists and modifes that type's dataImage to be functional.
     * @param revision a revision to check on which you want to set the type.
     * @param type a type to be searched for within all of the revision.
     * @param dataImage the image's data to be set.
     */
    public setDataImageRecursive(revision: Revision, type: string, dataImage: string) {
        if (!isNullOrUndefined(revision.type) && revision.type === type) {
            revision.dataImage = dataImage;
        }
        if (!isNullOrUndefined(revision.biomarkers) && revision.biomarkers.length > 0) {
            revision.biomarkers.forEach(revision => {
                this.setDataImageRecursive(revision, type, dataImage);
            });
        }
    }

    /**
     * 
     * @param typeDataMap map consisting of each type (from Revision class) associated with its equivalent dataImage (from Revision class)
     */
    // public setDataImageRecursiveWithMap(typeDataMap: Map<string, Buffer>): void {
    //     if (typeDataMap.has(this.type)) {
    //         this.dataImage = typeDataMap.get(this.type);
    //         typeDataMap.delete(this.type);
    //     }

    //     if (typeDataMap.size > 0){
    //         this.setDataImageRecursiveWithMap(typeDataMap);
    //     }
    // }
}
