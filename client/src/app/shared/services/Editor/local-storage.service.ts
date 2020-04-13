import { EditorService } from './editor.service';
import { LayersService } from './layers.service';
import { LoadingService } from './Data-Persistence/loading.service';

enum LocalStorageKeys {
  ImageId = 'imageId',
  AllCanvasInfo = 'canvasInfo'
}

export class LocalStorage {
  constructor() {}

  static lastSavedImageId(): string | null {
    if (window.localStorage.getItem(LocalStorageKeys.ImageId)) {
      return window.localStorage.getItem(LocalStorageKeys.ImageId);
    }
    return null;
  }

  static clear(): void {
    window.localStorage.removeItem(LocalStorageKeys.AllCanvasInfo);
    window.localStorage.removeItem(LocalStorageKeys.ImageId);
  }

  static resetImageId(imageId): void {
    window.localStorage.removeItem(LocalStorageKeys.AllCanvasInfo);
    window.localStorage.setItem(LocalStorageKeys.ImageId, imageId);
  }

  static save(loadingService: LoadingService, layersService: LayersService): void {
    // No save for local files or if nothing is loaded
    if (!loadingService.getImageId() || loadingService.getImageId() === 'local') {
      return;
    }
    const biomarkers = layersService.biomarkerCanvas;

    // Convert values to strings
    const encodedBiomarkers: [string, string, string][] = []; // [image, id, color]
    biomarkers.forEach(element => {
         encodedBiomarkers.push([
             element.currentCanvas.toDataURL('image/png'),
             element.id.substr(11), // remove 'annotation-' from the id
             element.color
         ]);
     });

    // Save string values in json
    const json = {
      biomarkers: encodedBiomarkers
    };

    // Save json as string
    const str = JSON.stringify(json);
    window.localStorage.setItem(LocalStorageKeys.AllCanvasInfo, str);
    window.localStorage.setItem(LocalStorageKeys.ImageId, loadingService.getImageId());
  }

  static load(loadingService: LoadingService, layersService: LayersService, width: number, height: number): void {
    // Read local storage\\

    const str = window.localStorage.getItem(LocalStorageKeys.AllCanvasInfo);

    const json = JSON.parse(str);
    if (!json) {
        loadingService.loadRevision(true);
        return;
    }
    if (!json.biomarkers) {
        return;
    }

    // Recreate biomarkers
    layersService.biomarkerCanvas.forEach(canvas => {
        canvas.clear();
    });
    layersService.biomarkerCanvas = [];
    json.biomarkers.forEach(element => {
        const imageString = element[0];
        const id = element[1];
        const color = element[2];
        const biomarker = document.createElement('canvas') as HTMLCanvasElement;
        const biomarkerImage = new Image();
        biomarkerImage.onload = () => {
            biomarker.width = biomarkerImage.width;
            biomarker.height = biomarkerImage.height;
            biomarker.getContext('2d').drawImage(biomarkerImage, 0, 0);
            layersService.newBiomarker(biomarkerImage, id, color);
        };
        biomarkerImage.src = imageString;
    });

    layersService.biomarkerCanvas.forEach(canvas => {
        canvas.draw();
    });
  }

}
