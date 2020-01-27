from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity


class User(Entity):
    id = PRIMARY(JSONAttr.Int())
    email = JSONAttr.String()
    firstName = JSONAttr.String()
    lastName = JSONAttr.String()
    isAdmin = JSONAttr.Bool()

    @classmethod
    def table(cls):
        return users


class UserTable(EntityTable):
    __entity__ = User

    @cli_method
    @format_entity(User)
    def create(self, firstname, lastname, email, password, is_admin=False):
        payload = dict(firstName=firstname, lastName=lastname, email=email,
                       password=password, isAdmin=is_admin)
        return server.post('/api/users/create', payload=payload)

    @cli_method
    def delete(self, user):
        if isinstance(user, User):
            user = user.primary_key_value()
        return server.delete('/api/users/delete/%i' % user)

    @cli_method
    @format_entity(User)
    def list(self):
        return server.get('/api/users/list')

    def _update(self, entity):
        server.put('/api/users/update/%i'%entity.id, payload=entity.to_json(to_str=False))

    def _getById(self, indexes):
        return [server.get('/api/users/%i' % i) for i in indexes]


users = UserTable()
