import os
from os.path import join, isfile
import cv2

PATH = './'
DIMENSION = 128

files = [f for f in os.listdir(PATH) if isfile(f)]
images = [f for f in files if not f.startswith(('pre', 'thumb')) and f.endswith('.png')]

for i in images:
    thumbnailPath = 'thumbnailI'+i[1:]
    if thumbnailPath in files:
        continue

    img = cv2.imread(join(PATH, i))
    h, w, c = img.shape
    r = max(DIMENSION/h, DIMENSION/w)
    h = int(h*r)
    w = int(w*r)
    img = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)
    cv2.imwrite(join(PATH, 'thumbnailI'+i[1:]), img)


