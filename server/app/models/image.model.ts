import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { isNullOrUndefined } from 'util';

import { Annotation } from './annotation.model';

export class Metadata {
    [key: string]: string | number | boolean;
}

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

    public interface(): IImage {
        return {
            id: this.id,
            type: this.type,
            metadata: this.metadata,
            preprocessing: this.preprocessing,
        };
    }

    public update(iimage: IImage): void {
        if(!isNullOrUndefined(iimage.type))          this.type = iimage.type; 
        if(!isNullOrUndefined(iimage.metadata))      this.metadata = iimage.metadata;
        if(!isNullOrUndefined(iimage.preprocessing)) this.preprocessing = iimage.preprocessing;
    }

    public static fromInterface(iimage: IImage): Image {
        const image = new Image();
        image.update(iimage);
        if(!isNullOrUndefined(iimage.id))   image.id = iimage.id;
        return image;
    }

    public proto(): ProtoImage {
        return {
            id: this.id,
            type: this.type,
            metadata: this.metadata,
            preprocessing: this.preprocessing,
        };
    }
}


export interface IImage {
    id?: number;
    type?: string;
    metadata?: Metadata;
    preprocessing?: boolean;
}


export interface ProtoImage {
    id: number;
    type: string;
    metadata: Metadata;
    preprocessing: boolean
}