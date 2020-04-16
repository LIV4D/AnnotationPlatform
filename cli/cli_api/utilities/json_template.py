from .class_attribute import ClassAttrHandler, ClsAttribute
from .collections import is_dict, if_none, dict_walk, dict_walk_zip, dict_deep_copy
from lazy_property import LazyProperty
from inspect import signature

JSON_TYPES = (dict, list, tuple, str, int, float, bool)


def check_json_type(t):
    return t == 'same_class' or issubclass(t, JSON_TYPES + (JSONClass,))


class JSONAttribute(ClsAttribute):
    def __init__(self, types, default=None, islist=False, read_only=False, optional=False):
        super(JSONAttribute, self).__init__(read_only=read_only)
        self.default = default
        self.islist = islist
        self.optional = optional
        if isinstance(types, type):
            types = (types,)
        for t in types:
            if not check_json_type(t):
                raise JSONClass.InvalidTemplateException(None, 'Invalid JSON type: %s.' % t)
        self.types = types

    def __set_name__(self, owner, name):
        self.types = tuple(t if t != 'same_class' else owner for t in self.types)
        if name[-1] == "_" and name[-2] != "_":
            name = name[:-1]
        if not owner.__template__ or not owner.__dict_template__:
            for attr in owner.cls_attributes(JSONAttr.GenericProperties).values():
                if attr.properties_names and self.name in attr.properties_names:
                    raise JSONClass.InvalidTemplateException(owner,
                                    'Properties %s impossible to define:\n '
                                    'generic properties %s already define a properties with'
                                    ' the same name.'
                                    % (name, attr.name))
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
            return l
        elif value is None:
            if not self.optional:
                raise ValueError('%s is not an optional attribute.' % self.name)
            return None
        else:
            value = _parse_type(value, self)
            return value

    def attr_to_json(self, handler, value, context=None):
        if self.optional and value is None:
            raise JSONClass.EmptyAttribute()
        if isinstance(value, (JSONClass, JSONClassList)):
            return value.to_json(to_str=False, context=context)
        return value

    def attr_from_json(self, handler, value):
        return _parse_type(value, self)

    def get_json(self, handler, context=None):
        v = self.get_attr(handler)
        return self.attr_to_json(handler, v, context=context)

    # ---   DECORATORS ---
    def to_json(self, f):
        param_count = len(signature(f).parameters)
        if param_count == 2:
            def attr_to_json(self, handler, value, context=None):
                return f(handler, value)
        elif param_count == 3:
            def attr_to_json(self, handler, value, context=None):
                return f(handler, value, context)
        else:
            def attr_to_json(self, handler, value, context=None):
                return f(handler)
        self.attr_to_json = attr_to_json

    def from_json(self, f):
        def attr_from_json(self, handler, value):
            return f(handler, value)
        self.attr_from_json = attr_from_json


