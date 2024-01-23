import os
from os.path import join, isfile
import cv2
import argparse


def create_thumbnails(path, size):
    files = [f for f in os.listdir(path) if isfile(f)]
    images = [f for f in files 
              if not f.startswith(('pre', 'thumb')) and f.endswith(('.png', '.jpg'))]

    for i in images:
        thumbnailPath = 'thumbnailI'+i[1:]
        if thumbnailPath in files:
            continue

        img = cv2.imread(join(path, i))
        h, w, c = img.shape
        r = max(size/h, size/w)
        h = int(h*r)
        w = int(w*r)
        img = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)
        cv2.imwrite(join(path, 'thumbnailI'+i[1:]), img)


if __name__ == '__main__':
    args = argparse.ArgumentParser()
    args.add_argument('-p', '--path', help='Path to images', default='.')
    args.add_argument('-s', '--size', help='Size of thumbnail', default=128)
    args = args.parse_args()
    create_thumbnails(args.path, args.size)
