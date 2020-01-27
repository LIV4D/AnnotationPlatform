import * as fs from 'fs';


export function searchFileByName(name: string, folderPath: string): string{
    let filename = null;
    const files = fs.readdirSync(folderPath);

    files.some(f => {
        // Search for a file with a name equal to imageId (without the extension).
        if(f.substr(0, f.lastIndexOf('.')) === name){
            filename = f;
            return true;
        }
        return false;
    });

    return filename;
}
