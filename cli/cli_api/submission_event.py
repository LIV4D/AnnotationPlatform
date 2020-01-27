from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity

from .user import User


class SubmissionEvent(Entity):
    id = PRIMARY(JSONAttr.Int())
    description = JSONAttr.String()
    date = JSONAttr.String(read_only=True)
    timestamp = JSONAttr.Float()
    user = JSONAttr(User, read_only=True)
    annotation = JSONAttr.Int(read_only=True)
    parentSubmission = JSONAttr.Int(read_only=True)
    childSubmission = JSONAttr.Int(list=True, read_only=True)

    def get_tasks(self):
        from .task import tasks
        return tasks.getById(self.tasks)

    def get_annotation(self):
        from .annotation import annotations
        return annotations.getById(self.annotation)

    def get_parent(self):
        if self.parentSubmission is None:
            return None
        return submissionEvents.getById(self.parentSubmission)

    def get_child(self):
        return submissionEvents.getById(self.childSubmission)

    @classmethod
    def table(cls):
        return submissionEvents


class SubmissionEventTable(EntityTable):
    __entity__ = SubmissionEvent

    @cli_method
    @format_entity(SubmissionEvent)
    def list(self, user=None, image=None):
        payload = dict(user=user, image=image)
        return server.get("/api/submissionEvents/list", payload)

    def _getById(self, indexes):
        return [server.get("/api/submissionEvent/get/:id/proto" % i) for i in indexes]


submissionEvents = SubmissionEvent()
