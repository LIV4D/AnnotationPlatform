import { Injectable } from '@angular/core';
import { Revision } from '../../models/revision';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})

// The service provides usefull functions
// helping the conversion of an array of biomarkers to a Revision
// object in the  format meant to be send to the server
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
    private setDataImageRecursive(revision: Revision, type: string, dataImage: string) {
        if (!isNullOrUndefined(revision.type) && revision.type === type) {
            revision.dataImage = dataImage;
        }
        if (!isNullOrUndefined(revision.biomarkers) && revision.biomarkers.length > 0) {
            revision.biomarkers.forEach(revision => {
                this.setDataImageRecursive(revision, type, dataImage);
            });
        }
    }
}
