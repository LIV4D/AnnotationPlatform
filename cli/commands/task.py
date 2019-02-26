import click
from . import utils
from collections import OrderedDict

@click.group(help='Commands to manage tasks')
def task():
    pass

@task.command(name='create', help='Create a new task')
@click.option('--imageId', 'image_id', help='Id of the image associated to the task', required=True)
@click.option('--taskTypeId', 'task_type_id', help='Id of the task type', required=True)
@click.option('--userId', 'user_id', help='Id of the user receiving the task', required=True)
@click.option('--limit_biomarkers', 'limit_biomarkers', help='Limit the task to specific biomarkers', required=False, default='')
@click.option('--active', help='Boolean specifying if the task is active (default=true)', required=False, default=True)
@click.option('--completed', help='Boolean specifying if the task is completed (default=false)', required=False, default=False)
def _create(image_id, task_type_id, user_id, limit_biomarkers, active, completed):
    create(image_id, task_type_id, user_id, limit_biomarkers, utils.to_boolean(active), utils.to_boolean(completed), True)

def create(image_id, task_type_id, user_id, limit_biomarkers=None, active=True, completed=False, display=True):
    if limit_biomarkers is None:
        limit_biomarkers = ''
    payload = { 'imageId': image_id, 'taskTypeId': task_type_id, 'userId': user_id,
        'active': str(active).lower(), 'completed': str(completed).lower() }
    response = utils.request_server('POST', '/api/tasks', payload)
    if response.status_code == 200:
        if limit_biomarkers:
            if isinstance(limit_biomarkers, (list, tuple)):
                ','.join(limit_biomarkers)
            from . import revision
            revision.update_diagnostic('[onlyEnable=%s]' % limit_biomarkers, user_id=user_id, image_id=image_id)
        if display:
            print('Task {!s} has been created.'.format(response.json()))
    elif display:
        print(response.json()['message'])
    return response.json()

@task.command(name='list', help='Lists the existing tasks in the database')
@click.option('--userId', 'user_id', help='Id to list only the tasks of a user (not required)', required=False)
def _list_task(user_id=None):
    list_task(user_id, True)

def list_task(user_id=None, display=False):
    if user_id is not None:
        response = utils.request_server('GET', '/api/tasks/list/{}'.format(user_id))
    else:
        response = utils.request_server('GET', '/api/tasks/list')
    if display:
        print('Tasks table')
        pretty_data = [OrderedDict([
                            ('id', _['id']), 
                            ('user', _['user']['name']), 
                            ('img', _.get('image', {'id': '?'})['id']),
                            ('active', '  X' if _['active'] else ' '),
                            ('completed', '    X' if _['completed'] else ' ')
                        ]) for _ in response.json()]
        utils.pretty_print_table(pretty_data)
    return response.json()

@task.command(name='update', help='Updates an existing task in the database')
@click.option('--taskId', 'task_id', help='Id to identify the task', required=True)
@click.option('--completed', help='Completion of the task (true or false)', required=True)
def _update(task_id, completed):
    update(task_id, completed, True)

def update(task_id, completed, display=False):
    payload = { 'completed': completed }
    response = utils.request_server('PUT', '/api/tasks/{}'.format(task_id), payload)
    if display and response.status_code == 200:
        print('The task with id {} has been updated successfully.'.format(task_id))
    return True if response.status_code == 200 else print(response.json()['message'])

@task.command(name='delete', help='Deletes an existing task in the database')
@click.option('--taskId', 'task_id', help='Id to identify the task', required=True)
def _delete(task_id):
    delete(task_id, True)

def delete(task_id, display=False):
    response = utils.request_server('DELETE', '/api/tasks/{}'.format(task_id))
    if display and response.status_code == 204:
        print('The task with id {} has been deleted successfully.'.format(task_id))
    return True if response.status_code == 204 else print(response.json()['message'])
