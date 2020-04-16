from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity, JSONClass
from .image import Image
from .submission_event import SubmissionEvent
from .utilities.collections import is_dict, if_none
import os


class AnnotationData(JSONClass):
    biomarkers = JSONAttr.List()
    nongraphic = JSONAttr.Dict()

    @staticmethod
    def create(biomarkers=None, nongraphic=None, biomarkers_thresholding=None, default_biomarker=None):
        if nongraphic is None:
            nongraphic = {}

        if biomarkers:
            if isinstance(biomarkers, (list, tuple)):
                def recursive_parse(biomarkers):
                    for b in biomarkers:
                        if is_dict(b):
                            if 'biomarkers' in b:
                                recursive_parse(b['biomarkers'])
                            elif 'dataImage' in b:
                                b['dataImage'] = AnnotationData.biomarker_to_png(b['dataImage'], default=default_biomarker, color=b['color'])
                recursive_parse(biomarkers)
            elif is_dict(biomarkers):
                def recursive_parse(biomarkers):
                    parsed_biomarkers = []
                    for b_key, b_value in biomarkers.items():
                        if is_dict(b_value):
                            parsed_biomarkers.append(dict(type=b_key, biomarkers=recursive_parse(b_value)))
                        else:
                            dataImage = AnnotationData.biomarker_to_png(b_value, default=default_biomarker)
                            if dataImage:
                                parsed_biomarkers.append(dict(type=b_key, dataImage=dataImage))
                    return parsed_biomarkers

                biomarkers = recursive_parse(biomarkers)
        else:
            biomarkers = []

        return AnnotationData(biomarkers=biomarkers, nongraphic=nongraphic)

    @staticmethod
    def biomarker_to_png(b, color=None, thresholding=None, default=None):
        from .utilities.image import encode_png
        import numpy as np

        if isinstance(b, str):
            try:
                if b.startswith('data:image/'):
                    return b
                elif os.path.exists(b):
                    from PIL import Image
                    img = Image.open(b)
                    img_data = np.array(img)
                    if thresholding:
                        img_data = thresholding(img_data)
                    else:
                        if img.mode == "RGBA":
                            img_data = (img_data[..., 3]*img_data.mean(axis=2)) > 127
                        elif img.mode == "RGB":
                            img_data = img_data.mean(axis=-1) > 127
                        else:
                            while img_data.ndim > 2:
                                img_data = img_data.mean()
                            img_data = img_data != 0
                else:
                    raise ValueError("Invalid image path: %s" % b)
            except Exception as e:
                print(e)
                if default is None:
                    raise e
                img_data = default
            
            return encode_png(img_data, color)
        elif isinstance(b, np.ndarray):
            if b.ndim > 2:
                raise ValueError('Invalid biomarker data: the image has multiple channels.')
            return encode_png(b)
        raise ValueError('Invalid biomarker definition:\n' + repr(b))



class Annotation(Entity):
    id = PRIMARY(JSONAttr.Int())
    comment = JSONAttr.String()
    image = JSONAttr(Image, read_only=True)
    submitEvent = JSONAttr(SubmissionEvent, read_only=True)
    data = JSONAttr(AnnotationData, optional=True)

    def download_data(self):
        self.data = AnnotationData.from_json(server.get('/api/annotations/get/%i/data' % self.id).json())
        return self.data

    @classmethod
    def table(cls):
        return annotations

    def __str__(self):
        return 'img=%i, %s' % (self.image.id, self.submitEvent.user)


class AnnotationTable(EntityTable):
    __entity__ = Annotation

    @cli_method
    @format_entity()
    def create(self, image: int, comment: str = None, data: AnnotationData = None):
        if isinstance(image, Image):
            image = image.id
        comment = if_none(comment, "")
        payload = dict(comment=comment, imageId=image)
        if data is not None:
            payload['data'] = data.to_json(to_str=False)
        return server.post("/api/annotations/create", payload=payload)

    @cli_method
    @format_entity()
    def list(self):
        return server.get('/api/annotations/list/proto')

    def _getById(self, indexes):
        return server.get('/api/annotations/get/proto', payload={'ids': indexes})

    def _update(self, entity):
        return server.put('/api/annotations/update/%i' % entity.id, payload=entity.to_json(to_str=False))
    
    def export_seed(self, path):
        self._dumps_to_json("/api/annotations/list", ('id', 'imageId', 'submitEventId', 'comment', 'data'), path)


annotations = AnnotationTable()
