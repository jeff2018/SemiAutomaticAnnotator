import tagme
import requests
from collections import Counter
from SPARQLWrapper import SPARQLWrapper, JSON
import json




token = "28b822b0-7839-45d0-bec3-4510a2dd72ca-843339462"
tagMeURL = "https://tagme.d4science.org/tagme/tag"


jsonFile2 = open('mappingSchemes.json')
mapping= json.load(jsonFile2)
f = open("transcrption_ForLoop.txt")
jsonTranscript = open('ForLoop-2.json')
transcript = json.load(jsonTranscript)

text = f.read()
tagme.GCUBE_TOKEN = token


def jsonRequest(url,data):
    print(data,url)
    resp, result = None,None
    try:
        resp = requests.post(url,params=data)
        result=resp.json()
        print(result)
    except requests.exceptions.RequestException as e:
        print("Request exception: {}".format(e))
        print(resp.text)


    return result

def frequenceService(url,data):
    results= []

    resp = jsonRequest(url,data)
    if resp['annotations']:
        annotations = resp['annotations']
        print(len(annotations))
        list=[]
        for a in annotations:
            if a['rho'] >= 0.095:
                spot = a['spot']
                title = a['title']
                wiki = tagme.title_to_uri(title)
                temp = [spot,wiki]
                list.append(temp)
                print(a)
                #print(spot, title, wiki)
        info_List=infoList(list)
        for i in info_List:
            temp = {"wiki":i[0],
                    "frequency":i[1],
                    "words": i[2]}
            results.append(temp)
    return results
def infoList(results):

    infoList=[]
    c = Counter(r[1] for r in results)
    for r in results:
        unique=True
        for i in infoList:
            if i[0] == r[1]:
                unique=False
                if r[0] not in i[2]:
                    i[2].append(r[0])
                break
        if unique:
            list = [r[1],c[r[1]],[r[0]]]
            infoList.append(list)
    print(infoList)
    return infoList

def tagMe(text):
    data= {"text":text,
           "lang":"en",
           "gcube-token":token,
           }
    results = frequenceService(tagMeURL,data)
    return results

def getDBPediaResource(spots):

    for s in spots:
        s['URI']=""
        wiki = s['wiki']
        httpwiki = "<"+ wiki.replace("https","http")+">"

        sparql = SPARQLWrapper("http://dbpedia.org/sparql")
        sparql.setQuery('''
            SELECT distinct ?concept
            WHERE {
                ?concept foaf:isPrimaryTopicOf ''' + httpwiki + '''   .
             
            } LIMIT 100

            ''')

        sparql.setReturnFormat(JSON)
        reply = sparql.query().convert()

        bindings = reply['results']['bindings'][0]
        #print(bindings)
        s['URI'] = "dbr:"+bindings['concept']['value'].rsplit('/', 1)[-1]

def mapToAlma(scheme,spottings):
    almaConcepts=[]
    print("---ALMA---")
    map = mapping[scheme]
    for s in spottings:
        for m in map:
            related = m['dbpediaConcept']
            if s['URI'] == related:
                #s['Concept'] = m['Concept']
                #print(s['Concept'])
                temp = {"wiki":s['wiki'],
                        "frequency":s['frequency'],
                        "words":s['words'],
                        "URI":s['URI'],
                        "concept":m['Concept'],
                        "label":m['label']}
                if not any(d['concept'] == temp['concept'] for d in almaConcepts):
                    almaConcepts.append(temp)
    return almaConcepts

def filterWords(spottings):
    for s in spottings:
        words = s['words']
        badwords=[]
        if len(words)>1:
            for t in spottings:
                if s['concept'] != t['concept']:
                    label = t['label'].lower()
                    label.replace("-"," ")

                    index = 0
                    for w in words:

                        if w == label:
                            #print(s)
                            #print(w,t, index)
                            index = index + 1
                            badwords.append(w)

                        index=index+1
        s['words'] = [x for x in words if x not in badwords]

def addTimeStamp(spottings):
    for s in spottings:
        words = s['words']
        s['time']=[]
        for w in words:
            if " " in w:
                wordArray = w.split(" ")
                wordLength = len(wordArray)
                firstWord = wordArray[0]
                for i, t in enumerate(transcript['words']):
                    n = t['name']
                    time = float(t['time'])
                    if n == firstWord:
                        print(firstWord)
                        nextWord = wordArray[wordLength-1]
                        nextElement = transcript['words'][i+1]
                        if nextWord == nextElement['name']:
                            print(nextWord)
                            time = int(round(time))
                            s['time'].append(time)

            else:
                for i, t in enumerate(transcript['words']):
                    n = t['name']
                    time = float(t['time'])
                    if n == w:
                        time = int(round(time))
                        s['time'].append(time)





    return



spottings = tagMe(text)
getDBPediaResource(spottings)
for s in spottings:
    print(s)
mappedALMA =mapToAlma('java',spottings)
filterWords(mappedALMA)

print(transcript['words'])

for t in transcript['words']:
    w = t['name']
    time = t['time']
    print(w,time)

addTimeStamp(mappedALMA)
for m in mappedALMA:
   print(m)