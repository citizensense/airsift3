from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework_nested import routers

from airsift.data import models, serializers
class DustboxesViewSet(ReadOnlyModelViewSet):
    queryset = models.Dustbox.objects.all()
    serializer_class = serializers.DustboxSerializer

class DustboxesReadingsViewSet(ReadOnlyModelViewSet):
    queryset = models.DustboxReading.objects.all()
    serializer_class = serializers.DustboxReadingSerializer

    def get_queryset(self, **kwargs):
        print(kwargs)
        return models.DustboxReading.objects.filter(dustbox_id=kwargs.get('dustbox_pk'))


router = routers.DefaultRouter()
router.register('dustboxes', DustboxesViewSet, 'dustboxes')

dustbox_router = routers.NestedDefaultRouter(router, r'dustboxes')
dustbox_router.register('readings', DustboxesReadingsViewSet, 'readings')

urls = [
    *router.urls,
    *dustbox_router.urls
]
