from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity
from .utilities.collections import recursive_dict, dict_deep_copy
from copy import deepcopy


class Image(Entity):
    id = PRIMARY(JSONAttr.Int())
    preprocessing = JSONAttr.Bool()
    metadata = JSONAttr.Dict()
    type = JSONAttr.String()

    def download_image(self, out=None):
        return server.request_image('/api/images/raw/%i' % self.id, out=out)

    def download_preprocessing(self, out=None):
        return server.request_image('/api/images/preproc/%i' % self.id, out=out)
    
    def update_image(self, path):
        return server.send_file('/api/images/updateFile/%i' % self.id, 'image', path)
    
    def update_preprocessing(self, path):
        return server.send_file('/api/images/updatePreprocessing/%i' % self.id, 'preprocessing', path)
        

    @classmethod
    def table(cls):
        return images


class ImageTable(EntityTable):
    __entity__ = Image

    @cli_method
    @format_entity()
    def create(self, path, type, metadata=None, preprocessing=None):
        files = {'image': path}
        if preprocessing:
            files['preprocessing'] = preprocessing
        payload = {'metadata': metadata if metadata else {},
                   'type': type}
        return server.send_files('/api/images/createCLI', files, payload=payload)

    @cli_method
    @format_entity()
    def list(self):
        return server.get('/api/images/list/proto')

    def _getById(self, indexes):
        return server.get('/api/images/get/proto', payload={'ids': indexes})

    def _update(self, entity):
        return server.put('/api/images/update/%i' % entity.id, payload=entity.to_json(to_str=False))

    def _delete(self, id):
        return server.delete('/api/images/delete/%i' % id)

    def batch_upload(self, folder, type, preprocessing_folder=None, biomarkers=None):
        from tqdm import tqdm
        from PIL import Image
        import os
        imgs = []
        for f in os.listdir(folder):
            try:
                Image.open(os.path.join(folder, f))
            except IOError:
                pass
            else:
                imgs.append(f)
        for f in tqdm(imgs, desc="Uploading images"):
            if preprocessing_folder:
                preprocessing = os.path.join(preprocessing_folder, f)
                if not os.path.exists(preprocessing):
                    preprocessing = None
            db_img = self.create(os.path.join(folder, f), type=type, preprocessing=preprocessing)
            if biomarkers:
                import numpy as np
                from .annotation import annotations, AnnotationData
                def rec(bio):
                    if isinstance(bio, (list, tuple)):
                        for b in bio:
                            rec(b)
                    else:
                        if 'biomarkers' in bio:
                            for b in bio['biomarkers']:
                                rec(b)
                        if 'dataImage' in bio:
                            bio['dataImage'] = os.path.join(bio['dataImage'], f)
            
                bio = deepcopy(biomarkers) 
                rec(bio)
                
                # biomarkers = recursive_dict(biomarkers, lambda _, path: os.path.join(path, f))
                img = Image.open(os.path.join(folder, f))
                default_biomarker = np.zeros(img.size, dtype=np.uint8)
                annotations.create(db_img, data=AnnotationData.create(biomarkers=bio, default_biomarker=default_biomarker))

    def export_seed(self, path):
        self._dumps_to_json("/api/images/list", ('id', 'preprocessing', 'type', 'metadata', 'data'), path)


images = ImageTable()
