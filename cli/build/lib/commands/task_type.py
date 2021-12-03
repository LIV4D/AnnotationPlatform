import click
from . import utils

@click.group(name='taskType', help='Commands to manage the task types')
def task_type():
    pass

@task_type.command(name='create', help='Creates a new task type')
@click.option('--name', help='Name of the task type')
@click.option('--description', help='Description of the task type')
def _create(name, description):
    create(name, description, True)

def create(name, description, display=False):
    payload = { 'name': name, 'description': description }
    response = utils.request_server('POST', '/api/taskTypes', payload)
    if response.status_code == 200 and display:
        print('Task type {!s} has been created.'.format(response.json()))
    elif display:
        print(response.json()['message'])
    return response.json()

@task_type.command(name='update', help='Updates a new task type')
@click.option('--id', help='Id of the task type to update')
@click.option('--name', help='Name of the task type', required=False)
@click.option('--description', help='Description of the task type', required=False)
def _update(id, name, description):
    update(id, name, description, True)

def update(id, name=None, description=None):
    payload = {}
    if name is not None:
        payload['name'] = name
    if description is not None:
        payload['description'] = description
    if not payload:
        return
    
    response = utils.request_server('POST', '/api/taskTypes/{}'.format(id), payload)
    return response.json()

@task_type.command(name='list', help='Lists every task types in the database')
def _list_task_types():
    list_task_types(True)

def list_task_types(display=False):
    response = utils.request_server('GET', '/api/taskTypes')
    if display:
        print('Task types table')
        utils.pretty_print_table(response.json())
    return response.json()
