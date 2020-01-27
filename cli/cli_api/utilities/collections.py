from collections import OrderedDict


def cast_to_list(l):
    if isinstance(l, str):
        return [l]
    try:
        return list(l)
    except TypeError:
        return [l]


def is_dict(d):
    return isinstance(d, (dict, OrderedDict))

def is_collection_of(o, t, c=None, recursive=False):
    if c is None or isinstance(o, c):
        try:
            for _ in o:
                if recursive:
                    if not istypeof_or_listof(_, t, recursive=True):
                        return False
                else:
                    if not isinstance(_, t):
                        return False
                return True
        except TypeError:
            return False
    return False


def istypeof_or_collectionof(o, t, c=None, recursive=False):
    if isinstance(o, t):
        return True
    return is_collection_of(o, t, c, recursive)


def istypeof_or_listof(o, t, recursive=False):
    return istypeof_or_collectionof(o, t, c=list, recursive=recursive)


def recursive_dict_update(destination, origin, append=False):
    for n, v in origin.items():
        dest_v = destination.get(n, None)
        if is_dict(v) and is_dict(dest_v):
            recursive_dict_update(destination[n], v)
        elif append and isinstance(v, list) and isinstance(dest_v, list):
            for list_v in v:
                append_needed = True
                if is_dict(list_v) and isinstance(append, str) and append in list_v:
                    key = list_v[append]
                    for i in range(len(dest_v)):
                        if is_dict(dest_v[i]) and dest_v[i] and dest_v[i].get(append, None) == key:
                            recursive_dict_update(dest_v[i], list_v, append=append)
                            append_needed = False
                if append_needed:
                    dest_v.append(list_v)
        else:
            destination[n] = v


def recursive_dict(dictionnary, function):
    r = {}
    for n, v in dictionnary.items():
        if is_dict(v):
            v = recursive_dict(v, function=function)
        else:
            v = function(n, v)
        r[n] = v
    return r


def dict_walk(dict):
    for k, v in dict.items():
        if is_dict(v):
            for r in dict_walk(v):
                yield r
        else:
            yield dict, k, v


def dict_walk_zip(dict1, dict2, raise_on_ignore=False):
    for k, v2 in dict2.items():
        try:
            v1 = dict1[k]
        except KeyError:
            if raise_on_ignore:
                raise KeyError('Unknown key %s.' % k)
            else:
                continue

        if is_dict(v1) and is_dict(v2):
            for _ in dict_walk_zip(v1, v2, raise_on_ignore=raise_on_ignore):
                yield _
        else:
            yield dict1, dict2, k, v1, v2


def dict_deep_copy(d):
    d_copy = type(d)()
    for k, v in d.items():
        if is_dict(v):
            v = dict_deep_copy(v)
        d_copy[k] = v
    return d_copy


def if_none(v, default=None):
    if default is None:
        return v is None
    return default if v is None else v


def if_else(v, cond, default=None):
    return v if cond(v) else default


def if_not(v, default=None):
    if default is None:
        return True if not v else False
    return default if not v else v


########################################################################################################################
class PropertyAccessor:
    def __init__(self, list):
        self._list = list

    def __getattr__(self, item):
        c = None
        for node in self._list:
            if hasattr(node, item):
                p = getattr(node, item, [])

                if c is None:
                    if isinstance(p, DictList) or isinstance(p, list):
                        c = p.copy()
                        continue
                    elif hasattr(type(p), 'List'):
                        c = type(p).List(p)
                    else:
                        c = []

                if isinstance(p, list) or isinstance(p, DictList):
                    c += p
                else:
                    c.append(p)
        return c

    def __setattr__(self, key, value):
        if key == '_list':
            super(PropertyAccessor, self).__setattr__('_list', value)
        for node in self._list:
            if hasattr(node, key):
                setattr(node, key, value)


########################################################################################################################
class AttributeDict(OrderedDict):

    @staticmethod
    def create(**kwargs):
        return AttributeDict.from_dict(kwargs, recursive=True)

    @staticmethod
    def from_dict(d, recursive=False):
        r = AttributeDict()
        for k, v in d.items():
            if is_dict(v) and recursive:
                v = AttributeDict.from_dict(v, True)
            r[k] = v
        return r

    @staticmethod
    def from_json(json):
        from json import loads
        d = loads(json)
        AttributeDict.from_dict(d, recursive=True)

    def to_json(self):
        from json import dumps
        return dumps(self)

    def __setitem__(self, key, value):
        if not isinstance(key, str) or '.' in key:
            raise ValueError('Invalid AttributeDict key: %s.' % repr(key))
        super(AttributeDict, self).__setitem__(key, value)

    def __getitem__(self, item):
        if isinstance(item, int):
            k = list(self.keys())
            if item > len(k):
                raise IndexError('Index %i out of range (AttributeDict length: %s)' % (item, len(k)))
            return super(AttributeDict, self).__getitem__(list(self.keys())[item])
        elif isinstance(item, str):
            return super(AttributeDict, self).__getitem__(item)
        else:
            return super(AttributeDict, self).__getitem__(str(item))

    def __getattr__(self, item):
        if item in self:
            return self[item]
        raise AttributeError('%s is unknown' % item)

    def __iter__(self):
        for v in self.values():
            yield v

    def __len__(self):
        return len(self.keys())


########################################################################################################################
def df_empty(columns, dtypes, index=None):
    import pandas as pd
    assert len(columns) == len(dtypes)

    df = pd.DataFrame(index=index)
    for c, d in zip(columns, dtypes):
        df[c] = pd.Series(dtype=d)
    return df
