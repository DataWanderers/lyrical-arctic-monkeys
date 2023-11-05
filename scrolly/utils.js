var main = d3.select("main");

// set the dimensions and margins of all graphs
const margin = {top: 50, right: 25, bottom: 45, left: 50},
      width = 700 - margin.left - margin.right,
      height = 420 - margin.top - margin.bottom;

// set colours for plot
const color_mapping = {
    red: "#A6055D",
    grey: "#777",
    green: "#00C184"
}

function showTooltip(d, tooltip, toolTipState) {
    tooltip
        .transition()
        .duration(200)
    tooltip
        .style("opacity", 1)
        .html(returnTooltipText(toolTipState, d))
}

function hideTooltip(d, tooltip) {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
}

function returnTooltipText(step, d) {
    // change tooltip text based on position in story
    switch (step) {
        case "title":
            return d.index + ": " + d.title
        case "title score":
            return d.index + ": " + d.title +
                " - sentiment score: " + d.score
        case "title score magnitude":
            return d.index + ": " + d.title +
                " - sentiment score: " + d.score +
                " - magnitude: " + d.magnitude
    }
}

function dotColorGrey(bubbleChart, data) {
    bubbleChart
        .data(data)
        .transition()
            .duration(1000)
                .attr("r", 10)  
                .style("fill", "#F2E8DC")
}

function dotColorSentiment(bubbleChart, data) {
    bubbleChart               
        .data(data)
        .transition()
            .duration(1000)
                .attr("r", 10)  
                .style("fill", function(d) { 
                if (d.score > 0) {
                    return color_mapping.green
                } else if (d.score < 0) {
                    return color_mapping.red
                } else {
                    return color_mapping.grey
                }
    })
}

function dotResize(svg, x, xAxis, y, yAxis, bubbleChart, data) {
    x.domain([0, 13]);
    
    svg.selectAll(".Xaxis")
        .transition()
        .duration(1000)
            .call(xAxis);
                          
    y.domain([0, 2]);
    
    svg.selectAll(".Yaxis")
        .transition()
        .duration(1000)
            .call(yAxis);
                          
    bubbleChart
        .data(data)
        .transition()
        .duration(1000)
            .attr("cx", d => x(d.index))
            .attr("cy", d => y(1))
            .attr("r", d => (d.magnitude*2.7));
}

function dotPositionScore(svg, x, xAxis, y, yAxis, bubbleChart, data) {
    x.domain([-.8, .8]);
    
    svg.selectAll(".Xaxis")
        .transition()
        .duration(1000)
            .style("opacity", 1)
            .call(xAxis);
                          
    
    y.domain([0, 2]);
    
    svg.selectAll(".Yaxis")
        .transition()
        .duration(1000)
            .call(yAxis);
                          
    bubbleChart
        .data(data)
        .transition()
        .duration(1000)
            .attr("cx", d => x(d.score))
            .attr("cy", d => y(1))
}

function dotPositionMagnitude(svg, y, yAxis, bubbleChart, data) {
    y.domain([1, d3.max(data, function(d) { return d.magnitude + 1 })]);
    
    svg.selectAll(".Yaxis")
        .transition()
        .duration(1000)
            .style("opacity", 1)
            .call(yAxis);

    bubbleChart
        .data(data)
        .transition()
        .duration(1000)
            .style("fill", function(d) { 
                if (d.score > 0) {
                    return color_mapping.green
                } else if (d.score < 0) {
                    return color_mapping.red
                } else {
                    return color_mapping.grey
                }
            })
            .attr("r", d => (d.magnitude*2))
            .attr("cy", d => y(d.magnitude))
}

function dotSimplify(bubbleChart, data) {
    bubbleChart
        .data(data)
        .transition()
        .duration(1000)
            .style("fill", "black")
            .attr("r", 5)
}

function toggleAxesOpacity(svg, toggleX, toggleY, opacity) {
    if (toggleX) {
        svg.selectAll(".Xaxis")
            .transition()
            .duration(1000)
                .style("opacity", opacity)
    }
    
    if (toggleY) {
        svg.selectAll(".Yaxis")
            .transition()
            .duration(1000)
                .style("opacity", opacity)
    }
}

function drawStraightPath(x, y) {
    if (typeof line === "undefined") {
        var path = d3.path();
                          
        for (var item = 0; item < data.length; item++) {
            let x_value = data[item].score
            let y_value = data[item].magnitude
            if (item === 0) {
                path.moveTo(x(x_value), y(y_value));
            } else {
                path.lineTo(x(x_value), y(y_value));
            }
        }
        
        window.line = d3.select(".chart")
            .append("path")
            .attr("class", "straight")
            .attr("d", path)

        window.totalLength = line.node().getTotalLength()
    }

    line
      .attr("stroke", "#F2E8DC")
      .attr("fill", "none")
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(3000)
        .attr("stroke-dashoffset", 0)
}

function hideStraightPath() {
    line
        .transition()
        .duration(3000)
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
    
}

function toggleElementOpacity(element, opacity) {
    element
        .transition()
        .duration(1000)
            .style("opacity", opacity)
}

function drawBezierPath(x, y, data) {
    if (typeof lineBezier === "undefined") {
        var pathBezier = d3.path();

        for (var item = 0; item < data.length; item++) {
            let currenItem = data[item];

            if (item === 0) {
                pathBezier.moveTo(x(currenItem[0]), y(currenItem[1]));
            }

            pathBezier.bezierCurveTo(
                x(currenItem[2]), 
                y(currenItem[3]),
                x(currenItem[4]), 
                y(currenItem[5]),
                x(currenItem[6]), 
                y(currenItem[7]),
            );

        }
        
        window.lineBezier = d3.select(".chart")
            .append("path")
                .attr("class", "bezier")
                .attr("stroke-width", "2px")
                .attr("d", pathBezier)

        window.totalLengthBezier = lineBezier.node().getTotalLength()
    }

    lineBezier
        .attr("stroke", "#F2E8DC")
        .attr("fill", "none")
        .attr("stroke-dasharray", totalLengthBezier + " " + totalLengthBezier)
        .attr("stroke-dashoffset", totalLengthBezier)
        .transition()
        .duration(3000)
            .attr("stroke-dashoffset", 0);
}

function hideBezierPath() {
    lineBezier
        .attr("fill", "none")
        .transition()
        .duration(3000)
            .attr("stroke-dasharray", totalLengthBezier + " " + totalLengthBezier)
            .attr("stroke-dashoffset", totalLengthBezier)
}

function handleResize(scroller, figure, step) {  // generic window resize listener event
    // update height of step elements
    var stepH = Math.floor(window.innerHeight * 0.75);
    step.style("height", stepH + "px");
    step.style("width", "250px")

    var figureHeight = window.innerHeight / 2;
    var figureMarginTop = (window.innerHeight - figureHeight) / 2;
    
    figure
        .style("height", figureHeight + "px")
        .style("top", figureMarginTop + "px");

    // tell scrollama to update new element dimensions
    scroller.resize();
}

function setupStickyfill() {
    d3.selectAll(".sticky").each(function() {
        Stickyfill.add(this);
    });
}