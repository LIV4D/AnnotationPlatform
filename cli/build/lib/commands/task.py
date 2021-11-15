import click
from . import utils
from collections import OrderedDict

@click.group(help='Commands to manage tasks')
def task():
    pass

@task.command(name='create', help='Create a new task')
@click.option('--imageId', 'image_id', help='Id of the image associated to the task', required=True)
@click.option('--taskTypeId', 'task_type_id', help='Id of the task type', required=True)
@click.option('--userId', 'user_id', help='Id of the user receiving the task', required=True)
@click.option('--limit_biomarkers', 'limit_biomarkers', help='Limit the task to specific biomarkers', required=False, default='')
@click.option('--active', help='Boolean specifying if the task is active (default=true)', required=False, default=True)
@click.option('--completed', help='Boolean specifying if the task is completed (default=false)', required=False, default=False)
def _create(image_id, task_type_id, user_id, limit_biomarkers, active, completed):
    create(image_id, task_type_id, user_id, limit_biomarkers, utils.to_boolean(active), utils.to_boolean(completed), True)

def create(image_id, user_id, limit_biomarkers=None, diagnostic=False, active=True, completed=False, display=True, comment="", force=False, merge=True, task_type_id=1):
    if isinstance(image_id, (list,tuple,set)):
        for i in image_id:
            if not create(i, user_id=user_id, limit_biomarkers=limit_biomarkers, active=active, completed=completed, display=display, diagnostic=diagnostic,
                          comment=comment, force=force, merge=merge, task_type_id=task_type_id):
                return False
        return True
    
    if diagnostic:
        limit_biomarkers = ''
        if not isinstance(diagnostic, str):
            diagnostic = '0'
    if limit_biomarkers is None:
        limit_biomarkers = ''
        
    c = ""
    if limit_biomarkers or comment or diagnostic:
        if isinstance(limit_biomarkers, (list, tuple)):
                limit_biomarkers = ','.join(limit_biomarkers)
            
        from . import revision
        r = revision.get_revision(user_id=user_id, image_id=image_id, svg=False)
        if r is not None and r['diagnostic']:
            if not force and not utils.confirm('A revision already existed for image %i and user %s. \t\nAre you sure you want to assign a new task?' % (image_id, user_id), default='n'):
                print('Cancelling...')
                return False
            t = 0 
            if merge:
                b, t, c = utils.info_from_diagnostic(r['diagnostic'])
                biomarkers = set(b)
                biomarkers.update(set(_.strip() for _ in limit_biomarkers.split(',')))
                limit_biomarkers = ','.join(biomarkers)
                if c and comment:
                    c += '\n'
                comment = utils.info_to_diagnostic(time=t, comment=c+comment)
            
        if limit_biomarkers:
            c += '[onlyEnable='+limit_biomarkers+',Others]'
        if diagnostic:
            c += '[diagnostic='+diagnostic+']'
        if comment:
            c += comment
        revision.update_diagnostic(c, user_id=user_id, image_id=image_id)
        
    payload = { 'imageId': image_id, 'taskTypeId': task_type_id, 'userId': user_id,
        'active': str(active).lower(), 'completed': str(completed).lower() }
    response = utils.request_server('POST', '/api/tasks', payload)
    if response.status_code == 200:
        if display:
            print('Task {!s} has been created.'.format(response.json()))
    else:
        if display:
            print(response.json()['message'])
        return False
    return True

@task.command(name='list', help='Lists the existing tasks in the database')
@click.option('--userId', 'user_id', help='Id to list only the tasks of a user (not required)', required=False)
def _list_task(user_id=None):
    list_task(user_id, True)

def list_task(user_id=None, display=False):
    if user_id is not None:
        response = utils.request_server('GET', '/api/tasks/list/{}'.format(user_id))
    else:
        response = utils.request_server('GET', '/api/tasks/list')
    if not response.status_code == 200:
        print('Error:', response.json()['message'])
        return []
    if display:
        print('Tasks table')
        pretty_data = [OrderedDict([
                            ('id', _['id']), 
                            ('user', _['user']['name']), 
                            ('img', _.get('image', {'id': '?'})['id']),
                            ('active', '  X' if _['active'] else ' '),
                            ('completed', '    X' if _['completed'] else ' ')
                        ]) for _ in response.json()]
        utils.pretty_print_table(pretty_data)
    return response.json()

@task.command(name='update', help='Updates an existing task in the database')
@click.option('--taskId', 'task_id', help='Id to identify the task', required=True)
@click.option('--completed', help='Completion of the task (true or false)', required=True)
def _update(task_id, completed):
    update(task_id, completed, True)

