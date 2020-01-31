import { inject, injectable } from 'inversify';

import TYPES from '../types';
import { SubmissionEventRepository } from '../repository/submissionEvent.repository';
import { SubmissionEvent, ISubmissionEvent } from '../models/submissionEvent.model';
import { createError } from '../utils/error';

@injectable()
export class SubmissionEventService {

    @inject(TYPES.EvenementRepository)
    private submissionEventRepository: SubmissionEventRepository;

    public async createSubmissionEvent(newEvenement: ISubmissionEvent): Promise<SubmissionEvent> {
        const evenement = SubmissionEvent.fromInterface(newEvenement);
        return await this.submissionEventRepository.create(evenement);
    }

    public async get(id: number){
        const event = await this.submissionEventRepository.find(id);
        if (event == null) {
            throw createError('This event does not exist.', 404);
        }
        return event;
    }

    public async list(filter: {userId?:number, imageId?:number}): Promise<SubmissionEvent[]>{
        return this.submissionEventRepository.findByFilter(filter);
    }
}
