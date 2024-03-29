from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# Create your models here.

class Concept(models.Model):
    uri = models.CharField(max_length=255)
    label = models.CharField(max_length=255)
    group = models.CharField(max_length=255)

    def __str__(self):
        return self.uri


class Resource(models.Model):
    name = models.CharField(max_length=255)
    filepath = models.CharField(max_length=255)


    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class PDF(Resource):
    nbrOfPages = models.PositiveIntegerField()
    textfolder = models.CharField(max_length=255,null=True)


class Video(Resource):
    duration = models.PositiveIntegerField()
    transcriptionFile = models.CharField(max_length=255,null=True)
    timestampFile = models.CharField(max_length=255,null=True)


class CodeSnippet(Resource):
    lines = models.PositiveIntegerField()


class Annotation(models.Model):
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE,null=True)
    #resource = models.ForeignKey('annotator.Resource', on_delete=models.CASCADE)

    frequency = models.PositiveIntegerField(null=True)

    class Meta:
        abstract = True



class PageAnnotation(Annotation):
    pdf = models.ForeignKey(PDF, on_delete=models.CASCADE,null=True)
    page = models.PositiveIntegerField()
    filepath = models.CharField(max_length=255,null=True)
    degree = models.FloatField(null=True)
    pagerank = models.FloatField(null=True)
    camino = models.NullBooleanField()


class VideoAnnotation(Annotation):
    video = models.ForeignKey(Video, on_delete=models.CASCADE,null=True)
    URI = models.CharField(max_length=255,null=True)
    wikilink =  models.CharField(max_length=255,null=True)


class CodeAnnotation(Annotation):
    cs = models.ForeignKey(CodeSnippet, on_delete=models.CASCADE,null=True)
    sequenceRank = models.PositiveIntegerField(null=True)

class timestamp(models.Model):
    starttime = models.PositiveIntegerField(null=True)
    endtime = models.PositiveIntegerField(null=True)
    videoAnnotation = models.ForeignKey(VideoAnnotation,on_delete=models.CASCADE,null=True)

class mappedWords(models.Model):
    word = models.CharField(max_length=255,null=True)
    videoAnnotation = models.ForeignKey(VideoAnnotation,on_delete=models.CASCADE,null=True)


class LineOfCode(models.Model):
    lineNumber = models.PositiveIntegerField()
    codeAnnotation = models.ForeignKey(CodeAnnotation,on_delete=models.CASCADE,null=True)

class Link(models.Model):
    source = models.PositiveIntegerField()
    target = models.PositiveIntegerField()

    class Meta:
        abstract = True
    def __str__(self):
        return str(self.source +"-"+self.target)

class LinkPDFAnnotation(Link):
    pdf = models.ForeignKey(PDF, on_delete=models.CASCADE,null=True)


class LinkVideoAnnotation(Link):
    video = models.ForeignKey(PDF, on_delete=models.CASCADE,null=True)


