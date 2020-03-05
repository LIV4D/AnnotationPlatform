import os
import sys
from os.path import basename, join, abspath
import pandas as pd

path = abspath(join(os.path.dirname(os.path.realpath(__file__)), '../cli/'))
sys.path.append(path) 
import liv4dcli as cli
from junno import log

 
# List Clinicians
CLINICIANS = {
    "Micheal Brent": "4207335d-4aea-4975-8ab0-3d46f8259e6f",
    "Cynthia Quian": "9dbc7fbd-66a9-4990-b53f-291f806f6672",
    "David Wong": "de7b71eb-87b0-4dce-84fe-373e86dc7eb8",
    "Marie-Carole Boucher": "84be2a52-5491-4d67-ad75-1704964eeb51",
    "Ananda Kalevar": "ed2f771f-fd43-4f0f-98f3-c42edfb5f3b4",
    "Karim Hammamji": "7b1dc155-f885-4ad8-9582-b5db27196c66",
    "Renaud Duval": "02758e79-f1e1-4989-8e57-5658672a2b12",
    "Gilles Desroches": "d8fae448-3e1f-41cc-93cd-bef2df151d47"
}
CLINICIANS_r = {v: k for k,v in CLINICIANS.items()}
CLINICIANS_ID = list(CLINICIANS.values())

TASKS = {
    "bright": "Exudates,Cotton Wool Spots,Drusen,Uncertain - Bright",
    "red": "Microaneurysms,Hemorrhages,Sub-retinal hemorrhage,Pre-retinal hemorrhage,Neovascularization,Uncertain - Red",
    "disk": "Disk,Cup,Macula",
    "vessel": "Vessels - Uncertain"
}


TASKS_r = {}
for t in TASKS.items():
    for _ in t[1].split(','):
        TASKS_r[_] = t[0]

def to_task(biomarkers):
    return {TASKS_r[_] for _ in biomarkers}

def get_stats(path):
    # Retreive data
    data = {_: {} for _ in TASKS.keys()}
    
    with log.Process('Downloading revision list...', verbose=False):
        revisions = [{'raw_comment': _['diagnostic'], 'clinician': CLINICIANS_r[_['user']['id']], 'img': _['image']['id']}
                    for _ in cli.revision.list_revision() if _['user']['id'] in CLINICIANS_ID]
    def revision_id(img, user):
        for i, r in enumerate(revisions):
            if r['img'] == img and r['clinician'] == user:
                return i
        return None
    
    with log.Process('Downloading task list...', verbose=False):
        tasks = [{'revision': revision_id(_['image']['id'], CLINICIANS_r[_['user']['id']]), 'img': _['image']['id'], 'clinician':CLINICIANS_r[_['user']['id']], 'completed': _['completed']} 
                for _ in cli.task.list_task(None) if _['user']['id'] in CLINICIANS_ID and _['active']]  
    
    with log.Process('Parsing tasks', verbose=False):
        for task in tasks:
            r = revisions[task['revision']]
            biomarkers, t, c = cli.utils.info_from_diagnostic(r['raw_comment'])
            for b in to_task(biomarkers):
                user = r['clinician']
                if user not in data[b]:
                    d = {'completed': 0, 'incompleted': 0, 'total_completed': 0, 'total': 0}
                    data[b][user] = d
                else:
                    d = data[b][user]
                if task['completed']:
                    d['completed'] += 1
                    d['total_completed'] += t
                else:
                    d['incompleted'] += 1
                d['total'] += t

    # Format data
    from junno.j_utils.string import time2str
    from collections import OrderedDict
    
    F_tasks = []
    F_clinician = []
    F_total_time = []
    F_total_completed_time = []
    F_completed = []
    F_incompleted = []
    
    for t, t_d in data.items():
        for c, d in t_d.items():
            F_tasks.append(t)
            F_clinician.append(c)
            F_total_time.append(time2str(d['total']))
            F_total_completed_time.append(time2str(d['total_completed']))
            F_completed.append(d['completed'])
            F_incompleted.append(d['incompleted'])

    c = list(CLINICIANS.keys())

    df = pd.DataFrame({'Task': pd.Series(F_tasks),
                       'Clinician': pd.Series(F_clinician),
                       'CompletedTasks': pd.Series(F_completed),
                       'IncompleteTasks': pd.Series(F_incompleted),
                       'TotalTimeComplete': pd.Series(F_total_completed_time),
                       'TotalTime': pd.Series(F_total_time),})

    df.to_excel(path)
    

if __name__ == '__main__':
    path = 'clinician_tasks.xls'
    if len(sys.argv) > 1:
        cli.config.url = sys.argv[1]
    if len(sys.argv) > 2:
        path = sys.argv[2]
    get_stats(path)
