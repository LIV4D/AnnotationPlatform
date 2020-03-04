from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity
from .task_type import TaskType
from .annotation import Annotation, annotations
from .image import Image
from .user import User
from .utilities.collections import if_none, AttributeDict


class Task(Entity):
    id = PRIMARY(JSONAttr.Int())
    taskType = JSONAttr(TaskType)
    annotation = JSONAttr(Annotation)
    isComplete = JSONAttr.Bool()
    isVisible = JSONAttr.Bool()
    comment = JSONAttr.String()
    assignedUser = JSONAttr(User)
    creator = JSONAttr(User)

    @classmethod
    def table(cls):
        return tasks


# Get the tasks in the CLI
# Add field to define the entity
class TaskTable(EntityTable):
    __entity__ = Task

    @cli_method
    @format_entity()
    def create(self, type, annotation, complete=False, visible=True, comment=None, assign_to=None):
        payload = AttributeDict.create(
                    taskTypeId=type.id if isinstance(type, TaskType) else type,
                    isComplete=complete,
                    isVisible=visible,
                    comment=if_none(comment, ""))

        if isinstance(annotation, Annotation):
            annotation = annotation.id
        elif isinstance(annotation, Image):
            annotation = annotations.create(image=annotation).id
        payload.annotationId = annotation

        if isinstance(assign_to, User):
            assign_to = assign_to.id
        if assign_to is not None:
            payload.assignedUserId = assign_to
        return server.post('/api/tasks/create', payload=payload)

    @cli_method
    @format_entity(Task)
    def list(self):
        return server.get('/api/tasks/list/proto')

# request from the server to the controller
    # update the entity
    def _update(self, entity):
        return server.put('/api/tasks/update/%i' % entity.id, payload=entity.to_json(to_str=False))
    # request: send to the server which then send a list of protos
    def _getById(self, indexes):
        return server.get("/api/tasks/get/proto", payload={'ids': indexes})
    # delete the entity
    def _delete(self, id):
        return server.delete('/api/tasks/delete/%i' % id)


tasks = TaskTable()
