from .annotation import *

import json

GRAPH_THRESHOLD = 10
SORT_CRITERIA = "degree" # or "pagerank"

def sortGraphNodes(nodes, sortCriteria):
    try:
        return sorted(nodes, key=lambda n: float(n.get("attributes").get(sortCriteria)), reverse=True)
    except:
        return []

def graphBuilder(annotations, sortCriteria, depth = 2, resourceLimit = 100): # annotations can be result of Spotlight/Babelfy
    """Returns a description of a graph (nodes, edges)"""
    results = jsonRequest(SERVER_ADDRESS + ":8081/graph", {
        "mynivelProfundidad": depth,        # Optional -> Default 1 Max 2
        "limitRecur": resourceLimit,        # Max number of resources take into account in the graph builder
        "annotations": json.dumps(annotations)
    }) or {}

    nodes = results.get("nodes") or []
    #print(results)

    nodes = results.get("nodes") or []
    edges = results.get("edges")
    #print(annotations)
    sources = [n for n in nodes if n['attributes']['camino']=='False']
    #print(sources)
    #print(len(sources))

    #print("nodes")
    for n in nodes:
        n['sources']=[]
        camino = n['attributes']['camino']
        label= n['attributes']['label']
        id = n['id']
        #print(n['attributes']['camino'], n['attributes']['label'], n['id'])
        if camino=='True':
            for e in edges:
                target = e['target']
                source = e['source']
                if id == target:
                    # print([s['label'] for s in sources if s['id'] == e['source']])
                    for s in sources:
                        if s['id'] == e['source']:
                            n['sources'].append(s['label'])

    #edges = results.get("edges")
    #for e in edges:
        #print(e)
        #print([i['label'] for i in nodes if i['id']==e['source']])
        #print([i['label'] for i in nodes if i['id']==e['target']])
        #for i in nodes:
         #   if i['id']==e['target']:

        #print(e['source'], e['target'])

    return sortGraphNodes(nodes, sortCriteria)

def extractInfoFromGraphNode(node):
    #print(node)
    return {
        "label": node.get("label"),
        "degree": node.get("attributes").get("degree"),
        "pagerank": node.get("attributes").get("pagerank"),
        "camino": node.get("attributes").get("camino"),
        "sources":node.get("sources")

    }

def combineResults(*annotatorResults):
    allResults = {}

    for result in annotatorResults:
        for (concept, frequency) in result:
            if concept not in allResults:
                allResults[concept] = 0
            allResults[concept] += frequency

    return allResults

def graph(*annotatorResults):
    initialConcepts = sorted(list(combineResults(*annotatorResults).items()), key=lambda t: int(t[1]), reverse=True)[:GRAPH_THRESHOLD]
    #print("---initialConcepts---")
    #print(initialConcepts)
    if len(initialConcepts) > 0:
        graphBuilderResults = graphBuilder(initialConcepts, SORT_CRITERIA)
        #print("---graphBuilderResults---")
        #print(graphBuilderResults)
        #print(len(graphBuilderResults))

        graphResults = [extractInfoFromGraphNode(node) for node in graphBuilderResults]
        #print("---graphResults---")
        #print(graphResults)
        #avg = avgDegree(graphResults)
        #print("---filteredResults")
        #filteredResults(graphResults,avg)
        return sorted(graphResults, key=lambda g: g[SORT_CRITERIA], reverse=True),initialConcepts
    return {}

def avgDegree(nodeResultList):
    sum = 0
    for n in nodeResultList:
        degree = n.get("degree")
        #print(degree)
        sum = sum + degree
    avg = round(sum/len(nodeResultList),2)
    #print("Sum: "+str(sum))
    #print("Avg :" + str(avg))
    return avg

def filteredResults(nodeResultList,average):

    for n in nodeResultList:
        if n.get("degree") >= average:
            print(n)
