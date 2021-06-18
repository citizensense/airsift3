import datetime
import math

import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.geos import Point

from airsift.data.models import Dustbox, DustboxReading

DATA_API_URL = settings.CITIZENSENSE_DATA_API

class Command(BaseCommand):
    help = 'Sync data from the citizensense api'

    sync_all = False
    bail_on_error = False
    verbose = False
    max = None
    pagesize = 50
    numpages = 1
    ids_to_sync = ()

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Fetch all readings',
        )
        parser.add_argument(
            '--bail',
            action='store_true',
            help='Bail when an error occurs',
        )
        parser.add_argument(
            '--max',
            nargs="?",
            type=int,
            help='Max number of readings per dustbox to read',
        )
        parser.add_argument(
            '--pagesize',
            default=50,
            type=int,
            help='Size of pages to fetch',
        )
        parser.add_argument('ids', nargs='*', type=str)

    def handle(self, *args, **options):
        self.sync_all = options.get('all', False)
        self.bail_on_error = options.get('bail', False)
        self.pagesize = options.get('pagesize', None)
        self.max = options.get('max', None)
        self.ids_to_sync = options.get('ids', ())

        if self.max is not None:
            self.numpages = self.max / self.pagesize
        else:
            self.numpages = math.inf


        self.sync_boxes()
        self.sync_readings()
        print('Sync completed!')

    def sync_boxes(self):
        print('Sync streams...')

        streams = requests.get(DATA_API_URL + '/streams', params={
            'limit': 'off'
        }).json().get('data', [])

        print(f'Found {len(streams)} boxes to sync')

        for data in streams:
            self.log_v(data)

            try:
                try:
                    model = Dustbox.objects.get(id=data['id'])
                except Dustbox.DoesNotExist:
                    model = Dustbox(id=data['id'])

                model.created_at = convert_timestamp(data.get('createdAt'))
                model.description = data.get('description')
                model.device_number = data.get('deviceNumber')
                model.entries_number = convert_int(data.get('entriesNumber'), 0)
                model.last_entry_at = convert_timestamp(data.get('lastEntryAt', {}).get('timestamp'))
                model.location = convert_point(data.get('location'))
                model.public_key = data.get('publicKey')
                model.slug = data.get('slug')
                model.title = data.get('title')
                model.updated_at = convert_timestamp(data.get('updatedAt'))

                model.save()

            except Exception as ex:
                print(f'Failed to sync data for stream {data["id"]}')
                print(ex)

                self.handle_exception()

    def sync_readings(self):
        i = 1

        if len(self.ids_to_sync) == 0:
            total = len(Dustbox.objects.all())

            for stream in Dustbox.objects.all():
                print(f'Sync readings from stream {stream.id} ({i}/{total})')
                self.sync_stream_reading(stream)
                i += 1
        else:
            total = len(self.ids_to_sync)

            for stream in Dustbox.objects.filter(id__in=self.ids_to_sync):
                print(f'Sync readings from stream {stream.id} ({i}/{total})')
                self.sync_stream_reading(stream)
                i += 1

    def sync_stream_reading(self, stream):
        if self.sync_all:
            self.sync_all_stream_readings(stream)

        else:
            page = 0
            visited = set()

            while page < self.numpages and self.sync_stream_reading_page(stream, page=page, visited=visited):
                page += 1

    def sync_stream_reading_page(self, stream, page, visited):
        print(f'Page {page}...')

        readings_data = requests.get(DATA_API_URL + '/collections/stream/' + str(stream.id), params={
            'page': page,
            'limit': self.pagesize,
        }).json().get('data', [])

        # Finish syncing, at latest, when we reach the end of the data
        if len(readings_data) == 0:
            print(f'Synced all readings for stream {stream.id}')
            return False

        return self.sync_stream_readings(stream, readings_data, visited=visited)

    def sync_all_stream_readings(self, stream):
        readings_data = requests.get(DATA_API_URL + '/collections/stream/' + str(stream.id), params={
            'limit': 'off'
        }).json().get('data', [])

        return self.sync_stream_readings(stream, readings_data)

    def sync_stream_readings(self, stream, readings_data, visited=None):
        for data in readings_data:
            self.log_v(data)

            if visited is None:
                visited = set()

            # Handle pagination alignment errors
            if data['id'] in visited:
                continue

            try:
                model = DustboxReading.objects.filter(id=data['id']).first()

                # Finish syncing this stream if we've got this reading in the database
                #
                # This assumes that the API repsonse is ordered by date of reading so that
                # having a reading implies also having all earlier readings.
                #
                # (and that our script never bailed. the --all switch can be used to backfill
                # manually if that happens)
                if model is not None and not self.sync_all:
                    print(f'Dustbox {stream.id} is up to date')
                    return False

                if model is None:
                    model = DustboxReading()
                    model.id = data['id']

                model.created_at = convert_timestamp(data.get('createdAt'))
                model.humidity = convert_float(data.get('humidity'))
                model.pm1 = convert_float(data.get('pm1'))
                model.pm2_5 = convert_float(data.get('pm2.5'))
                model.pm10 = convert_float(data.get('pm10'))
                model.dustbox_id = data.get('streamId')
                model.temperature = convert_float(data.get('temperature'))

                model.save()
                visited.add(model.id)

            except Exception as ex:
                print(f'Failed to sync data for stream reading {data["id"]}')
                print(ex)

                self.handle_exception()

        return True

    def handle_exception(self):
        if self.bail_on_error:
            exit(1)

    def log_v(self, *args):
        if self.verbose:
            print(*args)


def convert_timestamp(timestamp):
    if timestamp == 'never':
        return None

    ts_float = convert_float(timestamp)
    if ts_float is None:
        return None

    return datetime.datetime.fromtimestamp(ts_float / 1000, tz=datetime.timezone.utc)

def convert_point(json):
    if json is None:
        return None

    y = convert_float(json.get('latitude'))
    x = convert_float(json.get('longitude'))

    if x is None or y is None:
        return None

    return Point(x=float(x), y=float(y))

def convert_float(json, default=None):
    if json is None or json == '':
        return default

    return float(json)

def convert_int(json, default=None):
    if json is None or json == '':
        return default

    return int(json)
