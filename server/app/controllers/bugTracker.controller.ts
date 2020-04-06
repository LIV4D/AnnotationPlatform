import * as express from 'express';
import { injectable } from 'inversify';
import { IController } from './abstractController.controller';

@injectable()
export class BugtrackerController implements IController {

    public setRoutes(app: express.Application): void {
        // Element
        app.post('/api/bugtracker/create', this.createBugReport);
    }

    private createBugReport = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const bug = {
            description: req.body.description,
            author: req.body.author,
            date: req.body.date,
        };

        console.log(bug);
        res.sendStatus(204);

        // // spreadsheet key is the long id in the sheets URL
        // const { GoogleSpreadsheet } = require('google-spreadsheet');
        // const doc = new GoogleSpreadsheet('1XaTavWXhHRVp4_BWJpA2f0PjqGqyECc4hkVUCqHlHk4');

        // const creds = {
        //     client_email: 'bugtracker-963@plateformannotation.iam.gserviceaccount.com',
        //     // tslint:disable-next-line: max-line-length
        //     private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCbGAWDtUkHS697\nwJj60hVImoOhIGgv9cHtBCmP6OhZyMaR+eZqj6dVroikWZJEZKkBJCtiRjFyOo02\ngx72grr9if+xbEPsyRlYsSKyKgI68buX1CSwM1sAKPhXqLLfEEyBxMyTBsyQl292\nfSYMotSWDidp07W3hA7Ggq22KF4v0aObI/KfHgxUWo1C4W/9qQDF3s1Y6pp58Sc4\n42S+VQrWtEbntWPnr5xEfYRX2h4TE+UyhlcMZKzk9xXCWfwy4zxtb2fc9bKBh7BV\no5wZJJIjOpOR1o0KzsnVM8BJt37VZ5Iw9QqAryqgL1CU3olaHr60CSv4pokxCNUx\nFl+9lK53AgMBAAECggEASkpk5dSSITEDY3t7q/Wy5T7CW42a6pJFbMOoJvuRROS0\nHVt/oD6kkJnUcSlIs4MmI1pQf7gQ2l8qoliHndw8NtOCC9pI5STlA8OB06bkv5ho\nXA9t7YsEBZ0abF7uI4R6qVR8C9dfaMlpRnAnKDldLG2mOn6DVl8m9rbE//LxPuTl\nEts9yckugPvCZ0mjJNl5kq4ZViMO6K1LZ3A97+gYHFyDwJ0wc5/OPuPfX8ytizc8\nv3ak49B66//5oxXr43FuJ063ikMg6sKSeqwHMJ6fXSvrDkzoJyduJKzpCvwEtPi/\nVl5hoszRXFCckqKcn+1oaiQYGG8pixN6u34RJU/08QKBgQDLY6OB5mJ+Pn2u5/P1\nTu7O8Fli/4cr655ZvnMuLif3/D2epNppAQWLXN77LW7xqt36DZcw/MZgcL3D9gPt\nvmu5islAExRnFiyw7kiAEwNfoMM0lrmKX0WIXpzz7cLiEDG4DMy3xgskGT2nYx7S\nHENrSq4DWYcJIQrVXUIUa4N6UQKBgQDDNkeuf4j22mAVo+7sVhZtHkkAFwu34t3o\nJIKGmfpXp+kpg49rzlL9cAg0J4kWK3WDnxDM+3Pa4MPr9M/l0x8J9bIXW1ghEXgX\nk6Hk9iCcPAGjW3Rgnfpkp4vJmYL6QdlSLNH50uS9pHPRFe5qkdrqUOQ+RbpV/Fru\n4tTpsS8iRwKBgBnoSz+UtR8XnrLU4QJyV4EMpJYzrmgtzzHnTIypXHX+L2sx3JBb\njPU/kzezhdpKxZPAf23CBRLryYBYqg9yng44W4JJ6+Nls7Ol5p5Jzbg0pijguimi\nER1Zz+xScOyS24JyPvF5zJmAjZXwzlA9QWk9TgUnNkg3aUXcZzpqp4jBAoGANeC9\nWAQLIVaUPmTIhKId/m/lZgj2SwJqjK/G9q940MifKb4Nz4tajGhnWz2uMFg+Tt2Q\nHYMpLrfqWy1uU9g5MN6HELs9T6MqqhctD6x+w6AsM5ICRMhVW4KCqlmcNMYH3Q5R\nxcnXKCBDdum+q9sluJYq6KUGEMVds6EXcohcofECgYEAharp0bN6RsTD7a7XI1ZK\nTJWjFoLijKazLKdwRNE60ki5uUC9aM7hI/6i1OQaaHRxSy6nYgTxsjGLPsj2bdJ9\ngbZWe53hentqaCIFBLNu3jQCiwVL7lBgcVR1o4KA7zQ60PrIAVDJnul974bJnH0q\nwzhmHYJgE6QE88K2tTU/ZkM=\n-----END PRIVATE KEY-----\n',
        // };

        // doc.useServiceAccountAuth(creds, (err: any, res: any) => {
        //     if (err) {
        //         console.log('Auth Error:', err);
        //         return;
        //     }
        //     const data = {
        //         description: bug.description,
        //         author: bug.author,
        //         date: bug.date,
        //         img: '',
        //         status: 'new',
        //         commentaire: '',
        //     };
        //     doc.addRow(1, data, (err: any, res: any) => { });
        // });
        // res.sendStatus(204);
        // next();
    }
}