class JSONAttr(JSONAttribute):
    def __init__(self, types=JSON_TYPES, default=None, read_only=False, optional=False):
        super(JSONAttr, self).__init__(types=types, default=default, islist=False, read_only=read_only,
                                       optional=optional)

    class Any(JSONAttribute):
        def __init__(self, default=(), read_only=False, optional=False):
            super(JSONAttr.Any, self).__init__(types=JSON_TYPES+(JSONClass,), default=default, islist=False,
                                               read_only=read_only, optional=optional)

    class List(JSONAttribute):
        def __init__(self, types=None, key=None, default=(), read_only=False, optional=False):
            if types is None and key is None:
                super(JSONAttr.List, self).__init__(types=(list,), default=default, islist=False, read_only=read_only, optional=optional)
                
            else:
                if not isinstance(key, str):
                    key = True
                super(JSONAttr.List, self).__init__(types=types, default=default, islist=key, read_only=read_only, optional=optional)

        def __repr__(self):
            flags = ''
            if self.read_only:
                flags += ' READ_ONLY'
            if self.optional:
                flags += ' OPTIONAL'
            return self.name+': List(types=%s, default=%s%s)' % (self.types, self.default, flags)

    class String(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False, optional=False):
            if default is None and not optional:
                default = '' if not list else []
            super(JSONAttr.String, self).__init__(types=str, default=default, islist=list, read_only=read_only,
                                                  optional=optional)

        def __repr__(self):
            flags = ''
            if self.islist:
                flags += ' LIST'
            if self.read_only:
                flags += ' READ_ONLY'
            if self.optional:
                flags += ' OPTIONAL'
            return self.name+': String(default=%s%s)' % (self.default, flags)

    class Float(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False, optional=False, min=None, max=None):
            if default is None and not optional:
                default = 0 if not list else []
            super(JSONAttr.Float, self).__init__(types=(float,), default=default, islist=list, read_only=read_only,
                                                 optional=optional)
            self._min = min
            self._max = max

        def check_attr(self, handler, value):
            value = super(JSONAttr.Float, self).check_attr(handler, value)
            if self._min is not None and self._min > value:
                raise AttributeError('Invalid value for %s. Minimum value is %s, provided value is %s.'
                                     % (self.name, self._min, value))
            if self._min is not None and self._min > value:
                raise AttributeError('Invalid value for %s. Minimum value is %s, provided value is %s.'
                                     % (self.name, self._min, value))
            return value

        def __repr__(self):
            flags = ''
            if self.islist:
                flags += ' LIST'
            if self.read_only:
                flags += ' READ_ONLY'
            if self.optional:
                flags += ' OPTIONAL'
            return self.name+': Float(default=%s%s)' % (self.default, flags)

    class Int(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False, optional=False, min=None, max=None):
            if default is None and not optional:
                default = 0 if not list else []
            super(JSONAttr.Int, self).__init__(types=(int,), default=default, islist=list, read_only=read_only,
                                               optional=optional)

            self._min = min
            self._max = max

        def check_attr(self, handler, value):
            value = super(JSONAttr.Int, self).check_attr(handler, value)
            if self._min is not None and self._min > value:
                raise AttributeError('Invalid value for %s. Minimum value is %s, provided value is %s.'
                                     % (self.name, self._min, value))
            if self._min is not None and self._min > value:
                raise AttributeError('Invalid value for %s. Minimum value is %s, provided value is %s.'
                                     % (self.name, self._min, value))
            return value

        def __repr__(self):
            flags = ''
            if self.islist:
                flags += ' LIST'
            if self.read_only:
                flags += ' READ_ONLY'
            if self.optional:
                flags += ' OPTIONAL'
            return self.name+': Int(default=%s%s)' % (self.default, flags)

    class Bool(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False, optional=False):
            if default is None and not optional:
                default = False if not list else []
            super(JSONAttr.Bool, self).__init__(types=(bool,), default=default, islist=list, read_only=read_only,
                                                optional=optional)

        def __repr__(self):
            flags = ''
            if self.islist:
                flags += ' LIST'
            if self.read_only:
                flags += ' READ_ONLY'
            if self.optional:
                flags += ' OPTIONAL'
            return self.name+': Bool(default=%s%s)' % (self.default, flags)

    class Dict(JSONAttribute):
        def __init__(self, default=None, read_only=False, optional=False):
            if default is None and not optional:
                default = {}
            super(JSONAttr.Dict, self).__init__(types=(dict,), default=default, islist=False, read_only=read_only,
                                                optional=optional)

        def __repr__(self):
            flags = ''
            if self.read_only:
                flags += ' READ_ONLY'
            if self.optional:
                flags += ' OPTIONAL'
            return self.name+': Dict(default=%s%s)' % (self.default, flags)

    class SameClass(JSONAttribute):
        def __init__(self, default=None, list=False, read_only=False, optional=False):
            if default is None and not optional:
                default = 0 if not list else []
            super(JSONAttr.SameClass, self).__init__(types=('same_class',), default=default, islist=list,
                                                     read_only=read_only, optional=optional)

        def __repr__(self):
            flags = ''
            if self.islist:
                flags += ' LIST'
            if self.read_only:
                flags += ' READ_ONLY'
            if self.optional:
                flags += ' OPTIONAL'
            return self.name+': SameClass(default=%s%s)' % (self.default, flags)

    class GenericProperties(JSONAttribute):
        def __init__(self, names=None, types=None, prefix=''):
            if isinstance(names, str):
                names = names.split(',')
            if isinstance(types, type):
                types = (types,)
            self._properties_names = None if names is None else set(names)
            self._properties_prefix = prefix
            if prefix:
                raise NotImplementedError('Prefix for GenericProperties are not yet implemented. TODO: Check name collision.')
            self._properties_types = None if types is None else tuple(types)
            super(JSONAttr.GenericProperties, self).__init__(types=(dict,))

        def __repr__(self):
            return self.name+': GenericProperties(names=%s, types=%s)' % (self._properties_names, self._properties_types)

        def __set_name__(self, owner, name):
            gen_prop_siblings = tuple(owner.cls_attributes(JSONAttr.GenericProperties).values())

            if owner.json_template():
                template_attr_name = "{{%s}}" % name
                for template_siblings, k, v in dict_walk(owner.json_template()):
                    if k == template_attr_name:
                        break
                else:
                    raise JSONClass.InvalidTemplateException(owner,
                                    'Generic properties %s not found in custom template.' % name)

                gen_prop_siblings = [attr for attr in gen_prop_siblings if '{{%s}}' % attr.name in template_siblings]

                if self._properties_names:
                    invalid_properties_name = self._properties_names.intersection(template_siblings)
                    if invalid_properties_name:
                        raise JSONClass.InvalidTemplateException(owner,
                                        'Generic properties %s impossible to define:\n'
                                        'properties named %s are already define in the template.'
                                         % (name, invalid_properties_name))

            for attr in gen_prop_siblings:
                names_inter, types_inter = self.intersect_names_types(attr)
                if names_inter and types_inter:
                    if self.properties_names is None:
                        raise JSONClass.InvalidTemplateException(owner,
                                                                 'Generic properties %s impossible to define:\n '
                                                                 'generic properties %s already define any properties with types %s'
                                                                 % (name, attr.name, types_inter))
                    else:
                        raise JSONClass.InvalidTemplateException(owner,
                                                                 'Generic properties %s impossible to define:\n '
                                                                 'generic properties %s already define properties named %s with the same types %s.'
                                                                 % (name, attr.name, names_inter, types_inter))

            return super(JSONAttribute, self).__set_name__(owner, name)

        def check_attr(self, handler, value):
            d = DictGenericProperties(self, {}, handler, siblings=self.conflict_siblings,
                                      forbidden_names=self.forbiden_names)
            if not hasattr(value, 'items'):
                raise TypeError('Invalid type for generic properties %s. A dictionary object must be provided.')
            for k, v in value.items():
                d[k] = v
            value = d._d
            return super(JSONAttr.GenericProperties, self).check_attr(handler, value)

        def check_properties_name(self, name):
            return self._properties_names is None or name in self.properties_names

        def get_attr(self, handler, default=None):
            if default is None:
                default = {}
            data = super(JSONAttr.GenericProperties, self).get_attr(handler, default=None)
            if data is None:
                data = default
                super(JSONAttr.GenericProperties, self).set_attr(handler, data)
            return DictGenericProperties(self, data, siblings=self.conflict_siblings,
                                         forbidden_names=self.forbiden_names, handler=handler)

        @property
        def properties_types(self):
            return self._properties_types

        @property
        def properties_names(self):
            return [self._properties_prefix + n for n in self._properties_names]

        @LazyProperty
        def forbiden_names(self):
            template_siblings = {}
            for template_siblings, k, v in dict_walk(self.handler_cls.dict_template()):
                if v is self:
                    break
            names = set()
            for name, sibling in template_siblings.items():
                if sibling is self:
                    continue
                elif isinstance(sibling, JSONAttr.GenericProperties):
                    if self.properties_names is None:
                        names_inter, types_inter = self.intersect_names_types(sibling)
                        if types_inter and names_inter and names_inter != 'any':
                            names = names.union(names_inter)
                else:
                    names.add(name)
            return names

        @LazyProperty
        def conflict_siblings(self):
            template_siblings = {}
            for template_siblings, k, v in dict_walk(self.handler_cls.dict_template()):
                if v is self:
                    break
            return tuple(_ for _ in template_siblings.values()
                         if isinstance(_, JSONAttr.GenericProperties)
                         and _ is not self
                         and all(self.intersect_names_types(_)[0]))

        def intersect_names_types(self, other_gen_prop, any_value='any'):
            if self.properties_types is None:
                types = if_none(other_gen_prop.properties_types, any_value)
            elif other_gen_prop.properties_types is None:
                types = self.properties_types
            else:
                types = set(self.properties_types).intersection(other_gen_prop.properties_types)

            if self.properties_names is None:
                names = if_none(other_gen_prop.properties_names, any_value)
            elif other_gen_prop.properties_names is None:
                names = self.properties_names
            else:
                names = self.properties_names.intersection(other_gen_prop.properties_names)

            return names, types

    class OneOf(JSONAttribute):
        def __init__(self, *acceptable_values, default=None, optional=False):
            if default is None:
                default = acceptable_values[0]
            types = {type(v) for v in acceptable_values}

            super(JSONAttr.OneOf, self).__init__(types=types, default=default, optional=optional, islist=False)
            self._acceptable_values = acceptable_values

        def check_attr(self, handler, value):
            if value not in self._acceptable_values:
                raise AttributeError('Invalid value for %s.\n Expexted one of %s, received %s.' %
                                     (self.name, repr(self._acceptable_values), repr(value)))
            return value

    SAME_CLASS = 'same_class'


