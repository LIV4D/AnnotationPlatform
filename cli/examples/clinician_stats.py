import sys

import liv4dcli as cli
import pandas as pd

# ===  CLINICIANS ===
CLINICIANS = {"name": "USER ID"}
CLINICIANS_r = {v: k for k, v in CLINICIANS.items()}
CLINICIANS_ID = list(CLINICIANS.values())

# ===  TASKS TYPE ===
TASKS = {
    "bright": "Exudates,Cotton Wool Spots,Drusen,Uncertain - Bright",
    "red": "Microaneurysms,Hemorrhages,Sub-retinal hemorrhage,Pre-retinal hemorrhage,Neovascularization,Uncertain - Red",
    "disk": "Disk,Cup,Macula",
    "vessel": "Vessels - Uncertain",
}

TASKS_r = {}
for t in TASKS.items():
    for _ in t[1].split(","):
        TASKS_r[_] = t[0]


def to_task(biomarkers):
    return {TASKS_r[_] for _ in biomarkers}


# ===  Read Stats ===
def get_stats(path):
    # Retreive data
    data = {_: {} for _ in TASKS.keys()}

    print("Downloading revision list...")
    revisions = [
        {"raw_comment": _["diagnostic"], "clinician": CLINICIANS_r[_["user"]["id"]], "img": _["image"]["id"]}
        for _ in cli.revision.list_revision()
        if _["user"]["id"] in CLINICIANS_ID
    ]

    def revision_id(img, user):
        for i, r in enumerate(revisions):
            if r["img"] == img and r["clinician"] == user:
                return i
        return None

    print("Downloading task list...")
    tasks = [
        {
            "revision": revision_id(_["image"]["id"], CLINICIANS_r[_["user"]["id"]]),
            "img": _["image"]["id"],
            "clinician": CLINICIANS_r[_["user"]["id"]],
            "completed": _["completed"],
        }
        for _ in cli.task.list_task(None)
        if _["user"]["id"] in CLINICIANS_ID and _["active"]
    ]

    print("Parsing tasks")
    for task in tasks:
        r = revisions[task["revision"]]
        biomarkers, t, c = cli.utils.info_from_diagnostic(r["raw_comment"])
        for b in to_task(biomarkers):
            user = r["clinician"]
            if user not in data[b]:
                d = {"completed": 0, "incompleted": 0, "total_completed": 0, "total": 0}
                data[b][user] = d
            else:
                d = data[b][user]
            if task["completed"]:
                d["completed"] += 1
                d["total_completed"] += t
            else:
                d["incompleted"] += 1
            d["total"] += t

    # Format data
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
            F_total_time.append(d["total"])
            F_total_completed_time.append(d["total_completed"])
            F_completed.append(d["completed"])
            F_incompleted.append(d["incompleted"])

    c = list(CLINICIANS.keys())

    df = pd.DataFrame(
        {
            "Task": pd.Series(F_tasks),
            "Clinician": pd.Series(F_clinician),
            "CompletedTasks": pd.Series(F_completed),
            "IncompleteTasks": pd.Series(F_incompleted),
            "TotalTimeComplete": pd.Series(F_total_completed_time),
            "TotalTime": pd.Series(F_total_time),
        }
    )

    df.to_excel(path)


if __name__ == "__main__":
    path = "clinician_tasks.xls"
    if len(sys.argv) > 1:
        cli.config.url = sys.argv[1]
    if len(sys.argv) > 2:
        path = sys.argv[2]
    get_stats(path)
