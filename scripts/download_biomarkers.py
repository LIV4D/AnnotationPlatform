import os
import sys
from os.path import basename, join, abspath, exists
import pandas as pd
from collections import OrderedDict

path = abspath(join(os.path.dirname(os.path.realpath(__file__)), '../cli/'))
sys.path.append(path) 
import liv4dcli as cli
from junno import log
from junno.j_utils.string import time2str


# ===  CLINICIANS ===
CLINICIANS = {
    "Micheal Brent": "4207335d-4aea-4975-8ab0-3d46f8259e6f",
    "Cynthia Quian": "9dbc7fbd-66a9-4990-b53f-291f806f6672",
    "David Wong": "de7b71eb-87b0-4dce-84fe-373e86dc7eb8",
    "Marie-Carole Boucher": "84be2a52-5491-4d67-ad75-1704964eeb51",
    "Ananda Kalevar": "ed2f771f-fd43-4f0f-98f3-c42edfb5f3b4",
    "Karim Hammamji": "7b1dc155-f885-4adB8-9582-b5db27196c66",
    "Renaud Duval": "02758e79-f1e1-4989-8e57-5658672a2b12"
}

CLINICIANS_ID = {v: k for k, v in CLINICIANS.items()}


# === TASKS ===
TASKS = {
    "Bright": ("Cotton Wool Spots", "Drusen", "Exudates", "Uncertain - Bright"),
    "Red": ("Hemorrhages", "Microaneurysms", "Sub-retinal hemorrhage", "Pre-retinal hemorrhage",
            "Neovascularization", "Uncertain - Red"),
    "Disk": ("Disk", "Cup", "Macula"),
    "Vessels": ("Vessels - Uncertain",)
}

TASK_BY_BIOMARKER = {}
for t, biomarkers in TASKS.items():
    TASK_BY_BIOMARKER.update({b: t for b in biomarkers})


class RevisionEntry:
    def __init__(self, img_id, name, clinician, time, comment, revision_path=None, biomarkers=None):
        self.img_id = img_id
        self.name = name
        self.time = time
        self.comment = comment
        self.revision_path = revision_path
        self.biomarkers = biomarker
        self.clinician = clinician
        self.clinician_id = CLINICIANS[clinician]

    def infer_path(self, rev_dict):
        if self.revision_path is not None:
            return self.revision_path
        sibling_rev = rev_dict[self.img_id]

    def revision(self, r):
        self.time = r.time
        self.comment = r.comment

    @staticmethod
    def from_df_row(df_row):
        return RevisionEntry(img_id=df_row['Image'], time=df_row['time'], comment=df_row['comment'],
                             clinician=df_row['Clinician'], revision_path=df_row['path'], name=df_row['name'])

    @staticmethod
    def from_revision(revision):
        img_id = revision['image']['id']
        img_name = revision['image']['path'].rsplit('/', 1)[1].rsplit('.', 1)[0]
        clinician = CLINICIANS_ID[revision['user']['id']]
        b, t, c = get_diagnostic_info(revision['diagnostic'])
        if 'Others' in b:
            b.remove('Others')
        return RevisionEntry(img_id=img_id, name=img_name, time=time, comment=c, clinician=clinician, biomarkers=b)


def info_xls2dict(path):
    if exists(path):
        df = pd.read_excel(path)
        r = OrderedDict()
        for id, row in df.iterrows():
            entry = RevisionEntry.from_df_row(row)
            if entry.img in r:
                r[entry.img].append(entry)
            else:
                r[entry.img] = [entry]
    else:
        return {}


def info_dict2xls(path, rev_dict):
    data_dict = OrderedDict()
    data_dict['Image'] = []
    data_dict['Clinician'] = []
    data_dict['name'] = []
    data_dict['path'] = []
    data_dict['time'] = []
    data_dict['comment'] = []

    for img_id, revisions in rev_dict.items():
        for r in revisions:
            data_dict['Image'].append(img_id)
            data_dict['Clinician'].append(r.clinician)
            data_dict['name'].append(r.name)
            data_dict['path'].append(r.revision_path)
            data_dict['time'].append(r.time)
            data_dict['comment'].append(r.comment)

    df = pd.DataFrame(data_dict)
    df.to_excel(path)


