import os
import sys
from os.path import basename, join, abspath
import pandas as pd

path = abspath(join(os.path.dirname(os.path.realpath(__file__)), '../cli/'))
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

def get_stats(path):
    # Retreive data
    completed_tasks = {_: 0 for _ in clinicians.keys()}
    incomplete_tasks = {_: 0 for _ in clinicians.keys()}
    total_completed_time = {_: 0 for _ in clinicians.keys()}
    total_time = {_: 0 for _ in clinicians.keys()}
    
    with log.Process('Retreiving Clinicians Stats', total=len(clinicians)) as p:
        for clinician, clinician_id in clinicians.items():
            # Get tasks from a clinician
            tasks = cli.task.list_task(clinician_id)
            
            with log.Process(clinician, total=len(tasks), verbose=False) as p_task:
                for task in tasks:
                    # Check completion
                    completed = task['completed']
                    if completed:
                        completed_tasks[clinician] += 1
                    else:
                        incomplete_tasks[clinician] += 1
                    
                    # Get revision of this task
                    img_id = task['image']['id']
                    revision = cli.revision.get_revision(clinician_id, img_id, False)
                        
                    # Read time
                    comment = revision.get('diagnostic', '')
                    for c in comment.split(']'):
                        c = c.strip()
                        if c.startswith('[time='):
                            t = int(c[6:8])*60 + int(c[9:11])
                            total_time[clinician] += t
                            
                            if completed:
                                total_completed_time[clinician] += t
                    p_task.update(1)
            p.update(1)

    # Format data
    from junno.j_utils.string import time2str
        
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
