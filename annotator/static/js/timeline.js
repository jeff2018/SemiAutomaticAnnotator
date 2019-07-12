
function drawTimeline() {

    var $this = $('.timeline-content'); // targeted div
    console.log($this)
    var widthtc = $this.width();
    var heighttc = $this.height();

    var margin = {top: 20, right: 15, bottom: 125, left: 15},
        margin2 = {top: 175, right: 15, bottom: 50, left: 15},

        width = widthtc - margin.left - margin.right,
        height = heighttc - margin.top - margin.bottom,
        height2 = heighttc - margin2.top - margin2.bottom;

    var mySelections = {}
    var brushCount = 40;
    var brushes = [];

// Zoom
    var zoom = d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 10])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', zoomed);

// Scale

    var xScale = d3.scaleTime()
        .domain([0, 137 * 1000])//domain of [00:00 - 02:17] in seconds
        .range([0, width]);

    var xScale2 = d3.scaleTime()
        .domain([0, 137 * 1000])//domain of [00:00 - 02:17] in seconds
        .range([0, width]);

// Axis
    var xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeSecond.every(1))
        .tickSize(-height)
        .tickFormat(d3.timeFormat('%M:%S'))

    var xAxis2 = d3.axisBottom(xScale2)
        .ticks(d3.timeSecond.every(1))
        .tickSize(-height2)
        .tickFormat(d3.timeFormat('%M:%S'))


// Main svg
    var svg = d3.select('#timelineDiv')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)


    var focus = svg.append("g")
        .attr("class", "focus")

        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var rect = focus
        .append("rect")
        .attr("class", "area")
        //.attr("d", area)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
//.call(zoom);

// axis
    var axis = focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .attr("x", 0)


// Jump to interval [00:00, 01:00] at start


    /*var brushFocus = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("brush end", brushended);
    */
    var formatSeconds = d3.timeFormat("%S");
    var formatSecondsMinutes = d3.timeFormat("%M:%S");


    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    var gBrushes = focus.append('g')
        .attr("height", height)
        .attr("width", width)
        .attr("fill", "none")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .attr("class", "brushes");

    var gBrushesContext = context.append('g')
        .attr("height", height2)
        .attr("width", width)
        .attr("fill", "none")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .attr("class", "brushesContext");

    var brushcontext = context.append("g")
        .attr("class", "brushContext")
        .call(brush)
        .call(brush.move, [xScale(0 * 1000), xScale(30 * 1000)])
        .selectAll(".overlay")
        .each(function (d) {
            d.type = "selection";
        }) // Treat overlay interaction as move.
        .on("mousedown touchstart", brushcentered); // Recenter before brushing.

    var sliderwidth =context.select(".selection").attr("width")
    d3.select('.brushContext').selectAll('.selection').style("cursor", "initial");
    d3.select('.brushContext').selectAll('.overlay').style("cursor", "initial");


    var rect2 = context
        .append("rect")
        .attr("class", "area")
        //.attr("d", area2)
        .attr("width", width)
        .attr("height", height2)
        .style("fill", "none")

    var initialBrushesDrawn = false
    var initialBrushesDrawn2 = false

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    var ticks = context.selectAll(".tick text");

