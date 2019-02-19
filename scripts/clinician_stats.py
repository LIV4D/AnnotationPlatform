import os
import sys
from os.path import basename, join, abspath
import pandas as pd

path = abspath(join(os.path.dirname(os.path.realpath(__file__)), '../cli/'))
print(path)
sys.path.append(path) 
import liv4dcli as cli
from junno import log

 
# List Clinicians
clinicians = {
    "Micheal Brent": "4207335d-4aea-4975-8ab0-3d46f8259e6f",
    "Cynthia Quian": "9dbc7fbd-66a9-4990-b53f-291f806f6672",
    "David Wong": "de7b71eb-87b0-4dce-84fe-373e86dc7eb8",
    "Marie-Carole Boucher": "84be2a52-5491-4d67-ad75-1704964eeb51",
    "Ananda Kalevar": "ed2f771f-fd43-4f0f-98f3-c42edfb5f3b4",
    "Karim Hammamji": "7b1dc155-f885-4ad8-9582-b5db27196c66",
    "Renaud Duval": "02758e79-f1e1-4989-8e57-5658672a2b12"
}
clinicians_id = {v: k for k, v in clinicians.items()}

def get_stats(path):
    # Retreive data
    completed_tasks = {_: 0 for _ in clinicians.keys()}
    incomplete_tasks = {_: 0 for _ in clinicians.keys()}
    total_completed_time = {_: 0 for _ in clinicians.keys()}
    total_time = {_: 0 for _ in clinicians.keys()}
    with log.Process('Retreiving Tasks List'):
        tasks = None
        while tasks is None:
            try:
                tasks = cli.task.list_task()
            except Exception:
                log.warn('Error retreiving task list. Retrying...')
    
    with log.Process('Getting Tasks Info', total=len(tasks)) as p:
        for task in tasks:
            clinician_id = task['user']['id']
            clinician = clinicians_id[clinician_id]
            
            if task['completed']:
                completed_tasks[clinician] += 1
            else:
                incomplete_tasks[clinician] += 1
            
            img_id = tasks[0]['image']['id']
            
            revision = None
            while revision is None:
                try:
                    revision = cli.revision.get_revision(clinician_id, img_id)
                except Exception:
                    log.warn('Error retreiving revision (img=%i, clinician=%s). Retrying...' % (img_id, clinician))
            comment = revision.get('diagnostic', '')
            
            for c in comment.split(']'):
                c = c.strip()
                if c.startswith('[time='):
                    t = int(c[6:8])*60 + int(c[9:11])
                    total_time[clinician] += t
                    
                    if task['completed']:
                        total_completed_time[clinician] += t
            p.update(1)

    # Format data
    def time2str(t):
        if t > 3600:
            h = t // 3600
            m = t % 3600
            return '%i:%i:%i' % (h, m//60, m%60)
        else:
            return '%i:%i' % (t//60, t%60)
        
    F_total_time = {c: time2str(t) for c, t in total_time.items()}
    F_total_completed_time = {c: time2str(t) for c, t in total_completed_time.items()}
    F_average_time = {c: time2str(t//completed_tasks[c]) if completed_tasks[c] else '' for c, t in total_completed_time.items()}

    c = list(clinicians.keys())

    df = pd.DataFrame({'CompletedTasks': pd.Series(completed_tasks, index=c),
                    'IncompleteTasks': pd.Series(incomplete_tasks, index=c),
                    'AverageTime': pd.Series(F_average_time, index=c),
                    'TotalTimeComplete': pd.Series(F_total_completed_time, index=c),
                    'TotalTime': pd.Series(F_total_time, index=c),})

    df.to_excel(path)
    

if __name__ == '__main__':
    path = 'clinician_tasks.xls'
    if len(sys.argv) > 1:
        cli.config.url = sys.argv[1]
    if len(sys.argv) > 2:
        path = sys.argv[2]
    get_stats(path)
