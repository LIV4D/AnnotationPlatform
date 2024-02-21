import click
from . import utils

@click.group(name='biomarkerType', help='Commands to manage the differents classes of biomarkers')
def biomarker_type():
    pass

@biomarker_type.command(name='create', help='Creates a new biomarker class')
@click.option('--name', help='Name of the biomarker class')
@click.option('--color', help='Default color of the class')
@click.option('--parentId', 'parent_id', help='The id of the parent biomarker class')
@click.option('--imageTypes', 'image_types', help='The image types id for which the biomarker class is defined (comma separated list)')
def _create(name, color, parent_id, image_types):
    create(name, color, parent_id, list(image_types.split(',')), True)

def create(name, color, parent_id, image_types, display=False):
    payload = { 'name': name, 'color': color, 'parentId': parent_id, 'imageTypes': image_types }
    response = utils.request_server('POST', '/api/biomarkerTypes', payload)
    if response.status_code == 200 and display:
        print('Biomarker type {!s} has been created.'.format(response.json()))
    elif display:
        print(response.json()['message'])
    return response.json()

@biomarker_type.command(name='list', help='Lists every classes of biomarker in the database')
def _list_biomarker_types():
    list_biomarker_types(True)

def list_biomarker_types(display=False):
    response = utils.request_server('GET', '/api/biomarkerTypes')
    if display:
        print('Biomarker types table')
        pretty_print_tree(response.json(), ['id', 'name', 'color', 'description', 'imageTypes'])
    return response.json()

def pretty_print_tree(tree, ignore_keys, prefix='', depth=0):
    if len(tree) == 0:
        return
    for i, obj in enumerate(tree):
        # last branch
        if i > len(tree) - 2:
            prefix = prefix[:-5] + '     '
        # root
        if depth == 0:
            print(obj['name'])
            pretty_print_tree(obj['children'], ignore_keys, '|    ', depth + 1)
        # branch
        else:
            print(prefix[:-4] + '`---' + obj['name'] + ' {}'.format(obj['color']))
            pretty_print_tree(obj['children'], ignore_keys, prefix + '|    ', depth + 1)

@biomarker_type.command(name='delete', help='Deletes a class of biomarker if it does not have children')
@click.option('--biomarkerId', 'biomarker_id', help='Biomarker id')
def _delete(biomarker_id):
    delete(biomarker_id, True)

def delete(biomarker_id, display=False):
    response = utils.request_server('DELETE', '/api/biomarkerTypes/{}'.format(biomarker_id))
    if display and response.status_code == 204:
        print('The biomarkerType with id {} has been deleted successfully.'.format(biomarker_id))
    return True if response.status_code == 204 else print(response.json()['message'])

@biomarker_type.command(name='update', help='Updates the color of a class of biomarker')
@click.option('--biomarkerId', 'biomarker_id', help='Biomarker id')
@click.option('--color', help='New color of the class')
def _update(biomarker_id, color):
    update(biomarker_id, color, True)

def update(biomarker_id, color, display=False):
    payload = { 'color': color }
    response = utils.request_server('PUT', '/api/biomarkerTypes/{}'.format(biomarker_id), payload)
    if display and response.status_code == 200:
        print('The biomarkerType with id {} has been updated successfully.'.format(biomarker_id))
    return True if response.status_code == 200 else print(response.json()['message'])