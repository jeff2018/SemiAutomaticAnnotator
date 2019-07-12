from django.http import JsonResponse
from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from .models import *
from .utils import saveResource,retrieveAnnotations,processCS, processVideo
from .analysePDF import processPDF

import os
import json

from .models import Resource
# Create your views here.


def index(request):
    print("index")
    return render(request,'annotator/index.html')

def uploadFile(request):
    print("uploadfile")
    if request.method == 'POST' and request.FILES['file']:
        myfile = request.FILES['file']
        folder = "/Users/jeff/PycharmProjects/SAAnnotator/upload/"

        fs = FileSystemStorage()

        if not os.path.exists(str(folder+myfile.name)):
            filename = fs.save(myfile.name, myfile)
        filename = myfile.name
        destination=folder+myfile.name


        resource = saveResource(myfile.name,destination)
        res={"message": "Processed "+str(resource.name),
             "path":resource.filepath,
             "filename":resource.name,
             "id":resource.id}
        return JsonResponse(res)

    return render(request,'annotator/index.html')

def processFile(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)
        fileid = data['id']
        filename= data['name']

        if filename.endswith('.pdf'):

            f = PDF.objects.get(id=fileid)
            if f:

                print("id of file: "+str(f.id))

                myFileName, myFileExt = os.path.splitext(f.filepath)

                if myFileExt.lower() == '.pdf':
                    processPDF(f)
                    res = {"message": "Processed "+str(f.name),"path":f.filepath,"filename":f.name,"id":f.id}



                    return JsonResponse(res)

        if filename.endswith('.mp4'):
            f = Video.objects.get(id=fileid)
            if f:
                f.duration=data['duration']
                f.save()
                processVideo(f)
                res = {"message": "Processed "+str(f.name),"path":f.filepath,"filename":f.name,"id":f.id}
                return JsonResponse(res)



        if filename.endswith('.java') or filename.endswith('.c'):
            f = CodeSnippet.objects.get(id=fileid)
            if f:
                processCS(f)
                res = {"message": "Processed " + str(f.name), "path": f.filepath, "filename": f.name, "id": f.id}

                return JsonResponse(res)


    return render(request,'annotator/index.html')

def processTxtFile(request):
    print("processTxtFile")
    if request.method == 'POST':
        data = json.loads(request.body)
        fileid = data['id']
        filename = data['name']
        print(data)

        if filename.endswith('.pdf'):
            file = PDF.objects.get(id=fileid)

            res = retrieveAnnotations(file)
            return JsonResponse(res)

        if filename.endswith('.mp4'):
            file = Video.objects.get(id=fileid)

            #res = retrieveAnnotations(file)
            #return JsonResponse(res)


        if filename.endswith('.java') or filename.endswith('.c'):
            file = CodeSnippet.objects.get(id=fileid)
            res = retrieveAnnotations(file)


            return JsonResponse(res)

