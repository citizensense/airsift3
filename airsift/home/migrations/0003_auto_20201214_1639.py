# Generated by Django 3.0.11 on 2020-12-14 16:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('wagtailimages', '0022_uploadedimage'),
        ('home', '0002_infopage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='infopage',
            name='feature_image',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='wagtailimages.Image'),
        ),
    ]