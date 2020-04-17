import * as filesystem from 'fs';

/**
 * Searches for a file within the specified folderPath with a filename that is the same as the name and return the full path if it exsists.
 * @param name the name of the file that is being searched for.
 * @param folderPath a folder within the user's system
 * @returns the path of the specified file or null if the file doesn't exist
 */
export function searchFileByName(name: string, folderPath: string): string {

    let filename = null;
    const files = filesystem.readdirSync(folderPath);

    files.some(file => {
        // Search for a file with a name equal to name (without the extension).;
        if (file.substr(0, file.lastIndexOf('.')) === name) {
            filename = file;
            return true;
        }
        return false;
    });

    return filename;
}
