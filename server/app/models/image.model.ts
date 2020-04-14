import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Annotation } from './annotation.model';
import { IProtoImage } from '../prototype interfaces/IProtoImage.interface';
import { IImage } from '../interfaces/IImage.interface';

export class Metadata {
    [key: string]: string | number | boolean;
}

/**
 * An image is the retinian image as well as its thumbnail, its preprocessed image (a better quality version of the original image),
 * and the image which is going to be annotated for further study. All image file paths are stored within the object's metdata
 * attribute.
 *
 * It can be associated with any number of annotations (OneToMany)
 */
// tslint:disable-next-line:max-classes-per-file
@Entity()
export class Image {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public preprocessing: boolean;

    @Column('jsonb')
    public metadata: Metadata;

    @Column()
    public type: string;

    @OneToMany(type => Annotation, annotation => annotation.image)
    public annotations: Annotation[];

    public static fromInterface(iimage: IImage): Image {
        const image = new Image();
        image.update(iimage);
        if (!isNullOrUndefined(iimage.id)) {   image.id = iimage.id; }
        return image;
    }

    public interface(): IImage {
        return {
            id: this.id,
            type: this.type,
            metadata: this.metadata,
            preprocessing: this.preprocessing,
        };
    }

    public update(iimage: IImage): void {
        if (!isNullOrUndefined(iimage.type)) {          this.type = iimage.type; }
        if (!isNullOrUndefined(iimage.metadata)) {      this.metadata = iimage.metadata; }
        if (!isNullOrUndefined(iimage.preprocessing)) { this.preprocessing = iimage.preprocessing; }
    }

    public proto(): IProtoImage {
        return {
            id: this.id,
            type: this.type,
            metadata: this.metadata,
            preprocessing: this.preprocessing,
        };
    }
}
