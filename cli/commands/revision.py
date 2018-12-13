import click
from . import utils

@click.group(help='Commands to manage revisions in the database')
def revision():
    pass

@revision.command(name='create', help='Creates a new revision')
@click.option('--file', 'svg_file', help='file containing the svg of the revision', required=True, type=click.Path())
@click.option('--userId', 'user_id', help='Id of the user associated to the revision', required=True)
@click.option('--imageId', 'image_id', help='Id of the image associated to the revision', required=True)
@click.option('--diagnostic', help='Notes indicating the diagnosis of the medical image (optional)', required=False)
def _create(svg_file, user_id, image_id, diagnostic):
    create(open(click.format_filename(svg_file), 'r').read(), user_id, image_id, diagnostic, True)

def create(svg_string, user_id, image_id, diagnostic, display=False):
    payload = { 'svg': svg_string, 'userId': user_id, 'imageId': image_id, 'diagnostic': diagnostic }
    response = utils.request_server('POST', '/api/revisions/', payload)
    if response.status_code == 200 and display:
        print('Revision {!s} has been created in the database.')
    elif display:
        print(response.json()['message'])
    return response.json()

@revision.command(name='list', help='Lists all revisions')
def _list_revision():
    list_revision(True)

def list_revision(display=False):
    response = utils.request_server('GET', '/api/revisions/')
    if display:
        print('Revisions table')
        table = [{ k: v for (k, v) in obj.items() if k != 'svg'} for obj in response.json()]
        utils.pretty_print_table(table)
    return response.json()

@revision.command(name='svg', help='Gets a revision')
@click.option('--userId', 'user_id', help='Id of the user associated to the revision', required=True)
@click.option('--imageId', 'image_id', help='Id of the image associated to the revision', required=True)
def _get_revision(user_id, image_id):
    get_revision(user_id, image_id, True)

def get_revision(user_id, image_id, display=False):
    print('/api/revisions/{}/{}'.format(user_id, image_id))
    response = utils.request_server('GET', '/api/revisions/{}/{}'.format(user_id, image_id))
    if display:
        print('Svg of the revision')
        print(response.json())
    return response.json()

@revision.command(name='update', help='Creates a new revision')
@click.option('--file', 'svg_file', help='file containing the svg of the revision', required=True, type=click.Path())
@click.option('--userId', 'user_id', help='Id of the user associated to the revision', required=True)
@click.option('--imageId', 'image_id', help='Id of the image associated to the revision', required=True)
@click.option('--diagnostic', help='Notes indicating the diagnosis of the medical image (optional)', required=False)
def _update(svg_file, user_id, image_id, diagnostic):
    create(open(click.format_filename(svg_file), 'r').read(), user_id, image_id, diagnostic, True)

def update(svg_string, user_id, image_id, diagnostic, display=False):
    payload = { 'svg': svg_string, 'diagnostic': diagnostic }
    response = utils.request_server('PUT', '/api/revisions/{}/{}'.format(user_id, image_id), payload)
    if response.status_code == 200 and display:
        print('Revision {!s} has been updated in the database.')
    elif display:
        print(response.json()['message'])
    return response.json()

@revision.command(name='empty', help='Gets an empty revision of a given imageType')
@click.option('--imageTypeId', 'image_type_id', help='Id of the image type', required=True)
def _empty_revision(image_type_id):
    empty_revision(image_type_id, True)

def empty_revision(image_type_id, display=False):
    response = utils.request_server('GET', '/api/revisions/emptyRevision/{}'.format(image_type_id))
    if display:
        print('Empty revision xml')
        print(response.json()['svg'])
    return response.json()

@revision.command(name='delete', help='Delete a revision')
@click.option('--userId', 'user_id', help='The user that is associated to the revision', required=True)
@click.option('--imageId', 'image_id', help='The image that is associated to the revision', required=True)
def _delete(user_id, image_id):
    delete(user_id, image_id, True)

def delete(user_id, image_id, display=False):
    response = utils.request_server('DELETE', '/api/revisions/{}/{}'.format(user_id, image_id))
    if display and response.status_code == 204:
        print('The revision for the user {} and the image {} has been deleted successfully'.format(user_id, image_id))
    elif display:
        print(response.json()['message'])
    return response.status_code == 204