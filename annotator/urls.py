from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^uploadFile/$', views.uploadFile, name='uploadFile'),
    url(r'^processFile/$', views.processFile, name='processFile'),
    url(r'^processTxtFile/$', views.processTxtFile, name='processTxtFile'),

]