# Generated by Django 3.0.11 on 2020-12-08 16:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0007_auto_20201208_1657'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dustbox',
            name='id',
            field=models.CharField(primary_key=True, max_length=36, serialize=False),
        ),
    ]
