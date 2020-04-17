import getpass
import os
import requests

url = 'http://localhost:5050'
token_filename = 'token'

def get_token(force_login=False):
    '''
    '''
    if token_filename not in os.listdir() or force_login:
        username = input('Username: ')
        password = getpass.getpass('Password: ')
        payload = { 'username': username, 'password': password }
        response = requests.post(url + '/auth/login', params=payload)
        if response.status_code != 200:
            print(response.json()['message'])
            exit(-1)
        with open(token_filename, 'w+') as token_file:
            token_file.write(response.json()['token'])
        return response.json()['token']
    else:
        with open(token_filename, 'r') as token_file:
            token = token_file.read()
        return token