from .annotation import annotations
from .image import images
from .submission_event import submissionEvents
from .task_type import taskTypes
from .task import tasks
from .user import users
from .server import server
from . import config


class cli:
    annotations = annotations
    images = images
    submission_events = submissionEvents
    task_types = taskTypes
    tasks = tasks
    users = users
    server = server
    config = config
