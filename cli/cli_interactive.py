import sys
import os
from IPython import embed

sys.path.append(os.path.dirname(os.path.realpath(__file__)))
import cli_api

if len(sys.argv) > 1:
    url = sys.argv[1]
    cli_api.config.url = url
    cli_api.server.server._url = url

cli = cli_api.cli


print("Connected to: "+cli_api.config.url)
print('Commands are accessible through "cli.". The cli module is imported as "cli_api". Press Ctrl+D to quit.')
print(" --- ")
embed(colors='neutral')
