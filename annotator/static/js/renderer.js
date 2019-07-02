var pdfPath = null,
    pdfDoc = null,
    pdfTitle = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    totalPages = null,
    canvas = null,
    ctx = null

var container = document.getElementsByClassName("pdfContainer");

var schemeConceptsMap = {},
    tagMap = {},
    schemeConceptsArray = [];

const almaBaseURL = 'https://alma.uni.lu'

const scale = 1.1

jQuery.fn.exists = function () {
    return this.length > 0;
}


function openPDF(p) {
    pdfPath = p;
    pdfTitle = null;
    console.log("call open pdf")
    displayPDF()
}

function displayPDF() {
    $('#pdfView').replaceWith($('<canvas id="pdfView"></canvas><div id="text-layer" ></div>'))
    $('#prevPage, #nextPage, #page').prop('disabled', false);

    canvas = document.getElementById('pdfView')
    ctx = canvas.getContext('2d')


    pdfjsLib.getDocument(pdfPath).then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        console.log(pdfDoc)

        totalPages = pdfDoc.numPages;

        $('#pageCount').html(' of ' + totalPages);
        $('#controls-bar').show();
        $("#page").bind('blur keyup', function (e) {
            e.preventDefault();
            if (e.type == 'blur' || e.keyCode == '13') {
                var p = parseInt($(this).val());
                if (!isNaN(p)) {

                    pageNum = p
                    queueRenderPage(pageNum);
                }
            }
        });

        $("form#controls").keypress(function (e) {
            if (e.which == 13)
                return false;
        })

        pageNum = 1

        renderPage(pageNum)


    });
}

function renderPage(num) {
    pageRendering = true

    pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport(scale);

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        }
        var renderTask = page.render(renderContext);

        renderTask.promise.then(function () {
            pageRendering = false;

            if (pageNumPending !== null) {
                renderPage(pageNumPending)
                pageNumPending = null;
            }

            console.log(page.getTextContent())
            return page.getTextContent()
        }).then(function (textContent) {
            console.log(textContent)

            //div.append(textLayerDiv)

            console.log(canvas)
            //console.log(canvas.offset())
            var canvas_offset = $("#pdfView").offset();
            console.log(canvas_offset)

            $("#text-layer").html('');

            $("#text-layer").css({
                left: canvas_offset.left + 'px',
                top: canvas_offset.top + 'px',
                height: canvas.height + 'px',
                width: canvas.width + 'px'
            });
            //console.log(canvas_height,canvas_width)
            //console.log(viewport)
            var renderTextLayerTask = pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: $("#text-layer").get(0),
                viewport: viewport,
                textDivs: []
            });
            if (focusNode) {
                console.log("focus", focusNode)
                highlightWords(focusNode)

            }
            return renderTextLayerTask
            //textLayer.setTextContent(textContent);

            // Render text-fragments
            //textLayer.render();
        });
        //submitFile()

    });

    $("#page").val(num);

    var pageLink = $(".page-link-" + num)
    if (pageLink.exists()) {
        $(".page-link").removeClass("page-link-current");
        pageLink.addClass("page-link-current");

    }
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}


function onPrevPage() {
    if (pdfDoc === null || pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
    highlightConcepts(pageNum)
    if (focusNode) {
        $(window).ready(function () {
            highlightWords(focusNode)
        })
    }
}


function onNextPage() {
    if (pdfDoc === null || pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
    highlightConcepts(pageNum)
    if (focusNode) {
        $(window).ready(function () {
            highlightWords(focusNode)
        })
    }
}


$(function () {

    $('#addAnnotationsButton').click(function (e) {
        //console.log("keydown",e)
        var text = $("#schemeList option-select").text()
        var conceptName = $("#concepts option-select").text()

        console.log(text)
        console.log(conceptName)

    })
    // PDF controls
    $("#prevPage").click(onPrevPage);
    $("#nextPage").click(onNextPage);
    $("#controls-bar").hide();

    // Page navigation
    $("body").keydown(function (e) {
        if ([33, 37, 38].indexOf(e.keyCode) >= 0) { // page up, left, up
            onPrevPage();
        } else if ([34, 39, 40].indexOf(e.keyCode) >= 0) { // page down, right, down
            onNextPage();
        }
    });


    // Open PDF from menu call (or keyboard shortcut)
    //ipc.on('open-pdf', function (event, path) { openPDF(path) })

    $("#createPDFButton").prop("disabled", true);

    // Upon click this should should trigger click on the #file-to-upload file input element
// This is better than showing the not-good-looking file input element
    $("#upload-button").on('click', function () {
        console.log("click button")

        $("#file-to-upload").trigger('click')


    });

// When user chooses a PDF file
    $("#file-to-upload").on('change', function () {

        if ($("#file-to-upload").get(0).files[0].name.endsWith('.java')) {
            var javaFile = $("#file-to-upload").get(0).files[0]

            placeFileContent(
                document.getElementById('java-content'),
                javaFile)
            $('#navbarPdf').remove()
            $('#pdfContainer').replaceWith('<div id="javaView" style="overflow-y:auto"></div>')
            console.log()


        }
        // Validate whether PDF
        /*if (['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
            alert('Error : Not a PDF');
            return;
        }*/
        console.log("call on change")
        $("#upload-button").hide();

        // Send the object url of the pdf
        var form = document.getElementById('submit-form')

        //form.submit();
        //form.on('submit',function(){
        //  submitFile();
        //})
        if ($("#file-to-upload").get(0).files[0].name.endsWith('.pdf')) {
            openPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]))

        }

        console.log(document.getElementById('submit-form'))



        $.when(submitFile().then(function successHandler(response) {
                var filename = response.filename
                var filepath = response.path
                var fileid = response.id
                var message = response.message
                console.log(filename)
                console.log(message)
                console.log("Ask to process " + filename)
                $('#loadingtext').text('Processing ' + filename + '...')
                $.when(askToProcess(response).then(function successHandler(response) {
                    console.log("Ask to retieve annotations " + filename)

                    retrieveAnnotations(response)
                }, function errorHandler(response) {

                }))
            }, function errorHandler(response) {
                console.log("error occured")
            })
        )


    })

    ontologyReset()


})
;
var csrftoken = $("[name=csrfmiddlewaretoken]").val();

