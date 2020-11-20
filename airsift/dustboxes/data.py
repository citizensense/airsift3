import requests

class DustboxReadings:
    @staticmethod
    def load():
        baseurl = 'https://citizensense.co.uk:7000'
        data_streams = requests.get(baseurl+'/streams').json()
        data_collections = requests.get(baseurl+'/collections').json()

        return [
            DustboxReadings(dustbox, data_collections['data'])
            for dustbox
            in data_streams['data']
        ]


    def __init__(self, dustbox, readings):
        self.id = dustbox['id']
        self.properties = dustbox
        self.readings = [reading for reading in readings if reading['id'] == self.id]

    @property
    def current_reading(self):
        return next(sorted(self.readings, 'createdAt', False), None)
