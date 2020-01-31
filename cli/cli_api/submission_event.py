from .server import server
from .entity_api import EntityTable, Entity, JSONAttr, PRIMARY, cli_method, format_entity

from .user import User


class SubmissionEvent(Entity):
    id = PRIMARY(JSONAttr.Int())
    description = JSONAttr.String()
    date = JSONAttr.String(read_only=True)
    timestamp = JSONAttr.Float()
    user = JSONAttr(User, read_only=True)
    parentEvent = JSONAttr.SameClass(read_only=True)

    @classmethod
    def table(cls):
        return submissionEvents


class SubmissionEventTable(EntityTable):
    __entity__ = SubmissionEvent

    @cli_method
    @format_entity()
    def list(self, user=None, image=None):
        payload = dict(user=user, image=image)
        return server.get("/api/submissionEvents/list/proto", payload)

    def _getById(self, indexes):
        return server.get("/api/submissionEvents/get/proto", payload={'ids': indexes})


submissionEvents = SubmissionEvent()
