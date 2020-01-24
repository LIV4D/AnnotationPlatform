import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { SubmissionEventRepository } from '../repository/submissionEvent.repository';
import { IEvenement } from '../../../common/interfaces';
import { SubmissionEvent } from '../models/submissionEvent.model';

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
}
