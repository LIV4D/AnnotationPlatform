
import 'reflect-metadata';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { isNullOrUndefined } from 'util';
import { DeleteResult } from 'typeorm';

import { Annotation } from '../models/annotation.model';
import { IAnnotation } from '../interfaces/IAnnotation.interface';
import { AnnotationRepository } from '../repository/annotation.repository';
import { createError } from '../utils/error';
import { SubmissionEvent } from '../models/submissionEvent.model';
import { SubmissionEventService } from './submissionEvent.service';
import { User } from '../models/user.model';
import { WidgetRepository } from './../repository/widget.repository';
import { Widget } from '../models/widget.model';

@injectable()
export class AnnotationService {
    @inject(TYPES.AnnotationRepository)
    private annotationRepository: AnnotationRepository;

    @inject(TYPES.SubmissionEventService)
    private submissionEventService: SubmissionEventService;

    @inject(TYPES.WidgetRepository)
    private widgetRepository: WidgetRepository;


    /**
     * Creates a submission event for the annotation to be created and then sends it to the proper repository so it can create it.
     * @param newAnnotation an annotation that has been previously initialised
     * @param user a user that wishes to create a new annotation
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

    /**
     * Creates a submission event for updating the annotation and then send it to the proper repository so it can create it.
     * @param newAnnotation an annotation that has been previously initialised
     * @param user a user that wishes to update an existing annotation
     * @param eventInfo information pertaining to the time of the event and a description of it
     * @returns the annotation that has been found on the server (or null if not saved properly)
     */
    // tslint:disable-next-line:max-line-length
    public async update(newAnnotation: IAnnotation, user: User, eventInfo: {description?: string, timestamp?: number}= {}): Promise<Annotation> {
        const originalAnnotation = await this.getAnnotation(newAnnotation.id);
        const event = await this.submissionEventService.createSubmissionEvent({
            userId: user.id,
            parentEventId: originalAnnotation.submitEventId,
            description: isNullOrUndefined(eventInfo.description) ? 'Annotation update' : eventInfo.description,
            timestamp: isNullOrUndefined(eventInfo.timestamp) ? 0 : eventInfo.timestamp,
        });
        newAnnotation.submitEventId = event.id;
        originalAnnotation.update(newAnnotation);
        return await this.annotationRepository.create(originalAnnotation);
    }

    /**
     * Gets the annotation from the annotation id specified then sends a submission event for the cloned and
     * finally creates an exact clone of the annotation with the proper repository.
     * @param annotationId an annotation id for the annotation to be cloned
     * @param user a user that wishes to clone an existing annotation
     * @returns the annotation that has been found on the server (or null if not saved properly)
     */
    public async clone(annotationId: number, user: User): Promise<Annotation> {
        const originalAnnotation = await this.getAnnotation(annotationId);

        const event = await this.submissionEventService.createSubmissionEvent({
            userId: user.id,
            parentEventId: originalAnnotation.submitEventId,
            description: 'Cloned annotation',
        });

        const newIAnnotation = originalAnnotation.interface();
        delete newIAnnotation.id;
        newIAnnotation.submitEventId = event.id;

        const annotation = Annotation.fromInterface(newIAnnotation);
        return await this.annotationRepository.create(annotation);
    }

    /**
     * Checks to see if an annotation exists then sends it to the proper repository to be deleted.
     * @param annotationId an annotation id for the annotation to be deleted
     * @throws an error if the annotation doesn't exist
     * @returns whether the annotation was deleted or not
     */
    public async delete(annotationId: number): Promise<DeleteResult> {
        const annotation = await this.annotationRepository.find(annotationId);
        if (isNullOrUndefined(annotation)) {
            throw createError('This annotation does not exist', 404);
        }

        // TODO: Should an event by added here? Should events be deleted?

        return await this.annotationRepository.delete(annotation);
    }

    /**
     * Finds the annotation within the proper repository.
     * @param id an annotation id for the annotation which is to be retrieved
     * @throws an error if the annotation doesn't exist
     * @returns the annotation
     */
    public async getAnnotation(id: number): Promise<Annotation> {
        const annotation = await this.annotationRepository.find(id);
        if (isNullOrUndefined(annotation)) {
            throw createError('This annotation does not exist.', 404);
        }
        return annotation;
    }

    /**
     * Finds all the annotations within the proper repository.
     * @param ids annotation ids for all the annotation that need to be retrieved
     * @throws an error if the annotation doesn't exist
     */
    public async getAnnotations(ids: number[]): Promise<Annotation[]> {
        const annotations = await this.annotationRepository.findByIds(ids);
        if (annotations.length === 0) {
            throw createError('These annotations do not exist.', 404);
        }
        return annotations;
    }

    /**
     * @returns all annotations within the database
     */
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
