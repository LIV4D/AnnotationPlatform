from .utilities.json_template import JSONClass, JSONAttr, JSONClassList, JSONAttribute, is_dict
from collections import OrderedDict
import functools
import requests
from .server import Server


def PRIMARY(attr):
    if isinstance(attr, JSONAttribute):
        attr._primary_key = True
        attr.read_only = True
    return attr


def cli_method(f):
    @functools.wraps(f)
    def cli_command_wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Server.BackendError as e:
            raise Server.BackendError(e.msg, e.server) from None
    return cli_command_wrapper


class Entity(JSONClass):
    def __init__(self):
        super(Entity, self).__init__()

    @classmethod
    def primary_key(cls):
        for name, attr in cls.cls_attributes(JSONAttribute).items():
            if getattr(attr, '_primary_key', False):
                return name
        return None

    def primary_key_value(self):
        pk = self.primary_key()
        return None if pk is None else self.get(pk)

    def __repr__(self):
        pk_name = self.primary_key()
        pk = None if pk_name is None else self.get(pk_name, None)
        classname = self.__class__.__name__
        attributes = [name+": "+repr(value).replace("\n", "\n  |   |"+" "*len(name)) for name, value in self.attributes(JSONAttribute).items() if name != pk_name]
        return "\n  |  ".join([classname + ("" if pk is None else "[%s=%s]" % (pk_name, str(pk)))]
                            + attributes)

    def attr_changed(self, attr):
        pass

    # Table Shortcuts
    @classmethod
    def table(cls):
        return None

    def save(self):
        return self.table().update(self)

    def revert(self):
        self.update(self.table()._getById((self.primary_key_value(),))[0].json())

    def delete(self):
        self.table().delete(self)


class EntityTable:
    __entity__ = None

    def __init__(self):
        pass

    def __repr__(self):
        return self.__entity__.__name__ + " Table"

    # Overridable methods
    def _update(self, entity):
        raise NotImplementedError('Update operations are not defined for %s table.' % self.__entity__.__name__)

    def _update_multiples(self, entities):
        for e in entities:
            err = self._update(e)
            if err:
                return err

    def _delete(self, id):
        raise NotImplementedError('Delete operations are not defined for %s table.' % self.__entity__.__name__)

    def _getById(self, indexes):
        raise NotImplementedError('EntityTable subclass must provide an implementation of _getById(ids).')

    # Accessors
    @cli_method
    def getById(self, id):
        single = False
        if not isinstance(id, (list, tuple)):
            single=True
            id = [id]
        r = self._getById(id)
        if single:
            r = r[0]
        return _format_entity(self.__entity__, r)

    def __getitem__(self, item):
        return self.getById(item)

    # Modifiers
    @cli_method
    def update(self, entity):
        self._update(entity)

    @cli_method
    def update_multiples(self, entities):
        self._update_multiples(entities)

    @cli_method
    def delete(self, entities):
        if isinstance(entities, self.__entity__):
            entities = entities.primary_key_value()
        if isinstance(entities, int):
            return self._delete(entities)
        elif isinstance(entities, (list, tuple)):
            for e in entities:
                if not self.delete(e):
                    return False
        raise ValueError('Invalid entities type: %s.' % type(entities).__name__)

    def __delitem__(self, item):
        return self.delete(item)


class EntityList:
    def __init__(self, entity):
        self._entity = entity
        self._primary_key = entity.primary_key()
        self._primary_keys = {}
        self._list = []

    @staticmethod
    def from_json(entity, model):
        elist = EntityList(entity)
        if isinstance(model, str):
            from json import loads
            model = loads(str)
        if is_dict(model):
            elist.add(model)
        elif isinstance(model, (tuple, list)):
            for m in model:
                elist.add(m)
        return elist

    def add(self, entity):
        # Parse entity
        if isinstance(entity, str):
            from json import loads
            entity = loads(entity)
        if is_dict(entity):
            entity = self._entity.from_json(entity)
        if not isinstance(entity, self._entity):
            raise ValueError('Invalid Entity Type.\nExpected type: %s, Given type: %s.'
                             % (self._entity.__name__, type(entity).__name__))

        # Insert entity
        if self._primary_key:
            pk = str(entity.primary_key_value())
            id = self._primary_keys.get(pk, None)
            self._primary_keys[pk] = len(self._list)
            if id is not None:
                del self._list[id]
                self._primary_keys = {k: v-1 if v>id else v for k, v in self._primary_key}
                self._list.append(entity)
                return

        self._list.append(entity)

    def _to_list_id(self, item):
        if isinstance(item, str):
            if self._primary_key:
                id = self._primary_keys.get(item, None)
                if id is None:
                    raise IndexError("Unkown primary key value: %s." % item)
                return id
        elif isinstance(item, int):
            return item % len(self)

    def __getitem__(self, item):
        return self._list[self._to_list_id(item)]

    def __len__(self):
        return len(self._list)

    def items(self):
        if not self._primary_keys:
            raise NotImplementedError()
        return ((e.primary_key_value(),e ) for e in self._list)

    def values(self):
        return (e for e in self._list)

    def keys(self):
        return (e.primary_key_value() for e in self._list)

    def to_json(self, to_str=False):
        if not to_str:
            l = []
            for v in self._list:
                if isinstance(v, JSONClass):
                    v = v.to_json(to_str=False)
                l.append(v)
            return l
        else:
            from json import dumps
            return dumps(self.to_json(to_str=False), indent=True)

    def to_pandas(self):
        from pandas.io.json import json_normalize
        return json_normalize(self.to_json(to_str=False))

    def __repr__(self):
        if self.__len__():
            return repr(self.to_pandas())
        else:
            return "Empty %s list." % self._entity.__name__


def format_entity(entity):
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            r = f(*args, **kwargs)
            return _format_entity(entity, r)
        return wrapper
    return decorator


def _format_entity(entity, data):
    data_type = type(data)
    if isinstance(data, requests.Response):
        data = data.json()
    elif isinstance(data, str):
        from json import loads
        data = loads(data)
    if is_dict(data):
        return entity.from_json(data)
    elif isinstance(data, (list, tuple)):
        return EntityList.from_json(entity, data)
    raise ValueError("Type %s is not parsable as %s." % (data_type.__name__, entity.__name__))


def cli_method(f):
    @functools.wraps(f)
    def cli_command_wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Server.BackendError as e:
            raise Server.BackendError(e.msg, e.server) from None
    return cli_command_wrapper
