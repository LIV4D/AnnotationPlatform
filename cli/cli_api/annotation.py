from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity, JSONClass
from .image import Image
from .submission_event import SubmissionEvent
from .utilities.collections import is_dict, if_none


class AnnotationData(JSONClass):
    biomarkers = JSONAttr.Dict()
    hierarchy = JSONAttr.Dict()
    nongraphic = JSONAttr.Dict()

    @staticmethod
    def create(biomarkers=None, nongraphic=None):
        if nongraphic is None:
            nongraphic = {}

        bio = {}
        hierarchy = {}
        if biomarkers:
            # Parse hierarchy
            def parse_hierarchy(model):
                hierarchy = {}
                for k, v in model.items():
                    if is_dict(v):
                        hierarchy[k] = parse_hierarchy(v)
                    else:
                        bio[k] = v
                return hierarchy
            hierarchy = parse_hierarchy(biomarkers)

            # Parse biomarkers
            # for k, v in bio.items():
            #    if v

        return AnnotationData(biomarkers=bio, hierarchy=hierarchy, nongraphic=nongraphic)


class Annotation(Entity):
    id = PRIMARY(JSONAttr.Int())
    comment = JSONAttr.String()
    image = JSONAttr(Image, read_only=True)
    submitEvent = JSONAttr(SubmissionEvent, read_only=True)

    def get_data(self):
        data = server.get('/api/annotations/%i/data' % self.id)
        return AnnotationData.from_json(data)

    @classmethod
    def table(cls):
        return annotations


class AnnotationTable(EntityTable):
    __entity__ = Annotation

    @cli_method
    def create(image: int, comment: str = None, data: AnnotationData = None):
        if isinstance(image, Image):
            image = image.id
        comment = if_none(comment, "")
        payload = dict(comment=comment, imageId=image,
                       data=data.to_json(to_str=False))
        return server.post("/api/annotation/create", payload)

    @cli_method
    @format_entity()
    def list(self):
        return server.get('/api/annotations/list/proto')

    def _getById(self, indexes):
        return server.get('/api/annotation/get/proto', payload={'ids': indexes})

    def _update(self, entity):
        return server.put('/api/annotations/update/%i' % entity.id, payload=entity.to_json(to_str=False))


annotations = AnnotationTable()
