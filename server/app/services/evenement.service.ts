import { inject, injectable } from 'inversify';
import TYPES from '../types';
import { EvenementRepository } from '../repository/evenement.repository';
import { IEvenement } from '../../../common/common_interfaces/interfaces';
import { Evenement } from '../models/evenement.model';

@injectable()
export class EvenementService {

    @inject(TYPES.EvenementRepository)
    private evenementRepository: EvenementRepository;

    public async createEvenement(newEvenement: IEvenement): Promise<Evenement> {
        const evenement = new Evenement();
        for (const key of Object.keys(newEvenement)) {
            if (key === 'annotationId') {
                evenement.annotation = { id: newEvenement[key] } as any;
            } else if (key === 'userId') {
                evenement.user = { id: newEvenement[key] } as any;
            } else {
                evenement[key] = newEvenement[key];
            }
        }
        return await this.evenementRepository.create(evenement);
    }
}
