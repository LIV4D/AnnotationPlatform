from .class_attribute import ClassAttrHandler, ClsAttribute
from .collections import is_dict, if_none, dict_walk, dict_walk_zip, dict_deep_copy


def check_json_type(t):
    return t == 'same_class' or issubclass(t, (dict, list, tuple, str, int, float, bool, JSONClass))


class JSONAttribute(ClsAttribute):
    def __init__(self, types, default=None, islist=False, read_only=False):
        super(JSONAttribute, self).__init__(read_only=read_only)
        self.default = default
        self.islist = islist
        if isinstance(types, type):
            types = (types,)
        for t in types:
            if not check_json_type(t):
                raise JSONClass.InvalidTemplateException('Invalid JSON type: %s.' % t)
        self.types = types

    def __set_name__(self, owner, name):
        self.types = tuple(t if t != 'same_class' else owner for t in self.types)
        return super(JSONAttribute, self).__set_name__(owner, name)

    def new_attr(self, handler):
        if self.islist:
            l = JSONClassList(self)
            if self.default is not None:
                l.update(self.default, recursive=False)
            return l
        else:
            return self.default

    def check_attr(self, handler, value):
        if self.islist:
            l = JSONClassList(self)
            for v in value:
                l.append(_parse_type(v, self))
            value = l
        else:
            value = _parse_type(value, self)
        return value

    def attr_to_json(self, handler, value):
        if isinstance(value, (JSONClass, JSONClassList)):
            return value.to_json(to_str=False)
        return value

    def attr_from_json(self, handler, value):
        return _parse_type(value, self)

    # ---   DECORATORS ---
    def to_json(self, f):
        def attr_to_json(self, handler, value):
            return f(handler, value)
        self.attr_to_json = attr_to_json

    def from_json(self, f):
        def attr_from_json(self, handler, value):
            return f(handler, value)
        self.attr_from_json = attr_from_json


class JSONAttr(JSONAttribute):
    def __init__(self, types, default=None, read_only=False):
        super(JSONAttr, self).__init__(types=types, default=default, islist=False, read_only=read_only)

    class List(JSONAttribute):
        def __init__(self, types, default=(), read_only=False):
            super(JSONAttr.List, self).__init__(types=types, default=default, islist=True, read_only=read_only)

    class String(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False):
            if default is None:
                default = '' if not list else []
            super(JSONAttr.String, self).__init__(types=str, default=default, islist=list, read_only=read_only)

    class Float(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False):
            if default is None:
                default = 0 if not list else []
            super(JSONAttr.Float, self).__init__(types=(float,), default=default, islist=list, read_only=read_only)

    class Int(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False):
            if default is None:
                default = 0 if not list else []
            super(JSONAttr.Int, self).__init__(types=(int,), default=default, islist=list, read_only=read_only)

    class Bool(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False):
            if default is None:
                default = 0 if not list else []
            super(JSONAttr.Bool, self).__init__(types=(bool,), default=default, islist=list, read_only=read_only)

    class Dict(JSONAttribute):
        def __init__(self, default=None, read_only=False):
            if default is None:
                default = {}
            super(JSONAttr.Dict, self).__init__(types=(dict,), default=default, islist=False, read_only=read_only)

    class SameClass(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False):
            if default is None:
                default = 0 if not list else []
            super(JSONAttr.SameClass, self).__init__(types=('same_class',), default=default, islist=list, read_only=read_only)


def _parse_type(data, types):
    if data is None:
        return None
    attr = None
    if isinstance(types, JSONAttribute):
        attr = types
        types = attr.types
    elif isinstance(types, type):
        types = (types,)

    for t in types:
        if t is type(data):
            return data
        try:
            if issubclass(t, JSONClass):
                return t.from_json(data)
            else:
                return t(data)
        except Exception:
            pass
    if attr:
        raise JSONClass.ParseException(attr, 'Invalid value for attribute %s: %s.\n'
                                             '(Valid types: %s Provided type: %s)' % (attr.name, repr(data),
                                                                                      tuple(_.__name__ for _ in types),
                                                                                      type(data).__name__))
    else:
        raise JSONClass.ParseException(attr, 'Invalid value\n'
                                             '(Valid types: %s Provided type: %s)' % (tuple(_.__name__ for _ in types),
                                                                                      type(data).__name__))


