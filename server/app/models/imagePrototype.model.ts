import { Image } from './image.model';
import { ImageType } from './imageType.model';

export class ImagePrototype {
    public id: number;
    public imageType: ImageType;
    public path: string;
    public eye: string;
    public hospital: string;
    public patient: string;
    public visit: string;
    public code: string;
    public extra: string;

    constructor(image: Image) {
        this.id = image.id;
        this.imageType = image.imageType;
        this.path = image.path;
        this.eye = image.eye;
        this.hospital = image.hospital;
        this.patient = image.patient;
        this.visit = image.visit;
        this.code = image.code;
        this.extra = image.extra;
    }
}
