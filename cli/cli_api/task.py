from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity
from .task_type import TaskType
from .annotation import Annotation, annotations
from .user import User
from .utilities.collections import if_none, AttributeDict


class Task(Entity):
    id = PRIMARY(JSONAttr.Int())
    type = JSONAttr(TaskType)
    annotation = JSONAttr(Annotation)
    isComplete = JSONAttr.Bool()
    isVisible = JSONAttr.Bool()
    comment = JSONAttr.String()
    assignedUser = JSONAttr(User)
    creatorUser = JSONAttr(User)

    @classmethod
    def table(cls):
        return tasks


class TaskTable(EntityTable):
    __entity__ = Task

    @cli_method
    def create(self, type, annotation=None, complete=False, visible=True, comment=None, assign_to=None):
        payload = AttributeDict.create(
                    type=type.id if isinstance(type, TaskType) else type,
                    isComplete=complete,
                    isVisible=visible,
                    comment=if_none(comment, ""))

        if annotation is None:
            annotation = annotations.create()
        if isinstance(annotation, Annotation):
            annotation = annotation.id
        payload.annotation = annotation

        if isinstance(assign_to, User):
            assign_to = assign_to.id
        if assign_to is not None:
            payload.assignedUser = assign_to
        return server.post('/api/tasks/create', payload=payload)

    @cli_method
    @format_entity(Task)
    def list(self):
        return server.get('/api/tasks/list/proto')

    def _update(self, entity):
        return server.put('/api/tasks/update/%i' % entity.id, payload=entity.to_json(to_str=False))

    def _getById(self, indexes):
        return server.get("/api/tasks/get/proto", payload={'ids': indexes})


tasks = TaskTable()
