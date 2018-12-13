import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { BiomarkerTypeService } from '../services/biomarkerType.service';
import { createError } from '../utils/error';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class BiomarkerTypeController implements IRegistrableController {
    @inject(TYPES.BiomarkerTypeService)
    private biomarkerTypeService: BiomarkerTypeService;

    public register(app: express.Application): void {
        // Collection
        app.get('/api/biomarkerTypes', this.getBiomarkerTypes);
        app.post('/api/biomarkerTypes', this.createBiomarkerType);
        // Element
        app.get('/api/biomarkerTypes/:biomarkerTypeId', this.getBiomarkerType);
        app.get('/api/biomarkerTypes/findByName/:biomarkerTypeName', this.getBiomarkerTypeByName);
        app.put('/api/biomarkerTypes/:biomarkerTypeId', this.updateBiomarkerType);
        app.delete('/api/biomarkerTypes/:biomarkerTypeId', this.deleteBiomarkerType);
    }

    private getBiomarkerTypes = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.biomarkerTypeService.getBiomarkerTypes()
            .then(biomarkerTypes => res.send(biomarkerTypes))
            .catch(next);
    }

    private createBiomarkerType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const newBiomarkerType = {
            name: req.body.name,
            color: req.body.color,
            parentId: req.body.parentId,
            imageTypes: req.body.imageTypes,
        };
        this.biomarkerTypeService.createBiomarkerType(newBiomarkerType)
            .then(biomarkerType => res.send(biomarkerType))
            .catch(next);
    }

    private getBiomarkerType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (isNaN(Number(req.params.biomarkerTypeId))) {
            throw createError('Biomarker type id is not valid' + req.params.biomarkerTypeId, 400);
        }
        this.biomarkerTypeService.getBiomarkerType(req.params.biomarkerTypeId)
            .then(biomarkerType => res.send(biomarkerType))
            .catch(next);
    }

    private getBiomarkerTypeByName = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.biomarkerTypeService.getBiomarkerTypeByName(req.params.biomarkerTypeName)
            .then(biomarkerType => res.send(biomarkerType))
            .catch(next);
    }

    private updateBiomarkerType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const newBiomarkerType = {
            id: req.params.biomarkerTypeId,
            color: req.body.color,
        };
        this.biomarkerTypeService.updateBiomarkerType(newBiomarkerType)
            .then(biomarkerType => res.send(biomarkerType))
            .catch(next);
    }

    private deleteBiomarkerType = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.biomarkerTypeService.deleteBiomarkerType(req.params.biomarkerTypeId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
