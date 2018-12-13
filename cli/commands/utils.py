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


if __name__ == '__main__':
    pretty_print_table([
        {
            'test': 2,
            'test2': 47546,
            'test3': 'teadssadsadsadsdsaadsadas'
        },
        {
            'test': 21546,
            'test2': '1213',
            'test3': 'teadssadsadsadsadas'
        },
        {
            'test': 24525,
            'test2': 'leaesaeadsadsadas',
            'test3': 'teadssadsadsaddsadsa ddsasadsadas'
        },
        {
            'test': 2211,
            'test2': 'leadsadsaesaea',
            'test3': 'teadssaadsadsadas'
        }
    ])