from wagtailautocomplete.edit_handlers import AutocompletePanel, _can_create
from wagtailautocomplete.widgets import Autocomplete as AutocompleteWidget
from wagtailautocomplete.views import render_page
import json
from uuid import UUID
def uuid_convert(o):
        if isinstance(o, UUID):
            return o.hex

class AutocompleteWidgetForUUIDModels(AutocompleteWidget):
    """
    Generic override, keeps existing functionality
    ToDo: Extend to use custom json encoder
    """

    def format_value(self, value):
        try:
            # Try to rely on the default implementation
            return super().value_from_datadict(value)
        except:
            # In backup, use a custom serialiser to ensure UUID fields are serailised to string
            if not value:
                return 'null'
            if type(value) == list:
                return json.dumps([
                    render_page(page)
                    for page in self.target_model.objects.filter(pk__in=[str(v) for v in value])
                ], default=uuid_convert)
            else:
                return json.dumps(render_page(self.target_model.objects.get(pk=str(value))), default=uuid_convert)

class AutocompletePanelForUUIDModels(AutocompletePanel):

    def on_model_bound(self):
        """ This override replaces the widget with your custom version"""
        can_create = _can_create(self.target_model)
        self.widget = type(
            '_Autocomplete',
            (AutocompleteWidgetForUUIDModels,),
            dict(target_model=self.target_model, can_create=can_create, is_single=self.is_single),
        )
