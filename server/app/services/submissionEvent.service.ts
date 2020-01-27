import * as express from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { SubmissionEventRepository } from '../repository/submissionEvent.repository';
import { IEvenement } from '../../../common/interfaces';
import { SubmissionEvent } from '../models/submissionEvent.model';
import { createError } from '../utils/error';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class SubmissionEventService {

    @inject(TYPES.EvenementRepository)
    private submissionEventRepository: SubmissionEventRepository;

    public async createSubmissionEvent(newEvenement: IEvenement): Promise<SubmissionEvent> {
        const evenement = new SubmissionEvent();
        for (const key of Object.keys(newEvenement)) {
            if (key === 'annotationId') {
                evenement.annotation = { id: newEvenement[key] } as any;
            } else if (key === 'userId') {
                evenement.user = { id: newEvenement[key] } as any;
            } else {
                evenement[key] = newEvenement[key];
            }
        }
        return await this.submissionEventRepository.create(evenement);
    }

    public async get(id: number, req: express.Request){
        const event = await this.submissionEventRepository.find(id);
        if (event == null) {
            throw createError('This event does not exist.', 404);
        }
        if (event.user.id !== req.user.id) {
            throwIfNotAdmin(req);
        }
        return event;
    }

    public async list(filter: {userId?:number, imageId?:number}): Promise<SubmissionEvent[]>{
        return this.submissionEventRepository.findByFilter(filter);
    }
}