def _parse_type(data, types):
    if data is None:
        return None
    attr = None
    if isinstance(types, JSONAttribute):
        attr = types
        types = attr.types
    elif isinstance(types, type):
        types = (types,)
    elif isinstance(types, TypesUnion):
        types = types.types

    all_types = []
    for t in types:
        if isinstance(t, JSONClass):
            all_types += t.__all_parsable_subclasses__()
        all_types.append(t)

    if type(data) in all_types:
        return data

    for t in all_types:
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


def _register_attr_handler(attr, handler):
    import weakref
    if isinstance(attr, (JSONClass, JSONClassList)) and attr._parent_json_class is None:
        attr._parent_json_class = weakref.ref(handler)


def _unregister_attr_handler(attr, handler):
    if isinstance(attr, (JSONClass, JSONClassList)) and attr.parent_json_class is handler:
        attr._parent_json_class = None


class JSONClassList:
    def __init__(self, attr=None, types=None, unique_key=None):
        if attr is not None:
            import weakref
            self._types = attr.types
            self._attr = weakref.ref(attr)
            if unique_key is not None:
                self._unique_key = unique_key
            else:
                self._unique_key = self.attr.islist if isinstance(self.attr.islist, str) else None
        else:
            self._types = types
            self._attr = None
            self._unique_key = unique_key if unique_key is not None else None
        self._list = []
        self._mapping = {}
        self._parent_json_class = None

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

    def get(self, item, default=None):
        if isinstance(item, int):
            return self._list[item]
        if isinstance(item, str):
            k = self._mapping.get(item)
            if k is None:
                return default
            return self._list[k]
        return default

    def __setitem__(self, key, value):
        if isinstance(key, str):
            k = self._mapping.get(key)
            if k is None:
                raise KeyError('Unknown key %s.' % key)
            key = k
        if isinstance(key, int):
            _unregister_attr_handler(self._list[key], self)
            value = _parse_type(value, if_none(self.attr, self._types))
            _register_attr_handler(value, self)
            self._list[key] = value
        else:
            raise IndexError('Invalid index type')

    def __delitem__(self, key):
        if isinstance(key, int):
            _unregister_attr_handler(self._list[key], self)
            del self._list[key]
        elif isinstance(key, str):
            k = self._mapping.get(key)
            if k is None:
                raise KeyError('Unknown key %s.' % key)
            _unregister_attr_handler(self._list[k], self)
            del self._list[k]
        else:
            raise IndexError('Invalid index type')

    def insert(self, index, value):
        value = _parse_type(value, if_none(self.attr, self._types))
        if self._unique_key:
            k = self._mapping.get(value[self._unique_key])
            if k is not None:
                raise ValueError('An element already exists with unique key: %s.' % k)
            if index != len(self._list):
                self._mapping = {k: v if v < index else v+1 for k, v in self._mapping.items()}
            self._mapping[k] = index
        self._list.insert(index, value)
        _register_attr_handler(value, self)

    def append(self, value):
        return self.insert(index=len(self._list), value=value)

    def update(self, model, recursive=True):
        if isinstance(model, str):
            from json import loads
            model = loads(str)
        if is_dict(model):
           model = tuple(model.values())
        if isinstance(model, (tuple, list)):
            if self._unique_key:
                for v in model:
                    self.add(v, recursive=recursive)
            else:
                for v in model:
                    v = self.attr.attr_from_json(self, v) if self.attr else _parse_type(v, self._types)
                    _register_attr_handler(v, self)
                    self._list.append(v)
        else:
            self.add(model)

    def add(self, data, recursive=True):
        if self.attr:
            data = self.attr.attr_from_json(self, data)
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
                _unregister_attr_handler(self._list[k], self)
                _register_attr_handler(data, self)
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

    def to_json(self, to_str=True, context=None):
        if not to_str:
            l = []
            for v in self._list:
                if isinstance(v, JSONClass):
                    v = v.to_json(to_str=False, context=context)
                l.append(v)
            return l
        else:
            from json import dumps
            return dumps(self.to_json(to_str=False, context=context), indent=True)

    @property
    def attr(self):
        return None if self._attr is None else self._attr()

    @property
    def parent_json_class(self):
        return None if self._parent_json_class else self._parent_json_class()