def update(task_id, completed, display=False):
    if isinstance(task_id, (set, list, tuple)):
        success = True
        for task in task_id:
            success = update(task, completed=completed, display=display)
            if not success:
                break
        return success
    
    payload = { 'completed': completed }
    response = utils.request_server('PUT', '/api/tasks/{}'.format(task_id), payload)
    if display and response.status_code == 200:
        print('The task with id {} has been updated successfully.'.format(task_id))
    return True if response.status_code == 200 else print(response.json()['message'])

def update_visibility(task_id, visible):
    if isinstance(task_id, (set, list, tuple)):
        success = True
        for task in task_id:
            success = update_visibility(task, visible=visible)
            if not success:
                break
        return success
    
    payload = { 'active': visible }
    response = utils.request_server('PUT', '/api/tasks/{}'.format(task_id), payload)
    return True if response.status_code == 200 else print(response.json()['message'])

def completion_check(user, tasks_id=False):
    from . import revision
    tasks = list_task(user_id=user)
    if tasks_id:
        tasks_id = {t['image']['id']:t['id'] for t in tasks if t['completed']}
    tasks = {t['image']['id'] for t in tasks if t['completed']}
    if not tasks:
        return False
    
    revisions = revision.list_revision(user=user)
    revisions = {r['image']['id'] for r in revisions if utils.info_from_diagnostic(r['diagnostic'])[1] == 0}
    
    inter = revisions.intersection(tasks)
    if inter:
        return inter if not tasks_id else {tasks_id[t] for t in inter}
    else:
        return False
    
def hide_completed(user):
    tasks = list_task(user)
    disable_tasks = [t['id'] for t in tasks if t['completed'] and t['active']]
    if update_visibility(disable_tasks, False):
        print('%s tasks were disabled.' % len(disable_tasks))

