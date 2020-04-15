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

  // Save the annotations on local
  static save(loadingService: LoadingService, layersService: LayersService): void {
console.log(layersService.biomarkerCanvas);
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
             element.id,
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

  // Read local storage of the annotation

   static async load(loadingService: LoadingService, layersService: LayersService){LocalStorage.clear();
    const str = window.localStorage.getItem(LocalStorageKeys.AllCanvasInfo);
    const json = JSON.parse(str);

    if (!json) {
        loadingService.loadRevision(true);
        return;
    }
    if (!json.biomarkers) {
      return;
    }

    // Recreate Biomarkers
    layersService.biomarkerCanvas.forEach(canvas => {
      canvas.clear();
    });

    layersService.biomarkerCanvas = [];

    json.biomarkers.forEach(element => {
        const imageString:string = element[0];
        const id = element[1];
        const color = element[2];
        const biomarker = document.createElement('canvas') as HTMLCanvasElement;
        const biomarkerImage = new Image();
        biomarkerImage.onload = () => {
            biomarker.width = biomarkerImage.width;
            biomarker.height = biomarkerImage.height;
            biomarker.getContext('2d').drawImage(biomarkerImage, 0, 0);
            layersService.newBiomarker(biomarkerImage, id, color); // Recreate biomarker
        };
        biomarkerImage.src = imageString;
    });

    layersService.biomarkerCanvas.forEach(canvas => {
        canvas.draw();
    }
    );
  }

  static hasAnnotationStored(): boolean{
    let hasAnnotation = false;
    const str = window.localStorage.getItem(LocalStorageKeys.AllCanvasInfo);
    const json = JSON.parse(str);
    const blankImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABLAAAAZACAYAAABpLLv/AAAgAElEQVR4XuzYMREAAAwCseLfdG38kCrgQid2jgABAgQIECBAgAABAgQIECBAgEBYYOFsohEgQIAAAQIECBAgQIAAAQIECBA4A5YnIECAAAECBAgQIECAAAECBAgQSAsYsNL1CEeAAAECBAgQIECAAAECBAgQIGDA8gMECBAgQIAAAQIECBAgQIAAAQJpAQNWuh7hCBAgQIAAAQIECBAgQIAAAQIEDFh+gAABAgQIECBAgAABAgQIECBAIC1gwErXIxwBAgQIECBAgAABAgQIECBAgIAByw8QIECAAAECBAgQIECAAAECBAikBQxY6XqEI0CAAAECBAgQIECAAAECBAgQMGD5AQIECBAgQIAAAQIECBAgQIAAgbSAAStdj3AECBAgQIAAAQIECBAgQIAAAQIGLD9AgAABAgQIECBAgAABAgQIECCQFjBgpesRjgABAgQIECBAgAABAgQIECBAwIDlBwgQIECAAAECBAgQIECAAAECBNICBqx0PcIRIECAAAECBAgQIECAAAECBAgYsPwAAQIECBAgQIAAAQIECBAgQIBAWsCAla5HOAIECBAgQIAAAQIECBAgQIAAAQOWHyBAgAABAgQIECBAgAABAgQIEEgLGLDS9QhHgAABAgQIECBAgAABAgQIECBgwPIDBAgQIECAAAECBAgQIECAAAECaQEDVroe4QgQIECAAAECBAgQIECAAAECBAxYfoAAAQIECBAgQIAAAQIECBAgQCAtYMBK1yMcAQIECBAgQIAAAQIECBAgQICAAcsPECBAgAABAgQIECBAgAABAgQIpAUMWOl6hCNAgAABAgQIECBAgAABAgQIEDBg+QECBAgQIECAAAECBAgQIECAAIG0gAErXY9wBAgQIECAAAECBAgQIECAAAECBiw/QIAAAQIECBAgQIAAAQIECBAgkBYwYKXrEY4AAQIECBAgQIAAAQIECBAgQMCA5QcIECBAgAABAgQIECBAgAABAgTSAgasdD3CESBAgAABAgQIECBAgAABAgQIGLD8AAECBAgQIECAAAECBAgQIECAQFrAgJWuRzgCBAgQIECAAAECBAgQIECAAAEDlh8gQIAAAQIECBAgQIAAAQIECBBICxiw0vUIR4AAAQIECBAgQIAAAQIECBAgYMDyAwQIECBAgAABAgQIECBAgAABAmkBA1a6HuEIECBAgAABAgQIECBAgAABAgQMWH6AAAECBAgQIECAAAECBAgQIEAgLWDAStcjHAECBAgQIECAAAECBAgQIECAgAHLDxAgQIAAAQIECBAgQIAAAQIECKQFDFjpeoQjQIAAAQIECBAgQIAAAQIECBAwYPkBAgQIECBAgAABAgQIECBAgACBtIABK12PcAQIECBAgAABAgQIECBAgAABAgYsP0CAAAECBAgQIECAAAECBAgQIJAWMGCl6xGOAAECBAgQIECAAAECBAgQIEDAgOUHCBAgQIAAAQIECBAgQIAAAQIE0gIGrHQ9whEgQIAAAQIECBAgQIAAAQIECBiw/AABAgQIECBAgAABAgQIECBAgEBawICVrkc4AgQIECBAgAABAgQIECBAgAABA5YfIECAAAECBAgQIECAAAECBAgQSAsYsNL1CEeAAAECBAgQIECAAAECBAgQIGDA8gMECBAgQIAAAQIECBAgQIAAAQJpAQNWuh7hCBAgQIAAAQIECBAgQIAAAQIEDFh+gAABAgQIECBAgAABAgQIECBAIC1gwErXIxwBAgQIECBAgAABAgQIECBAgIAByw8QIECAAAECBAgQIECAAAECBAikBQxY6XqEI0CAAAECBAgQIECAAAECBAgQMGD5AQIECBAgQIAAAQIECBAgQIAAgbSAAStdj3AECBAgQIAAAQIECBAgQIAAAQIGLD9AgAABAgQIECBAgAABAgQIECCQFjBgpesRjgABAgQIECBAgAABAgQIECBAwIDlBwgQIECAAAECBAgQIECAAAECBNICBqx0PcIRIECAAAECBAgQIECAAAECBAgYsPwAAQIECBAgQIAAAQIECBAgQIBAWsCAla5HOAIECBAgQIAAAQIECBAgQIAAAQOWHyBAgAABAgQIECBAgAABAgQIEEgLGLDS9QhHgAABAgQIECBAgAABAgQIECBgwPIDBAgQIECAAAECBAgQIECAAAECaQEDVroe4QgQIECAAAECBAgQIECAAAECBAxYfoAAAQIECBAgQIAAAQIECBAgQCAtYMBK1yMcAQIECBAgQIAAAQIECBAgQICAAcsPECBAgAABAgQIECBAgAABAgQIpAUMWOl6hCNAgAABAgQIECBAgAABAgQIEDBg+QECBAgQIECAAAECBAgQIECAAIG0gAErXY9wBAgQIECAAAECBAgQIECAAAECBiw/QIAAAQIECBAgQIAAAQIECBAgkBYwYKXrEY4AAQIECBAgQIAAAQIECBAgQMCA5QcIECBAgAABAgQIECBAgAABAgTSAgasdD3CESBAgAABAgQIECBAgAABAgQIGLD8AAECBAgQIECAAAECBAgQIECAQFrAgJWuRzgCBAgQIECAAAECBAgQIECAAAEDlh8gQIAAAQIECBAgQIAAAQIECBBICxiw0vUIR4AAAQIECBAgQIAAAQIECBAgYMDyAwQIECBAgAABAgQIECBAgAABAmkBA1a6HuEIECBAgAABAgQIECBAgAABAgQMWH6AAAECBAgQIECAAAECBAgQIEAgLWDAStcjHAECBAgQIECAAAECBAgQIECAgAHLDxAgQIAAAQIECBAgQIAAAQIECKQFDFjpeoQjQIAAAQIECBAgQIAAAQIECBAwYPkBAgQIECBAgAABAgQIECBAgACBtIABK12PcAQIECBAgAABAgQIECBAgAABAgYsP0CAAAECBAgQIECAAAECBAgQIJAWMGCl6xGOAAECBAgQIECAAAECBAgQIEDAgOUHCBAgQIAAAQIECBAgQIAAAQIE0gIGrHQ9whEgQIAAAQIECBAgQIAAAQIECBiw/AABAgQIECBAgAABAgQIECBAgEBawICVrkc4AgQIECBAgAABAgQIECBAgAABA5YfIECAAAECBAgQIECAAAECBAgQSAsYsNL1CEeAAAECBAgQIECAAAECBAgQIGDA8gMECBAgQIAAAQIECBAgQIAAAQJpAQNWuh7hCBAgQIAAAQIECBAgQIAAAQIEDFh+gAABAgQIECBAgAABAgQIECBAIC1gwErXIxwBAgQIECBAgAABAgQIECBAgIAByw8QIECAAAECBAgQIECAAAECBAikBQxY6XqEI0CAAAECBAgQIECAAAECBAgQMGD5AQIECBAgQIAAAQIECBAgQIAAgbSAAStdj3AECBAgQIAAAQIECBAgQIAAAQIGLD9AgAABAgQIECBAgAABAgQIECCQFjBgpesRjgABAgQIECBAgAABAgQIECBAwIDlBwgQIECAAAECBAgQIECAAAECBNICBqx0PcIRIECAAAECBAgQIECAAAECBAgYsPwAAQIECBAgQIAAAQIECBAgQIBAWsCAla5HOAIECBAgQIAAAQIECBAgQIAAAQOWHyBAgAABAgQIECBAgAABAgQIEEgLGLDS9QhHgAABAgQIECBAgAABAgQIECBgwPIDBAgQIECAAAECBAgQIECAAAECaQEDVroe4QgQIECAAAECBAgQIECAAAECBAxYfoAAAQIECBAgQIAAAQIECBAgQCAtYMBK1yMcAQIECBAgQIAAAQIECBAgQICAAcsPECBAgAABAgQIECBAgAABAgQIpAUMWOl6hCNAgAABAgQIECBAgAABAgQIEDBg+QECBAgQIECAAAECBAgQIECAAIG0gAErXY9wBAgQIECAAAECBAgQIECAAAECBiw/QIAAAQIECBAgQIAAAQIECBAgkBYwYKXrEY4AAQIECBAgQIAAAQIECBAgQMCA5QcIECBAgAABAgQIECBAgAABAgTSAgasdD3CESBAgAABAgQIECBAgAABAgQIGLD8AAECBAgQIECAAAECBAgQIECAQFrAgJWuRzgCBAgQIECAAAECBAgQIECAAAEDlh8gQIAAAQIECBAgQIAAAQIECBBICxiw0vUIR4AAAQIECBAgQIAAAQIECBAgYMDyAwQIECBAgAABAgQIECBAgAABAmkBA1a6HuEIECBAgAABAgQIECBAgAABAgQMWH6AAAECBAgQIECAAAECBAgQIEAgLWDAStcjHAECBAgQIECAAAECBAgQIECAgAHLDxAgQIAAAQIECBAgQIAAAQIECKQFDFjpeoQjQIAAAQIECBAgQIAAAQIECBAwYPkBAgQIECBAgAABAgQIECBAgACBtIABK12PcAQIECBAgAABAgQIECBAgAABAgYsP0CAAAECBAgQIECAAAECBAgQIJAWMGCl6xGOAAECBAgQIECAAAECBAgQIEDAgOUHCBAgQIAAAQIECBAgQIAAAQIE0gIGrHQ9whEgQIAAAQIECBAgQIAAAQIECBiw/AABAgQIECBAgAABAgQIECBAgEBawICVrkc4AgQIECBAgAABAgQIECBAgAABA5YfIECAAAECBAgQIECAAAECBAgQSAsYsNL1CEeAAAECBAgQIECAAAECBAgQIGDA8gMECBAgQIAAAQIECBAgQIAAAQJpAQNWuh7hCBAgQIAAAQIECBAgQIAAAQIEDFh+gAABAgQIECBAgAABAgQIECBAIC1gwErXIxwBAgQIECBAgAABAgQIECBAgIAByw8QIECAAAECBAgQIECAAAECBAikBQxY6XqEI0CAAAECBAgQIECAAAECBAgQMGD5AQIECBAgQIAAAQIECBAgQIAAgbSAAStdj3AECBAgQIAAAQIECBAgQIAAAQIGLD9AgAABAgQIECBAgAABAgQIECCQFjBgpesRjgABAgQIECBAgAABAgQIECBAwIDlBwgQIECAAAECBAgQIECAAAECBNICBqx0PcIRIECAAAECBAgQIECAAAECBAgYsPwAAQIECBAgQIAAAQIECBAgQIBAWsCAla5HOAIECBAgQIAAAQIECBAgQIAAAQOWHyBAgAABAgQIECBAgAABAgQIEEgLGLDS9QhHgAABAgQIECBAgAABAgQIECBgwPIDBAgQIECAAAECBAgQIECAAAECaQEDVroe4QgQIECAAAECBAgQIECAAAECBAxYfoAAAQIECBAgQIAAAQIECBAgQCAtYMBK1yMcAQIECBAgQIAAAQIECBAgQICAAcsPECBAgAABAgQIECBAgAABAgQIpAUMWOl6hCNAgAABAgQIECBAgAABAgQIEDBg+QECBAgQIECAAAECBAgQIECAAIG0gAErXY9wBAgQIECAAAECBAgQIECAAAECBiw/QIAAAQIECBAgQIAAAQIECBAgkBYwYKXrEY4AAQIECBAgQIAAAQIECBAgQMCA5QcIECBAgAABAgQIECBAgAABAgTSAgasdD3CESBAgAABAgQIECBAgAABAgQIGLD8AAECBAgQIECAAAECBAgQIECAQFrAgJWuRzgCBAgQIECAAAECBAgQIECAAAEDlh8gQIAAAQIECBAgQIAAAQIECBBICxiw0vUIR4AAAQIECBAgQIAAAQIECBAgYMDyAwQIECBAgAABAgQIECBAgAABAmkBA1a6HuEIECBAgAABAgQIECBAgAABAgQMWH6AAAECBAgQIECAAAECBAgQIEAgLWDAStcjHAECBAgQIECAAAECBAgQIECAgAHLDxAgQIAAAQIECBAgQIAAAQIECKQFDFjpeoQjQIAAAQIECBAgQIAAAQIECBAwYPkBAgQIECBAgAABAgQIECBAgACBtIABK12PcAQIECBAgAABAgQIECBAgAABAgYsP0CAAAECBAgQIECAAAECBAgQIJAWMGCl6xGOAAECBAgQIECAAAECBAgQIEDAgOUHCBAgQIAAAQIECBAgQIAAAQIE0gIGrHQ9whEgQIAAAQIECBAgQIAAAQIECBiw/AABAgQIECBAgAABAgQIECBAgEBawICVrkc4AgQIECBAgAABAgQIECBAgAABA5YfIECAAAECBAgQIECAAAECBAgQSAsYsNL1CEeAAAECBAgQIECAAAECBAgQIGDA8gMECBAgQIAAAQIECBAgQIAAAQJpAQNWuh7hCBAgQIAAAQIECBAgQIAAAQIEDFh+gAABAgQIECBAgAABAgQIECBAIC1gwErXIxwBAgQIECBAgAABAgQIECBAgIAByw8QIECAAAECBAgQIECAAAECBAikBQxY6XqEI0CAAAECBAgQIECAAAECBAgQMGD5AQIECBAgQIAAAQIECBAgQIAAgbSAAStdj3AECBAgQIAAAQIECBAgQIAAAQIGLD9AgAABAgQIECBAgAABAgQIECCQFjBgpesRjgABAgQIECBAgAABAgQIECBAwIDlBwgQIECAAAECBAgQIECAAAECBNICBqx0PcIRIECAAAECBAgQIECAAAECBAgYsPwAAQIECBAgQIAAAQIECBAgQIBAWsCAla5HOAIECBAgQIAAAQIECBAgQIAAAQOWHyBAgAABAgQIECBAgAABAgQIEEgLGLDS9QhHgAABAgQIECBAgAABAgQIECBgwPIDBAgQIECAAAECBAgQIECAAAECaQEDVroe4QgQIECAAAECBAgQIECAAAECBAxYfoAAAQIECBAgQIAAAQIECBAgQCAtYMBK1yMcAQIECBAgQIAAAQIECBAgQICAAcsPECBAgAABAgQIECBAgAABAgQIpAUMWOl6hCNAgAABAgQIECBAgAABAgQIEDBg+QECBAgQIECAAAECBAgQIECAAIG0gAErXY9wBAgQIECAAAECBAgQIECAAAECBiw/QIAAAQIECBAgQIAAAQIECBAgkBYwYKXrEY4AAQIECBAgQIAAAQIECBAgQMCA5QcIECBAgAABAgQIECBAgAABAgTSAgasdD3CESBAgAABAgQIECBAgAABAgQIGLD8AAECBAgQIECAAAECBAgQIECAQFrAgJWuRzgCBAgQIECAAAECBAgQIECAAAEDlh8gQIAAAQIECBAgQIAAAQIECBBICxiw0vUIR4AAAQIECBAgQIAAAQIECBAgYMDyAwQIECBAgAABAgQIECBAgAABAmkBA1a6HuEIECBAgAABAgQIECBAgAABAgQMWH6AAAECBAgQIECAAAECBAgQIEAgLWDAStcjHAECBAgQIECAAAECBAgQIECAgAHLDxAgQIAAAQIECBAgQIAAAQIECKQFDFjpeoQjQIAAAQIECBAgQIAAAQIECBAwYPkBAgQIECBAgAABAgQIECBAgACBtIABK12PcAQIECBAgAABAgQIECBAgAABAgYsP0CAAAECBAgQIECAAAECBAgQIJAWMGCl6xGOAAECBAgQIECAAAECBAgQIEDAgOUHCBAgQIAAAQIECBAgQIAAAQIE0gIGrHQ9whEgQIAAAQIECBAgQIAAAQIECBiw/AABAgQIECBAgAABAgQIECBAgEBawICVrkc4AgQIECBAgAABAgQIECBAgAABA5YfIECAAAECBAgQIECAAAECBAgQSAsYsNL1CEeAAAECBAgQIECAAAECBAgQIGDA8gMECBAgQIAAAQIECBAgQIAAAQJpAQNWuh7hCBAgQIAAAQIECBAgQIAAAQIEDFh+gAABAgQIECBAgAABAgQIECBAIC1gwErXIxwBAgQIECBAgAABAgQIECBAgIAByw8QIECAAAECBAgQIECAAAECBAikBQxY6XqEI0CAAAECBAgQIECAAAECBAgQMGD5AQIECBAgQIAAAQIECBAgQIAAgbSAAStdj3AECBAgQIAAAQIECBAgQIAAAQIGLD9AgAABAgQIECBAgAABAgQIECCQFjBgpesRjgABAgQIECBAgAABAgQIECBAwIDlBwgQIECAAAECBAgQIECAAAECBNICBqx0PcIRIECAAAECBAgQIECAAAECBAgYsPwAAQIECBAgQIAAAQIECBAgQIBAWsCAla5HOAIECBAgQIAAAQIECBAgQIAAAQOWHyBAgAABAgQIECBAgAABAgQIEEgLGLDS9QhHgAABAgQIECBAgAABAgQIECBgwPIDBAgQIECAAAECBAgQIECAAAECaQEDVroe4QgQIECAAAECBAgQIECAAAECBAxYfoAAAQIECBAgQIAAAQIECBAgQCAtYMBK1yMcAQIECBAgQIAAAQIECBAgQICAAcsPECBAgAABAgQIECBAgAABAgQIpAUMWOl6hCNAgAABAgQIECBAgAABAgQIEDBg+QECBAgQIECAAAECBAgQIECAAIG0gAErXY9wBAgQIECAAAECBAgQIECAAAECBiw/QIAAAQIECBAgQIAAAQIECBAgkBYwYKXrEY4AAQIECBAgQIAAAQIECBAgQMCA5QcIECBAgAABAgQIECBAgAABAgTSAgasdD3CESBAgAABAgQIECBAgAABAgQIGLD8AAECBAgQIECAAAECBAgQIECAQFrAgJWuRzgCBAgQIECAAAECBAgQIECAAAEDlh8gQIAAAQIECBAgQIAAAQIECBBICxiw0vUIR4AAAQIECBAgQIAAAQIECBAgYMDyAwQIECBAgAABAgQIECBAgAABAmkBA1a6HuEIECBAgAABAgQIECBAgAABAgQMWH6AAAECBAgQIECAAAECBAgQIEAgLWDAStcjHAECBAgQIECAAAECBAgQIECAgAHLDxAgQIAAAQIECBAgQIAAAQIECKQFDFjpeoQjQIAAAQIECBAgQIAAAQIECBAwYPkBAgQIECBAgAABAgQIECBAgACBtIABK12PcAQIECBAgAABAgQIECBAgAABAgYsP0CAAAECBAgQIECAAAECBAgQIJAWMGCl6xGOAAECBAgQIECAAAECBAgQIEDAgOUHCBAgQIAAAQIECBAgQIAAAQIE0gIGrHQ9whEgQIAAAQIECBAgQIAAAQIECBiw/AABAgQIECBAgAABAgQIECBAgEBawICVrkc4AgQIECBAgAABAgQIECBAgAABA5YfIECAAAECBAgQIECAAAECBAgQSAsYsNL1CEeAAAECBAgQIECAAAECBAgQIGDA8gMECBAgQIAAAQIECBAgQIAAAQJpAQNWuh7hCBAgQIAAAQIECBAgQIAAAQIEDFh+gAABAgQIECBAgAABAgQIECBAIC1gwErXIxwBAgQIECBAgAABAgQIECBAgIAByw8QIECAAAECBAgQIECAAAECBAikBQxY6XqEI0CAAAECBAgQIECAAAECBAgQMGD5AQIECBAgQIAAAQIECBAgQIAAgbSAAStdj3AECBAgQIAAAQIECBAgQIAAAQIGLD9AgAABAgQIECBAgAABAgQIECCQFjBgpesRjgABAgQIECBAgAABAgQIECBAwIDlBwgQIECAAAECBAgQIECAAAECBNICBqx0PcIRIECAAAECBAgQIECAAAECBAgYsPwAAQIECBAgQIAAAQIECBAgQIBAWsCAla5HOAIECBAgQIAAAQIECBAgQIAAAQOWHyBAgAABAgQIECBAgAABAgQIEEgLGLDS9QhHgAABAgQIECBAgAABAgQIECBgwPIDBAgQIECAAAECBAgQIECAAAECaQEDVroe4QgQIECAAAECBAgQIECAAAECBAxYfoAAAQIECBAgQIAAAQIECBAgQCAtYMBK1yMcAQIECBAgQIAAAQIECBAgQICAAcsPECBAgAABAgQIECBAgAABAgQIpAUMWOl6hCNAgAABAgQIECBAgAABAgQIEDBg+QECBAgQIECAAAECBAgQIECAAIG0gAErXY9wBAgQIECAAAECBAgQIECAAAECBiw/QIAAAQIECBAgQIAAAQIECBAgkBYwYKXrEY4AAQ"

    if (!json || !json.biomarkers) {
      return hasAnnotation;
    }

    json.biomarkers.forEach(element => {
        const imageString:string = element[0];
        if (imageString !== null && imageString !== undefined && !imageString.startsWith(blankImage)){
          hasAnnotation = true;
        }
      });
    return hasAnnotation;
  }
}
