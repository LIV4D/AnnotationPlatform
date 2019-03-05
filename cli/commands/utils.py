import requests
from . import config


def request_server(method, path, payload={}):
    header = { 'Authorization': 'Bearer ' + config.get_token() }
    try:
        response = requests.request(method, config.url + path, json=payload, headers=header)
    except requests.exceptions.RequestException as e:
        print(e)
        exit(-1)
    return response


def request_file(path):
    header = { 'Authorization': 'Bearer ' + config.get_token() }
    try:
        response = requests.get(config.url + path, headers=header, stream=True)
    except requests.exceptions.RequestException as e:
        print(e)
        exit(-1)
    return response


def send_file(method, path, filename, file, field, payload={}):
    header = { 'Authorization': 'Bearer ' + config.get_token() }
    files = { field: (filename, file) }
    try:
        response = requests.request(method, config.url + path, headers=header, files=files, data=payload)
    except requests.exceptions.RequestException as e:
        print(e)
        exit(-1)
    return response

def pretty_print_table(table):
    if len(table) == 0:
        print('Empty table')
        return
    headers = table[0].keys()
    column_lengths = calculate_column_lengths(table, headers)
    # Print headers
    print(''.join((' {:<' + str(column_length) + '} |') for column_length in column_lengths).format(*headers))
    print('=' * (sum(column_lengths) + len(column_lengths) * 3))
    # Print table
    for obj in table:
        for i, key in enumerate(headers):
            if isinstance(obj[key], (int, float)):
                print((' {:>' + str(column_lengths[i]) + '} ').format(obj[key]), end='|')
            else:
                print((' {!s:<' + str(column_lengths[i]) + '} ').format(obj[key]), end='|')
        print('')


def calculate_column_lengths(table, headers=None):
    if headers is None:
        headers = table[0].keys()
    data_dict = { k: [] for k in headers }
    for obj in table:
        for key in headers:
            data_dict[key].append(obj[key])
    for key in headers:
        data_dict[key].append(key)
    return [max([len(str(value)) for value in column]) for column in data_dict.values()]


def to_boolean(string):
    if isinstance(string, str):
        if string.lower() == 'true':
            return True
        else:
            return False
    else:
        return string

def decode_svg(svg_xref):
    import base64
    from io import BytesIO
    from PIL import Image
    import numpy
    if svg_xref.startswith('data:image/png;base64,'):
        svg_xref = svg_xref[len('data:image/png;base64,'):]
    png_buffer = BytesIO(base64.b64decode(svg_xref.encode('ascii')))
    png_img = Image.open(png_buffer)
    return numpy.array(png_img)[...,3] > 127


def confirm(text, default=None):
    answer = ""
    while answer not in ["y", "n"]:
        answer = input(text+ "[%s/%s]" % ('Y' if default.lower()=='y' else 'y',
                                              'N' if default.lower()=='n' else 'n')).lower()
        if answer=='' and default is not None:
            answer = default
    return answer == "y"


def info_from_diagnostic(diagnostic):
    biomarkers = []
    time = 0
    comment = ""
    
    for c in diagnostic.split(']'):
        c_stripped = c.strip()
        if c_stripped.startswith('[onlyEnable='):
            b = c_stripped[12:].split(',')
            biomarkers += [_ for _ in b if _ not in ('Others', )]
        elif c_stripped.startswith('[time='):
            time = int(c_stripped[6:8])*60 + int(c_stripped[9:11])
        else:
            comment += c+']'

    if comment:
        comment = comment[:-1]

    return biomarkers, time, comment
