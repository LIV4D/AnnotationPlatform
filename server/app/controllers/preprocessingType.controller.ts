import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { PreprocessingTypeService } from '../services/preprocessingType.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class PreprocessingTypeController implements IRegistrableController {
    @inject(TYPES.PreprocessingTypeService)
    private preprocessingTypeService: PreprocessingTypeService;

    public register(app: express.Application): void {
        // Collection
        app.get('/api/preprocessingTypes', this.getPreprocessingTypes);
        // Element
        app.post('/api/preprocessingTypes', this.createPreprocessingType);
        app.put('/api/preprocessingTypes/:preprocessingTypeId', this.updatePreprocessingType);
        app.get('/api/preprocessingTypes/:preprocessingTypeId', this.getPreprocessingType);
        app.get('/api/preprocessingTypes/findByName/:preprocessingTypeName', this.getPreprocessingTypeByName);
    }

    private getPreprocessingTypes = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.preprocessingTypeService.getPreprocessingTypes()
            .then(preprocessingTypes => res.send(preprocessingTypes))
            .catch(next);
    }

    private createPreprocessingType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const newPreprocessingType = {
            name: req.body.name,
            description: req.body.description,
        };
        this.preprocessingTypeService.createPreprocessingType(newPreprocessingType)
            .then(preprocessingType => res.send(preprocessingType))
            .catch(next);
    }

    private updatePreprocessingType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const updatedPreprocessingType = {
            id: req.params.preprocessingTypeId,
            name: req.body.name,
            description: req.body.description,
        };
        this.preprocessingTypeService.updatePreprocessingType(updatedPreprocessingType)
            .then(preprocessingType => res.send(preprocessingType))
            .catch(next);
    }

    private getPreprocessingType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.preprocessingTypeService.getPreprocessingType(req.params.preprocessingTypeId)
            .then(preprocessingType => res.send(preprocessingType))
            .catch(next);
    }

    private getPreprocessingTypeByName = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.preprocessingTypeService.getPreprocessingTypeByName(req.params.preprocessingTypeName)
            .then(preprocessingType => res.send(preprocessingType))
            .catch(next);
    }
}
