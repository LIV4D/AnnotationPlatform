import { isNullOrUndefined } from 'util';

export class Revision {
    biomarkers?: Array<Revision>;
    type: string;
    color?: string;
    dataImage?: Buffer; // ou string

    public setDataImageRecursive(type: string, dataImage: Buffer) {
        if (this.type === type) {
            this.dataImage = dataImage;
        } else {
            if (!isNullOrUndefined(this.biomarkers) && this.biomarkers.length > 0) {
                this.setDataImageRecursive(type, dataImage);
            }
        }
    }
}