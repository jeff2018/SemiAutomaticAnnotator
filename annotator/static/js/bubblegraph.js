
var pageArray = ["Page 1", "Page 2", "Page 3", "Page 4", "Page 5", "Page 6"];

var $this = $('.inner-div'); // targeted div
var offset = $this.offset();
var width = $this.width();
var height = $this.height();
var documentMode = true
var pageMode = false
var focusNode = null;

console.log(width, height)

var svg = d3.select("#svg_bubblegraph"),
    //width = +svg.attr("width"),
    //height = +svg.attr("height"),
    centerX = width * 0.5,
    centerY = height * 0.5,
    strength = 0.05;
console.log(centerX, centerY)

var color = d3.scaleSequential(d3.interpolateRainbow);
var colorPage = d3.scaleOrdinal(d3.schemeCategory10);
/*$(function(){
    $("#btn_bubblegraph").on('click',function(){
        console.log("bubblegraph")
        console.log($(this).hasClass('active') )
        drawBubbleGraph(data)
        var sunburst = d3.select(".sunburst")
        if (sunburst) {
            sunburst.remove()
        }
    });
})*/

function drawBubbleGraph(data) {

    focusNode = null;
    var pageWheel;
    var infoBox;

    var scaleRadius = d3.scaleLinear().domain([0, pageArray.length]).range([45, 95]);
    var maxRadiusFocusNode = centerY * 0.75;




    let pack = d3.pack()
        .size([width, height])
        .padding(1.5);


    var forceCollide = d3.forceCollide(d => d.r + 2);

    var simulation = d3.forceSimulation()
        .force("link",
           d3.forceLink().id(function(d) { return d.id; })
           	.distance(function(d) {
           	    //console.log(scaleRadius(d.source.nbrPages/2 ) + scaleRadius(d.target.nbrPages/2 ))
           	    return (2*scaleRadius(d.source.nbrPages)) + (2*scaleRadius(d.target.nbrPages));
           	})
            .strength(function(d) {return 0.75; })
          )
        .force("charge", d3.forceManyBody().strength(-100))
        //.force("collide", forceCollide)
        .force('x', d3.forceX(centerX).strength(strength))
        .force('y', d3.forceY(centerY).strength(strength))
        //.force("attraceForce",d3.forceManyBody().strength(-100));


    let root = d3.hierarchy({children: data.nodes})
        .sum(function (d) {
            return d.value
        });

    let nodes = pack(root).leaves().map(node => {

        //console.log('node:', node.x, (node.x - centerX) * 2);
        const data = node.data;
    return {
        x: centerX + (node.x - centerX) * 3,
        y: centerY + (node.y - centerY) * 3,
        r: 0,
        radius: node.r,
        name: data.label,
        uri: data.uri,
        nbrPages: data.pages.length,
        pages: data.pages,
        id : data.id
    }
})
    ;

    console.log(data.links)
    svg = d3.select("#svg_bubblegraph")
    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(data.links);



//var radius = d3.scaleSqrt().domain([0,1]).range([25,50]);
    svg.append("svg:defs").selectAll('marker')
                        .data(['end'])
                        .enter()
                        .append("svg:marker")
                        .attr('id', function (d) {
                            return d;
                        })
                        .attr('viewBox', '0 -5 10 10')
                        .attr('refX', 6)
                        .attr('refY',-1.5)
                        .attr('markerWidth', 6)
                        .attr('markerHeight', 6)
                        .attr('orient', 'auto')
                        .append('svg:path')
                        .attr("d", "M0,-5L10,0L0,5");


    var link = svg.append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(data.links)
            .enter().append("svg:path")
            .attr("stroke-width", function(d) { return 1 })
            .attr("marker-end", "url(#end)");

            //.attr("marker-end", function(d) { return "url(#" + (d.source.id + "-" + d.target.id).replace(/\s+/g, '') + ")"; })



      link.style('fill', 'none')
            .style('stroke', 'black')
          .style("stroke-width", '2px');


    let node = svg.append("g")
        .attr("class", "bubblegraph")
        .selectAll('.node')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node')
        //.style('opacity', 0.2)
        .on("click", async function (d) {
        if (d3.event.shiftKey) {
            d.pages = []
            d.nbrPages = 0
            deselect(d)
            return;
        }
        await moveToCenter(d)
    })
    .call(
        d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append('circle')
        .attr('id', d => "c_" + d.index)
        .attr('r', 0)
        .attr("class", "circle")
        .style("stroke-width", 0.5)
        .style("stroke", "black")
        .style('fill', function (d) {
            if (d.nbrPages == 0) {
                return "lightgrey";
            } else {
                return defineColor(d)

            }
        })
        .transition().duration(2000).ease(d3.easeElasticOut)
        .tween('circleIn', (d) => {
        let i = d3.interpolateNumber(0, scaleRadius(d.nbrPages));
    return (t) =>
    {
        d.r = i(t);
        simulation.force('collide', forceCollide);
    }
});


    node.append('text')
        .attr("id", function (d, i) {
            return "t_" + i
        })
        .attr("class", "nodeText")
        //.attr("dy", ".3em")
        .attr("x", function (d) {
            return 0
        })
        .attr("y", function (d) {
            return 0

        })
        .style("text-anchor", "middle")
        .text(function (d) {
            return d.name
        })
        .each(function (d, i) {
            let r = d3.select("circle[id='c_" + i + "']").attr("r")
            //console.log(r)
            svg.select("#t_" + i)
                .call(wrap2, 2 * r)

        })

        .style("font-size", "15px")
    /*
    .each(getSize)
    .style("font-size",function (d) {
        console.log(d)
        return d.scale

    });*/


    d3.select(document).on('click', function () {

            let target = d3.event.target;
            console.log(target)
            if (target.closest(".pageArc") || target.closest(".pageText") || target.closest(".infoRect")) {
                //  console.log("as en pagearc")
                return;
            }
            if (target.closest(".fa") || target.closest("#nextPage") || target.closest("#prevPage")) {

                return;
            }

            if (!target.closest(".circle") && focusNode) {
                removeHighlightWords(focusNode)

                focusNode.fx = null;
                focusNode.fy = null;
                console.log(focusNode)
                simulation.alphaTarget(0.2).restart();
                d3.transition().duration(1000).ease(d3.easePolyOut)
                    .tween('moveOut', function () {

                        let ir = d3.interpolateNumber(focusNode.r, scaleRadius(focusNode.nbrPages))
                        return function (t) {
                            focusNode.r = ir(t)
                            simulation.force('collide', forceCollide)
                        }
                    })
                    .on('end', () => {
                    let circle = d3.select("circle[id='c_" + focusNode.index + "']")
                    circle.style('fill', function (d) {
                    if (focusNode.nbrPages === 0) {
                        return "lightgrey";
                    } else {
                        var value
                        var i = parseFloat("0." + focusNode.index)
                        if (isEven(focusNode.index)) {
                            value = i
                        } else {
                            value = 1.0 - i
                        }

                        return color(value)
                    }
                });
                focusNode = null;
                pageWheel = null;
                infoBox = null;
                simulation.alphaTarget(0);
            }).on('interrupt', () => {
                    simulation.alphaTarget(0);
            });

                d3.selectAll('.node')
                    .filter(function (d, i) {
                        return i !== focusNode.index;
                    })
                    .transition().duration(2000)
                    .style('opacity', 1.0);

                if (pageWheel) {
                    pageWheel.remove()

                }
                if (infoBox) {
                    infoBox.remove()

                }


            }
        }
    )


    function ticked() {
       link.attr("d", function(d) {
            //console.log(d)
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy),

            offsetTargetX = (dx * d.target.r)/dr,
            offsetTargetY = (dy * d.target.r)/dr,
            offsetSourceX = (dx * d.source.r) /dr,
            offsetSourceY = (dy * d.source.r) /dr;
        //console.log(d,offsetTargetX,offsetTargetY)
        return "M" +
            d.source.x + "," +
            d.source.y + "A" +
            dr + "," + dr + " 0 0,1 " +
            (d.target.x-offsetTargetX)+ "," +
            (d.target.y-offsetTargetY);
            //return "M" + (d.source.x-offsetSourceX) + "," + (d.source.y-offsetSourceY) + "L" + (d.target.x-offsetTargetX) + "," + (d.target.y-offsetTargetY);

    });
       /*link.attr("d", function(d){
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy),
          gamma = Math.atan2(dy, dx), // Math.atan2 returns the angle in the correct quadrant as opposed to Math.atan
          sx = Math.max(d.source.r, Math.min(width - d.source.r,  d.source.x + (Math.cos(gamma) * d.source.r)  )),
          sy = Math.max(d.source.r, Math.min(height - d.source.r,  d.source.y + (Math.sin(gamma) * d.source.r)  )),
          // Recall that 10 is the size of the arrow
          tx = Math.max(d.target.r, Math.min(width - d.target.r,  d.target.x - (Math.cos(gamma) * (d.target.r +12))  )),
          ty = Math.max(d.target.r, Math.min(height - d.target.r,  d.target.y - (Math.sin(gamma) * (d.target.r +12))  ));
      // If you like a tighter curve, you may recalculate dx dy dr:
      //dx = tx - sx;
      //dy = ty - sy;
      //dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
    });
        /*link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });*/


        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        node.select('circle')
            .attr('r', d => d.r)
    };

    async function deselect(nodeClicked) {
        //console.log(nodeClicked)
        simulation.alphaTarget(0.2).restart();
        node.filter(function (d, i) {
            return i === nodeClicked.index
        }).transition().duration(800)
            .tween("deselect", function (d) {
                let irl = d3.interpolateNumber(nodeClicked.r, scaleRadius(nodeClicked.nbrPages))
                return function (t) {
                    nodeClicked.r = irl(t)
                    simulation.force('collide', forceCollide)

                }
            })
            .on('interrupt', () => {
                console.log("interupt")
                nodeClicked.r = scaleRadius(nodeClicked.nbrPages);
                let circle = d3.select("circle[id='c_" + nodeClicked.index + "']")
                circle.style('fill', function (d) {

                    return "lightgrey";

                });
            })
            .on('end',()=>{
                nodeClicked.r = scaleRadius(nodeClicked.nbrPages);
                let circle = d3.select("circle[id='c_" + nodeClicked.index + "']")
                circle.style('fill', function (d) {

                    return "lightgrey";

                });
                console.log("end")
        })
        simulation.alphaTarget(0.2).restart()

    }

    async function moveToCenter(currentNode) {

        d3.event.stopImmediatePropagation();
        console.log('currentNode', currentNode)

        d3.selectAll('.node')
            .transition().duration(100)
            .style('opacity', 1.0);

        if (currentNode === focusNode) {
            console.log("True as equal")
            return;
        }

        let lastNode = focusNode;
        focusNode = currentNode;


        pageWheel = d3.select(".pageWheel")
        if (pageWheel) {
            pageWheel.remove()
        }
        if (infoBox) {
            infoBox.remove()
        }

        if (lastNode) {
            console.log("lastNode", lastNode)

            lastNode.fx = null;
            lastNode.fy = null;
            node.filter(function (d, i) {
                return i === lastNode.index
            })
                .transition().duration(2000)
                .tween('circleOut', await

            function () {
                console.log("lastnode.r", lastNode.r)
                console.log("lastnode.radius", lastNode.radius)
                console.log("nbrpages", lastNode.nbrPages)
                console.log("scale radius", scaleRadius(lastNode.nbrPages))

                let irl = d3.interpolateNumber(lastNode.r, scaleRadius(lastNode.nbrPages))
                return function (t) {
                    lastNode.r = irl(t)
                }
            }

        )
        .
            on('interrupt', () => {
                lastNode.r = scaleRadius(lastNode.nbrPages);
            let circle = d3.select("circle[id='c_" + lastNode.index + "']")
            circle.style('fill', function (d) {
                if (lastNode.nbrPages === 0) {
                    return "lightgrey";
                } else {
                    var value
                    var i = parseFloat("0." + lastNode.index)
                    if (isEven(lastNode.index)) {
                        value = i
                    } else {
                        value = 1.0 - i
                    }

                    return color(value)
                }
            })

        })
            ;
        }

        simulation.alphaTarget(0.2).restart()

        d3.transition().duration(2000)
            .tween('moveIn', function () {
                console.log('tweenMoveIn', currentNode)
                let ix = d3.interpolateNumber(currentNode.x, centerX);
                let iy = d3.interpolateNumber(currentNode.y, centerY);
                let ir = d3.interpolateNumber(currentNode.r, maxRadiusFocusNode);

                return function (t) {
                    currentNode.fx = ix(t);
                    currentNode.fy = iy(t);
                    currentNode.r = ir(t);
                    simulation.force('collide', forceCollide);
                }


            })
            .on('end', () => {
            drawArc(currentNode)
            highlightWords(currentNode)



        }
    )
    .
        on('interrupt', () => {
            console.log('move interrupt', currentNode);
        currentNode.fx = null;
        currentNode.fy = null;
        simulation.alphaTarget(0);
    })
        ;
        d3.selectAll('.node')
            .filter(function (d, i) {
                return i !== currentNode.index;
            })
            .transition().duration(2000)
            .style('opacity', 0.5);
        //drawArc(currentNode)
        /*
        d3.selectAll('.node')
            .filter(function(d,i) { return i === currentNode.index; })
            .transition().duration(1000)
            .tween('transform', function(d) {
                var that = d3.select(this);

                return function (t) {
                    that.attr('transform', function (d) {
                        var k = "translate(" + width / 2 + "," + height / 2 +")";
                        return k
                    })
                    simulation.nodes(data)
                }
            })*/
        /*
        d3.selectAll('.node')
            .filter(function(d,i){
                return i === currentNode.index
            })
            .transition().duration(1000)
            .attrTween('transform', function(){
                var k = "translate(" + width / 2 + "," + height / 2 +")";
                return k
            })

    */


        /*
        var clickedNode = d3.select("#n_"+d.index)
        console.log(clickedNode)
        d3.selectAll('.node').on("tick",ticked);
        simulation
            .nodes(data)
            .on("tick", ticked);

        clickedNode.transition().attr('transform',function(d){
            d3.selectAll('.node').on("tick",ticked);
            simulation
                .nodes(data)
                .on("tick", ticked);

            var k = "translate(" + width / 2 + "," + height / 2 +")";
            return k
        })*/
    }


    async function drawArc(currentNode) {
        //console.log(currentNode.fx, currentNode.fy, currentNode.r)

        function endall(transition, callback) {
            if (typeof callback !== "function") throw new Error("Wrong callback in endall");
            if (transition.size() === 0) {
                callback()
            }
            var n = 0;
            transition
                .each(function () {
                    ++n;
                })
                .on("end", function () {
                    if (!--n) callback.apply(this, arguments);
                });
        }

        function computeTextRotation(d) {

            var angle = (d.startAngle + d.endAngle) / Math.PI * 90;

            // Avoid upside-down labels; labels as rims
            return (angle < 120 || angle > 270) ? angle : angle + 180;
            //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
        }

        var increase = 50
        var arc_IR = parseInt(currentNode.r + increase);
        var arc_OR = parseInt(currentNode.r);


        pageWheel = svg
            .append('g')
            .attr("class", "pageWheel")
            .attr('transform', 'translate(' + currentNode.fx + ',' + currentNode.fy + ')');


        var pie = d3.pie()
            .value(1)
            .sort(null);

        var arc = d3.arc()
            .innerRadius(arc_IR)
            .outerRadius(arc_OR);


        var path = pageWheel.selectAll(".pageArc")
            .data(pie(pageArray))
            .enter()

        path.append("path")
            .attr("d", arc)
            .attr("class", "pageArc")
            .attr("value_id", function (d, i) {
                return i + 1
            })
            .attr("id", function (d, i) {
                return "pageArc_" + parseInt(i + 1)
            })
            .attr("value_fill", function (d, i) {
                // console.log(currentNode.pages)
                if (currentNode.pages.includes(d.data)) {
                    return colorPage(i);
                } else {
                    return "lightgrey"
                }

            })
            .attr("fill", function (d, i) {
                //console.log(currentNode.pages)
                if (currentNode.pages.includes(d.data)) {
                    return colorPage(i);
                } else {
                    return "lightgrey"
                }

            })
            .style("stroke", "White")
            .style("stroke-widht", "2")
            .transition()
            .attrTween('d', function (d) {
                var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                let ir = d3.interpolateNumber(currentNode.r, currentNode.r + increase);
                return function (t) {
                    currentNode.r = ir(t);
                    simulation.force('collide', forceCollide);
                    d.endAngle = i(t);
                    return arc(d);
                }
            })
            .call(endall, () => {
            var text = path.append("g")
                .append("text")
                .attr("dy", ".3em")
                .attr("class", "pageText")
                .attr("transform", function (d) {
                    // console.log(d)
                    return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ')';
                })
                .attr("text-anchor", "middle")
                .text(function (d, i) {
                    return d.data
                }).style("font-size", "20px")

            //console.log(d3.select(".pageArc"))
            d3.selectAll(".pageArc")
            .on("mouseover", pieceMouseOver)
            .on("mouseout", pieceMouseOut)
            .on("click", function (d) {
                toggleColor(d)
                updatePageSelection(d)
                //console.log(currentNode.pages)

            })


    })
        await drawInfoBox(currentNode)

        function updatePageSelection(d) {
            var pages = currentNode.pages
            //console.log(pages)
            var pieceInfo = d.data
            //console.log(pieceInfo)
            if (pages.includes(pieceInfo)) {
                currentNode.pages = arrayRemove(pages, pieceInfo)
            } else {
                currentNode.pages.push(pieceInfo)
            }
            currentNode.pages.sort()
            currentNode.nbrPages = currentNode.pages.length
            //console.log(currentNode.pages)


        }


    }

    async function drawInfoBox(currentNode) {

        var results = await querySPARQL(currentNode);
        console.log(results)

        var posX = currentNode.fx - ((maxRadiusFocusNode + (maxRadiusFocusNode / 2.5)) / 2)
        var posY = currentNode.fy - ((maxRadiusFocusNode + (maxRadiusFocusNode / 2.5)) / 2)
        var boxWidth = maxRadiusFocusNode + (maxRadiusFocusNode / 2.5)
        /*
        var div = d3.select("#scroll")
            .style("height",boxWidth+"px")
            .style("width",boxWidth+"px")
            .style("top",0 +"px")
            .style("left",0 +"px")

            .text(results[0][0].abstract.value)

        var infobox = svg.append("g")
            .attr("class","infobox")
            .attr('transform', 'translate(' + posX + ',' + posY + ')');

        var foreign = infobox.append("foreignObject")
            .attr("width",boxWidth)
            .attr("height",boxWidth)
            .append(div)
         .style("overflow-y","scroll")
            .text(results[0][0].abstract.value)
            .style("font-size", "14px")
    */
        console.log("Boxwidth", boxWidth * 0.32)
        infoBox = svg.selectAll("infobox")
            .data(results)
            .enter()
            .append("g")
            .attr('transform', 'translate(' + posX + ',' + posY + ')');

        /* var fo= infoBox.append("foreignObject")
             .attr('class',"container")
             .attr("height", boxWidth)
             .attr("width", boxWidth)

         var div = fo.append("div")
             .attr('class',"content")
             .attr("id","viz")
             .attr("height", boxWidth)
             .attr("width", boxWidth)*/

        var infoRect = infoBox.append("rect")

            .attr("class", "infoRect")
            .attr("height", boxWidth)
            .attr("width", boxWidth)
            .attr("fill", "white")
            .style("opacity", 0.85)
            .on("mouseover", function (d) {
                d3.select(this)

                    .style("stroke", "Black")
                    .style("stroke-width", "2")
            })
            .on("mouseout", function (d) {
                d3.select(this)

                    .style("stroke", "White")
                    .style("stroke-width", "2")
            })
            .on("click", function (d) {
                var linkWiki = d[0].wikiLink.value
                console.log(d[0].wikiLink.value)
                window.open(linkWiki)
            })

        var infoText = infoBox.append("text")
            .attr("class", "infoText")
            .attr("text-anchor", "start")
            .attr("x", 2)
            .attr("y", boxWidth * 0.32)
            .text(function (d) {
                var dbabstract = d[0].abstract.value
                ///console.log(d[0][0].abstract.value)
                //console.log("abstract ",d[0][0].abstract.value)
                return dbabstract
            })
            .style("font-size", "14px")
            .call(wrap, maxRadiusFocusNode + (maxRadiusFocusNode / 2.5))

        var infoTitle = infoBox.append("text")
            .attr("class", "infoTitle")
            .attr("text-anchor", "start")
            .attr("x", 30)
            .attr("y", 65)
            .text(function (d) {
                var dblabel = d[0].label.value
                return dblabel
            })
            .style("font-size", "22px")
            .style("font-weight", "bold")
            .style("text-decoration", "underline")

        var infoImage = infoBox.append('image')
            .attr("class", "infoImage")

            .attr('xlink:href', function (d) {
                var dbthumbnail = d[0].image
                if (dbthumbnail) {
                    return dbthumbnail.value
                }
            })
            .attr('width', 155)
            .attr('height', 155)
            .attr("x", boxWidth - 202)
            .attr("y", 0)


    }

    function arrayRemove(arr, value) {

        return arr.filter(function (ele) {
            return ele != value;
        });

    }


    function dragstarted(d) {
        if (focusNode === null) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
    }

    function dragged(d) {
        if (focusNode === null) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

    }

    function dragended(d) {
        if (focusNode === null) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }

    function toggleColor(d) {
        //console.log("togglecolor",d)
        var pieceSelect = "#" + "pageArc_" + parseInt(d.index + 1)
        var currentColor = d3.select(pieceSelect).attr("value_fill")

        currentColor = currentColor == "lightgrey" ? colorPage(d.index) : "lightgrey";

        d3.select(pieceSelect).attr("value_fill", currentColor);
        d3.select(pieceSelect).style("fill", currentColor);

    }


    var pieceMouseOver = function () {

        var pieceObject = d3.select(this)
        var valueID = pieceObject.attr("value_id");

        var pieceSelect = "#" + "pageArc_" + valueID
        var selection = d3.selectAll(pieceSelect)
        selection.style("stroke", "Black")
        selection.style("stroke-width", "1")
        switchPage(valueID)
    }

    var pieceMouseOut = function () {
        var pieceObject = d3.select(this)

        var valueID = pieceObject.attr("value_id");

        var pieceSelect = "#pageArc_" + valueID
        var selection = d3.selectAll(pieceSelect)

        selection.style("stroke", "White")
        selection.style("stroke-width", "1")
    }




}
function defineColor(d) {
        //console.log(d)
        var value
        var i = parseFloat("0." + d.index)
        if (isEven(d.index)) {
            value = i
        } else {
            value = 1.0 - i
        }

        return color(value)
}


