from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity


class TaskType(Entity):
    id = PRIMARY(JSONAttr.Int())
    title = JSONAttr.String()
    description = JSONAttr.String()

    tasks = JSONAttr.Int(list=True)

    def get_tasks(self):
        from .task import tasks
        return tasks.getById(self.tasks)

    @classmethod
    def table(cls):
        return taskTypes


class TaskTypeTable(EntityTable):
    __entity__ = TaskType

    @cli_method
    def create(self, title, description):
        payload = dict(title=title, description=description)
        return server.post('/api/taskTypes/create', payload=payload)

    @cli_method
    @format_entity(TaskType)
    def list(self):
        return server.get('/api/taskTypes/list')

    def _update(self, entity):
        server.post('/api/taskTypes/update/%i' % entity.id, payload=entity.to_json(to_str=False))

    def _getById(self, indexes):
        return [server.get('/api/taskTypes/%i' % i) for i in indexes]


taskTypes = TaskTypeTable()
