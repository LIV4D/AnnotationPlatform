import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { ImageTypeService } from '../services/imageType.service'; // imageType.service
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class ImageTypeController implements IRegistrableController {
    @inject(TYPES.ImageTypeService)
    private imageTypeService: ImageTypeService;

    public register(app: express.Application): void {
        // Collection
        app.get('/api/imageTypes', this.getImageTypes);
        app.post('/api/imageTypes/create', this.createImageType);
        // Element
        app.get('/api/imageTypes/:imageTypeId', this.getImageType);
        app.put('/api/imageTypes/:imageTypeId', this.updateImageType);
        app.delete('/api/imageTypes/:imageTypeId', this.deleteImageType);
    }

    private getImageTypes = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageTypeService.getImageTypes()
            .then(imageTypes => res.send(imageTypes))
            .catch(next);
    }

    private createImageType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const newImageType = {
            name: req.body.name,
            description: req.body.description,
        };
        this.imageTypeService.createImageType(newImageType)
            .then(imageType => res.json(imageType.id))
            .catch(next);
    }

    private getImageType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageTypeService.getImageType(req.params.imageTypeId)
            .then(imageType => res.send(imageType))
            .catch(next);
    }

    private updateImageType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const updatedImageType = {
            id: req.params.imageTypeId,
            name: req.body.name,
            description: req.body.description,
        };
        this.imageTypeService.updateImageType(updatedImageType)
            .then(imageType => res.send(imageType))
            .catch(next);
    }

    private deleteImageType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.imageTypeService.deleteImageType(req.params.imageTypeId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
