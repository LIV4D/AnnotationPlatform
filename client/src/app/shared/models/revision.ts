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
    /**
     * 
     * @param typeDataMap map consisting of each type (from Revision class) associated with its equivalent dataImage (from Revision class)
     */
    public setDataImageRecursiveWithMap(typeDataMap: Map<string, Buffer>) {
        if (typeDataMap.has(this.type)) {
            this.dataImage = typeDataMap.get(this.type);
            typeDataMap.delete(this.type);
        }

        if (typeDataMap.size > 0){
            this.setDataImageRecursiveWithMap(typeDataMap);
        }
    }
}