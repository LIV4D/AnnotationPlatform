End-points Documentation
========================

The end-points described in this document are defnied in controllers files (server/app/controllers).

They use the following postgresqul (or JSON) types defined in models files (server/app/model).

Postgresql/JSON type:
---------------------
#### ``Image``

###### Attributes
 - ``id`` *[Int, Unique Primary]*:
 - ``path`` *[string]*:
 - ``preprocessingPath`` *[attached file]*:
 - ``thumbnail``*[string]*:
 - ``metadata``*[JSON]*:
 - ``type`` *[string, nullable]*:

Image end-points: ``/api/images``
---------------------------------

#### ``POST /api/images/create``
Add a new images in the database.
###### Payload
 - ``type``:
 - ``metadata`` *[JSON dict]*:
 - ``image`` *[attached file]*: The raw image file.
 - ``preprocessing``*[attached file, optional]*: The preprocessed image file.
###### Raise


#### ``PUT /api/images/update/:imageId``
Update the image of index ``:imageId``.
###### Payload
 - ``type``:
 - ``metadata``: A string
 - ``image`` *(attached file)*: The raw image file.
###### Raise

#### ``GET /api/images/:imageId``
Get the image of index ``:imageId``.
###### Return
``Image``
###### Raise

#### ``DELETE /api/images/:imageId``
Delete the image of index ``:imageId``.
###### Return
Code 204
###### Raise

#### ``GET /api/images/list``
Get all images.
###### Return
``Image[]``
###### Raise

#### ``GET /api/images/list/protype``
Get the image of index ``:imageId``.
###### Return
``ImagePrototype[]``
###### Raise

#### ``GET /api/metadata/:imageId``
Get the metadata of image with index ``:imageId``.
###### Return
``JSON``
###### Raise

#### ``GET /api/preproc/:imageId``
Get the preprocessing image of the image with index ``:imageId``.
###### Return
###### Raise

#### ``GET /api/images/thumbnail/:imageId``
Get the thumbnail of the image with index ``:imageId``.
###### Return
###### Raise

#### ``GET /api/images/gallery``
Get the image of index ``:imageId``.
###### Query
 - ``sort``:
 - ``order``:
 - ``page``:
 - ``pageSize``:
 - ``filters``:
###### Return
- ``objects`` [ *IGalleryObject[]* ]:
###### Raise
