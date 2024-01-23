# LIV4D CLI

The LIV4D CLI is a python interface for the LIV4D Annotation Plateform. It allows the research teams to manage user accounts; to
create, upload and download images and annotation maps; and finally to assign annotation tasks to users and monitor
their completion.

## Installation

The LIV4D CLI is bundled as a python package. To install it, simply clone the repository and run the following commands:

```bash
git clone https://github.com/LIV4D/AnnotationPlatform.git
cd AnnotationPlatform/cli
pip install .
```

## Usage

Import the package in your python script and specify the URL of our server:

```python
import liv4dcli as cli
cli.config.url = "http://your.server.ca"
```

The examples folder contains a few scripts and notebook that demonstrate the usage of the CLI.
