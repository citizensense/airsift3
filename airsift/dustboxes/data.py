import requests
from datetime import datetime, timedelta
import json
import os
import urllib.parse

def citizensense_data(request, path):
    url = f'https://citizensense.co.uk:7000/{path}?{request.GET.urlencode()}'
    res = proxy_request(url)
    return res
class DustboxReadings:
    @staticmethod
    def load():
        # To configure the API,
        # edit /var/www/data-platform-realtime/axios-vanilla
        # and then run the build command `npm build`
        baseurl = 'https://citizensense.co.uk:7000'
        # var/www/data-platform-realtime/axios-vanilla/backend/src/modules/stream/controllers/read/streams.js
        data_streams = requests.get(baseurl+'/streams', params={
            'limit': 'off'
        }).json()

        current_date = datetime.now()
        date_from = current_date - timedelta(minutes=5)
        # var/www/data-platform-realtime/axios-vanilla/backend/src/modules/collection/controllers/read/collections.js
        data_collections = requests.get(baseurl+'/collections', params={
            'limit': 'off',
            'dateFrom': date_from,
            'dateTo': current_date
        }).json()

        return [
            DustboxReadings(dustbox, data_collections['data'])
            for dustbox
            in data_streams['data']
        ]


    def __init__(self, dustbox, readings):
        self.id = dustbox['id']
        self.properties = dustbox
        self.readings = [reading for reading in readings if reading['streamId'] == self.id]

    @property
    def current_reading(self):
        s = next(iter(sorted(self.readings, key=prop('createdAt'), reverse=False)), None)
        return s

def prop(key_name: str):
    def key(self):
        return self[key_name]
    return key

import urllib
from django.http import HttpResponse

excluded_headers = set([
    # Hop-by-hop headers
    # ------------------
    # Certain response headers should NOT be just tunneled through.  These
    # are they.  For more info, see:
    # http://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html#sec13.5.1
    'connection', 'keep-alive', 'proxy-authenticate',
    'proxy-authorization', 'te', 'trailers', 'transfer-encoding',
    'upgrade',

    # Although content-encoding is not listed among the hop-by-hop headers,
    # it can cause trouble as well.  Just let the server set the value as
    # it should be.
    'content-encoding',

    # Since the remote server may or may not have sent the content in the
    # same encoding as Django will, let Django worry about what the length
    # should be.
    'content-length',
])

def proxy_request(url):
    res = urllib.request.urlopen(url)

    response = HttpResponse(res.read())

    headers = dict(res.info())

    for key in headers:
        if key.lower() in excluded_headers:
            continue
        try:
            response[key] = headers.get(key)
        except:
            pass

    return response
