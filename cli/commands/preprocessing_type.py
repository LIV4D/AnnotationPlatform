import click
from . import utils

@click.group(name='preprocessingType', help='Commands to manage preprocessing types stored in the database')
def preprocessing_type():
    pass

@preprocessing_type.command(name='create', help='Creates a preprocessing type')
@click.option('--name', help='Name of the preprocessing type')
@click.option('--description', help='Description of the preprocessing type')
def _create(name, description):
    create(name, description, True)

def create(name, description, display=False):
    payload = { 'name': name, 'description': description }
    response = utils.request_server('POST', '/api/preprocessingTypes', payload)
    if response.status_code == 200 and display:
        print('Preprocessing type {!s} has been created.'.format(response.json()))
    elif display:
        print(response.json()['message'])
    return response.json()

@preprocessing_type.command(name='list', help='Lists the preprocessing types in the database')
def _list_preprocessing_type():
    list_preprocessing_type(True)

def list_preprocessing_type(display=False):
    response = utils.request_server('GET', '/api/preprocessingTypes')
    if display:
        print('Preprocessing types table')
        utils.pretty_print_table(response.json())
    return response.json()

@preprocessing_type.command(name='update', help='Updates an existing preprocessing type')
@click.option('--id', help='Id of the existing preprocessing type')
@click.option('--name', help='Name of the preprocessing type')
@click.option('--description', help='Description of the preprocessing type')
def _update(id, name, description):
    update(id, name, description, True)

def update(id, name, description, display=False):
    payload = { 'name': name, 'description': description }
    response = utils.request_server('PUT', '/api/preprocessingTypes/{}'.format(id), payload)
    if response.status_code == 200 and display:
        print('Preprocessing type {!s} has been updated.'.format(response.json()))
    elif display:
        print(response.json()['message'])
    return response.json()