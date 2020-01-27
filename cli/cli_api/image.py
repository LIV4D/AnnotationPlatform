from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity


class Image(Entity):
    id = PRIMARY(JSONAttr.Int())
    preprocessing = JSONAttr.Bool()
    metadata = JSONAttr.Dict()
    type = JSONAttr.String()

    def download_image(self, out=None):
        return server.request_image('/api/images/raw/%i'%self.id, out=out)

    def download_preprocessing(self, out=None):
        return server.request_image('/api/images/preproc/%i'%self.id, out=out)

    @classmethod
    def table(cls):
        return images


class ImageTable(EntityTable):
    __entity__ = Image

    @cli_method
    @format_entity(Image)
    def create(self, path, type, metadata=None, preprocessing=None):
        files = {'image': path}
        if preprocessing:
            files['preprocessing'] = preprocessing
        payload = {'metadata': metadata if metadata else {},
                   'type': type}
        return server.send_files('/api/images/create', files, payload=payload)

    @cli_method
    @format_entity(Image)
    def list(self):
        return server.get('/api/images/list/prototype')

    def _update(self, entity):
        server.put('/api/images/update/%i' % entity.id, payload=entity.to_json(to_str=False))

    def _delete(self, id):
        return server.delete('/api/images/delete/%i' % id)

    def _getById(self, indexes):
        return [server.get('/api/images/%i'%i) for i in indexes]


images = ImageTable()
