# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2019-07-01 14:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annotator', '0009_auto_20190701_1454'),
    ]

    operations = [
        migrations.AddField(
            model_name='codeannotation',
            name='sequenceRank',
            field=models.PositiveIntegerField(null=True),
        ),
    ]
