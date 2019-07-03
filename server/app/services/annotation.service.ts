import 'reflect-metadata';
import TYPES from '../types';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import { Annotation } from '../models/annotation.model';
import { AnnotationRepository } from '../repository/annotation.repository';
import { DeleteResult } from 'typeorm';
import { createError } from '../utils/error';
import { throwIfNotAdmin } from '../utils/userVerification';
import { ImageService } from './image.service';
import { isNullOrUndefined } from 'util';
import { IAnnotation } from '../../../common/common_interfaces/interfaces';

@injectable()
export class AnnotationService {
    @inject(TYPES.AnnotationRepository)
    private annotationRepository: AnnotationRepository;
    @inject(TYPES.ImageService)
    private imageService: ImageService;

    public async create(newAnnotation: IAnnotation): Promise<Annotation> {
        const annotation = new Annotation();
        annotation.data = newAnnotation.data;
        annotation.image = { id: newAnnotation.imageId } as any;
        return await this.annotationRepository.create(annotation);
    }

    public async update(newAnnotation: IAnnotation): Promise<Annotation> {
        const annotation = new Annotation();
        for (const key of Object.keys(newAnnotation)) {
            annotation[key] = newAnnotation[key];
        }
        return await this.annotationRepository.create(annotation);
    }

    public async getAnnotation(id: number): Promise<Annotation> {
        const annotation = await this.annotationRepository.find(id);
        if (isNullOrUndefined(annotation)) {
            throw createError('This annotation does not exist.', 404);
        }
        return annotation;
    }

    public async getAnnotations(): Promise<Annotation[]> {
        return await this.annotationRepository.findAll();
    }

}
