var main = d3.select("main");

// set the dimensions and margins of all graphs
const margin = {top: 50, right: 25, bottom: 45, left: 100},
      width = 700 - margin.left - margin.right,
      height = 420 - margin.top - margin.bottom;

// set colours for plot
const color_mapping = {
    red: "#A6055D",
    grey: "#777",
    green: "#00C184"
}

// generic window resize listener event
function handleResize(scroller, figure, step) {
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

function toggleChart(chart1, chart2) {  // chart1 is on, chart2 is off
    chart1.style("display", "block");
    chart2.style("display", "none");
}

function hideTooltip(d, tooltip) {
    tooltip.style("opacity", 0)
}

function mouseover(d, tooltip, selection) {
    tooltip.style("opacity", 1)
    d3.selectAll(".myArea").style("opacity", .2)
    d3.select(selection).style("stroke", "black").style("opacity", 1)
}

function mousemove(d, i, tooltip, keys) {
    tooltip.text(keys[i])
}

function mouseleave(d, tooltip) {
    hideTooltip(d, tooltip)
    d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
}

function toggleElementOpacity(element, opacity) {
    element.transition().duration(1000).style("opacity", opacity)
}

function toggleAxesOpacity(chart, toggleX, toggleY, opacity) {
    if (toggleX) {
        toggleElementOpacity(chart.selectAll(".Xaxis"), opacity)
    }
    
    if (toggleY) {
        toggleElementOpacity(chart.selectAll(".Yaxis"), opacity)
    }
}