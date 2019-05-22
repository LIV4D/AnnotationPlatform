import { Image } from './image.model';
export class ImagePrototype {
    public id: number;
    public path: string;
    public preprocessingPath: string;
    constructor(image: Image) {
        this.id = image.id;
        this.path = image.path;
        this.preprocessingPath = image.preprocessingPath;
    }
}
