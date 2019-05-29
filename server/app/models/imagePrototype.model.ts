import { Image } from './image.model';

// TODO: do I keep the thumbnail attribute?
export class ImagePrototype {
    public id: number;
    public path: string;
    public preprocessingPath: string;
    public thumbnail: string;
    constructor(image: Image) {
        this.id = image.id;
        this.path = image.path;
        this.preprocessingPath = image.preprocessingPath;
        this.thumbnail = image.thumbnail;
    }
}
