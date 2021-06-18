# Generated by Django 3.0.11 on 2021-02-22 14:51

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('datastories', '0008_auto_20210222_1423'),
    ]

    operations = [
        migrations.AlterField(
            model_name='datastory',
            name='dustbox_location_options',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(blank=True, choices=[('Roadside', 'Roadside'), ('Garden', 'Garden'), ('Indoors', 'Indoors')], max_length=1000), blank=True, default=list, size=None, verbose_name='Where are these dustboxes placed?'),
        ),
    ]