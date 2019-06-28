from langdetect import detect
from collections import Counter

import requests, textwrap

SERVER_ADDRESS = "http://172.24.99.127"

BASE_URL = "https://api.dbpedia-spotlight.org/"

reqheaders = {'accept': 'application/json'}

PROXIES = {
    "http": "http://connect.virtual.uniandes.edu.co:22",
    "https": "http://connect.virtual.uniandes.edu.co:22"
}

def jsonRequest(url, data, verbose = False):
    response, results = None, None
    #print(data)
    try:
        response = requests.post(url, params=data, proxies=PROXIES)
        #response = requests.get(url, params=data, headers=reqheaders)
        if verbose:
            print("Request to {} took {}".format(url, response.elapsed))

        response.raise_for_status()
        results = response.json()
    except requests.exceptions.RequestException as e:
        print("Request exception: {}".format(e))
        print(response.text)
    except ValueError:
        print("Invalid JSON response")
    #print(results)
    return results

def frequencyService(url, data, chunkSize = 6000):
    print(url,data)
    chunks = textwrap.wrap(data["text"], width=chunkSize, break_long_words=False, break_on_hyphens=False)
    #print("chunks: "+str(chunks))
    results = {}

    for chunk in chunks:
        data.update({"text": chunk})
        r = jsonRequest(url, data) or []
        #print(r)
        #res = jsonRequest(url, data) or []
        #r= tupleList(res)
        ##print("---")
        #print(r)

        for (concept, frequency) in r:
            #print(concept)
            if concept not in results:
                results[concept] = 0
            results[concept] += frequency

    return results.items()

def detectLanguage(text):
    detectedLanguage = detect(text).upper()
    acceptedLanguages = ['EN', 'FR', 'ES']
    language = detectedLanguage if detectedLanguage in acceptedLanguages else acceptedLanguages[0]
    return language

def tupleList(jsonResult):
    tuple_list = []

    c = Counter(j['@URI'] for j in jsonResult['Resources'])
    #print(c)
    if jsonResult['Resources']:

        for j in jsonResult['Resources']:
            unique = True
            for t in tuple_list:
                if j['@URI'] == t[0]:
                    unique = False
                    break
            if unique:
                tuple = [j['@URI'],c[j['@URI']],j['@surfaceForm']]
                tuple_list.append(tuple)

    return tuple_list

def spotlight(text, canonical = True, sort = True):
    def get_slope_intercept(x1, x2, y1, y2):
        slope = (y2 - y1) / (x2 - x1)
        intercept = y1 - slope * x1
        return slope, intercept

    def interpolate(xRange, yRange, x):
        slope, intercept = get_slope_intercept(*xRange, *yRange)
        y = slope * x + intercept
        return y

    def calculate_confidence_support(l):
        if l in range(500):
            # confidence: 0.1 - 0.25, support: 5 - 10
            confidence = interpolate((0, 500), (.1,.25), l)
            support = interpolate((0, 500), (5, 10), l)
        elif l in range(500,1000):
            # confidence: 0.2 - 0.35, support: 5 - 10
            confidence = interpolate((500, 1000), (.2, .35), l)
            support = interpolate((500, 1000), (5, 10), l)
        else: # >= 1000:
            # confidence: 0.3 - 0.4, support: 10 - 20
            confidence = .4
            support = 20

        return confidence, support

    confidence, support = calculate_confidence_support(len(text))
    print(confidence,support)

    """Returns an array of tuples (concept, frequency)"""

    results = frequencyService(SERVER_ADDRESS + ":8081/spotlight", {
        "support": support,                 # Optional-> Default  20
        "confidence": confidence,           # Optional->Default 0.4
        "language": detectLanguage(text),   # Required: EN-FR
        "canonical": int(canonical),        # 1 -> Tranforms to English DBpedia
        "text": text
    })
    """
    language = detectLanguage(text)
    results = frequencyService(BASE_URL+language.lower()+"/annotate", {
        "support":int(round(support)),
        "confidence":confidence,
        "text": text

    })
 """
    if sort:
        results = sorted(results, key=lambda t: int(t[1]), reverse=True)

    return results

def babelfy(text, sort = True):
    """Returns an array of tuples (concept, frequency)"""
    results = frequencyService(SERVER_ADDRESS + ":8082/babelfy", {
        "language": detectLanguage(text),   # Required: EN-ES-FR
        "text": text
    })

    if sort:
        results = sorted(results, key=lambda t: int(t[1]), reverse=True)

    return results
