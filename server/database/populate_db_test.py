import psycopg2
import os
import sys

from configparser import ConfigParser


def config(filename='database.ini', section='postgresql'):
    # create a parser
    parser = ConfigParser()
    # read config file
    parser.read(filename)

    # get section, default to postgresql
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))

    return db



def get_users_from_old_db(cursor):

    get_users_query = "SELECT name, email, hash, salt, role from public.User;"
    cursor.execute(get_users_query)
    return cursor.fetchall()



def insert_users_to_new_db(cursor_to_new_db, users):

    id = 1
    for user in users:
        name, email, hash, salt, role = user
        isAdmin = False
        if role == 'admin':
            isAdmin = True
        cursor_to_new_db.execute("INSERT INTO liv4d_db_test.User (id, name, email, hash, salt, isAdmin) VALUES (%s, %s, %s, %s, %s, %s)", (id, name, email, hash, salt, isAdmin))


def migrate_users(cursor_to_new_db, cursor_to_old_db):

    insert_users_to_new_db(cursor_to_new_db, get_users_from_old_db(cursor_to_old_db))


if __name__== '__main__':

    # connect to database

    connection_params = config()
    connection_to_liv4d = psycopg2.connect(**connection_params)
    cursor_to_old_db = connection_to_liv4d.cursor()

    # connection to new database
    connection_to_liv4d_test = psycopg2.connect(**connection_params)
    cursor_to_new_db = connection_to_liv4d_test.cursor()

    migrate_users(cursor_to_new_db, cursor_to_old_db)

    cursor_to_new_db.close()
    cursor_to_old_db.close()

    # close connection to database:
    connection_to_liv4d.close()
