import math
import sys
from collections import OrderedDict
from os import makedirs
from os.path import dirname, exists, join

import liv4dcli as cli
import pandas as pd

# ===  CLINICIANS ===
CLINICIANS = {"name": "USER ID"}

CLINICIANS_ID = {v: k for k, v in CLINICIANS.items()}


# === TASKS ===
TASKS = {
    "Bright": ("Cotton Wool Spots", "Drusen", "Exudates", "Uncertain - Bright"),
    "Red": (
        "Hemorrhages",
        "Microaneurysms",
        "Sub-retinal hemorrhage",
        "Pre-retinal hemorrhage",
        "Neovascularization",
        "Uncertain - Red",
    ),
    "Disk": ("Disk", "Cup", "Macula"),
    "Vessels": ("Vessels - Uncertain",),
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
        self.biomarkers = biomarkers
        self.clinician = clinician
        self.clinician_id = CLINICIANS[clinician]

    def __str__(self):
        return "%s|%s %s: [%s] %s" % (self.clinician, self.img_id, self.biomarkers, self.time, self.comment)

    def __repr__(self):
        return "RevisionEntry(%s)" % str(self)

    def update(self, r):
        self.time = r.time
        self.comment = r.comment

    @staticmethod
    def from_df_row(df_row):
        return RevisionEntry(
            img_id=df_row["Image"],
            time=df_row["time"],
            comment=df_row["comment"],
            clinician=df_row["Clinician"],
            revision_path=df_row["path"],
            name=df_row["name"],
        )

    @staticmethod
    def from_revision(revision):
        img_id = revision["image"]["id"]
        img_name = revision["image"]["path"].rsplit("/", 1)[1].rsplit(".", 1)[0]
        clinician = CLINICIANS_ID[revision["user"]["id"]]
        b, t, c = get_diagnostic_info(revision["diagnostic"])
        if "Others" in b:
            b.remove("Others")
        return RevisionEntry(img_id=img_id, name=img_name, time=t, comment=c, clinician=clinician, biomarkers=b)


def info_xls2dict(path):
    if exists(path):
        df = pd.read_excel(path)
        r = OrderedDict()
        for _, row in df.iterrows():
            if math.isnan(row["Image"]):
                continue
            entry = RevisionEntry.from_df_row(row)
            if entry.img_id in r:
                r[entry.img_id].append(entry)
            else:
                r[entry.img_id] = [entry]
        return r
    else:
        return {}


def info_dict2xls(path, rev_dict):
    data_dict = OrderedDict()
    data_dict["Image"] = []
    data_dict["Clinician"] = []
    data_dict["name"] = []
    data_dict["path"] = []
    data_dict["time"] = []
    data_dict["comment"] = []

    for img_id, revisions in rev_dict.items():
        for r in revisions:
            data_dict["Image"].append(img_id)
            data_dict["Clinician"].append(r.clinician)
            data_dict["name"].append(r.name)
            data_dict["path"].append(r.revision_path)
            data_dict["time"].append(r.time)
            data_dict["comment"].append(r.comment)

    df = pd.DataFrame(data_dict)
    makedirs(dirname(path), exist_ok=True)
    df.to_excel(path)


def get_diagnostic_info(diagnostic):
    biomarkers = []
    time = 0
    comment = ""

    for c in diagnostic.split("]"):
        c_stripped = c.strip()
        if c_stripped.startswith("[onlyEnable="):
            b = c_stripped[12:].split(",")
            biomarkers += [_ for _ in b if _ not in ("Others",)]
        elif c_stripped.startswith("[time="):
            t = c[6:].split(":")
            if len(t) == 1:
                t = int(t[0])
            elif len(t) == 2:
                t = int(t[0]) * 60 + int(t[1])
            elif len(t) == 3:
                t = int(t[0]) * 3600 + int(t[1]) * 60 + int(t[2])
            time = t
        else:
            comment += c + "]"

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
        revision.revision_path = revision.name + "_" + len(revisions)


def download(root_path, limit="edited"):
    tasks_metadata = {}
    for task in TASKS.keys():
        meta_path = join(root_path, task, "metadata.xls")
        if exists(meta_path):
            tasks_metadata[task] = info_xls2dict(meta_path)
        else:
            tasks_metadata[task] = {}

    all_revisions = [
        RevisionEntry.from_revision(_) for _ in cli.revision.list_revision() if _["user"]["id"] in CLINICIANS_ID
    ]

    revision_downloaded = False

    for clinician, clinician_id in CLINICIANS.items():
        clinician_revisions = list(filter(lambda r: r.clinician == clinician, all_revisions))

        #   --- Compute revisions: the list of revision to download ---
        if limit == "completed":
            tasks = cli.task.list_task(clinician_id)
            images_id = [_["image"]["id"] for _ in tasks if _["completed"]]
            revisions = list(filter(lambda r: r.img_id in images_id, clinician_revisions))
        elif limit == "submitted":
            revisions = list(filter(lambda r: r.time > 0, clinician_revisions))
        elif limit == "edited":

            def was_edited(revision):
                if revision.time == 0:
                    return False
                for b in revision.biomarkers:
                    b_task = TASK_BY_BIOMARKER[b]
                    r = tasks_metadata[b_task].get(revision.img_id, None)
                    if r is None:
                        return True
                    for _ in r:
                        if _.clinician == clinician and _.time != revision.time:
                            return True
                return False

            revisions = list(filter(was_edited, clinician_revisions))
        elif limit == "new":

            def is_new(revision):
                for b in revision.biomarkers:
                    b_task = TASK_BY_BIOMARKER[b]
                    r = tasks_metadata[b_task].get(revision.img_id, None)
                    if r is None:
                        return True
                    if all(_.clinician != clinician for _ in r):
                        return True
                return False

            revisions = list(filter(is_new, clinician_revisions))
        else:
            raise NotImplementedError(
                "Invalid limit parameter: %s.\n" "Valid values: completed, submitted, edited, new." % limit
            )

        #   --- Download every selected revision ---
        for r in revisions:
            print(" - %i|%s : %s" % (r.img_id, r.name, r.biomarkers))
            revision_svg = cli.revision.get_revision(image_id=r.img_id, user_id=r.clinician_id, svg=True)["svg"]
            for b in r.biomarkers:
                b_task = TASK_BY_BIOMARKER[b]
                b_path = join(root_path, b_task, b)
                update_dict(r, tasks_metadata[b_task])
                cli.revision.export_biomarker(revision_svg, biomarker=b, out=join(b_path, r.revision_path + ".png"))
            revision_downloaded = True

        if revision_downloaded:
            for task, rev_dict in tasks_metadata.items():
                meta_path = join(root_path, task, "metadata.xls")
                info_dict2xls(meta_path, rev_dict)
        else:
            print("Local data already up-to-date.")


if __name__ == "__main__":
    path = "./"
    limit = "edited"
    if len(sys.argv) > 1:
        cli.config.url = sys.argv[1]
    if len(sys.argv) > 2:
        limit = sys.argv[2]
    if len(sys.argv) > 3:
        path = sys.argv[3]
    download(path, limit)
