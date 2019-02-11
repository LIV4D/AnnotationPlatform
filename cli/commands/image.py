import click
import ntpath
import shutil
from . import utils
import xml.etree.ElementTree as ET

ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
ET.register_namespace('sodipodi', 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd')
ET.register_namespace('docname', 'fullAnnotations.svg')

@click.group(help='Commands to manage images stored in the database.')
def image():
    pass

@image.command(name='create', help='Creates an image in the database from a file (required), and a revision (optional).')
@click.option('--file', 'image_file', help='Default color of the class', type=click.Path())
@click.option('--eye', help='Which side the image represent (left or right)', required=False)
@click.option('--hospital', help='Where the visit has taken place', required=False)
@click.option('--patient', help='Patient id', required=False)
@click.option('--visit', help='Visit id', required=False)
@click.option('--code', help='Code differentiating multiple images taken during the same visit', required=False)
@click.option('--imageTypeId', 'image_type_id', help='Id of the image type', required=True)
@click.option('--baseRevision', 'base_revision', help='A base revision that will have to be corrected later', default='<?xml?><svg></svg>')
@click.option('--finalRevision', 'final_revision', help='The finalized version of a revision after correction', default='')
def _create(image_file, eye, hospital, patient, visit, code, image_type_id, base_revision, final_revision):
    create(click.format_filename(image_file), eye, image_type_id, base_revision, final_revision, None, True)

def create(image_file,
           eye,
           hospital,
           patient,
           visit,
           code,
           image_type_id,
           base_revision='<xml></xml>',
           final_revision='',
           extra={},
           display=False):
    image_data = open(image_file, 'rb')
    payload = {
        'eye': eye,
        'hospital': hospital,
        'patient': patient,
        'visit': visit,
        'code': code,
        'imageTypeId': image_type_id,
        'baseRevision': base_revision,
        'finalRevision': final_revision,
        'extra': extra
    }
    response = utils.send_file('POST', '/api/images', ntpath.basename(image_file), image_data, 'image', payload)
    if response.status_code == 200 and display:
        print('Image {!s} has been created.'.format(response.json()))
    elif display:
        print(response.text)
        exit(-1)
    return response.json()

@image.command(name='list', help='Lists the images stored in the database')
def _list_image():
    list_image(True)

def list_image(display=False):
    response = utils.request_server('GET', '/api/images')
    if display:
        print('Image table')
        utils.pretty_print_table(response.json())
    return response.json()

def get_image(image_id):
    response = utils.request_server('GET', '/api/images/%i' % image_id)
    if response.status_code != 200:
        print("Image with id=%i doesn't exist." % image_id)
    return response.json()
    

@image.command(name='file', help='Downloads the image stored in the server')
@click.option('--imageId', 'image_id', help='Id of the image to download', required=True)
@click.option('--path', help='Path to store the downloaded image (default=./)', required=False, default='./')
def _image_file(image_id, path):
    image_file(image_id, path, True)

def image_file(image_id, path, display=False):
    response = utils.request_file('/api/images/{}/getFile'.format(image_id))
    if response.status_code == 200:
        with open(path + ntpath.basename(image_object['path']), 'wb') as file:
            shutil.copyfileobj(response.raw, file)

@image.command(name='revision', help='Downloads the revision stored in the server')
@click.option('--imageId', 'image_id', help='Id of the image to get the base revision from')
@click.option('--path', help='Path to store the downloaded revision (default=./)', required=False, default='./')
def _revision_file(image_id, path):
    revision_file(image_id, path, True)

def revision_file(image_id, path, display=False):
    response = utils.request_server('GET', '/api/images/{}/baseRevision'.format(image_id))
    if response.status_code == 200:
        svg_file_name = ''.join(ntpath.basename(image_object['path']).split('.')[:-1]) + '.svg'
        with open(path + svg_file_name, 'w+') as file:
            file.write(response.json()['svg'])

def get_base_revision(image_id):
    response = utils.request_server('GET', '/api/images/{}/baseRevision'.format(image_id))
    if response.status_code != 200:
        raise RuntimeError(response.json()['message'])
    return response.json()['svg']
    
    

@image.command(name='update', help='Updates an image in the database')
@click.option('--imageId', 'image_id', help='Id of the image to update', required=True)
@click.option('--file', 'image_file', help='Color of the class', type=click.Path())
@click.option('--eye', help='Which side the image represent (left or right)', required=False)
@click.option('--hospital', help='Where the visit has taken place', required=False)
@click.option('--patient', help='Patient id', required=False)
@click.option('--visit', help='Visit id', required=False)
@click.option('--code', help='Code differentiating multiple images taken during the same visit', required=False)
@click.option('--imageTypeId', 'image_type_id', help='Id of the image type', required=False)
@click.option('--baseRevision', 'base_revision', help='A base revision that will have to be corrected later', default='<?xml?><svg></svg>')
@click.option('--finalRevision', 'final_revision', help='The finalized version of a revision after correction', default='')
def _update(image_id, image_file, eye, hospital, patient, visit, code, image_type_id, base_revision,    final_revision):
    update(image_id, image_file, eye, hospital, patient, visit, code, image_type_id, base_revision, final_revision, True)

def update(image_id,
           image_file,
           eye,
           hospital,
           patient,
           visit,
           code,
           image_type_id,
           base_revision='<xml></xml>',
           final_revision='',
           display=False):
    payload = {
        'eye': eye,
        'hospital': hospital,
        'patient': patient,
        'visit': visit,
        'code': code,
        'imageTypeId': image_type_id,
        'baseRevision': base_revision,
        'finalRevision': final_revision
    }
    image_data = open(image_file, 'rb')
    response = utils.send_file('PUT', '/api/images/{}'.format(image_id), ntpath.basename(image_file), image_data, 'image', payload)
    if display and response.status_code == 200:
        print('The image with id {} has been updated successfully.'.format(image_id))
    return True if response.status_code == 200 else print(response.json()['message'])


def update_base_revision(image_id,
                         svg,
                         update_all_revision=False,
                         display=False):
    payload = {'baseRevision': svg}
    response = utils.request_server('PUT', '/api/images/{}/baseRevision'.format(image_id), payload)
    if display and response.status_code == 200:
        print('The base revision of image with id {} has been updated successfully.'.format(image_id))
    return True if response.status_code == 200 else print(response.json()['message'])


def update_biomarker(image_id, biomarker, png, update_all_revision=False, display=False):
    svg_tree = ET.fromstring(get_base_revision(image_id))
    biomarker = [_ for _ in svg_tree.iter() if _.get('id')==biomarker][0]
    biomarker.set('{http://www.w3.org/1999/xlink}href', 'data:image/png;base64,{!s}'.format(png.decode('ascii')))
    
    xml_header = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    svg = xml_header.encode(encoding='utf-8') + ET.tostring(svg_tree, encoding='utf-8')
    return update_base_revision(image_id=image_id, svg=svg.decode('utf-8'), update_all_revision=update_all_revision, display=display)
    


@image.command(name='delete', help='Deletes an image from the database')
@click.option('--imageId', 'image_id', help='Id of the image to delete', required=True)
def _delete(image_id):
    delete(image_id, True)

def delete(image_id, display=False):
    response = utils.request_server('DELETE', '/api/images/{}'.format(image_id))
    if display and response.status_code == 204:
        print('The image with id {} has been deleted successfully.'.format(image_id))
    return True if response.status_code == 204 else response.json()['message']
