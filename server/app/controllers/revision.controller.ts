import * as express from 'express';
import TYPES from '../types';
import { inject, injectable } from 'inversify';
import { IRegistrableController } from './registrable.controller';
import { RevisionService } from '../services/revision.service';
import { BiomarkerTypeService } from './../services/biomarkerType.service';
import { ImageService } from '../services/image.service';
import { throwIfNotAdmin } from '../utils/userVerification';

@injectable()
export class RevisionController implements IRegistrableController {
    @inject(TYPES.RevisionService)
    private revisionService: RevisionService;
    @inject(TYPES.BiomarkerTypeService)
    private biomarkerTypeService: BiomarkerTypeService;
    @inject(TYPES.ImageService)
    private imageService: ImageService;

    public register(app: express.Application): void {
        // Collection
        app.get('/api/revisions', this.getRevisions);
        // Element
        app.post('/api/revisions', this.createRevision);
        app.get('/api/revisions/emptyRevision/:imageTypeId', this.getEmptyRevision);
        app.get('/api/revisions/:revisionId', this.getRevision);
        app.get('/api/revisions/:userId/:imageId', this.getRevisionForUserForImage);
        app.put('/api/revisions/:userId/:imageId', this.updateRevisionForUserForImage);
        app.get('/api/revisions/svg/:userId/:imageId', this.getSvgForUserForImage);
        app.delete('/api/revisions/:userId/:imageId', this.deleteRevisionForUserForImage);
    }

    private getRevisions = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.revisionService.getRevisions()
            .then(revisions => res.send(revisions))
            .catch(next);
    }

    private createRevision = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        const newRevision = {
            svg: req.body.svg,
            diagnostic: req.body.diagnostic,
            userId: req.body.userId,
            imageId: req.body.imageId,
        };
        this.revisionService.createRevision(newRevision)
            .then(revision => res.json(revision))
            .catch(next);
    }

    private getEmptyRevision = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.biomarkerTypeService.generateSvg(Number(req.params.imageTypeId))
            .then(svg =>  res.send({ svg }))
            .catch(next);
    }

    private getRevision = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.revisionService.getRevision(req.params.revisionId, req)
            .then(revision => res.send(revision))
            .catch(next);
    }

    private getRevisionForUserForImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        this.revisionService.getRevisionForUserForImage(req.params.userId, req.params.imageId)
            .then(revision => res.send(revision))
            .catch(next);
    }

    private updateRevisionForUserForImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        const updatedRevision = {
            svg: req.body.svg,
            diagnostic: req.body.diagnostic,
            userId: req.params.userId,
            imageId: req.params.imageId,
        };
        this.revisionService.updateRevisionForUserForImage(updatedRevision)
            .then(revision => res.send(revision))
            .catch(next);
    }

    private getSvgForUserForImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.user.id !== req.params.userId) {
            throwIfNotAdmin(req);
        }
        this.revisionService.getRevisionForUserForImage(req.params.userId, req.params.imageId)
            .then(revision => {
                if (revision !== undefined) {
                    res.send(revision);
                } else {
                    this.imageService.getImage(req.params.imageId)
                    .then(image => {
                        res.send(image.baseRevision);
                    });
                }
            })
            .catch(next);
    }

    private deleteRevisionForUserForImage = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        throwIfNotAdmin(req);
        this.revisionService.deleteRevisionForUserForImage(req.params.userId, req.params.imageId)
            .then(() => res.sendStatus(204))
            .catch(next);
    }
}
