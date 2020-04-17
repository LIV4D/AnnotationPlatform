import requests
from . import config
from .utilities.collections import if_none
import getpass
import os
import shutil


class Server:
    tokens_filename = os.path.expanduser('~/.annotation_tokens.txt')

    def __init__(self, url=None):
        self._url = if_none(url, config.url)
        self._token = None

    #  ---  AUTHENTIFICATION ---
    @property
    def url(self):
        return self._url

    @property
    def token(self):
        if self._token is not None:
            return self._token

        # Search for token
        if os.path.exists(self.tokens_filename):
            with open(self.tokens_filename, "r") as f:
                for l in f.readlines():
                    if l.startswith(self.url):
                        self._token = l.split(' ')[1]
                        return self._token

        self.authenticate()
        return self._token

    def authenticate(self, username=None, password=None):
        if username is None:
            username = input('Username: ')
        if password is None:
            password = getpass.getpass('Password: ')
        params = dict(username=username, password=password)
        try:
            response = requests.post(self.url+'/auth/login', params=params)
        except requests.exceptions.RequestException as e:
            raise ConnectionError(e)
        if response.status_code == 401:
            print('\nError: invalid login or password.')
            return self.authenticate()
        elif response.status_code != 200:
            raise Server.BackendError(response.json().get('message', ''), self)

        self._token = response.json()['token']
        tokens = ''
        if os.path.exists(self.tokens_filename):
            with open(self.tokens_filename, 'r') as f:
                tokens = f.read().splitlines()
            tokens = '\n'.join([_ for _ in tokens if not _.startswith(self._url)]) + '\n'
        tokens += self._url + ' ' + self._token

        with open(self.tokens_filename, 'w+') as f:
            f.write(tokens)

    def headers(self):
        return {'Authorization': 'Bearer '+self.token}

    #  ---  REQUESTS  ---
    def request(self, method, path, json=None, **kwargs):
        if json is None:
            json = {}
        if not path.endswith('/'):
            path += '/'
        try:
            response = requests.request(method, self.url + path, json=json, headers=self.headers(), **kwargs)
        except requests.exceptions.RequestException as e:
            raise ConnectionError(e)
        if response.status_code == 404:
            raise Server.BackendError('[Error 404] Unknown end point: "'+path+'".', self)
        elif response.status_code == 401:
            print('[Error 401] Unauthorized request. Authenticating...')
            self.authenticate()
            return self.request(method=method, path=path, json=json)
        elif response.status_code >= 400:
            raise Server.BackendError('[Error %i] ' % response.status_code + response.json().get('message', ''), self)

        return response

    def request_file(self, path, out=None):
        raw = self.request('GET', path, stream=True).raw
        if out:
            with open(out, 'wb') as f:
                shutil.copyfileobj(raw, f)
        return raw

    def request_image(self, path, out=None):
        # TODO: Reencode image
        return self.request_file(path, out=out)

    def put(self, path, payload=None):
        return self.request('PUT', path, json=payload)

    def post(self, path, payload=None):
        return self.request('POST', path, json=payload)

    def get(self, path, payload=None):
        return self.request('GET', path, json=payload)

    def delete(self, path, payload=None):
        return self.request('DELETE', path, json=payload)

    def send_file(self, path, field, filename, payload=None):
        return self.send_file(path=path, filenames_dict={field: filename}, payload=payload)

    def send_files(self, path, filenames_dict, payload=None):
        if payload is None:
            payload = {}
        files = {}
        for field, filename in filenames_dict.items():
            files[field] = (os.path.basename(filename), open(filename, 'rb'))
        r = self.request('POST', path, files=files, data=payload)
        for filename, file in files.values():
            file.close()
        return r

    class BackendError(Exception):
        def __init__(self, msg, server):
            self.server = server
            self.msg = msg
            super(Server.BackendError, self).__init__(msg)


server = Server()
