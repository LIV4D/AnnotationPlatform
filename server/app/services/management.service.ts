import { injectable } from 'inversify';
import fs = require('fs');
import path = require('path');

@injectable()
export class ManagementService {
    private modelDirectoryName = '../models/';

    public async listAllModels(): Promise<string[]> {
        this.modelDirectoryName = path.resolve(__dirname, this.modelDirectoryName);
        let filesWithExtensions = await fs.readdirSync(this.modelDirectoryName).map(file => {
            return file;
        });
        filesWithExtensions = filesWithExtensions.filter( (file) => !file.match(/(.map)$/));
        return filesWithExtensions.map(fileWithExtensions => {
            return fileWithExtensions.replace(/(\.[^/.]+)+$/, '');
        });
    }

}