def update_user(img_id, old_user_id, new_user_id, force=False, copy_biomarker='auto', keep_initial_task=False, keep_initial_revision=True,
                merge_task=False, context=None, verbose=False):
    if context is None:
        context = {'tasks':[], 'revisions': []}
    if isinstance(img_id, (list, tuple, set)):
        success = True
        for i in img_id:
            print("\n--- IMAGE: %i ---" % i)
            success &= update_user(i, old_user_id, new_user_id, force=force, copy_biomarker=copy_biomarker, merge_task=merge_task,
                                   keep_initial_task=keep_initial_task, keep_initial_revision=keep_initial_revision, context=context)
        return success
    
    from . import revision
    tasks = context['tasks']
    revisions = context['revisions']
    if not tasks:
        tasks += list_task(user_id=old_user_id)
        tasks += list_task(user_id=new_user_id)
    if not revisions:
        revisions += revision.list_revision(user=old_user_id)
        revisions += revision.list_revision(user=new_user_id)
    
    old_task = None
    erased_task = None
    for t in tasks:
        if t['image']['id'] == img_id:
            if t['user']['id']==old_user_id:
                old_task = t
            if t['user']['id']==new_user_id:
                erased_task = t
        if old_task is not None and erased_task is not None:
            break
    if old_task is None:
        raise ValueError('No task found for img %i and user %s' % (img_id, old_user_id))
    
    old_revision = None
    erased_revision = None
    for r in revisions:
        if r['image']['id'] == img_id:
            if r['user']['id']==old_user_id:
                old_revision = r
            if r['user']['id']==new_user_id:
                erased_revision = r
        if old_revision is not None and erased_revision is not None:
            break
    if old_revision is None:
        raise ValueError('No revision is associated with the task (img: %i, user: %s).' % (img_id, old_task['user']['name']))
    
    if not keep_initial_task and old_task['completed'] and not force:
            if not utils.confirm('This task is already completed. \t\nAre you sure you want to change the current user?', default='n'):
                print('Cancelling...')
                return
            
    if not merge_task and erased_task and erased_task['completed'] and not force:
        if not utils.confirm('%s already have a completed task (#%i) on this image. \t\nAre you want to erase this task?'
                             % (erased_task['user']['name'], erased_task['id']), default='n'):
            print('Cancelling...')
            return
    
    biomarkers, time, comment = utils.info_from_diagnostic(old_revision['diagnostic'])
    if not keep_initial_revision and not force:
        if time != 0:
            if not utils.confirm('%s modified the revision of image %i. \t\nAre you sure you want to delete his/her revision?' % (old_task['user']['name'], img_id), default='n'):
                print('Cancelling...')
                return
    updated_biomarkers = biomarkers
    
    if erased_revision is not None:
        biomarkers, time, comment = utils.info_from_diagnostic(erased_revision['diagnostic'])
        
        b_intersect = set(biomarkers).intersection(updated_biomarkers)
        if b_intersect and not force:
            if not utils.confirm('A revision already exists for image %i and user %s. \t\nAre you sure you want to erase biomarkers %s?' % (img_id, erased_revision['user']['name'], b_intersect), default='n'):
                print('Cancelling...')
                return

    irreversible_operations = []
    def log_error(error):
        if irreversible_operations:
            print("/!\\ FATAL ERROR: "+error+" /!\\")
            print("The following operation were performed and are NOT reversible:")
            for o in irreversible_operations:
                print(' - '+o)
        else:
            print("Error: "+error)
            print("Aborting (img_id=%i)..." % img_id)

    if erased_task is not None:
        operation_description = "Deleting Task #%i [img=%i,user=%s]" % (erased_task['id'], img_id, erased_task['user']['name'])
        if verbose:
            print("\t"+operation_description)
        if not delete(erased_task['id'], display=True):
            log_error("task %i [img=%i,user=%s] couldn't be deleted." % (erased_task['id'], img_id, erased_task['user']['name']))
            return False
        irreversible_operations.append(operation_description)
    
    biomarkers, time, comment = utils.info_from_diagnostic(old_revision['diagnostic'])
    if copy_biomarker == 'auto':
        copy_biomarker = time!=0
    
    operation_description = "Creating Task [img=%i,new_user=%s]" % (img_id, new_user_id)
    if verbose:
        print("\t"+operation_description)
    if not create(img_id, new_user_id, limit_biomarkers=biomarkers, comment=comment, display=True, force=True, merge=merge_task):
        log_error("task [img=%i,user=%s] couldn't be created" % (img_id, new_user_id))
        return False
    irreversible_operations.append(operation_description)
    
    if copy_biomarker:
        for b in biomarkers:
            operation_description = "Transfering/Erasing biomarker [%s]" % b
            if verbose:
                print("\t"+operation_description)
            if not revision.transfer_biomarker(img_id, old_user_id, new_user_id, b, force=True, display=True):
                log_error("Transferring biomarker [%s] failed." % b)
                return False
            irreversible_operations.append(operation_description)
    
    if not keep_initial_task:
        operation_description = "Deleting Task #%i [img=%i,user=%s]" % (old_task['id'], img_id, old_task['user']['name'])
        if verbose:
            print("\t"+operation_description)
        if not delete(old_task['id'], display=True):
            log_error("task %i [img=%i,user=%s] couldn't be deleted." % (old_task['id'], img_id, old_task['user']['name']))
            return False
        irreversible_operations.append(operation_description)
        
    if keep_initial_revision:
        if not keep_initial_task and (time or comment):
            revision.update_diagnostic(utils.info_to_diagnostic(time=time, comment=comment), user_id=old_user_id, image_id=img_id)
    elif old_revision:
        operation_description = "Deleting revision %i [img=%i,user=%s]" % (old_revision['id'], img_id, old_revision['user']['name'])
        if verbose:
            print("\t"+operation_description)
        if not revision.delete(old_user_id, img_id, display=True):
            log_error("revision %i [img=%i,user=%s] couldn't be deleted." % (old_revision['id'], img_id, old_revision['user']['name']))
            return False
        irreversible_operations.append(operation_description)
    
    return True


@task.command(name='delete', help='Deletes an existing task in the database')
@click.option('--taskId', 'task_id', help='Id to identify the task', required=True)
def _delete(task_id):
    delete(task_id, True)

def delete(task_id, display=False):
    response = utils.request_server('DELETE', '/api/tasks/{}'.format(task_id))
    if display and response.status_code == 204:
        print('The task with id {} has been deleted successfully.'.format(task_id))
    return True if response.status_code == 204 else print(response.json()['message'])

def delete_all_from_user(user_id, display=True):
    tasks = list_task(user_id, False)
    if not tasks:
        print('No tasks are linked to this user. Nothing to delete')
        return
    
    if not utils.confirm('%i tasks are linked to the user %s. Are you sure you want to delete them? (Revision will not be deleted but comments will...)' % (len(tasks), tasks[0]['user']['name']), default='n'):
        print('Aborting...')
        return
    
    from .revision import update_diagnostic
    
    for task in tasks:
        img_id = task['image']['id']
        task_id = task['id']
        update_diagnostic('', user_id, task_id, display=False)
        delete(task_id, display=False)
        if display:
            print('Task %i Removed!  (image #%i, user: %s)' % (task_id, img_id, task['user']['name']))
