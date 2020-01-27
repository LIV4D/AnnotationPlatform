from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity
from .task_type import TaskType
from .user import User
from .image import Image


class Task(Entity):
    id = PRIMARY(JSONAttr.Int())
    type = JSONAttr(TaskType)
    user = JSONAttr(User)
    image = JSONAttr(Image)
    isCompleted = JSONAttr.Bool()
    isVisible = JSONAttr.Bool()
    comment = JSONAttr.String()

    annotation = JSONAttr.Int()

    def get_annotation(self):
        from .annotation import annotations
        return annotations.getById(self.annotation)

    @classmethod
    def table(cls):
        return tasks


class TaskTable(EntityTable):
    __entity__ = Task

    @cli_method
    def create(self, firstname, lastname, email, password, is_admin=False):
        payload = dict(firstname=firstname, lastname=lastname, email=email,
                       password=password, isAdmin=is_admin)
        return server.post('/api/users/create', payload=payload)

    @cli_method
    @format_entity(Task)
    def list(self):
        return server.get('/api/users/list')

    def _update(self, entity):
        server.put('/api/users/update/%i' % entity.id, payload=entity.to_json(to_str=False))

    def _getById(self, indexes):
        return [server.get('/api/tasks/%i/proto' % i) for i in indexes]


tasks = TaskTable()
