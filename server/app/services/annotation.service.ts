import 'reflect-metadata';
import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { Annotation } from '../models/annotation.model';
import { AnnotationRepository } from '../repository/annotation.repository';
import { createError } from '../utils/error';
import { isNullOrUndefined } from 'util';
import { IAnnotation } from '../../../common/interfaces';
import { DeleteResult } from 'typeorm';
import { SubmissionEvent } from '../models/submissionEvent.model';
import { SubmissionEventService } from './submissionEvent.service';

@injectable()
export class AnnotationService {
    @inject(TYPES.AnnotationRepository)
    private annotationRepository: AnnotationRepository;
    @inject(TYPES.EvenementService)
    private evenementService: SubmissionEventService;

    public async create(newAnnotation: IAnnotation, req: express.Request): Promise<Annotation> {
        const annotation = new Annotation();
        annotation.data = newAnnotation.data;
        annotation.image = { id: newAnnotation.imageId } as any;
        annotation.comment = newAnnotation.comment;
        const r =  await this.annotationRepository.create(annotation);
        this.evenementService.createSubmissionEvent({annotationId:r.id, userId:req.user.id,
                                                     description: "Initial Submit", timestamp: 0});
        return r;
    }

    public async update(newAnnotation: IAnnotation, req: express.Request): Promise<Annotation> {
        const annotation = await this.annotationRepository.find(newAnnotation.id);
        if (isNullOrUndefined(annotation)) {
            createError('this annotation does not exist', 404);
        }
        for (const key of Object.keys(newAnnotation)) {
                annotation[key] = newAnnotation[key];
        }
        const r = await this.annotationRepository.create(annotation);
        this.evenementService.createSubmissionEvent({annotationId:r.id, userId:req.user.id,
            description: "CLI Update", timestamp: 0});
        return r;
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