_JSON_SUBCLASS_NAMESPACE = {}

class JSONClass(ClassAttrHandler):
    __template__ = None
    __dict_template__ = None
    __exact_template__ = True
    __ABSTRACT__ = "JSONClass"

    @classmethod
    def template(cls):
        if cls.__template__ is None:
            template = ""
            for attr in cls.cls_attributes(JSONAttribute).values():
                if isinstance(attr, JSONAttr.GenericProperties):
                    template += '\t"{{' + attr.name + '}}": "...",\n'
                else:
                    template += '\t"' + attr.name + '": "{{' + attr.name + '}}",\n'
            cls.__template__ = '{\n' + template[:-2] + '\n}'
            return cls.__template__
        elif isinstance(cls.__template__, str):
            return cls.__template__
        else:
            from json import dumps
            return dumps(cls.__template__)

    @classmethod
    def json_template(cls):
        if cls.__template__ is None or isinstance(cls.__template__, str):
            from json import loads, JSONDecodeError
            from collections import OrderedDict
            try:
                cls.__json_template = loads(cls.template(), object_pairs_hook=OrderedDict)
            except JSONDecodeError as e:
                raise JSONClass.InvalidTemplateException(cls, "Invalid JSON template." +
                                                         "\nError: '%s' in template: \n " % str(e)
                                                         + cls.__name__ + cls.template()) from None
        return cls.__json_template

    @classmethod
    def dict_template(cls):
        if cls.__dict_template__ is None:
            json = cls.json_template()

            attributes = cls.cls_attributes(JSONAttribute)
            used_attributes = set()
            for d, k, v in dict_walk(json):
                if k.startswith('{{') and k.endswith('}}'):
                    attr_name = k[2:-2]
                    attr = attributes.get(attr_name, None)
                    if attr is None:
                        raise JSONClass.InvalidTemplateException(cls, "Unknown generic properties %s." % v)
                    used_attributes.add(attr_name)
                    d[k] = attr
                elif isinstance(v, str) and v.startswith('{{') and v.endswith('}}'):
                    v = v[2:-2]
                    attr = attributes.get(v, None)
                    if attr is not None:
                        used_attributes.add(v)
                        d[k] = attr
                    elif hasattr(cls, v) and check_json_type(getattr(cls, v)):
                        d[k] = getattr(cls, v)
                    else:
                        raise JSONClass.InvalidTemplateException('Unknown attribute %s.' % v)
            if len(used_attributes) != len(attributes):
                diff = set(attributes.keys()).difference(used_attributes)
                raise JSONClass.InvalidTemplateException(cls, "Those attributes were not find in the template: %s." % diff)
            cls.__dict_template__ = json

        return cls.__dict_template__

    __subclass_parsing_behaviour__ = "auto"
    __parsable_subclasses__ = set()

    @classmethod
    def __register_subclass__(cls, name, bases):
        if name == "JSONClass":
            return

        parent_cls = bases[0]
        parent_cls.__parsable_subclasses__.add(cls)

    @classmethod
    def __all_parsable_subclasses__(cls):
        all_subclasses = []

        def recursive_explore_subclasses(subcls):
            if subcls.__subclass_parsing_behaviour__ == "auto":
                for c in subcls.__parsable_subclasses__:
                    if c not in all_subclasses:
                        recursive_explore_subclasses(c)
                        if c.__ABSTRACT__ != c.__name__:
                            all_subclasses.append(c)
        recursive_explore_subclasses(cls)
        return all_subclasses

    def __init__(self, **kwargs):
        super(JSONClass, self).__init__(**kwargs)
        self._parent_json_class = None

    def generic_properties_attributes(self):
        gen_prop_attrs = self.cls_attributes(types=JSONAttr.GenericProperties).values()
        explicit_prop = []
        implicit_prop = []
        for attr in gen_prop_attrs:
            if attr.properties_names is not None:
                explicit_prop.append(attr)
            else:
                implicit_prop.append(attr)
        return explicit_prop+implicit_prop

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
            attr.set(handler=self, value=value)
        else:
            raise AttributeError('%s unknown.' % key)

    def __delattr__(self, item):
        getattribute = super(ClassAttrHandler, self).__getattribute__
        attributes = getattribute('__class__').cls_attributes(JSONAttribute)
        attr = attributes.get(item, None)
        if attr is not None:
            if attr.read_only:
                raise AttributeError('%s is a read-only attribute' % attr.name)
            if not attr.optional:
                raise AttributeError('%s is a non-optional attribute' % attr.name)
            attr.set(handler=self, value=None)
        else:
            raise AttributeError('%s unknown.' % item)

    def update(self, model, recursive=True):
        if isinstance(model, str):
            import json
            model = json.loads(model)
        if is_dict(model):
            gen_prop_attrs = self.generic_properties_attributes()
            for d1, d2, k, v_old, v_new in dict_walk_zip(self.dict_template(), model, on_miss=None):
                if v_old is None:
                    # Check for generic properties
                    valid_generic_properties = None
                    for gen_prop_attr in gen_prop_attrs:
                        try:
                            gen_prop_attr.get(self)[k] = v_new
                        except Exception:
                            continue
                        valid_generic_properties = True
                        break
                    if not valid_generic_properties and self.__exact_template__:
                        raise JSONClass.ParseException(type(self), 'Unknown properties %s in %s template.' % (k, type(self)))
                elif isinstance(v_old, JSONAttribute):
                    attr = v_old
                    v_old = getattr(self, attr.name)
                    if recursive:
                        if attr.islist:
                            v_old.update(v_new, recursive=recursive)
                        elif isinstance(attr, JSONClass):
                            v_old.update(v_new, recursive=recursive)
                        else:
                            attr.set(self, attr.attr_from_json(self, v_new))
                    else:
                        attr.set(self, v_new)
                elif v_old != v_new:
                    raise JSONClass.ParseException(attr, 'Value of %s is not compatible with %s template' % (k, type(self)))
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
                        attr.set(self, v_new)
                else:
                    attr.set(self, v_new)
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

    def to_json(self, to_str=True, context=None):
        if not to_str:
            template = dict_deep_copy(self.dict_template())
            generic_properties = []
            empty_attrs = []
            for d, k, v in dict_walk(template):
                if isinstance(v, JSONAttr.GenericProperties):
                    generic_properties.append((d, v))
                elif isinstance(v, JSONAttribute):
                    v_attr = v.get_attr(self)
                    empty_attr = False
                    try:
                        v_json = self.attr_to_json(v, v_attr, context=context)
                    except JSONClass.EmptyAttribute:
                        empty_attr = True
                    if not empty_attr:
                        d[k] = v_json
                    else:
                        empty_attrs.append((d, k))
            for d, attr in reversed(generic_properties):
                for k, v in attr.get(self).items():
                    d[k] = v
                del d['{{'+attr.name+'}}']
            for d, k in empty_attrs:
                del d[k]
            return template
        else:
            from json import dumps
            return dumps(self.to_json(to_str=False, context=context), indent=True)

    def attr_to_json(self, attr, value, context=None):
        return attr.attr_to_json(self, value, context=context)

    def __attr_changed(self, attr_name, previous):
        _unregister_attr_handler(previous, self)
        v = self.get(attr_name)
        _register_attr_handler(v, self)

    @property
    def parent_json_class(self):
        return None if self._parent_json_class else self._parent_json_class()

    @property
    def root_json_class(self):
        root = self
        while root.parent_json_class:
            root = root.parent_json_class
        return root

    def __getitem__(self, item):
        return DictTemplate(self, self.dict_template())[item]

    def __setitem__(self, key, value):
        DictTemplate(self, self.dict_template())[key] = value

    def __repr__(self):
        attributes = [name + ": " + repr(value).replace("\n", "\n  |   " + (
                        ' ' if isinstance(value, JSONClass) else '|') + " " * len(name))
                        for name, value in self.attributes(JSONAttribute).items()]
        return "\n  |  ".join([type(self).__name__] + attributes)

    class InvalidTemplateException(Exception):
        def __init__(self, jsonclass, *msg):
            super(JSONClass.InvalidTemplateException, self).__init__(*msg)
            self.jsonclass = jsonclass
            self.msg = msg

    class ParseException(Exception):
        def __init__(self, json_template, *msg):
            super(JSONClass.ParseException, self).__init__(*msg)
            self.json_template = json_template
            self.msg = msg

    class EmptyAttribute(Exception):
        def __init__(self):
            super(JSONClass.EmptyAttribute, self).__init__()


