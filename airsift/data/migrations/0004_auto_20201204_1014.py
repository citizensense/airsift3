# Generated by Django 3.0.11 on 2020-12-04 10:14

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0003_auto_20201204_1014'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stream',
            name='location',
            field=django.contrib.gis.db.models.fields.PointField(null=True, srid=4326),
        ),
    ]
