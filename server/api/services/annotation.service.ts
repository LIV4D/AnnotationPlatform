import 'reflect-metadata';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { Annotation } from '../models/annotation.model';
import { AnnotationRepository } from '../repository/annotation.repository';
import { createError } from '../utils/error';
import { isNullOrUndefined } from 'util';
import { IAnnotation } from '../../../common/interfaces';
import { DeleteResult } from 'typeorm';
import { SubmissionEvent } from '../models/submissionEvent.model';

@injectable()
export class AnnotationService {
    @inject(TYPES.AnnotationRepository)
    private annotationRepository: AnnotationRepository;

    public async create(newAnnotation: IAnnotation): Promise<Annotation> {
        const annotation = new Annotation();
        annotation.data = newAnnotation.data;
        annotation.image = { id: newAnnotation.imageId } as any;
        annotation.comment = newAnnotation.comment;
        return await this.annotationRepository.create(annotation);
    }

    public async update(newAnnotation: IAnnotation): Promise<Annotation> {
        const annotation = await this.annotationRepository.find(newAnnotation.id);
        if (isNullOrUndefined(annotation)) {
            createError('this annotation does not exist', 404);
        }
        for (const key of Object.keys(newAnnotation)) {
                annotation[key] = newAnnotation[key];
        }
        return await this.annotationRepository.create(annotation);
    }

    public async delete(oldAnnotation: IAnnotation): Promise<DeleteResult> {
        const annotation = await this.annotationRepository.find(oldAnnotation.id);
        if (isNullOrUndefined(annotation)) {
            createError('This annotation does not exist', 404);
        }
        return await this.annotationRepository.delete(annotation);
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

    public async getLastSubmissionEvent(id: number): Promise<SubmissionEvent> {
        const annotation = await this.annotationRepository.find(id);
        if (isNullOrUndefined(annotation)) {
            createError('This annotation does not exist', 404);
        }
        return annotation.lastSubmissionEvent;
    }
}