// Only display a tick-label if second is dividable by 5
    ticks.attr("class", function (d, i) {

        var s = formatSeconds(d)
        if (s % 10 !== 0) d3.select(this).remove();
    });
    console.log(brushes)
    console.log(mySelections)

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        xScale.domain(t.rescaleX(xScale2).domain());
        //focus.select(".area").attr("d", area);
        focus.select(".axis--x").call(xAxis);
        context.select(".brush").call(brush.move, xScale.range().map(t.invertX, t));

    }

    function brushcentered() {

        console.log(xScale(1), xScale(0))
        var dx = sliderwidth, // Use a fixed width when recentering.
            cx = d3.mouse(this)[0],
            x0 = cx - dx / 2,
            x1 = cx + dx / 2;
        d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
    }

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

        var s = d3.event.selection || xScale2.range();
        var s_map = s.map(xScale2.invert, xScale2)

        if (d3.event.sourceEvent) {
            //console.log(d3.event.sourceEvent.srcElement.parentNode)

        }
        xScale.domain(s_map);


        //console.log(formatSeconds(s_map[0]))
        //console.log(formatSeconds(s_map[1]))

        //console.log(d3.event)
        //focus.select(".area").attr("d", area);

        gBrushes.selectAll(".brush").each(function (brushObj) {
            // this init's the brush
            //brushObj.brush(d3.select(this));

            //console.log(this.id)
            //console.log(brushObj)
            //console.log(typeof mySelections)
            if (mySelections[this.id]) {
                var startpoint = formatSecondsMinutes(mySelections[this.id].start),
                    endpoint = formatSecondsMinutes(mySelections[this.id].end)


                //console.log(mySelections[this.id],hmsToSecondsOnly(startpoint),hmsToSecondsOnly(endpoint))
                brushObj.brush.move(d3.select(this), [
                    xScale(hmsToSecondsOnly(startpoint) * 1000),
                    xScale(hmsToSecondsOnly(endpoint) * 1000),
                ])
            }


        })


        focus.select(".axis--x").call(xAxis);


    }


    function hmsToSecondsOnly(str) {
        var p = str.split(':'),
            s = 0, m = 1;

        while (p.length > 0) {
            s += m * parseInt(p.pop(), 10);
            m *= 60;
        }

        return s;
    }

    function brushended() {
        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.
        var d0 = d3.event.selection.map(xScale.invert),
            d1 = d0.map(d3.timeSecond);

        // If empty when rounded, use floor & ceil instead.
        if (d1[0] >= d1[1]) {
            d1[0] = d3.timeSecond.floor(d0[0]);
            d1[1] = d3.timeSecond.offset(d1[0]);
        }

        d3.select(this).transition().call(d3.event.target.move, d1.map(xScale));
    }


    /*
    function zoomed() {
        var transform = d3.event.transform;

        var xNewScale = transform.rescaleX(xScale);

        xAxis.scale(xNewScale);
        axis.call(xAxis);
        ticks = d3.selectAll(".tick text")
        // readjust labels in case of zooming
        ticks.attr("class", function (d, i) {
            var s = formatSeconds(d)
            if (s % 5 !== 0) d3.select(this).remove();
        });

    }*/


    function newBrush() {
        //console.log('newBrush')
        var brush = d3.brushX()
            .extent([[0, 0], [width, height]])

            .on("start", brushstart)
            .on("brush", brushed)
            .on("end", brushend);

        brushes.push({id: brushes.length, brush: brush});

        function brushstart() {
            // Brush start here

        };


        function brushed() {
            var brushContext = gBrushesContext.select("#" + this.id)
            brushContext.selectAll('.overlay').attr("height", height2)
            brushContext.selectAll('.selection').attr("height", height2)

            if (!d3.event.sourceEvent) return;
            if (!d3.event.sourceEvent.srcElement) return;
            //console.log(d3.event.sourceEvent.srcElement.parentNode)
            //console.log((this))
            //console.log(d3.event.sourceEvent)
            //console.log(d3.event)
            //console.log(d3.event.sourceEvent.srcElement.parentNode)
            let selection = d3.event.selection.map(xScale.invert);

            mySelections[this.id] = {start: selection[0], end: selection[1]};


            //console.log("Selections are: ", mySelections);


        }

        function brushend() {
            //console.log("brushend")
            var brushContext = gBrushesContext.select("#" + this.id)
            brushContext.selectAll('.overlay').attr("height", height2)
            brushContext.selectAll('.selection').attr("height", height2)
            // Figure out if our latest brush has a selection
            var lastBrushID = brushes[brushes.length - 1].id;
            var lastBrush = document.getElementById('brush-' + lastBrushID);
            var selection = d3.brushSelection(lastBrush);

            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.sourceEvent.srcElement) return;

            if (!d3.event.selection) return; // Ignore empty selections.
            var d0 = d3.event.selection.map(xScale.invert),
                d1 = d0.map(d3.timeSecond);

            // If empty when rounded, use floor & ceil instead.
            if (d1[0] >= d1[1]) {
                d1[0] = d3.timeSecond.floor(d0[0]);
                d1[1] = d3.timeSecond.offset(d1[0]);
            }

            d3.select(this).transition().call(d3.event.target.move, d1.map(xScale));
            brushContext.transition().call(d3.event.target.move, d1.map(xScale2));
            brushContext.on('.brush', null);

            console.log("durch brushend")
            // If it does, that means we need another one
            if (brushes.length < brushCount && selection && selection[0] !== selection[1]) {

                newBrush()


            }

            // Always draw brushes
            drawBrushes();
        }
    }

    function drawBrushes() {
        //console.log("draw", initialBrushesDrawn)
        var brushSelection = gBrushes
            .selectAll('.brush')
            .data(brushes, function (d) {
                return d.id
            });

        //console.log("Brush selection:", brushSelection);

        // Set up new brushes
        brushSelection.enter()
            .insert("g", '.brush')
            .attr('class', 'brush')
            .attr('id', function (brush) {
                return "brush-" + brush.id;
            })
            .each(function (brushObject) {
                // call the brush
                brushObject.brush(d3.select(this));
                //console.log(brushObject)


                if (!initialBrushesDrawn) {
                    console.log("sin am if")
                    d3.select(this)
                        .attr('class', 'brush')
                        .selectAll('.overlay')
                        .style('pointer-events', function () {
                            var brush = brushObject.brush;
                            if (brushObject.id === brushes.length - 1 && brush !== undefined) {
                                return 'all';
                            } else {
                                return 'none';
                            }
                        })


                    // set some default values of the brushes
                    d3.select(this).selectAll('.selection')
                        .style('fill', function (d) {
                            return colorScale(brushObject.id)
                        })
                    brushObject.brush.move(d3.select(this), [

                        xScale(brushObject.start * 1000),
                        xScale(brushObject.endpoint * 1000),
                    ])

                }

            });


        brushSelection
            .each(function (brushObject) {

                d3.select(this)
                    .attr('class', 'brush')
                    .selectAll('.overlay')
                    .style('pointer-events', function () {
                        var brush = brushObject.brush;
                        if (brushObject.id === brushes.length - 1 && brush !== undefined) {
                            return 'all';
                        } else {
                            return 'none';
                        }
                    })


                d3.select(this).selectAll('.selection')
                    .style('fill', function (d) {
                        return colorScale(brushObject.id)
                    })
            })

        brushSelection.exit()
            .remove();

        initialBrushesDrawn = true
        drawBrushes2()
    }

    function drawBrushes2() {
        //console.log("draw", initialBrushesDrawn2)
        var brushSelection2 = gBrushesContext
            .selectAll('.brush')
            .data(brushes, function (d) {
                return d.id
            });


        // Set up new brushes
        brushSelection2.enter()
            .insert("g", '.brush')
            .attr('class', 'brush')
            .attr('id', function (brush) {
                return "brush-" + brush.id;
            })
            .each(function (brushObject) {
                // call the brush
                brushObject.brush(d3.select(this));
                //console.log(brushObject)


                if (!initialBrushesDrawn2) {
                    console.log("sin am if")
                    d3.select(this)
                        .attr('class', 'brush')
                        .selectAll('.overlay')
                        .style('pointer-events', function () {
                            var brush = brushObject.brush;
                            if (brushObject.id === brushes.length - 1 && brush !== undefined) {
                                return 'all';
                            } else {
                                return 'none';
                            }
                        })


                    // set some default values of the brushes

                    brushObject.brush.move(d3.select(this), [

                        xScale2(brushObject.start * 1000),
                        xScale2(brushObject.endpoint * 1000),
                    ])
                    d3.select(this).selectAll('.selection')
                        .style('fill', function (d) {
                            return colorScale(brushObject.id)
                        })
                    d3.select(this).selectAll('.overlay').attr("height", height2)
                    d3.select(this).selectAll('.selection').attr("height", height2)

                }

            });


        brushSelection2
            .each(function (brushObject) {
                //console.log(brushObject)
                //console.log(d3.select(this).selectAll('.selection'))
                d3.select(this)
                    .attr('class', 'brush')
                    .selectAll('.overlay')
                    .attr("height", height2)

                    .style('pointer-events', function () {
                        var brush = brushObject.brush;
                        if (brushObject.id === brushes.length - 1 && brush !== undefined) {
                            return 'all';
                        } else {
                            return 'none';
                        }
                    })

                d3.select(this).selectAll('.selection')
                    .style('fill', function (d) {
                        return colorScale(brushObject.id)
                    })
                d3.select(this).selectAll('.overlay').attr("height", height2)
                d3.select(this).selectAll('.selection').attr("height", height2)


            })

        brushSelection2.exit()
            .remove();

        initialBrushesDrawn2 = true

    }

    makeBrush(0, 10);
    makeBrush(60, 117);

    newBrush()
    drawBrushes()


    function makeBrush(start, end) {
        const brush = d3
            .brushX()
            .extent([[0, 0], [width, height]])
            .on("start", brushstart)
            .on("brush", brushed)
            .on('end', brushend);

        var startDate = new Date(start * 1000)
        var endDate = new Date(end * 1000)
        console.log(startDate, endDate)

        var brushID = brushes.length
        console.log(brushes.length)

        mySelections["brush-" + brushID] = {start: startDate, end: endDate};
        brushes.push({id: brushes.length, brush, start: start, endpoint: end});

        function brushstart() {
            // Brush start here

        };


        function brushed() {

            var brushContext = gBrushesContext.select("#" + this.id)

            brushContext.selectAll('.overlay').attr("height", height2)
            brushContext.selectAll('.selection').attr("height", height2)
            if (!d3.event.sourceEvent) return;
            if (!d3.event.sourceEvent.srcElement) return;
            //console.log(d3.event.sourceEvent.srcElement.parentNode)
            let selection = d3.event.selection.map(xScale.invert);

            mySelections[this.id] = {start: selection[0], end: selection[1]};

            //console.log("Selections are: ", mySelections);


        }

        function brushend() {
            var brushContext = gBrushesContext.select("#" + this.id)

            brushContext.selectAll('.overlay').attr("height", height2)
            brushContext.selectAll('.selection').attr("height", height2)
            //console.log("brushend")
            // Figure out if our latest brush has a selection
            var lastBrushID = brushes[brushes.length - 1].id;
            var lastBrush = document.getElementById('brush-' + lastBrushID);
            var selection = d3.brushSelection(lastBrush);

            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.sourceEvent.srcElement) return;

            if (!d3.event.selection) return; // Ignore empty selections.
            var d0 = d3.event.selection.map(xScale.invert),
                d1 = d0.map(d3.timeSecond);

            // If empty when rounded, use floor & ceil instead.
            if (d1[0] >= d1[1]) {
                d1[0] = d3.timeSecond.floor(d0[0]);
                d1[1] = d3.timeSecond.offset(d1[0]);
            }
            d3.select(this).transition().call(d3.event.target.move, d1.map(xScale));

            //console.log(this.id)
            //console.log(gBrushesContext.select("#"+this.id))

            brushContext.on('.brush', null);

            brushContext.transition().call(d3.event.target.move, d1.map(xScale2));


        }

        //makeBrush2(start,end)
    }

    function makeBrush2(start, end) {
        const brush = d3
            .brushX()
            .extent([[0, 0], [width, height2]])
            .on("start", brushstart2)
            .on("brush", brushed2)
            .on('end', brushend2);

        var startDate = new Date(start * 1000)
        var endDate = new Date(end * 1000)
        console.log(startDate, endDate)

        var brushID = brushes.length
        console.log(brushes.length)

        //mySelections["brush-" + brushID] = {start: startDate, end: endDate};
        //brushes.push({id: brushes.length, brush, start: start, endpoint: end});

        function brushstart2() {
            // Brush start here

        };


        function brushed2() {


            if (!d3.event.sourceEvent) return;
            if (!d3.event.sourceEvent.srcElement) return;
            //console.log(d3.event.sourceEvent.srcElement.parentNode)
            console.log((this))
            let selection = d3.event.selection.map(xScale.invert);

            mySelections[this.id] = {start: selection[0], end: selection[1]};

            //console.log("Selections are: ", mySelections);


        }

        function brushend2() {
            //console.log("brushend")
            // Figure out if our latest brush has a selection
            var lastBrushID = brushes[brushes.length - 1].id;
            var lastBrush = document.getElementById('brush-' + lastBrushID);
            var selection = d3.brushSelection(lastBrush);

            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            var d0 = d3.event.selection.map(xScale.invert),
                d1 = d0.map(d3.timeSecond);

            // If empty when rounded, use floor & ceil instead.
            if (d1[0] >= d1[1]) {
                d1[0] = d3.timeSecond.floor(d0[0]);
                d1[1] = d3.timeSecond.offset(d1[0]);
            }

            d3.select(this).transition().call(d3.event.target.move, d1.map(xScale2));


        }
    }

/*
    let toggle = true;

    document.getElementById('disable-btn').addEventListener('click', () => {
        toggleBrush();
    });

    var toggleBrush = function () {
        toggle = !toggle;

        if (!toggle) {
            document.getElementById('disable-btn').innerHTML = '<i class="fa fa-toggle-off"></i> Brushes Off';

            for (let i = 0, len = brushes.length; i < len; i++) {
                d3.select('#brush-' + i).on('.brush', null);
            }

            d3.select('.brushes').selectAll('.selection').style("cursor", "initial");
            d3.select('.brushes').selectAll('.overlay').style("cursor", "initial");
            rect.on(".zoom", null)


        } else {
            document.getElementById('disable-btn').innerHTML = '<i class="fa fa-toggle-on"></i> Brushes On';

            for (let i = 0, len = brushes.length; i < len; i++) {
                brushes[i].brush(d3.select('#brush-' + i));
            }

            rect.call(zoom)
            startTransition();

            d3.select('.brushes').selectAll('.selection').style("cursor", "move");
            d3.select('.brushes').selectAll('.overlay').style("cursor", "crosshair");


        }
    };*/
}