function getSize(d) {
    var bbox = this.getBBox(),
        cbbox = this.parentNode.getBBox(),

        scale = Math.max(cbbox.width / bbox.width, cbbox.height / bbox.height)
    console.log(bbox, cbbox)
    d.scale = scale
}


function wrap2(text, width) {
    //console.log("wrap",text,width)
    text.each(function () {
        var text = d3.select(this)
        var joinOperator = " "
        if (text.text().includes("-")) {
            joinOperator = "-"
        }
        if (text.text().includes("_")) {
            joinOperator = "_"
        }
        var words = text.text().split(/[ _-]+/).reverse(), ///[ _]+/ /\s+/
            word,
            counter = 0,
            line = [],
            lineNumber = 0,
            lineHeight = 1.2, // ems
            startBox = (lineHeight / 2) / 2,
            x = text.attr("x"),
            y = text.attr("y"),
            dy = text.attr("dy") ? text.attr("dy") : 0,
            totalLines = words.length,
            start = -(lineHeight / 2) * (totalLines - 1),
            resultingLines = [],
            adjustment = 0;

        if (totalLines > 1) {
            if (!isEven(totalLines)) {
                start = startBox - (lineHeight / 2) * (totalLines - 1);
            } else {
                start = startBox - (lineHeight / 2) - (2 / totalLines);
            }

        } else {
            start = startBox
        }

        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", start + "em").attr("id", "start").attr("value", start);

        //console.log(tspan)
        //console.log(words)
        //console.log(totalLines,lineHeight,lineHeight*totalLines)


        while (word = words.pop()) {
            //console.log(word)

            line.push(word);
            //console.log(line)
            tspan.text(line.join(joinOperator));
            //console.log(line.join(joinOperator))
            //console.log(tspan.node())
            //console.log(tspan.node().getComputedTextLength() > width)
            //console.log(tspan.node().getComputedTextLength(), width)

            if (tspan.node().getComputedTextLength() > width) {
                //console.log("if",tspan.node().getComputedTextLength(), width)

                var last = line.pop();
                //console.log(last)
                resultingLines.push(last)
                tspan.text(line.join(joinOperator));
                line = [word];
                //console.log(line,lineNumber,lineHeight,dy,resultingLines.length)
                var modifier;


                if (totalLines > 1) {
                    if (words.length !== 0) {
                        modifier = ++lineNumber * lineHeight + (start * (totalLines - 1))

                    } else {
                        modifier = ++lineNumber * lineHeight + (start * (resultingLines.length - 1))
                        //console.log(resultingLines.length < totalLines)
                        if (resultingLines.length < totalLines) {
                            var old = text.selectAll("tspan").attr("value")
                            //console.log(old)
                            adjustment = lineHeight / 2
                            text.selectAll("tspan").attr("dy", parseFloat(old) + adjustment + "em").attr("value", parseFloat(old) + adjustment)
                        }

                    }
                } else {
                    modifier = 0
                }
                counter = counter + 1

                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", modifier + parseFloat(adjustment) + "em").attr("id", "if").attr("value", modifier).text(word);
                //console.log(lineNumber)
            } else {
                resultingLines.shift()
                resultingLines.push(line.join(" "))
                if (words.length === 0 && totalLines > 1) {
                    var old = text.selectAll("tspan").attr("value")
                    //console.log(old)
                    adjustment = lineHeight / 2
                    text.selectAll("tspan").attr("dy", parseFloat(old) + adjustment + "em").attr("value", parseFloat(old) + adjustment)
                }
            }

        }


    });


}


