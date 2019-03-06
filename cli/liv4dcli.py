import click
from commands import biomarker_type, config, image, image_type, preprocessing, preprocessing_type, revision, task, task_type, user, utils

@click.group()
def liv4d_cli():
    pass

liv4d_cli.add_command(biomarker_type.biomarker_type)
liv4d_cli.add_command(image.image)
liv4d_cli.add_command(image_type.image_type)
liv4d_cli.add_command(preprocessing.preprocessing)
liv4d_cli.add_command(preprocessing_type.preprocessing_type)
liv4d_cli.add_command(revision.revision)
liv4d_cli.add_command(task.task)
liv4d_cli.add_command(task_type.task_type)
liv4d_cli.add_command(user.user)

if __name__ == '__main__':
    liv4d_cli()
