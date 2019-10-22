import click
from os import makedirs
from os.path import dirname
from . import utils
from collections import OrderedDict
import xml.etree.ElementTree as ET

ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
ET.register_namespace('sodipodi', 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd')
ET.register_namespace('docname', 'fullAnnotations.svg')

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
        print('Revision (user=%s, img=%i) has been updated in the database.' % (user_id, image_id))
    elif display:
        print(response.json()['message'])
    return response.json()

@revision.command(name='list', help='Lists all revisions')
def _list_revision():
    list_revision(True)

def list_revision(user=None, display=False):
    if user is None:
        response = utils.request_server('GET', '/api/revisions/list')
    else:
        response = utils.request_server('GET', '/api/revisions/listByUser/{}'.format(user))
    if display:
        print('Revisions table')
        pretty_data = [OrderedDict([
                            ('id', _['id']), 
                            ('user', _['user']['name']), 
                            ('img', _['image']['id']),
                            ('diagnostic', _['diagnostic'])
                        ]) for _ in response.json()]
        utils.pretty_print_table(pretty_data)
    return response.json()

@revision.command(name='svg', help='Gets a revision')
@click.option('--userId', 'user_id', help='Id of the user associated to the revision', required=True)
@click.option('--imageId', 'image_id', help='Id of the image associated to the revision', required=True)
def _get_revision(user_id, image_id):
    get_revision(user_id, image_id)

def get_revision(user_id, image_id, svg=True, display=False):
    if svg:
        response = utils.request_server('GET', '/api/revisions/{}/{}'.format(user_id, image_id))
    else:
        response = utils.request_server('GET', '/api/revisions/proto/{}/{}'.format(user_id, image_id))
    if response.status_code == 200:
        r = response.json()
        if display:
            pretty_data = [OrderedDict([
                            ('id', r['id']),
                            ('diagnostic', r['diagnostic'])
                        ])]
            utils.pretty_print_table(pretty_data)
        return r
    if display:
        print(response.json()['message'])
    return None

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

def update_svg(svg_string, user_id, image_id, display=False):
    payload = { 'svg': svg_string}
    response = utils.request_server('PUT', '/api/revisions/{}/{}'.format(user_id, image_id), payload)
    if response.status_code == 200 and display:
        print('Svg (user=%s, img=%i) has been updated in the database.' % (user_id, image_id))
    elif display:
        print(response.json()['message'])
    return response.json()

def update_diagnostic(diagnostic, user_id, image_id, display=False):
    payload = { 'diagnostic': diagnostic}
    response = utils.request_server('PUT', '/api/revisions/{}/{}'.format(user_id, image_id), payload)
    if response.status_code == 200 and display:
        print('Diagnostic (user=%s, img=%i) has been updated in the database.' % (user_id, image_id))
    elif display:
        print(response.json()['message'])
    return response.json()

def get_biomarkers(user_id, image_id):
    svg_tree = ET.fromstring(get_revision(user_id, image_id)['svg'])
    biomarkers = [_ for _ in svg_tree.iter() if _.tag.endswith('image')]
    biomarkers = {node.get('id'): utils.decode_svg(node.get('{http://www.w3.org/1999/xlink}href')) for node in biomarkers}
    return biomarkers

def get_biomarker(user_id, image_id, biomarker, out='array'):
    return export_biomarker(get_revision(user_id, image_id, svg=True)['svg'], biomarker, out)
    
def export_biomarker(svg, biomarker, out='array'):
    svg_tree = ET.fromstring(svg)
    b = [_.get('{http://www.w3.org/1999/xlink}href') for _ in svg_tree.iter() if _.get('id') == biomarker][0]
    if out.lower()=='array':
        return utils.decode_svg(b)
    elif out.lower()=='svg':
        return b
    elif out.lower()=='png':
        if b.startswith('data:image/png;base64,'):
            b = b[len('data:image/png;base64,'):]
        return b
    else:
        from PIL import Image
        import numpy as np
        array = utils.decode_svg(b)
        array = (array*255).astype(np.uint8)
        makedirs(dirname(out), exist_ok=True)
        Image.fromarray(array).save(out)
        return array

def update_biomarker(user_id, image_id, biomarker, png, display=False):
    if isinstance(png, bytes):
        png = png.decode('ascii')
    svg_tree = ET.fromstring(get_revision(user_id, image_id)['svg'])
    biomarker = [_ for _ in svg_tree.iter() if _.get('id')==biomarker][0]
    biomarker.set('{http://www.w3.org/1999/xlink}href', 'data:image/png;base64,{!s}'.format(png))
    
    xml_header = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    svg = xml_header.encode(encoding='utf-8') + ET.tostring(svg_tree, encoding='utf-8')
    return update_svg(image_id=image_id, user_id=user_id, svg_string=svg.decode('utf-8'), display=display)

def transfer_biomarker(image_id, from_user_id, to_user_id, biomarker, force=False, display=False):
    if not force:
        r = get_revision(to_user_id, image_id, svg=False)
        biomarkers, time, comment = utils.info_from_diagnostic(r['diagnostic'])
        if time != 0 and biomarker in biomarkers:
            if not utils.confirm('%s already annotated %s on image %i. Tranfering will erase his/her work. \n Are you sure you want to proceed?'
                                 % (to_user_id, biomarker, image_id), default='n'):
                print('Cancelling...')
                return

    return update_biomarker(to_user_id, image_id, biomarker, display=display,
                            png=get_biomarker(from_user_id, image_id, biomarker, out='png'))

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

def clean_unused(user, force=False, only_empty=False):
    from .task import list_task
    user_revisions = list_revision(user)
    
    if not user_revisions:
        print('No revisions where found for this user.')
        return 0
    
    user_task = list_task(user)
    user_task_img = {t['image']['id'] for t in user_task}
    
    unused_revisions = []
    
    for r in user_revisions:
        img = r['image']['id']
        if img not in user_task_img:
            if not force:
                biomarkers, time, comment = utils.info_from_diagnostic(r['diagnostic'])
                if time != 0:
                    if only_empty:
                        continue
                    if not utils.confirm('%s made some annotation on image %i. Deleting this revision will erase his/her work. \n Are you sure you want to proceed?'
                                    % (r['user']['name'], img), default='n'):
                        print('Ignoring image %i'%img)
                        continue
            unused_revisions.append(r)
    
    if not unused_revisions:
        print('No unused revisions where found for user %s.' % user_revisions[0]['user']['name'])
        return 0
    
    if not force and not utils.confirm('%i unused revisions where found for user %s. Do yo want to delete them?' % (len(unused_revisions), unused_revisions[0]['user']['name']), default='y'):
        print('Aborting...')
        return -1
    
    deleted_revisions = []
    for r in unused_revisions:
        if not delete(r['user']['id'], r['image']['id']):
            print('Error when deleting the revision of image %i.\n The revisions of the following images have been correctly deleted: %s.'
                  % (r['image']['id'], [_['image']['id'] for _ in deleted_revisions]) )
            return len(deleted_revisions)
        deleted_revisions.append(r)
    return len(deleted_revisions)
