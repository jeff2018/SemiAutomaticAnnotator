# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2019-06-27 15:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('annotator', '0002_infopage_pdf'),
    ]

    operations = [
        migrations.AddField(
            model_name='infopage',
            name='filepath',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
