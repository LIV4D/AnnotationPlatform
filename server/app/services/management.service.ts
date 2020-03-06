import { injectable } from 'inversify';
import fs = require('fs');

@injectable()
export class ManagementService {
    private readonly modelDirectoryName = '../models/';

    public async listAllModels(): Promise<string[]> {
        const filesWithExtensions = await fs.readdirSync(this.modelDirectoryName).map(file => {
            return file;
        });
        return filesWithExtensions.map(fileWithExtensions => {
            return fileWithExtensions.replace(/(\.[^/.]+)+$/, '');
        });
    }

}
