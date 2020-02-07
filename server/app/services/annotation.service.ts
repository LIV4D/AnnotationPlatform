import 'reflect-metadata';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { isNullOrUndefined } from 'util';
import { DeleteResult } from 'typeorm';

import { Annotation, IAnnotation } from '../models/annotation.model';
import { AnnotationRepository } from '../repository/annotation.repository';
import { createError } from '../utils/error';
import { SubmissionEvent } from '../models/submissionEvent.model';
import { SubmissionEventService } from './submissionEvent.service';
import { User } from '../models/user.model'

@injectable()
export class AnnotationService {
    @inject(TYPES.AnnotationRepository)
    private annotationRepository: AnnotationRepository;
    @inject(TYPES.SubmissionEventService)
    private submissionEventService: SubmissionEventService;

    /**
     * Creates a submission event for the annotation to be created and then sends it to the proper repository so it can create it.
     * @param newAnnotation the annotation that has been previously initialised
     * @param user the user that wishes to create a new annotation
     * @returns the annotation that has been found on the server (or null if not saved properly)
     */
    public async create(newAnnotation: IAnnotation, user: User): Promise<Annotation> {
        const event = await this.submissionEventService.createSubmissionEvent({
            userId: user.id,
            description: 'Initial submit',
        });

        newAnnotation.submitEventId = event.id;
        const annotation = Annotation.fromInterface(newAnnotation);
        return  await this.annotationRepository.create(annotation);
    }

    public async update(newAnnotation: IAnnotation, user: User, eventInfo:{description?:string, timestamp?: number}={}): Promise<Annotation> {
        const originalAnnotation = await this.getAnnotation(newAnnotation.id);
        const event = await this.submissionEventService.createSubmissionEvent({
            userId: user.id,
            parentEventId: originalAnnotation.submitEventId,
            description: isNullOrUndefined(eventInfo.description) ? "Annotation update" : eventInfo.description,
            timestamp: isNullOrUndefined(eventInfo.timestamp) ? 0 : eventInfo.timestamp,
        });

        newAnnotation.submitEventId = event.id;
        originalAnnotation.update(newAnnotation);
        return await this.annotationRepository.create(originalAnnotation);
    }

    public async clone(annotationId: number, user: User): Promise<Annotation> {
        const originalAnnotation = await this.getAnnotation(annotationId);

        const event = await this.submissionEventService.createSubmissionEvent({
            userId: user.id,
            parentEventId: originalAnnotation.submitEventId,
            description: "Cloned annotation"
        });

        const newIAnnotation = originalAnnotation.interface();
        delete newIAnnotation.id;
        newIAnnotation.submitEventId = event.id;

        const annotation = Annotation.fromInterface(newIAnnotation); 
        return await this.annotationRepository.create(annotation);
    }

    public async delete(annotationId: number): Promise<DeleteResult> {
        const annotation = await this.annotationRepository.find(annotationId);
        if (isNullOrUndefined(annotation)) {
            createError('This annotation does not exist', 404);
        }

        // TODO: Should an event by added here? Should events be deleted?

        return await this.annotationRepository.delete(annotation);
    }

    public async getAnnotation(id: number): Promise<Annotation> {
        const annotation = await this.annotationRepository.find(id);
        if (isNullOrUndefined(annotation)) {
            throw createError('This annotation does not exist.', 404);
        }
        return annotation;
    }

    public async getAnnotations(ids: number[]): Promise<Annotation[]> {
        const annotations = await this.annotationRepository.findByIds(ids);
        if (annotations.length==0) {
            throw createError('These annotations do not exist.', 404);
        }
        return annotations;
    }

    public async getAllAnnotations(): Promise<Annotation[]> {
        return await this.annotationRepository.findAll();
    }

    public async getLastSubmissionEvent(id: number): Promise<SubmissionEvent> {
        const annotation = await this.annotationRepository.find(id);
        if (isNullOrUndefined(annotation)) {
            createError('This annotation does not exist', 404);
        }
        return annotation.submitEvent;
    }
}
