import liv4dcli as cli

cli.config.url = "http://your.server.ca"

# ===    TASKS    ===
bright = "Cotton Wool Spots,Drusen,Exudates,Uncertain - Bright,Others"
red = (
    "Hemorrhages,Microaneurysms,Sub-retinal hemorrhage,Pre-retinal hemorrhage,Neovascularization,Uncertain - Red,Others"
)
disk = "Disk,Cup,Macula,Others"
vessel = "Vessels - Uncertain,Others"


# ===    USERS    ===
user_assign = {
    "4207335d-4aea-4975-8ab0-3d46f8259e6f": red,
    "9dbc7fbd-66a9-4990-b53f-291f806f6672": red,
    "de7b71eb-87b0-4dce-84fe-373e86dc7eb8": red,
    "84be2a52-5491-4d67-ad75-1704964eeb51": bright,
    "ed2f771f-fd43-4f0f-98f3-c42edfb5f3b4": bright,
    "7b1dc155-f885-4ad8-9582-b5db27196c66": disk,
    "02758e79-f1e1-4989-8e57-5658672a2b12": vessel,
}

task_assign = {}
for user, task in user_assign.items():
    if task not in task_assign:
        task_assign[task] = []
    task_assign[task].append(user)


# ===    IMAGES    ===
# fmt: off
batch = [3, 5, 7, 8, 10, 12, 13, 14, 15, 22, 16, 36, 52, 53, 64, 68, 70, 75, 78, 85, 116, 207, 295, 997, 1032, 28, 128, 
         235, 270, 648, 2, 4, 11, 20, 21, 88, 137, 167, 17, 38, 9, 23, 49, 81, 98, 18, 19, 1, 6, 25]
# fmt: on

for img in batch:
    for task, users in task_assign.items():
        user = users.pop(0)
        users.append(user)
        cli.task.create(image_id=img, task_type_id=1, user_id=user, limit_biomarkers=task)
