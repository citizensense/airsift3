import datetime

import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.gis.geos import Point

from airsift.data.models import Dustbox, DustboxReading

BASE_URL = settings.CITIZENSENSE_DATA_API

class Command(BaseCommand):
    help = 'Sync data from the citizensense api'

    sync_all = False
    bail_on_error = False
    verbose = False
    start = {}

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Delete poll instead of closing it',
        )
        parser.add_argument(
            '--bail',
            action='store_true',
            help='Bail when an error occurs',
        )
        parser.add_argument(
            '--page',
            nargs="?",
            help='Offset to start scraping pages at',
        )

    def handle(self, *args, **options):
        self.sync_all = options.get('all', False)
        self.bail_on_error = options.get('bail', False)
        start_opt = options.get('page', None)

        if start_opt is not None:
            key, val = start_opt.split('=')
            self.start = {
                key: int(val)
            }

        self.sync_boxes()
        self.sync_readings()

    def sync_boxes(self):
        print('Sync streams...')

        streams = requests.get(BASE_URL + '/streams', params={
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
                model.entries_number = data.get('entriesNumber')
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
        for stream in Dustbox.objects.all():
            self.sync_stream_reading(stream)

    def sync_stream_reading(self, stream):
        page = self.start.get(str(stream.id), 0)
        visited = set()

        while True:
            print(f'Sync readings for {stream.id} (page {page})...')

            readings_data = requests.get(BASE_URL + '/collections/stream/' + str(stream.id), params={
                'page': page
            }).json().get('data', [])

            # Finish syncing, at latest, when we reach the end of the data
            if len(readings_data) == 0:
                print(f'Synced all readings for stream {stream.id}')
                return

            for data in readings_data:
                self.log_v(data)

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
                        return

                    if model is None:
                        model = DustboxReading()
                        model.id = data['id']

                    model.created_at = convert_timestamp(data.get('createdAt'))
                    model.humidity = convert_float(data.get('humidity'))
                    model.pm1 = convert_float(data.get('pm1'))
                    model.pm2_5 = convert_float(data.get('pm2.5'))
                    model.pm10 = convert_float(data.get('pm10'))
                    model.stream_id = data.get('streamId')
                    model.temperature = convert_float(data.get('temperature'))

                    model.save()
                    visited.add(model.id)

                except Exception as ex:
                    print(f'Failed to sync data for stream reading {data["id"]}')
                    print(ex)

                    self.handle_exception()

            page += 1

    def handle_exception(self):
        if self.bail_on_error:
            exit(1)

    def log_v(self, *args):
        if self.verbose:
            print(*args)


def convert_timestamp(timestamp):
    if timestamp == 'never' or timestamp is None:
        return None

    return datetime.datetime.fromtimestamp(float(timestamp) / 1000, tz=datetime.timezone.utc)

def convert_point(json = {}):
    y = json.get('latitude')
    x = json.get('longitude')

    if x is None or y is None or x == '' or y == '':
        return None

    return Point(x=float(x), y=float(y))

def convert_float(json):
    if json is None or json == '':
        return None

    return float(json)
