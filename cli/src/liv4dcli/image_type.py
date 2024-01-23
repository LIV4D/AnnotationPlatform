import click
from . import utils

@click.group(name='imageType', help='Commands to manage the image types')
def image_type():
    pass

@image_type.command(name='create', help='Creates a new image type')
@click.option('--name', help='Name of the image type')
@click.option('--description', help='Description of the image type')
def _create(name, description):
    create(name, description, True)

def create(name, description, display=False):
    payload = { 'name': name, 'description': description }
    response = utils.request_server('POST', '/api/imageTypes', payload)
    if response.status_code == 200 and display:
        print('Image type {!s} has been created.'.format(response.json()))
    elif display:
        print(response.json()['message'])
    return response.json()

@image_type.command(name='list', help='Lists every image types in the database')
def _list_image_types():
    list_image_types(True)

def list_image_types(display=False):
    response = utils.request_server('GET', '/api/imageTypes')
    if display:
        print('Image types table')
        utils.pretty_print_table(response.json())
    return response.json()

@image_type.command(name='delete', help='Deletes an image type if it does not have any image of that type')
@click.option('--imageTypeId', 'image_type_id', help='Id of the image type')
def _delete(image_type_id):
    delete(image_type_id, True)

def delete(image_type_id, display=False):
    response = utils.request_server('DELETE', '/api/imageTypes/{}'.format(image_type_id))
    if display and response.status_code == 204:
        print('The imageType with id {} has been deleted successfully.'.format(image_type_id))
    return True if response.status_code == 204 else print(response.json()['message'])

@image_type.command(name='update', help='Updates an image in the database')
@click.option('--imageTypeId', 'image_type_id', help='Id of the image type')
@click.option('--name', help='Name of the image type')
@click.option('--description', help='Decription of the image type')
def _update(image_type_id, name, description):
    update(image_type_id, name, description, True)

def update(image_type_id, name, description, display=False):
    payload = { 'name': name, 'description': description }
    response = utils.request_server('PUT', '/api/imageTypes/{}'.format(image_type_id), payload)
    if display and response.status_code == 200:
        print('The imageType with id {} has been updated successfully.'.format(image_type_id))
    return True if response.status_code == 200 else print(response.json()['message'])