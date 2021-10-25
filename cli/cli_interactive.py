import sys 
import os 
sys.path.append(os.path.dirname(os.path.realpath(__file__))) 

import liv4dcli as cli

if len(sys.argv) > 1:
    cli.config.url = sys.argv[1]

bright = "Exudates,Cotton Wool Spots,Drusen,Uncertain - Bright"
red = "Microaneurysms,Hemorrhages,Sub-retinal hemorrhage,Pre-retinal hemorrhage,Neovascularization,Uncertain - Red"
disk = "Disk,Cup,Macula"
vessel = "Vessels - Uncertain"

brent = "4207335d-4aea-4975-8ab0-3d46f8259e6f"
qian = "9dbc7fbd-66a9-4990-b53f-291f806f6672"
wong = "de7b71eb-87b0-4dce-84fe-373e86dc7eb8"
boucher = "84be2a52-5491-4d67-ad75-1704964eeb51"
kalevar = "ed2f771f-fd43-4f0f-98f3-c42edfb5f3b4"
hammamji = "7b1dc155-f885-4ad8-9582-b5db27196c66"
duval = "02758e79-f1e1-4989-8e57-5658672a2b12"
desroches = "d8fae448-3e1f-41cc-93cd-bef2df151d47"

clinicians = [brent, qian, wong, boucher, kalevar, hammamji, duval, desroches]

gabriel = "b45c99c9-b10e-4cd9-96d7-4060a889184b"

from IPython import embed
embed(colors='neutral')