class TypesUnion:
    def __init__(self, *types, default_init=None):
        parsed_types = set()
        for t in types:
            if isinstance(t, type):
                parsed_types.add(t)
            elif isinstance(t, TypesUnion):
                parsed_types.union(t.types)
            elif isinstance(t, (tuple, list, set)):
                parsed_types.union(t)
        self._types = tuple(parsed_types)

        if default_init:
            self.__call__ = default_init

    @property
    def types(self):
        return self._types


class DictTemplate:
    def __init__(self, attr_handler, template):
        super(DictTemplate, self).__init__()
        from weakref import ref
        self._attr_handler = ref(attr_handler)
        self._template = template

    def __repr__(self):
        return self.to_json(to_str=True)

    def __getitem__(self, item):
        try:
            item = self._template[item]
        except KeyError:
            for gen_prop_attr in self._template.values():
                if isinstance(gen_prop_attr, JSONAttr.GenericProperties):
                    props = gen_prop_attr.get(self._attr_handler())
                    if item in props:
                        return props[item]
            raise KeyError('Unknown item %s in template of %s.' % (item, type(self._attr_handler()).__name__)) from None
        if isinstance(item, JSONAttribute):
            h = self._attr_handler()
            return item.attr_to_json(h, item.get_attr(h))
        elif is_dict(item):
            return DictTemplate(self._attr_handler(), item)
        return item

    def __setitem__(self, key, value):
        undefined = False
        try:
            item = self._template[key]
        except KeyError:
            item = None
            undefined = True

        if isinstance(item, JSONAttribute):
            item.set(self._attr_handler(), value)
        elif undefined:
            # If the item is not define in template, search for a valid generic property.
            generic_properties = {_._global_id: _
                                  for _ in self._template.values() if isinstance(_, JSONAttr.GenericProperties)}
            generic_properties = [generic_properties[_] for _ in sorted(generic_properties.keys())]
            generic_properties = [_ for _ in generic_properties if _.properties_names is not None] \
                                 + [_ for _ in generic_properties if _.properties_names is None]
            for gen_prop_attr in generic_properties:
                try:
                    gen_prop_attr.get(self._attr_handler())[key] = value
                except (KeyError, TypeError) as e:
                    continue
                else:
                    # # If the item is a valid generic property make sure it is removed from others generic properties.
                    # for gen_prop_attr in self._attr_handler().generic_properties_attributes():
                    #     if gen_prop_attr is not valid_prop_attr:
                    #         gen_prop_dict = gen_prop_attr.get(self._attr_handler())
                    #         if item in gen_prop_dict:
                    #             del gen_prop_dict[item]
                    return
            else:
                raise KeyError('%s was not found in template %s.'
                               % (key, type(self._attr_handler()).__name__))
        else:
            raise KeyError('%s is a read-only member of the template %s.'
                           % (key, type(self._attr_handler()).__name__))

    def __delitem__(self, key):
        undefined = False
        try:
            item = self._template[key]
        except KeyError:
            item = None
            undefined = True

        if isinstance(item, JSONAttribute):
            if not item.optional:
                raise ValueError('%s is not optional.' % item.name)
            item.set(self._attr_handler(), None)
        elif undefined:
            # If the item is not define in template, search for a valid generic property.
            generic_properties = [_ for _ in self._template.values() if isinstance(_, JSONAttr.GenericProperties)]
            for gen_prop_attr in generic_properties:
                try:
                    del gen_prop_attr.get(self._attr_handler())[key]
                except (KeyError, TypeError) as e:
                    continue
                else:
                    return
            else:
                raise KeyError('%s was not found in template %s.'
                               % (key, type(self._attr_handler()).__name__))
        else:
            raise KeyError('%s is a read-only member of the template %s.'
                           % (key, type(self._attr_handler()).__name__))

    def __contains__(self, item):
        return item in self.keys()

    def items(self):
        for k in self._template.keys():
            yield k, self[k]

    def values(self):
        for k in self._template.keys():
            yield self[k]

    def keys(self):
        return self._template.keys()

    def __len__(self):
        return len(self._template)

    def to_json(self, to_str=True, context=None):
        if not to_str:
            json = {}
            for k, v in self.items():
                try:
                    json[k] = v.to_json(to_str=False, context=context) if isinstance(v, DictTemplate) else v
                except JSONClass.EmptyAttribute:
                    continue
            return json

        from json import dumps
        return dumps(self.to_json(to_str=False, context=context))


