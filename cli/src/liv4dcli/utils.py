import requests
import numpy as np
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

def encode_png(data, color=None):
    import base64
    # from io import BytesIO
    import cv2
    # from PIL import Image   
    
    if len(data.shape) == 3 and data.shape[-1]==1:
        data = data[..., 0]
    if data.dtype==np.bool:
        data = data.astype(np.uint8)*255
    if len(data.shape) == 2 and color is not None:
        if isinstance(color, str):
            color = str2color(color)
        colormap = np.ones(shape=data.shape+(3,),dtype=np.uint8)
        colormap *= color[None, None, ::-1]
        data = np.concatenate([colormap, data[:,:,None]], axis=2)
    
    _, data = cv2.imencode('.png', data)
    return 'data:image/png;base64,' + base64.b64encode(data).decode('ascii')

def decode_png(svg_xref):
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
            biomarkers += [_.strip() for _ in b if _.strip() not in ('Others', )]
        elif c_stripped.startswith('[time='):
            t = c_stripped[6:].split(':')
            if len(t) == 1:
                t = int(t[0])
            elif len(t) == 2:
                t = int(t[0])*60 + int(t[1])
            elif len(t) == 3:
                t = int(t[0])*3600 + int(t[1])*60 + int(t[2])
            time = t
        else:
            comment += c+']'

    if comment:
        comment = comment[:-1]

    return biomarkers, time, comment

def decode_info(d):
    r = {'time': 0, 'comment': "", 'biomarkers': []}
    for c in d.split(']'):
        c_stripped = c.strip()
        if not c_stripped:
            continue
        
        if c_stripped.startswith('[onlyEnable='):
            b = c_stripped[12:].split(',')
            r['biomarkers'] += [_.strip() for _ in b if _.strip() not in ('Others', )]
        elif c_stripped.startswith('[time='):
            t = c_stripped[6:].split(':')
            if len(t) == 1:
                t = int(t[0])
            elif len(t) == 2:
                t = int(t[0])*60 + int(t[1])
            elif len(t) == 3:
                t = int(t[0])*3600 + int(t[1])*60 + int(t[2])
            r['time'] += t
        elif c_stripped[0] == '[' and '=' in c_stripped:
            name, data = c_stripped[1:].split('=')
            r[name.strip()] = data.strip()
        else:
            r['comment']+= c+']'

    if r['comment']:
        r['comment'] = r['comment'][:-1]

    return r


def dict_info_from_diagnostic(diagnostic):
    d = dict(comment="", biomarkers=[])
    for c in diagnostic.split(']'):
        c_stripped = c.strip()
        if c_stripped.startswith('[onlyEnable='):
            b = c_stripped[12:].split(',')
            d['biomarkers'] += [_.strip() for _ in b if _.strip() not in ('Others', )]
        elif c_stripped.startswith('[time='):
            t = c_stripped[6:].split(':')
            if len(t) == 1:
                t = int(t[0])
            elif len(t) == 2:
                t = int(t[0])*60 + int(t[1])
            elif len(t) == 3:
                t = int(t[0])*3600 + int(t[1])*60 + int(t[2])
            d['time'] = t
        elif c_stripped.startswith('[diagnostic='):
            diagnostics = c_stripped[12:].split('M')
            if len(diagnostics) == 1:
                diagnostics.append('')
            else:
                if diagnostics[0]:
                    d['RD'] = {0:'R0', 1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4A', 5: 'R4S', 6: 'R6'}[int(diagnostics[0])]
                if diagnostic[1]:
                    d['ME'] = {0:'M0', 1: 'M1', 2: 'M2', 6: 'M6'}[int(diagnostics[1])]
        else:
            d['comment'] += c+']'

    if d['comment']:
        d['comment'] = d['comment'][:-1]
    
    return d


def info_to_diagnostic(biomakers=None, time=None, comment=None):
    c = ""
    if biomakers:
        if isinstance(biomakers, (list, tuple)):
            biomakers = ','.join(biomakers)
        c += '[onlyEnable=%s] ' % biomakers
    if time:
        m = str(time//60)
        m = '0'+m if len(m)==1 else m
        s = str(time%60)
        s = '0'+s if len(s)==1 else s
        c += '[time=%s:%s] '%(m,s)
    if comment:
        c += comment
    return c

def paste_int_list():
    import clipboard
    l = clipboard.paste().split('\n')
    return [int(_) for _ in l if _]


def str2color(str_color):
    if not str_color or not isinstance(str_color, str):
        return np.zeros((3,), dtype=np.uint8 if uint8 else np.float16)

    import webcolors
    if str_color.startswith('#'):
        c = webcolors.hex_to_rgb(str_color)
    else:
        c = webcolors.name_to_rgb(str_color)

    c = np.array(c, dtype=np.float16)
    c = c.astype(dtype=np.uint8)#[::-1]
    return c
