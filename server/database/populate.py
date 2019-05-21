import base64
import csv
import json
import liv4dcli
import os
import numpy as np
import xml.etree.ElementTree as ET
from io import BytesIO
from PIL import Image


def color_png(png_image, color):
    image = Image.open(png_image)
    image = image.convert('RGBA')
    data = np.array(image)
    red, green, blue, _ = data.T

    black_filter = (red == 0) & (blue == 0) & (green == 0)
    white_filter = (red != 0) | (blue != 0) | (green != 0)
    data[..., :-1][white_filter.T] = color
    data[...][black_filter.T] = (255, 255, 255, 0)

    new_image = Image.fromarray(data)
    buffer = BytesIO()
    new_image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue())


def create_subtree(element, current_path, image_name, biomarker_types):
    list_image = [biomarker_type for biomarker_type in biomarker_types
        if len(biomarker_type['children']) == 0]
    list_group = [biomarker_type for biomarker_type in biomarker_types
        if len(biomarker_type['children']) > 0]

    for biomarker_type in list_group:
        sub_element = ET.SubElement(element, 'g', attrib={'id': biomarker_type['name']})
        create_subtree(
            sub_element,
            os.path.join(current_path, biomarker_type['name']),
            image_name,
            biomarker_type['children']
        )

    for biomarker_type in list_image:
        color = tuple(int(biomarker_type['color'].lstrip('#')[i:i+2], 16) for i in (0, 2 ,4))
        image_data = color_png(os.path.join(current_path, biomarker_type['name'], image_name), color)
        sub_element = ET.SubElement(element, 'image', attrib={
            'id': biomarker_type['name'],
            'color': biomarker_type['color'],
            'xlink:href': 'data:image/png;base64,{!s}'.format(image_data.decode('ascii'))})


def create_base_revision(image_name, base_revision_folder, biomarker_types):
    xml_header = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    svg_document = ET.Element('svg', attrib={
        'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'xmlns:sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
        'sodipodi:docname': 'fullAnnotations.svg',
    })
    create_subtree(svg_document, base_revision_folder, image_name, biomarker_types)
    xml_doc = xml_header.encode(encoding='utf-8') + ET.tostring(svg_document, encoding='utf-8')
    return xml_doc.decode('utf-8')


def get_metadata(metadata_path):
    metadata_dict = {}
    with open(metadata_path) as metadata_csv:
        metadata_reader = csv.DictReader(metadata_csv)
        for row in metadata_reader:
            metadata_dict[row['image']] = {
                'hospital': row['Site'],
                'patient': row['patient_id'],
                'visit': row['session_id'],
                'extra': json.dumps({
                    'sex': row['sex'],
                    'age': row['age'],
                    'ethnic_group': row['ethnic_group'],
                    'blood_pressure_medication': row['blood_pressure_medication'],
                    'diabetes_type': row['diabetes_type'],
                    'duration': row['duration']
                })
            }
    return metadata_dict


def create_images(base_revision_folder, image_folder, metadata_path):
    biomarker_types = liv4dcli.biomarker_type.list_biomarker_types()
    image_list = [img_name for img_name in os.listdir(image_folder)
        if os.path.isfile(os.path.join(image_folder, img_name))]
    image_dict = {}
    metadata_dict = get_metadata(metadata_path)

    for image in image_list:
        base_revision = create_base_revision(image, base_revision_folder, biomarker_types)
        metadata = metadata_dict[image]

        response = liv4dcli.image.create(
            image_file=os.path.join(image_folder, image),
            image_type_id='1',
            base_revision=base_revision,
            eye='',
            code='',
            **metadata
        )
        if 'message' in response:
            print(response)
        image_dict[response['id']] = image

    return image_dict


def create_preprocessings(image_dict, preprocessing_folder):
    for key, image_name in image_dict.items():
        preprocessing_path = os.path.join(preprocessing_folder, 'preprocessing_' + image_name)
        # os.rename(os.path.join(preprocessing_folder, image_name), preprocessing_path)
        liv4dcli.preprocessing.create(preprocessing_path, key, 1)


if __name__ == '__main__':
    base_revision_folder = './prerevisions'
    image_folder = './images'
    preprocessing_folder = './preprocessings'
    metadata_path = './metadata.csv'

    image_dict = create_images(base_revision_folder, image_folder, metadata_path)
    create_preprocessings(image_dict, preprocessing_folder)