class DictGenericProperties:
    def __init__(self, generic_properties_attr, data, handler, forbidden_names=(), siblings=()):
        import weakref
        self._generic_properties_attr = generic_properties_attr
        self._d = data
        self._siblings = siblings
        self._forbidden_names = forbidden_names
        self._handler = weakref.ref(handler)

    def __repr__(self):
        return repr(self._d)

    def __getitem__(self, key):
        if not isinstance(key, str):
            raise KeyError('Key of generic properties must be of type string and not %s.' % type(str).__name__)
        try:
            return self._d[key]
        except KeyError:
            if self._generic_properties_attr.properties_names is None:
                raise KeyError('Unknown property "%s"' % key)
            elif key in self._generic_properties_attr.properties_names:
                raise KeyError('Property "%s" has no value yet.' % key)
            else:
                raise KeyError('Invalid property "%s".' % key)

    def __setitem__(self, key, value):
        if not isinstance(key, str):
            raise KeyError('Key of generic properties must be of type string.')

        if key in self.forbidden_names() or \
           (self._generic_properties_attr.properties_names is not None
            and key not in self._generic_properties_attr.properties_names):
            raise KeyError('Invalid property "%s".' % key)

        valid_types = self._generic_properties_attr.properties_types
        if valid_types is not None:
            if not isinstance(value, valid_types):
                for t in valid_types:
                    try:
                        value = t(value)
                    except TypeError:
                        continue
                    else:
                        break
                else:
                    raise TypeError('Property %s must be of type: %s.\n Given type was %s.'
                                    % (self._generic_properties_attr.name, repr(valid_types), type(value).__name__))

        self._d[key] = value

    def __contains__(self, item):
        return item in self.keys()

    def __delitem__(self, key):
        if not isinstance(key, str):
            raise KeyError('Key of generic properties must be of type string.')
        try:
            del self._d[key]
        except KeyError:
            raise KeyError('Unknown property %s.' % key) from None

    def forbidden_names(self):
        names = self._forbidden_names
        for s in self._siblings:
            names = names.union(s.get_attr(self._handler()).keys())
        return names

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
