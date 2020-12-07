from django.db import models
from django.contrib.gis.db.models import PointField

class Dustbox(models.Model):
    id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    description = models.TextField()
    device_number = models.CharField(null=True, max_length=256)
    entries_number = models.IntegerField()
    last_entry_at = models.DateTimeField(null=True)
    location = PointField(null=True)
    public_key = models.CharField(max_length=256)
    slug = models.SlugField()
    title = models.CharField(max_length=256)
    updated_at = models.DateTimeField(null=True)

class DustboxReading(models.Model):
    id = models.UUIDField(primary_key=True)
    created_at = models.DateTimeField()
    humidity = models.FloatField(null=True)
    pm1 = models.FloatField(null=True)
    pm2_5 = models.FloatField(null=True)
    pm10 = models.FloatField(null=True)
    stream = models.ForeignKey(Dustbox, on_delete=models.CASCADE)
    temperature = models.FloatField(null=True)
