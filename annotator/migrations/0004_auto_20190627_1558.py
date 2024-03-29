# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2019-06-27 15:58
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('annotator', '0003_infopage_filepath'),
    ]

    operations = [
        migrations.AlterField(
            model_name='infocode',
            name='camino',
            field=models.NullBooleanField(),
        ),
        migrations.AlterField(
            model_name='infocode',
            name='concept',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='annotator.Concept'),
        ),
        migrations.AlterField(
            model_name='infocode',
            name='degree',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='infocode',
            name='frequency',
            field=models.PositiveIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='infocode',
            name='pagerank',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='infopage',
            name='camino',
            field=models.NullBooleanField(),
        ),
        migrations.AlterField(
            model_name='infopage',
            name='concept',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='annotator.Concept'),
        ),
        migrations.AlterField(
            model_name='infopage',
            name='degree',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='infopage',
            name='frequency',
            field=models.PositiveIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='infopage',
            name='pagerank',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='infovideo',
            name='camino',
            field=models.NullBooleanField(),
        ),
        migrations.AlterField(
            model_name='infovideo',
            name='concept',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='annotator.Concept'),
        ),
        migrations.AlterField(
            model_name='infovideo',
            name='degree',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='infovideo',
            name='frequency',
            field=models.PositiveIntegerField(null=True),
        ),
        migrations.AlterField(
            model_name='infovideo',
            name='pagerank',
            field=models.FloatField(null=True),
        ),
    ]
