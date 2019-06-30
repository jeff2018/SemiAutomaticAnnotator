# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2019-06-30 19:46
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('annotator', '0007_linkpdfannotation_linkvideoannotation'),
    ]

    operations = [
        migrations.AddField(
            model_name='codeannotation',
            name='cs',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='annotator.CodeSnippet'),
        ),
        migrations.AddField(
            model_name='videoannotation',
            name='video',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='annotator.Video'),
        ),
    ]