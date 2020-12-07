# Generated by Django 3.0.11 on 2020-12-04 12:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0004_auto_20201204_1014'),
    ]

    operations = [
        migrations.AlterField(
            model_name='reading',
            name='humidity',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='reading',
            name='pm1',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='reading',
            name='pm10',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='reading',
            name='pm2_5',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='reading',
            name='temperature',
            field=models.FloatField(null=True),
        ),
    ]