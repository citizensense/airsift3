# Generated by Django 3.0.11 on 2020-12-04 16:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('wagtailimages', '0022_uploadedimage'),
        ('datastories', '0002_auto_20201204_1453'),
    ]

    operations = [
        migrations.AlterField(
            model_name='datastory',
            name='feature_image',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='wagtailimages.Image'),
        ),
    ]
