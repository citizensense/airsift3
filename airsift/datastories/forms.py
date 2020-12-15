
from django import forms
from django.contrib.postgres.fields.array import ArrayField
from django.db.models.fields import CharField
from django.forms import SelectMultiple
from django.utils.datastructures import MultiValueDict

def MultipleChoiceModel(choices, **kwargs):
    return ArrayField(
        CharField(max_length=1000, blank=True, choices=choices),
        default=list,
        blank=True,
        **kwargs
    )

def create_choices (*choices):
    return list(
        (choice, choice) if isinstance(choice, str) else choice
        for choice in choices
    )

class ArrayFieldSelectMultiple(SelectMultiple):
    """This is a Form Widget for use with a Postgres ArrayField. It implements
    a multi-select interface that can be given a set of `choices`.

    You can provide a `delimiter` keyword argument to specify the delimeter used.
    """

    def __init__(self, *args, **kwargs):
        # Accept a `delimiter` argument, and grab it (defaulting to a comma)
        self.delimiter = kwargs.pop("delimiter", ",")
        super(ArrayFieldSelectMultiple, self).__init__(*args, **kwargs)

    def render_options(self, choices, value):
        # value *should* be a list, but it might be a delimited string.
        if isinstance(value, str):  # python 2 users may need to use basestring instead of str
            value = value.split(self.delimiter)
        return super(ArrayFieldSelectMultiple, self).render_options(choices, value)

    def value_from_datadict(self, data, files, name):
        if isinstance(data, MultiValueDict):
            # Normally, we'd want a list here, which is what we get from the
            # SelectMultiple superclass, but the SimpleArrayField expects to
            # get a delimited string, so we're doing a little extra work.
            return self.delimiter.join(data.getlist(name))
        return data.get(name, None)
