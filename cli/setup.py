from setuptools import setup, find_packages

setup(
    name='liv4dcli',
    version='0.9',
    packages=find_packages(),
    install_requires=[
        #'click',
        'requests',
        'IPython',
        'inspect',
        'pandas'

    ],
    #entry_points='''
    #    [console_scripts]
    #    liv4dcli=liv4dcli:liv4d_cli
    #''',
)
