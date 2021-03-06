# Generated by Django 3.0.11 on 2020-11-30 19:16

import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import wagtail.core.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('wagtailimages', '0022_uploadedimage'),
        ('wagtailcore', '0059_apply_collection_ordering'),
    ]

    operations = [
        migrations.CreateModel(
            name='ObservationType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=256)),
            ],
        ),
        migrations.CreateModel(
            name='Observation',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.Page')),
                ('body', wagtail.core.fields.RichTextField(blank=True, null=True)),
                ('datetime', models.DateTimeField(blank=True, default=django.utils.timezone.now)),
                ('location', django.contrib.gis.db.models.fields.PointField(blank=True, null=True, srid=4326)),
                ('images', models.ManyToManyField(blank=True, null=True, related_name='_observation_images_+', to='wagtailimages.Image')),
                ('observation_type', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='observations.ObservationType')),
            ],
            options={
                'abstract': False,
            },
            bases=('wagtailcore.page',),
        ),
    ]
