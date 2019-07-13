# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2019-07-13 07:30
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annotator', '0012_auto_20190712_2155'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='timestamp',
            name='time',
        ),
        migrations.AddField(
            model_name='timestamp',
            name='endtime',
            field=models.PositiveIntegerField(null=True),
        ),
        migrations.AddField(
            model_name='timestamp',
            name='starttime',
            field=models.PositiveIntegerField(null=True),
        ),
    ]
