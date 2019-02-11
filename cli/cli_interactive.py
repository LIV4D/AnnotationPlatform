import sys 
import os 
sys.path.append(os.path.dirname(os.path.realpath(__file__))) 

import liv4dcli as cli

if len(sys.argv) > 1:
    cli.config.url = sys.argv[1]

import code
code.interact(local=locals())
