# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2019-06-27 15:29
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('annotator', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='infopage',
            name='pdf',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='annotator.PDF'),
        ),
    ]
