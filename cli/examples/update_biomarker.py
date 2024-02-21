import base64
import os
import sys
import xml.etree.ElementTree as ET
from io import BytesIO
from os.path import basename, join

import liv4dcli as cli
import numpy as np
from PIL import Image
from tqdm import tqdm


def color_png(png_image, color):
    image = Image.open(png_image)
    image = image.convert("RGBA")
    data = np.array(image)
    red, green, blue, _ = data.T

    black_filter = (red == 0) & (blue == 0) & (green == 0)
    white_filter = (red != 0) | (blue != 0) | (green != 0)
    data[..., :-1][white_filter.T] = color
    data[...][black_filter.T] = (255, 255, 255, 0)

    new_image = Image.fromarray(data)
    buffer = BytesIO()
    new_image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue())


def update_biomarker(path, biomarker, update_all_revision=True, image_id=None):
    images = cli.image.list_image()
    preannotations = [f for f in os.listdir(path) if f.endswith(".png")]
    b_name = biomarker
    biomarkers = ET.fromstring(cli.revision.empty_revision(1)["svg"])
    biomarkers = [_ for _ in biomarkers.iter() if _.get("id") == biomarker]
    if not biomarkers or not biomarkers[0].tag.endswith("image"):
        raise ValueError("%s is not a biomarker." % biomarker)
    biomarker_color = biomarkers[0].get("color")
    biomarker_color = tuple(int(biomarker_color.lstrip("#")[i : i + 2], 16) for i in (0, 2, 4))

    if image_id is None:
        for img in tqdm(images):
            name = basename(img["path"])
            if name in preannotations:
                png = color_png(name, color=biomarker_color)
                cli.image.update_biomarker(img["id"], biomarker, png, update_all_revision, True)
    else:
        for img in images:
            if img["id"] != image_id:
                continue
            name = basename(img["path"])
            if name in preannotations:
                png = color_png(join(path, name), color=biomarker_color)
                cli.image.update_biomarker(img["id"], biomarker, png, update_all_revision, True)
            else:
                raise ValueError("Biomarker %s for image %i: %s not found." % (b_name, img["id"], name))


if __name__ == "__main__":
    path = "./"
    image_id = None
    if len(sys.argv) > 2:
        cli.config.url = sys.argv[2]
    if len(sys.argv) > 3:
        path = sys.argv[3]
    if len(sys.argv) > 4:
        image_id = int(sys.argv[4])
    update_biomarker(path, sys.argv[1], image_id=image_id)
