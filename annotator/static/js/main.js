var text_layer
$('#switch_modus').change(function (d) {
    //console.log($("#page").val())
    if (!this.checked) {
        documentMode = true
        pageMode = false
        d3.selectAll('circle')
            .style('opacity', 1.00)
    } else {
        var shownPage = $("#page").val()
        pageMode = true
        documentMode = false
        d3.selectAll('circle')
            .filter(function (d) {
                console.log(d.pages.includes(shownPage))
                return !d.pages.includes("Page " + shownPage)
            })

            .style('opacity', 0.25);
    }


})


$('#page').on("keyup", function (e) {
    //console.log("keydown",e)
    if (e.key === 'Enter') {
        console.log("enter")
        var shownPage = $("#page").val()
        highlightConcepts(shownPage)
    }


})

function switchPage(pageNum){
    var inputPage = $("#page")

    var actualPage = inputPage.val()
    if(actualPage !==pageNum){
        var e = $.Event("keyup")
        e.keyCode= 13;
        e.key ='Enter'
        //console.log(inputPage)
        inputPage.val(pageNum)
        inputPage.trigger(e)
    }


}

function highlightConcepts(pageNum) {
    if (pageMode) {
        d3.selectAll('circle')
            .filter(function (d) {
                //console.log(d.pages.includes(pageNum))
                return !d.pages.includes("Page " + pageNum)
            })
            .style('opacity', 0.25);
        d3.selectAll('circle')
            .filter(function (d) {
                //console.log(d.pages.includes(pageNum))
                return d.pages.includes("Page " + pageNum)
            })
            .style('opacity', 1.00);
    }
}

async function highlightWords(d) {
    var interval = setInterval(function() {
        if (text_layer= document.getElementById('text-layer')) {
            clearInterval(interval);
            //console.log(text_layer);
            var textDivs = text_layer.children;
            //console.log("highlightwords",textDivs)
            //console.log(d)
            var highlightColor = defineColor(d)
            var words = d.words
            for (var w = 0; w < words.length; w++) {
                for (var t = 0; t < textDivs.length; t++) {
                    var div_child = textDivs[t]
                    $(div_child).each(function () {
                        // console.log($(this).html($(this).html()))
                        var search_value = words[w]
                        var search_regexp = new RegExp(search_value.toLowerCase(), "g");
                        $(this).html($(this).html().toLowerCase().replace(search_regexp, '<span class = "highlight" style="background-color:'+highlightColor+ '">' + search_value + "</span>"));

                        //console.log($(this).span)

                    })
                }
            }
        }
    }, 100);


    /*var span = document.getElementsByClassName("highlight "+d.index)
    for (var i = 0; i < span.length; i++) {
        span[i].style.backgroundColor = highlightColor;
        span[i].className +=" "+d.index
    }*/


    /*div_first.each(function(){
        var search_value = "Ontology"
        var search_regexp = new RegExp(search_value, "g");
        $(this).html($(this).html().replace(search_regexp,"<span class = 'highlight'>"+search_value+"</span>"));
                        $(this).html($(this).html().toLowerCase().replace(search_regexp, '<span class = "highlight '+d.index+'" style="background-color:'+highlightColor+ '">' + search_value + "</span>"));

    })*/


}


function removeHighlightWords(d) {

        var span_highlight = document.getElementsByClassName("highlight")
        console.log("before resolve",span_highlight)
        console.log("length:", span_highlight.length)
        for (var i = span_highlight.length - 1; i >= 0; --i) {
            console.log(span_highlight[i])
            console.log("length in loop:", span_highlight.length)

            span_highlight[i].remove()
        }


}


