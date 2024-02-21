# LIV4D - Annotation Platform

The _LIV4D Annotation Platform_ is a web app designed to annotate pathological or anatomical structures on medical images.

It was initially developed to annotate fundus images of the [MAPLES-DR](https://figshare.com/articles/dataset/_b_MAPLES-DR_b_MESSIDOR_Anatomical_and_Pathological_Labels_for_Explainable_Screening_of_Diabetic_Retinopathy/24328660) public dataset.

![demo video](./documentation/demo.gif)

## Features
- __Web based__: Once installed on your institution server, the annotation plateform is available everywhere without installation.
- __Secured__: Each annotator has his own account and must authentify before gaining access to the medical images and annotations.
- __Task Oriented__: The annotation work is organised in tasks, assigned to annotators. Hence, multiple annotators can simultanously annotate different biomarkers on the same image.
- __Efficient__: The annotation editor was designed with labelling efficiency in mind. It includes several visual enhancements algorithms, shortcuts and specialized annotation tools to simplify and accelerate the annotation process.
- __Graphics Tablet Support__: The annotation interface may be manipulated with a graphics stylus, some annotation tools are even pressure sensitive!

## Ressources
All the platform functionalities are described in details in the [User Guide](documentation/UserGuide.pdf). This document was written to help our team of clinicians familiarize themselves with the platform interface.

A one-page overview of the annotation tools is also available [here](documentation/101guide.pdf).

## Install

To host the platform on your own server, see the [installation guide](documentation/InstallationGuide.pdf). 
Once the server is setup, the platform is accessible as a web app without requiring any installation on the client side.

To interact programmatically with the database, we provide a CLI bundled as a Python package which must be installed locally. See [CLI Readme](cli/) for installation instructions. 





