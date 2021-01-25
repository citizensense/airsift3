# Generated by Django 3.0.11 on 2020-12-18 11:46

from django.db import migrations, models
import modelcluster.fields


class Migration(migrations.Migration):

    dependencies = [
        ('observations', '0005_auto_20201218_1146'),
        ('data', '0011_auto_20201218_1146'),
        ('datastories', '0006_datastoryindex'),
    ]

    operations = [
        migrations.AlterField(
            model_name='datastory',
            name='canonical_url',
            field=models.URLField(blank=True, help_text="Leave blank to use the page's URL.", max_length=255, null=True, verbose_name='Canonical URL'),
        ),
        migrations.AlterField(
            model_name='datastory',
            name='related_dustboxes',
            field=modelcluster.fields.ParentalManyToManyField(blank=True, to='data.Dustbox', verbose_name='Are there any Airsift Dustboxes monitoring this area?'),
        ),
        migrations.AlterField(
            model_name='datastory',
            name='related_observations',
            field=modelcluster.fields.ParentalManyToManyField(blank=True, to='observations.Observation', verbose_name='Are there any local observations on Airsift from the monitoring period (and before)'),
        ),
        migrations.AlterField(
            model_name='datastoryindex',
            name='canonical_url',
            field=models.URLField(blank=True, help_text="Leave blank to use the page's URL.", max_length=255, null=True, verbose_name='Canonical URL'),
        ),
    ]