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

const scale = 1.25

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
            if(focusNode){
                console.log("focus",focusNode)
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
    if(focusNode){
        $(window).ready(function(){
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
    if(focusNode){
        $(window).ready(function(){
            highlightWords(focusNode)
        })
    }
}


$(function () {
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
        // Validate whether PDF
        if (['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
            alert('Error : Not a PDF');
            return;
        }
        console.log("call on change")
        $("#upload-button").hide();

        // Send the object url of the pdf
        var form = document.getElementById('submit-form')

        //form.submit();
        //form.on('submit',function(){
        //  submitFile();
        //})


        console.log(document.getElementById('submit-form'))


        openPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]))
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

                    retrieveAnnotations(response.id)
                }, function errorHandler(response) {

                }))
            }, function errorHandler(response) {
                console.log("error occured")
            })
        )


    })


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
        "id": file.id
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

function retrieveAnnotations(fileid) {
    var data = {
        "id": fileid
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
            //initGraph(response.responseJSON)
            //document.getElementById("btn_bubblegraph").click();
            drawBubbleGraph(response.responseJSON)

            initg= true
        }

    })
}

function initGraph(data1){
    document.getElementById("btn_bubblegraph").click()

    drawBubbleGraph(data)



}

function openGraph(evt, graphName) {

    console.log("opengraph",evt,graphName)
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