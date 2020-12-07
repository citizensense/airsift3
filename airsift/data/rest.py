from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework_nested import routers

from airsift.data.models import Dustbox, DustboxReading

class DustboxesViewSet(ReadOnlyModelViewSet):
    queryset = Dustbox.objects.all()

class DustboxesReadingsViewSet(ReadOnlyModelViewSet):
    queryset = Dustbox.objects.all()

    def get_queryset(self):
        return Dustbox.objects.filter(dustbox_id=)


router = routers.DefaultRouter()
dustbox_router = routers.NestedDefaultRouter(router, r'dustboxes')

router.register('dustboxes', DustboxesViewSet, 'dustboxes')
dustbox_router.register('readings', DustboxesReadingsViewSet, 'readings')
