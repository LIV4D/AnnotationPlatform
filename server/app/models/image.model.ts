import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Annotation } from './annotation.model';
import { IProtoImage } from '../prototype interfaces/IProtoImage.interface';
import { IImage } from '../interfaces/IImage.interface';

import { ImageType } from './imageType.model';

export class Metadata {
    [key: string]: string | number | boolean;
}

// tslint:disable-next-line:max-classes-per-file
@Entity()
export class Image {

    @ManyToOne(type => ImageType, imageType => imageType.images)
    public imageType: ImageType;

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
