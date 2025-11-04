from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework_nested import routers
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import pagination, generics, filters
from django_filters import rest_framework as django_filters
from airsift.data import models, serializers
from django.db.models import Avg
from airsift.datastories.forms import create_choices
class ItemSetPagination(pagination.LimitOffsetPagination):
     default_limit = 1

class ItemSetFiltering(django_filters.FilterSet):
    date = django_filters.DateTimeFromToRangeFilter(
        label="Date (Between)"
    )
    class Meta:
        model = models.DustboxReading
        fields = [
            "date"
        ]

class DustboxesViewSet(ReadOnlyModelViewSet):
    queryset = models.Dustbox.objects.all()
    serializer_class = serializers.DustboxSerializer

class DustboxesReadingsViewSet(ReadOnlyModelViewSet):
    queryset = models.DustboxReading.objects.all()
    serializer_class = serializers.DustboxReadingSerializer
    pagination_class = ItemSetPagination
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ItemSetFiltering
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = self.queryset
        queryset = queryset.filter(
            dustbox=self.kwargs['dustbox_pk']
        )
        return queryset

class AggItemSetFiltering(django_filters.FilterSet):
    date = django_filters.DateTimeFromToRangeFilter(
        label="Date (Between)",
        required=False
    )
    # allowed_measures = ('pm1', 'pm2_5', 'pm10',)
    # measure = django_filters.ChoiceFilter(
    #     choices=create_choices(*allowed_measures), null_value='pm2_5', label='Air quality measure'
    # )
    limit = django_filters.NumberFilter(required=False, label='Return limit')

    allowed_means = (
        # Trunc
        'millennium',
        'century',
        'decade',
        'year',
        'quarter',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
        'milliseconds',
        'microseconds',
        # Part
        'century',
        'decade',
        'year',
        'month',
        'day',
        'hour',
        'minute',
        'second',
        'microseconds',
        'milliseconds',
        'dow',
        'doy',
        'epoch',
        'isodow',
        'isoyear',
        'timezone',
        'timezone_hour',
        'timezone_minute',
    )

    mean = django_filters.ChoiceFilter(
        choices=create_choices(*allowed_means), null_value='day', label='Mean time period to average over',
        required=True
    )

    mode = django_filters.ChoiceFilter(
        choices=create_choices('trunc', 'part'), null_value='trunc', label='Mean of date_trunc or date_part. Trunc for continuous time, part for reporting at this level of granularity.',
        required=True
    )
    class Meta:
        model = models.DustboxReading
        fields = [
            "date",
            "mean",
            # "measure"
        ]
class DustboxesReadingAggregatesViewSet(ReadOnlyModelViewSet):
    queryset = models.DustboxReading.objects.all()
    serializer_class = serializers.DustboxReadingSerializer
    pagination_class = ItemSetPagination
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = AggItemSetFiltering
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        queryset = queryset.filter(
            dustbox=self.kwargs['dustbox_pk']
        )
        date_after = self.request.query_params.get('date_after', None)
        if date_after:
            queryset = queryset.filter(created_at__gte=date_after)
        date_before = self.request.query_params.get('date_before', None)
        if date_before:
            queryset = queryset.filter(created_at__lte=date_before)

        mean = self.request.query_params.get('mean', 'minute')

        orderby = self.request.query_params.get('ordering') or self.ordering
        orderby = orderby if type(orderby) is list or isinstance(orderby, list) else [orderby]

        limit = int(self.request.query_params.get('limit') or self.pagination_class.default_limit)

        mode = self.request.query_params.get('mode', 'trunc')

        queryset = queryset\
            .extra({
                'created_at': f'date_{mode}(\'{mean}\', "created_at")'
            })\
            .values(
                'created_at'
            )\
            .annotate(**{
                'pm1': Avg('pm1'),
                'pm2_5': Avg('pm2_5'),
                'pm10': Avg('pm10'),
                'humidity': Avg('humidity'),
                'temperature': Avg('temperature'),
            })\
            .order_by(*orderby)\
            [:limit]

        return Response(queryset)

router = routers.DefaultRouter()
router.register(r'dustboxes', DustboxesViewSet, basename='dustboxes')

dustbox_router = routers.NestedSimpleRouter(router, r'dustboxes', lookup='dustbox')
dustbox_router.register(r'readings', DustboxesReadingsViewSet, basename='readings')
dustbox_router.register(r'aggregates', DustboxesReadingAggregatesViewSet, basename='aggregates')

urls = [
    *router.urls,
    *dustbox_router.urls
]
