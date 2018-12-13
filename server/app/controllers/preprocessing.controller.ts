import * as express from 'express';
import * as path from 'path';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { PreprocessingService } from '../services/preprocessing.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class PreprocessingController implements IRegistrableController {
    @inject(TYPES.PreprocessingService)
    private preprocessingService: PreprocessingService;

    public register(app: express.Application): void {
        // Collection
        app.get('/api/preprocessings/', this.getPreprocessings);
        app.get('/api/preprocessings/:imageId', this.getPreprocessingsForImage);
        // Element
        app.post('/api/preprocessings/',
            this.preprocessingService.upload.single('preprocessing'),
            this.uploadPreprocessing);
        app.get('/api/preprocessings/:imageId/:preprocessingTypeId', this.getPreprocessingForImageForType);
        app.delete('/api/preprocessings/:imageId/:preprocessingTypeId', this.deletePreprocessingForImageForType);
    }

    private getPreprocessings = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.preprocessingService.getPreprocessings()
            .then(preprocessings => res.send(preprocessings))
            .catch(next);
    }

    private getPreprocessingsForImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.preprocessingService.getPreprocessingsForImage(req.params.imageId)
            .then(preprocessings => res.send(preprocessings))
            .catch(next);
    }

    private uploadPreprocessing = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // isAdmin executes in preprocessingService.upload
        const newPreprocessing = {
            filename: req.body.filename,
            imageId: req.body.imageId,
            preprocessingTypeId: req.body.preprocessingTypeId,
        };
        if (req.body.isUpdate) {
            this.preprocessingService.updatePreprocessingForImageForType(newPreprocessing)
                .then(preprocessing => res.send(preprocessing))
                .catch(next);
        } else {
            this.preprocessingService.uploadPreprocessing(newPreprocessing)
                .then(preprocessing => res.send(preprocessing))
                .catch(next);
        }
    }

    private getPreprocessingForImageForType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.preprocessingService.getPreprocessingForImageForType(req.params.imageId, req.params.preprocessingTypeId)
            .then(preprocessingType => res.sendFile(path.resolve(preprocessingType.path)))
            .catch(next);
    }

    private deletePreprocessingForImageForType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.preprocessingService.deletePreprocessingForImageForType(req.params.imageId, req.params.preprocessingTypeId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