function submitFile() {
    var formDataRaw = $('#submit-form')[0]
    console.log(formDataRaw)
    //console.log(form)
    var form_data = new FormData(formDataRaw)
    console.log(form_data)
    //form_data.append('file',formDataRaw)
    return $.ajax({
        type: "POST",
        headers: {'X-CSRFToken': csrftoken},
        url: "/annotator/uploadFile/",
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
        async: true


    });
}

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

function askToProcess(file) {
    console.log(file)
    var data = {
        "id": file.id,
        "name":file.filename
    }
    return $.ajax({
        type: "POST",
        url: "/annotator/processFile/",
        headers: {'X-CSRFToken': csrftoken},

        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        cache: false,
        processData: false,
        async: true,
        beforeSend: function () {
            $('.overlay').show();

        },
        success: function (response) {

            console.log(response.message)
        },
        complete: function () {
            //$('.overlay').hide();

            $('#loadingtext').text('Generating annotations...')

        }

    })
}

function retrieveAnnotations(file) {
    var data = {
        "id": file.id,
        "name": file.filename
    }
    return $.ajax({
        type: "POST",
        url: "/annotator/processTxtFile/",
        headers: {'X-CSRFToken': csrftoken},
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        cache: false,
        processData: false,
        async: true,
        success: function (response) {

            console.log(response)
        },
        complete: function (response) {
            $('.overlay').hide();
            $('.inner-div').show()
            console.log(response)
            console.log(response.responseJSON)
            var res = response.responseJSON
            var filename = res.filename
            //initGraph(response.responseJSON)
            //document.getElementById("btn_bubblegraph").click();
            if(filename.endsWith('.pdf')){
                drawBubbleGraph(res)

            }
            if(filename.endsWith('.java') || filename.endsWith('.c')) {
                drawCSGraph(res)
            }

        }

    })
}

function initGraph(data1) {
    document.getElementById("btn_bubblegraph").click()

    drawBubbleGraph(data)


}

function openGraph(evt, graphName) {

    console.log("opengraph", evt, graphName)
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(graphName).style.display = "block";

    evt.currentTarget.className += " active";


}

function ontologyReset() {

    schemeConceptsMap = {};

    downloadSchemes(function () {
        //$("#addAnnotationsButton").prop('disabled', false)


    });
}

function downloadSchemes(callback) {
    $.ajax({
        url: almaBaseURL + '/api/schemes/',
        type: "GET",
        dataType: "json",
        success: function (response) {
            var data = response
            //console.log(data)
            downloadTagsByScheme(data.shift(), data, callback)

        },

    })

    /*request(almaBaseURL + '/api/schemes/', function (error, response, body) {
        if(!error) {
            data = JSON.parse(body);
            //$("#addAnnotationsButton").prop('disabled', true);
            downloadTagsByScheme(data.shift(), data, callback);
        }
    });*/

}

function downloadTagsByScheme(scheme, remainingSchemes, finalCallback) {

    $.ajax({
        url: almaBaseURL + '/api/schemes/' + scheme.uri + '/',
        type: "GET",
        dataType: "json",
        success: function (data) {
            //console.log(data)ß
            schemeConceptsMap[scheme.uri] = {'title': scheme.title, 'concepts': []}
            var map = {'title': scheme.title, 'concepts': [], 'uri': scheme.uri}
            for (var i = 0; i < data.length; i++) {
                var concept = data[i]
                if (concept.label.length > 0) {
                    var c = {'label': concept.label, 'scheme': scheme.title};
                    tagMap[concept.uri] = c;

                    schemeConceptsMap[scheme.uri].concepts.push(concept.uri)
                    map.concepts.push(concept.uri)
                }
            }
            schemeConceptsArray.push(map)
            if (remainingSchemes.length > 0) {
                downloadTagsByScheme(remainingSchemes.shift(), remainingSchemes, finalCallback);
            } else {


                finalCallback();
                console.log(schemeConceptsMap)
                console.log(tagMap)
                console.log(schemeConceptsArray)

            }
        }
    })

}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}

function placeFileContent(target, file) {
    readFileContent(file).then(content => {
        console.log(target)
        console.log(content)
        //$('#java-content').text(content);
        //$('#java-content').parent().remove("prettyprinted");
        var pre = document.createElement('pre');
        var code = document.createElement('code')

        pre.className = "prettyprint prettyprinted";
        code.className='prettycode language-java'
        code.innerHTML = PR.prettyPrintOne(content, 'java', true);
        pre.appendChild(code)
        $('#javaView').append(pre);
        //$("#container").append('<pre class="prettyprint"><code id="java-content" class="language-java" >content</code></pre>')

        prettyPrint()
    }).catch(error => console.log(error))
}

