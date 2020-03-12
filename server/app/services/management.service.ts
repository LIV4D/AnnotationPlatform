import { injectable } from 'inversify';
import fs = require('fs');
import path = require('path');
import util = require('util');

@injectable()
export class ManagementService {
    private modelDirectoryName = '../models/';

    public async listAllModels(): Promise<string[]> {
        this.modelDirectoryName = path.resolve(__dirname, this.modelDirectoryName);

        const readdir = util.promisify(fs.readdir);
        let filesWithExtensions = await readdir(this.modelDirectoryName);

        filesWithExtensions = filesWithExtensions.filter( (file) => !file.match(/(.map)$/));
        return filesWithExtensions.map(fileWithExtensions => {
            return fileWithExtensions.replace(/(\.[^/.]+)+$/, '');
        });
    }

}
