from .models import *
import os
import json
from .speechmatics import transcribe
from .tagMe import getAnnotations
from .graph import graph
from .annotation import spotlight,babelfy
from .codeAnnotation import execute_java,AnnotatorMain



def saveResource(file,destination):
    if file.endswith('.pdf'):
        print("file is a pdf.")
        pdf_exist = PDF.objects.filter(name=file).exists()
        if pdf_exist:
            resource = PDF.objects.get(name=file)
        else:
            resource = PDF(name=file,filepath=destination,nbrOfPages=1)
            resource.save()

    if file.endswith('.mp4'):
        print("file is a video.")
        pdf_exist = Video.objects.filter(name=file).exists()
        if pdf_exist:
            resource = Video.objects.get(name=file)
        else:
            resource = Video(name=file,filepath=destination,duration=1)
            resource.save()

    if file.endswith('.java') or file.endswith('.c'):
        print("file is a codesnippet")
        cs_exist = CodeSnippet.objects.filter(name=file).exists()
        if cs_exist:
            resource = CodeSnippet.objects.get(name=file)
        else:
            resource = CodeSnippet(name=file,filepath=destination,lines=1)
            resource.save()


    return resource

def processVideo(file):
    annotations_exist = VideoAnnotation.objects.filter(video_id=file.id).exists()
    if not annotations_exist:
        filepath = file.filepath
        folder = "/Users/jeff/PycharmProjects/SAAnnotator/upload/video_" + str(file.id) + "/"
        if not os.path.exists(folder):
            os.makedirs(folder)
        if not file.transcriptionFile:
            transcribedFile, transcibedJson = transcribe(filepath,folder)
            file.transcriptionFile = transcribedFile
            file.timestampFile = transcibedJson
            file.save()
        print("no trans requierd")



def processCS(file):
    annotations_exist = CodeAnnotation.objects.filter(cs_id=file.id).exists()
    if not annotations_exist:
        filepath = file.filepath
        print(filepath)
        args=[]
        args.append(filepath)
        conceptsCS=execute_java(AnnotatorMain,args)
        print(conceptsCS)
        jsonFile = open('/Users/jeff/PycharmProjects/SAAnnotator/annotator/sequence_scrapbook.json')
        sequenceArray = json.load(jsonFile)
        sequence=[]
        conceptsCSList = json.loads(conceptsCS)
        if file.name.endswith(".java"):
            sequence=sequenceArray[1]['java']
        else:
            sequence = sequenceArray[0]['c']

        remainingList=[]
        for cpt in conceptsCSList:

            uri = cpt['uri']
            lines=cpt['lines']
            for index, seq_uri in enumerate(sequence):
                if uri == seq_uri:
                    print(uri,lines,index)
                    cpt['degree']=index
                    remainingList.append(cpt)
        sortedRemainingList = sorted(remainingList,key=lambda k:k['degree'],reverse=True)
        for index, concept_srl in enumerate(sortedRemainingList):
            concept_srl['degree']=index+1
        print(sortedRemainingList)

        for concept_cs in sortedRemainingList:
            uri = concept_cs['uri']
            lines = concept_cs['lines']
            degree = concept_cs['degree']

            concept_exist = Concept.objects.filter(uri=uri).exists()
            if not concept_exist:
                concept = Concept(uri=uri, label=uriToLabel(uri), group="1")
                concept.save()
            else:
                concept = Concept.objects.get(uri=uri)
            ca= CodeAnnotation(sequenceRank=degree,frequency=len(lines),concept_id=concept.id,cs_id=file.id)
            ca.save()
            for line in lines:
                line_exist = LineOfCode.objects.filter(lineNumber=line,codeAnnotation_id=ca.id)
                if not line_exist:
                    new_line = LineOfCode(lineNumber=line,codeAnnotation_id=ca.id)
                    new_line.save()




