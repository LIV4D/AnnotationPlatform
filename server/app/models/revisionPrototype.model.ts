import { User } from './user.model';
import { ImagePrototype } from './imagePrototype.model';
import { Revision } from './revision.model';

export class RevisionPrototype {
    public id: number;
    public image: ImagePrototype;
    public user: User;
    public diagnostic: string;

    constructor(revision: Revision) {
        this.id = revision.id;
        this.image = revision.image === undefined ? undefined : revision.image.prototype();
        this.user = revision.user;
        this.diagnostic = revision.diagnostic;
    }
}