def get_diagnostic_info(diagnostic):
    biomarkers = []
    time = 0
    comment = ""
    
    for c in diagnostic.split(']'):
        c_stripped = c.strip()
        if c_stripped.startswith('[onlyEnable='):
            b = c_stripped.split(',')
            biomarkers += [_ for _ in b if _ not in ('Others', )]
        elif c_stripped.startswith('[time='):
            time = int(c_stripped[6:8])*60 + int(c_stripped[9:11])
        else:
            comment += c+']'

    if comment:
        comment = comment[:-1]

    return biomarkers, time, comment


def update_dict(revision: RevisionEntry, rev_dict):
    revisions = rev_dict.get(revision.img_id, None)
    if revisions is None:
        revision.revision_path = revision.name
        rev_dict[revision.img_id] = [revision]
    else:
        for r in revisions:
            if r.clinician == revision.clinician:
                r.update(revision)
                revision.revision_path = r.revision_path
                return
        revisions.append(revision)
        revision.revision_path = revision.name+'_'+len(revisions)


def download(root_path, limit="edited"):
    with log.Process('Reading existing files') as p:
        tasks_metadata = {}
        for task in TASKS.keys():
            meta_path = join(root_path, task, 'metadata.xls')
            if exists(meta_path):
                tasks_metadata[task] = info_xls2dict(meta_path)
            else:
                tasks_metadata[task] = {}
    
    with log.Process('Retreiving Clinicians Infos', total=len(clinicians)) as p:
        all_revisions = [RevisionEntry.from_revision(_) for _ in cli.revision.list_revision()]
        
        for clinician, clinician_id in CLINICIANS.items():
            clinician_revisions = list(filter(lambda r: r.clinician == clinician, all_revisions))

            #   --- Compute revisions: the list of revision to download ---
            if limit == "completed":
                tasks = cli.task.list_task(clinician_id)
                images_id = [_['image']['id'] for _ in tasks if _['completed']]
                revisions = list(filter(lambda r: r.img_id in images_id, clinician_revisions))
            elif limit == "submitted":
                revisions = list(filter(lambda r: r.time > 0, clinician_revisions))
            elif limit == 'edited':
                def was_edited(revision):
                    if revision.time == 0:
                        return False
                    r = tasks_metadata.get(revision.img_id, None)
                    if r is not None:
                        for _ in r:
                            if _.clinician == clinician:
                                return _.time != revision.time
                    return False
                revisions = list(filter(was_edited, clinician_revisions))
            elif limit == 'new':
                def is_new(revision):
                    r = tasks_metadata.get(revision.img_id, None)
                    if r is not None:
                        return all(_.clinician != clinician for _ in r)
                    return False
                revisions = list(filter(is_new, clinician_revisions))
            else:
                raise NotImplementedError

            #   --- Download every selected revision ---
            with log.Process(clinician, total=len(revisions), verbose=False) as p_revision:
                for r in revisions:
                    for b in r.biomarkers:
                        b_task = TASK_BY_BIOMARKER[b]
                        b_path = join(root_path, b_task, b)
                        update_dict(r, tasks_metadata)
                        cli.revision.get_revision(image_id=r.img_id, user_id=r.clinician_id, biomarker=b,
                                                  out=join(b_path, r.revision_path+'.png'))
                    p_revision.update(1)
            p.update(1)


if __name__ == '__main__':
    path = 'clinician_tasks.xls'
    if len(sys.argv) > 1:
        cli.config.url = sys.argv[1]
    if len(sys.argv) > 2:
        path = sys.argv[2]
    get_stats(path)