def retrieveAnnotations(file,scheme):
    if file:
        print("id of file: " + str(file.id))

        myFileName, myFileExt = os.path.splitext(file.filepath)

        if myFileExt.lower() == '.pdf':
            print(file)

            annotations_exist = PageAnnotation.objects.filter(pdf_id = file.id).exists()
            if not annotations_exist:
                textfolder = file.textfolder
                print(textfolder)
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
                d['frequency']=[]
                degree=0

                concept_id = d['id']
                page_annot = PageAnnotation.objects.filter(pdf_id=file.id,concept_id=concept_id)
                for p in page_annot:
                    d['pages'].append(str("Page "+str(p.page)))
                    degree +=p.degree
                    d['frequency'].append(p.frequency)
                d['value'] = len(d['pages'])
                d['avgDegree'] = degree / d['value']
                d['words'] = []
                print(d)
            for dl in dict_links:
                dl['distance']=10
            combined_dict = {"nodes":list(dict),"links":list(dict_links),"pages":file.nbrOfPages,"filename": file.name, "id": file.id}

            return combined_dict

        if myFileExt.lower() =='.mp4':
            annotations_exist = VideoAnnotation.objects.filter(video_id=file.id).exists()
            if not annotations_exist:
                concepts = getAnnotations(file,scheme)
                for c in concepts:
                    con_uri = c['concept']
                    concept_exist = Concept.objects.filter(uri=con_uri).exists()
                    if not concept_exist:
                        concept = Concept(uri=con_uri, label=c['label'], group="1")
                        concept.save()
                    else:
                        concept = Concept.objects.get(uri=con_uri)
                    va = VideoAnnotation(video_id=file.id,concept_id=concept.id, URI=c['URI'],frequency=len(c['time']),wikilink=c['wiki'])
                    va.save()
                    words = c['words']
                    for w in words:
                        mw = mappedWords(word=w,videoAnnotation_id=va.id)
                        mw.save()
                    time = c['time']
                    for t in time:
                        ts = timestamp(starttime=t, endtime=t+1,videoAnnotation_id=va.id)
                        ts.save()
            annotations = VideoAnnotation.objects.filter(video_id=file.id).values('concept_id').distinct()
            videoConcepts = Concept.objects.filter(id__in=annotations).values()
            dict =videoConcepts
            for d in dict:
                print(d)
                va = VideoAnnotation.objects.get(concept_id=d['id'], video_id=file.id)
                d['frequency'] = va.frequency
                d['wiki']= va.wikilink
                d['uri']=va.URI
                d['words']=[]
                d['time']=[]
                words = mappedWords.objects.filter(videoAnnotation=va.id)
                for w in words:
                    d['words'].append(w.word)

                timestamps = timestamp.objects.filter(videoAnnotation=va.id)
                for t in timestamps:
                    start = t.starttime
                    end = t.endtime
                    domainrange =[]
                    domainrange.append(start)
                    domainrange.append(end)
                    d['time'].append(domainrange)
            combined_dict = {"nodes": list(dict), "filename": file.name, "id": file.id}
            print(combined_dict)
            return combined_dict






        if myFileExt.lower() =='.java' or myFileExt.lower() =='.c':
            annotations = CodeAnnotation.objects.filter(cs_id=file.id).values('concept_id').distinct()
            cs = Concept.objects.filter(id__in=annotations).values()

            dict = cs
            for d in dict:
                d['lines'] = []
                print(d['id'])
                print(d)
                ca = CodeAnnotation.objects.get(concept_id=d['id'], cs_id=file.id)
                d['sequenceRank'] = ca.sequenceRank
                d['frequency'] = ca.frequency
                lines = LineOfCode.objects.filter(codeAnnotation=ca.id)
                for line in lines:
                    d['lines'].append(line.lineNumber)

            combined_dict = {"nodes": list(dict),"filename": file.name, "id": file.id}
            print(combined_dict)
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
        #print("t ", t)
        if t['camino'] == 'False':
            #print("camino false")
            for i in initialConcepts:
                #print("i ", i)
                ending = i[0].rsplit('/', 1)[1]
                resource = "dbr:" + ending

                freq = i[1]
                # print(resource,t['label'])
                if resource == t['label']:
                    t['frequency'] = freq
    for t in topTen:
        if t['camino'] == 'True':
            #print("camino true")

            oldSources = t['sources']
            t['sources'] = [s['label'] for s in topTen if s['label'] in oldSources]
            newSources = t['sources']

            for s in topTen:
                #print("s ", s)
                if s['label'] in newSources:
                    t['frequency'] += s['frequency']
            if len(t['sources']) != 0:

                avgFreg = int(round(t['frequency'] / len(t['sources'])))
                t['frequency'] = avgFreg
        results.append(t)
        # print(t)
    return results