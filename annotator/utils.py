from .models import *
import os
from .graph import graph
from .annotation import spotlight,babelfy
from django.forms.models import model_to_dict



def saveResource(file,destination):
    if file.endswith('.pdf'):
        print("file is a pdf.")
        pdf_exist = PDF.objects.filter(name=file).exists()
        if pdf_exist:
            resource = PDF.objects.get(name=file)
        else:
            resource = PDF(name=file,filepath=destination,nbrOfPages=1)
            resource.save()
    return resource

def retrieveAnnotations(file):
    if file:
        print("id of file: " + str(file.id))

        myFileName, myFileExt = os.path.splitext(file.filepath)

        if myFileExt.lower() == '.pdf':
            print(file)

            annotations_exist = PageAnnotation.objects.filter(pdf_id = file.id).exists()
            if not annotations_exist:
                textfolder = file.textfolder
                page_counter = 1
                fileList = os.listdir(textfolder)
                fileList.sort()
                print(fileList)
                for filename in fileList:
                    print(filename)
                    print("-----")
                    txtfile = open(str(textfolder+filename),"r")
                    transcription = str(txtfile.read())
                    if transcription != "":
                        concepts = analysis(transcription)
                        sorted_concepts = sorted(concepts,key=lambda k: k['camino'])
                        for sc in sorted_concepts:
                            con_uri = sc['label']
                            concept_exist = Concept.objects.filter(uri=con_uri).exists()
                            if not concept_exist:
                                concept = Concept(uri=con_uri,label=uriToLabel(con_uri),group="1")
                                concept.save()
                            else:
                                concept = Concept.objects.get(uri=con_uri)
                            pa = PageAnnotation(degree=sc['degree'], pagerank= sc['pagerank'], camino=eval(sc['camino']), frequency =sc['frequency'],page=page_counter,pdf_id=file.id,concept_id=concept.id,filepath=str(file.textfolder+filename))
                            pa.save()

                            if pa.camino:
                                sources = sc['sources']
                                for s in sources:
                                    source = Concept.objects.get(uri=s)

                                    linkpdf_exist = LinkPDFAnnotation.objects.filter(source=source.id, target=concept.id,pdf_id=file.id).exists()
                                    if not linkpdf_exist:
                                        linkpdf = LinkPDFAnnotation(source=source.id,target=concept.id,pdf_id=file.id)
                                        linkpdf.save()

                    page_counter=page_counter+1

        annotations = PageAnnotation.objects.filter(pdf_id=file.id).values('concept_id').distinct()
        cs = Concept.objects.filter(id__in=annotations).values()

        links = LinkPDFAnnotation.objects.filter(pdf_id=file.id).values()
        dict = cs
        dict_links = links
        for d in dict:
            d['pages']=[]
            degree=0
            print(d)
            concept_id = d['id']
            page_annot = PageAnnotation.objects.filter(pdf_id=file.id,concept_id=concept_id)
            for p in page_annot:
                d['pages'].append(str("Page "+str(p.page)))
                degree +=p.degree
            d['value'] = len(d['pages'])
            d['avgDegree'] = degree / d['value']
            d['words'] = []

        for dl in dict_links:
            dl['distance']=10
        combined_dict = {"nodes":list(dict),"links":list(dict_links)}

        return combined_dict


def uriToLabel(uri):
    label = uri.split(':')[1]
    return label

def analysis(text):
    results = []
    # print("Original text:", text)

    spotlightResults = spotlight(text)
    babelfyResults = babelfy(text)

    graphResults, initialConcepts = graph(spotlightResults, babelfyResults)

    topTen = graphResults[:10]
    for t in topTen:
        t['frequency'] = 0
        print("t ", t)
        if t['camino'] == 'False':
            print("camino false")
            for i in initialConcepts:
                print("i ", i)
                ending = i[0].rsplit('/', 1)[1]
                resource = "dbr:" + ending

                freq = i[1]
                # print(resource,t['label'])
                if resource == t['label']:
                    t['frequency'] = freq
    for t in topTen:
        if t['camino'] == 'True':
            print("camino true")

            oldSources = t['sources']
            t['sources'] = [s['label'] for s in topTen if s['label'] in oldSources]
            newSources = t['sources']

            for s in topTen:
                print("s ", s)
                if s['label'] in newSources:
                    t['frequency'] += s['frequency']
            avgFreg = int(round(t['frequency'] / len(t['sources'])))
            t['frequency'] = avgFreg
        results.append(t)
        # print(t)
    return results