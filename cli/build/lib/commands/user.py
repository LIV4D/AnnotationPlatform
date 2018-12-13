import click
import getpass
import requests
from . import config
from . import utils

@click.group(help='Commands to manage the users in the database')
def user():
    pass

@user.command(name='create', help='Creates a new user')
@click.option('--name', help='Name of the user')
@click.option('--email', help='Email of the user')
@click.option('--password', help='Password of the user')
@click.option('--role', help='clinician or admin')
def _create(name, email, password, role):
    create(name, email, password, role, True)

def create(name, email, password, role, display=False):
    payload = { 'name': name, 'email': email, 'password': password, 'role': role }
    response = utils.request_server('POST', '/api/users', payload)
    if response.status_code == 200 and display:
        print('User {!s} has been created.'.format(response.json()))
    elif display:
        print(response.json()['message'])
    return response.json()

@user.command(name='list', help='Lists every user in the database')
def _list_user():
    list_user(True)

def list_user(display=False):
    response = utils.request_server('GET', '/api/users')
    if display:
        print('User table')
        utils.pretty_print_table(response.json())
    return response.json()

@user.command(name='update', help='Updates a user in the database')
@click.option('--userId', 'user_id', help='Id to identify the user', required=True)
@click.option('--name', help='Id to identify the user', required=False)
@click.option('--password', help='Id to identify the user', required=False)
def _update(user_id, name, password):
    update(user_id, name, password, True)

def update(user_id, name, password, display=False):
    payload = { 'name': name, 'password': password }
    response = utils.request_server('PUT', '/api/users/{}'.format(user_id), payload)
    if display and response.status_code == 200:
        print('The user with id {} has been updated successfully.'.format(user_id))
    return True if response.status_code == 200 else print(response.json()['message'])

@user.command(name='delete', help='Deletes a user in the database')
@click.option('--userId', 'user_id', help='Id to identify the user', required=True)
def _delete(user_id):
    delete(user_id, True)

def delete(user_id, display=False):
    response = utils.request_server('DELETE', '/api/users/{}'.format(user_id))
    if display and response.status_code == 204:
        print('The user with id {} has been deleted successfully.'.format(user_id))
    return True if response.status_code == 204 else print(response.json()['message'])