class JSONClassList:
    def __init__(self, attr=None, types=None, unique_key=None):
        if attr is not None:
            self._types = attr.types
            self._attr = attr
            if unique_key is not None:
                self._unique_key = unique_key
            else:
                self._unique_key = self._attr.islist if isinstance(self._attr.islist, str) else None
        else:
            self._types = types
            self._attr = None
            self._unique_key = unique_key if unique_key is not None else None
        self._list = []
        self._mapping = {}

    def __repr__(self):
        return self.to_json(to_str=True)

    def __len__(self):
        return len(self._list)

    def __getitem__(self, item):
        if isinstance(item, int):
            return self._list[item]
        if isinstance(item, str):
            k = self._mapping.get(item)
            if k is None:
                raise KeyError('Unknown key %s.' % item)
            return self._list[k]
        raise IndexError('Invalid index type')

    def __setitem__(self, key, value):
        if isinstance(key, int):
            self._list[key] = _parse_type(value, if_none(self._attr, self._types))
        elif isinstance(key, str):
            k = self._mapping.get(key)
            if k is None:
                raise KeyError('Unknown key %s.' % key)
            self._list[k] = _parse_type(value, if_none(self._attr, self._types))
        else:
            raise IndexError('Invalid index type')

    def __delitem__(self, key):
        if isinstance(key, int):
            del self._list[key]
        elif isinstance(key, str):
            k = self._mapping.get(key)
            if k is None:
                raise KeyError('Unknown key %s.' % key)
            del self._list[k]
        else:
            raise IndexError('Invalid index type')

    def insert(self, index, value):
        value = _parse_type(value, if_none(self._attr, self._types))
        if self._unique_key:
            k = self._mapping.get(value[self._unique_key])
            if k is not None:
                raise ValueError('An element already exists with unique key: %s.' % k)
            if index != len(self._list):
                self._mapping = {k: v if v < index else v+1 for k, v in self._mapping.items()}
            self._mapping[k] = index
        self._list.insert(index, value)

    def append(self, value):
        return self.insert(index=len(self._list), value=value)

    def update(self, model, recursive=True):
        if isinstance(model, str):
            from json import loads
            model = loads(str)
        if is_dict(model):
            if self._unique_key:
                for v in model.values():
                    self.add(v, recursive=recursive)
            elif self._attr:
                self._list += [self._attr.attr_from_json(self, v) for v in model.values()]
            else:
                self._list += [_parse_type(v, self._types) for v in model.values()]
        elif isinstance(model, (tuple, list)):
            if self._unique_key:
                for v in model:
                    self.add(v, recursive=recursive)
            elif self._attr:
                self._list += [self._attr.attr_from_json(self, v) for v in model]
            else:
                self._list += [_parse_type(v, self._types) for v in model]
        else:
            self.add(model)

    def add(self, data, recursive=True):
        if self._attr:
            data = self._attr.attr_from_json(self, data)
        else:
            data = _parse_type(data, self._types)
        if self._unique_key:
            key = data[self._unique_key]
            k = self._mapping.get(key, None)
            if k is None:
                self._mapping[k] = len(self._list)
                self._list.append(data)
            elif recursive:
                self._list[k].update(data, recursive=True)
            else:
                self._list[k] = data
        else:
            self._list.append(data)

    def keys(self):
        return self._mapping.keys()

    def values(self):
        return self._mapping.values()

    def items(self):
        for k, v in self._mapping.items():
            yield k, self._list[v]

    def to_json(self, to_str=True):
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


