from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity


class Widget(Entity):
    id = PRIMARY(JSONAttr.Int())
    annotationId = JSONAttr.Int()
    label = JSONAttr.String()
    type = JSONAttr.String()
    defaultEntryValue = JSONAttr.String()
    validationRegex = JSONAttr.String()
    entryField = JSONAttr.String()

    def __str__(self):
        return '['+self.role+'] '+self.firstName + ' ' + self.lastName


class WidgetTable(EntityTable):
    __entity__ = Widget

    @cli_method
    @format_entity()
    def create(self, annotationId, label, type, defaultEntryValue, validationRegex):
        payload = dict(annotationId=annotationId, label=label, type=type,
                       defaultEntryValue=defaultEntryValue, validationRegex=validationRegex)
        return server.post('/api/widgets/create', payload=payload)

    @cli_method
    def delete(self, user):
        if isinstance(user, Widget):
            user = user.primary_key_value()
        return server.delete('/api/widgets/delete/%i' % user)

    # @cli_method
    # @format_entity()
    # def list(self):
    #     return server.get('/api/users/list')

    def _update(self, entity):
        return server.put('/api/widgets/update/%i' % entity.id, payload=entity.to_json(to_str=False))

    # def _getById(self, indexes):
    #     return [server.get('/api/users/get/%i' % i) for i in indexes]


widgets = WidgetTable()
