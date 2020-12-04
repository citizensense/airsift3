from django import template
register = template.Library()
from ..models import DataStory

@register.tag
def get_datastories(*args, **kwargs):
    return DataNode(DataStory.objects.live().public().all())

class DataNode(template.Node):
    def __init__(self, datastories):
        self.datastories = datastories

    def render(self, context):
        context['datastories'] = list(self.datastories)
        return ''
