import click
import ntpath
import shutil
from . import utils

@click.group(name='preprocessing', help='Commands to manage preprocessings stored in the database')
def preprocessing():
    pass

@preprocessing.command(name='create', help='Creates a preprocessing')
@click.option('--file', 'preprocessing_file', help='Path to the preprocessing file', type=click.Path(), required=True)
@click.option('--imageId', 'image_id', help='Id of the image from which the preprocessing was created', required=True)
@click.option('--preprocessingTypeId', 'preprocessing_type_id', help='Id of the preprocessing type', required=True)
def _create(preprocessing_file, image_id, preprocessing_type_id):
    create(click.format_filename(preprocessing_file), image_id, preprocessing_type_id, True)

def create(preprocessing_file, image_id, preprocessing_type_id, display=False):
    preprocessing_data = open(preprocessing_file, 'rb')
    payload = { 'imageId': image_id, 'preprocessingTypeId': preprocessing_type_id }
    response = utils.send_file('POST','/api/preprocessings', ntpath.basename(preprocessing_file),
        preprocessing_data, 'preprocessing', payload)
    if response.status_code == 200 and display:
        print('Preprocessing {!s} has been created/updated.'.format(response.json()))
    elif display:
        print(response.text)
        return None
    return response.json()

@preprocessing.command(name='list', help='Lists the preprocessing types in the database')
def _list_preprocessing():
    list_preprocessing(True)

def list_preprocessing(display=False):
    response = utils.request_server('GET', '/api/preprocessings')
    if display:
        print('Preprocessing table')
        utils.pretty_print_table(response.json())
    return response.json()

@preprocessing.command(name='file', help='Downloads the preprocessing stored in the server')
@click.option('--imageId', 'image_id', help='Id of the preprocessing to download', required=True)
@click.option('--preprocessingTypeId', 'preprocessing_type_id', help='Id of the preprocessing type to download', required=True)
@click.option('--path', help='Path to store the downloaded preprocessing (default=./)', required=False, default='./')
def _preprocessing_file(image_id, preprocessing_type_id, path):
    preprocessing_file(image_id, preprocessing_type_id, path, True)

def preprocessing_file(image_id, preprocessing_type_id, path, display=False):
    preprocessing_list = list_preprocessing()
    preprocessing_object = next((x for x in preprocessing_list if str(x['id']) == str(image_id)), None)
    if preprocessing_object is None:
        print('Preprocessing with this id does not exist')
        exit(-1)
    response = utils.request_file('/api/preprocessings/{}/{}'.format(image_id, preprocessing_type_id))
    if response.status_code == 200:
        with open(path + ntpath.basename(preprocessing_object['path']), 'wb') as file:
            shutil.copyfileobj(response.raw, file)
    else:
        print(response.status_code)

@preprocessing.command(name='update', help='Updates a preprocessing')
@click.option('--file', 'preprocessing_file', help='Path to the preprocessing file', type=click.Path(), required=True)
@click.option('--imageId', 'image_id', help='Id of the image from which the preprocessing was created', required=True)
@click.option('--preprocessingTypeId', 'preprocessing_type_id', help='Id of the preprocessing type', required=True)
def _update(preprocessing_file, image_id, preprocessing_type_id):
    create(click.format_filename(preprocessing_file), image_id, preprocessing_type_id, True)

@preprocessing.command(name='delete', help='Deletes a preprocessing')
@click.option('--imageId', 'image_id', help='Id of the image from which the preprocessing will be delete', required=True)
@click.option('--preprocessingTypeId', 'preprocessing_type_id', help='Id of the preprocessing type', required=True)
def _delete(image_id, preprocessing_type_id):
    delete(image_id ,preprocessing_type_id, True)

def delete(image_id, preprocessing_type_id, display=False):
    response = utils.request_server('DELETE', '/api/preprocessings/{}/{}'.format(image_id, preprocessing_type_id))
    if display and response.status_code == 204:
        print('The preprocessing with imageId {} and preprocessingTypeId {} has been deleted successfully.'.format(image_id, preprocessing_type_id))
    return True if response.status_code == 204 else print(response.json()['message'])