class JSONClass(ClassAttrHandler):
    __template__ = None
    __ABSTRACT__ = False

    @classmethod
    def template(cls):
        if cls.__template__ is None:
            template = "{\n"
            for attr in cls.cls_attributes(JSONAttribute).values():
                template += '\t"' + attr.name + '": "{{' + attr.name + '}}",\n'
            cls.__template__ = template[:-2] + '\n}'
        return cls.__template__

    @classmethod
    def dict_template(cls):
        if not hasattr(cls, '__dict_template__'):
            from json import loads
            json = loads(cls.template())

            attributes = cls.cls_attributes(JSONAttribute)
            used_attributes = set()
            for d, k, v in dict_walk(json):
                if isinstance(v, str) and v.startswith('{{') and v.endswith('}}'):
                    v = v[2:-2]
                    attr = attributes.get(v, None)
                    if attr is None:
                        raise JSONClass.InvalidTemplateException(cls, "Unknown Attribute %s." % v)
                    used_attributes.add(v)
                    d[k] = attr
            if len(used_attributes) != len(attributes):
                diff = set(attributes.keys()).difference(used_attributes)
                raise JSONClass.InvalidTemplateException(cls, "Those attributes were not find in the template: %s." % diff)
            cls.__dict_template__ = json

        return cls.__dict_template__

    def __init__(self, **kwargs):
        super(JSONClass, self).__init__(**kwargs)

    def get(self, item, default=None):
        getattribute = super(ClassAttrHandler, self).__getattribute__
        attributes = getattribute('__class__').cls_attributes(JSONAttribute)

        attr = attributes.get(item, None)
        if attr is not None:
            return attr.get_attr(self)
        return default

    def set(self, key, value):
        getattribute = super(ClassAttrHandler, self).__getattribute__
        attributes = getattribute('__class__').cls_attributes(JSONAttribute)
        attr = attributes.get(key, None)
        if attr is not None:
            if attr.read_only:
                raise AttributeError('%s is a read-only attribute' % attr.name)
            attr.set_attr(handler=self, value=value)
        else:
            raise AttributeError('%s unknown.' % key)

    def update(self, model, recursive=True):
        if isinstance(model, str):
            import json
            model = json.loads(model)
        if is_dict(model):
            for d1, d2, k, v_old, v_new in dict_walk_zip(self.dict_template(), model, raise_on_ignore=True):
                if isinstance(v_old, JSONAttribute):
                    attr = v_old
                    v_old = getattr(self, attr.name)
                    if recursive:
                        if attr.islist:
                            v_old.update(v_new, recursive=recursive)
                        elif isinstance(attr, JSONClass):
                            v_old.update(v_new, recursive=recursive)
                        else:
                            attr.set_attr(self, attr.attr_from_json(self, v_new))
                    else:
                        attr.set_attr(self, v_new)
                elif v_old != v_new:
                    raise JSONClass.ParseException('Value of %s is not compatible with %s template' % (k, type(self)))
        elif type(self) == type(model):
            attributes = self.cls_attributes(JSONAttribute)
            for attr_name, v_new in model.attributes(JSONAttribute).items():
                attr = attributes[attr_name]
                v_old = getattr(self, attr_name)
                if recursive:
                    if attr.islist:
                        v_old.update(v_new, recursive=recursive)
                    elif isinstance(attr, JSONClass):
                        v_old.update(v_new, recursive=recursive)
                    else:
                        attr.set_attr(self, v_new)
                else:
                    attr.set_attr(self, v_new)
        else:
            raise ValueError('Invalid model: %s.' % repr(model))

    @classmethod
    def from_attributes(cls, d):
        keys = set(d.keys())
        attrs = {_.name for _ in cls.cls_attributes(JSONAttribute)}
        unused = keys.difference(attrs)
        if unused:
            print('Warning when initializing %s from dict:\n'
                  '%s keys will be ignored.' % (cls.__name__, unused))

        return cls.__new__(**{k: d[k] for k in keys.intersection(attrs)})

    @classmethod
    def from_json(cls, json):
        if isinstance(json, str):
            from json import loads
            json = loads(json)
        if not is_dict(json):
            raise ValueError('Invalid json type: %s.' % type(json))

        c = cls()
        c.update(json, recursive=False)
        return c

    def to_json(self, to_str=True):
        if not to_str:
            template = dict_deep_copy(self.dict_template())
            for d, k, v in dict_walk(template):
                if isinstance(v, JSONAttribute):
                    d[k] = v.attr_to_json(self, v.get_attr(self))
            return template
        else:
            from json import dumps
            return dumps(self.to_json(to_str=False), indent=True)

    def __getitem__(self, item):
        return DictTemplate(self, self.dict_template())[item]

    def __setitem__(self, key, value):
        DictTemplate(self, self.dict_template())[key] = value

    def __repr__(self):
        attributes = [k+': '+repr(v) for k, v in self.attributes(JSONAttribute).items()]
        return type(self).__name__ + '\n\t' + attributes.join('\n\t')

    class InvalidTemplateException(Exception):
        def __init__(self, jsonclass, *msg):
            super(JSONClass.InvalidTemplateException, self).__init__(*msg)
            self.jsonclass = jsonclass

    class ParseException(Exception):
        def __init__(self, json_template, *msg):
            super(JSONClass.ParseException, self).__init__(*msg)
            self.json_template = json_template


class DictTemplate:
    def __init__(self, attr_handler, d):
        super(DictTemplate, self).__init__()
        from weakref import ref
        self._attr_handler = ref(attr_handler)
        self._d = d

    def __repr__(self):
        return self.to_json(to_str=True)

    def __getitem__(self, item):
        item = self._d[item]
        if isinstance(item, JSONAttribute):
            return item.get_attr(self._attr_handler())
        elif is_dict(item):
            return DictTemplate(self._attr_handler(), item)
        return item

    def __setitem__(self, key, value):
        item = self._d[key]
        if isinstance(item, JSONAttribute):
            item.set_attr(self._attr_handler(), value)
        else:
            raise KeyError('%s is part of the template %s and is not editable.'
                           % (key, type(self._attr_handler()).__name__))

    def items(self):
        for k in self._d.keys():
            yield k, self[k]

    def values(self):
        for k in self._d.keys():
            yield self[k]

    def keys(self):
        return self._d.keys()

    def __len__(self):
        return len(self._d)

    def to_json(self, to_str=True):
        if not to_str:
            json = {}
            for k, v in self.items():
                json[k] = v.to_json(to_str=False) if isinstance(v, DictTemplate) else v
            return json

        from json import dumps
        return dumps(self.to_json(to_str=False))