async function querySPARQL(currentNode) {
    var url = "http://dbpedia.org/sparql";
    var resource = currentNode.uri
    var abstract = "?abstract"
    var wikiLink = "?wikiLink"
    var label = "?label"
    var dbPage = "?page"
    var image = "?image"
    var finalResource;

    var resp = []
    const escapeRegExp = (string) =>
    {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    finalResource = escapeRegExp(resource)

    //console.log(finalResource)

    var query = [
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
        "PREFIX type: <http://dbpedia.org/class/yago/>",
        "PREFIX prop: <http://dbpedia.org/property/>",
        "SELECT" + abstract + ", " + label + ", " + wikiLink + ", " + dbPage + ", " + image,
        "WHERE {",
        "{",
        " " + finalResource + " dbo:wikiPageRedirects " + dbPage + ".",
        " " + wikiLink + " foaf:primaryTopic " + dbPage + ".",
        "Optional{ " + dbPage + " dbo:thumbnail " + image + "}" + ".",
        "Optional{ " + dbPage + " dbo:abstract " + abstract + "}" + ".",
        " " + dbPage + " rdfs:label " + label + ".",
        "FILTER langMatches(lang(" + label + "),'en')" + ".",
        "FILTER langMatches(lang(" + abstract + "),'en')",
        "}",
        "UNION {",
        " " + wikiLink + " foaf:primaryTopic " + finalResource + ".",
        "Optional{ " + finalResource + " dbo:thumbnail " + image + "}" + ".",
        "Optional{ " + finalResource + " dbo:abstract " + abstract + "}" + ".",
        " " + finalResource + " rdfs:label " + label + ".",
        "FILTER langMatches(lang(" + label + "),'en')" + ".",
        "FILTER langMatches(lang(" + abstract + "),'en')",
        "}",
        "}",
        "Limit 100"
    ].join(" ");


    //console.log("this query: [" + query + "]");

    var queryUrl = url + "?query=" + encodeURIComponent(query) + "&format=json";
    //console.log(queryUrl)

    await
    $.ajax({
        dataType: "jsonp",
        url: queryUrl,
        success: function (data) {
            //console.log(data);
            var bindings = data.results.bindings;
            resp.push(bindings)

        }
    });
    return resp
}

d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    })
};

function isEven(n) {
    return n % 2 == 0;
}

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/[ _]+/).reverse(), ///[ _]+/ /\s+/
            word,
            counter = 0,
            line = [],
            lineNumber = 0,
            lineHeight = 1.2, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = text.attr("dy") ? text.attr("dy") : 0,
            timeToBreak = false;
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em")
        while (word = words.pop()) {
            if (lineNumber === 20) {
                timeToBreak = true

            }
            //console.log(word)
            counter = counter + 1
            //console.log(counter)
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));

                line = [word];
                //console.log(lineNumber)

                //console.log(line)
                if (timeToBreak === true) {
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text("...");
                    break;
                }

                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);

            }

        }
    });
}
