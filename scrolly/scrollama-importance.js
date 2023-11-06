/**********************/
/******* d3           */
/**********************/ 

// append the svg object to the body of the page
const svg_importance = d3.select("#viz-importance")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var tooltip_importance = d3.select("#viz-importance")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")

// add X axis
const x_importance = d3.scaleLinear()
    .domain([0, 13])
    .range([0, width]);

svg_importance.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "Xaxis axis")
    .style("opacity", 0)
    .call(d3.axisBottom(x_importance));

// add Y axis
const y_importance = d3.scaleLinear()
    .domain([0, 2])
    .range([height, 0]);

svg_importance.append("g")
    .attr("class", "Yaxis axis")
    .style("opacity", 0)
    .call(d3.axisLeft(y_importance));

// define helper variables
var xAxis_importance = d3.axisBottom().scale(x_importance);
var yAxis_importance = d3.axisLeft().scale(y_importance);
var toolTipStat_importance = "title";

// add bubble chart
const bubbleChart_importance = svg_importance.append("g")
    .attr("class", "chart")
    .selectAll("dot")
    .data(data)
    .join("circle")
    .attr("class", "bubbles")
    .attr("cx", d => x_importance(d.index))
    .attr("cy", d => y_importance(1))
    .attr("r", 10)
    .style("fill", "#F2E8DC")
    .attr("stroke", "white")
    .on("mouseover", function(d) {showTooltip(d, tooltip_importance, toolTipStat_importance);})
    .on("mouseleave", function(d) {hideTooltip(d, tooltip_importance);})

/**********************/
/******* scrollama    */
/**********************/ 

var scrolly_importance = main.select("#scrolly-importance");
var figure_importance = scrolly_importance.select("figure");
var step_importance = scrolly_importance.select("article").selectAll(".step");
var scroller_importance = scrollama();

function handleStepEnter(response) {
    console.log(response);  // response = { element, index, direction }
    let currentIndex = response.index;
    let currentDirection = response.direction;

    // add color to current step only
    step_importance.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // update graphic based on step
    switch(currentIndex) {
        case 0:
            toolTipStat_importance = "title";
            if (currentDirection === "up") {
                dotColorGrey(bubbleChart_importance, data)
            }
            break;
        case 1:
            toolTipStat_importance = "title score";
            dotColorSentiment(bubbleChart_importance, data)
            break;
        case 2:
            toolTipStat_importance = "title score magnitude";
            dotResize(svg_importance, x_importance, xAxis_importance, y_importance, yAxis_importance, bubbleChart_importance, data)
            if (currentDirection === "up") {
                toggleAxesOpacity(svg_importance, true, false, 0)
            }
            break;
        case 3:
            dotPositionScore(svg_importance, x_importance, xAxis_importance, y_importance, yAxis_importance, bubbleChart_importance, data)
            if (currentDirection === "up") {
                toggleAxesOpacity(svg_importance, false, true, 0)
            }
            break;
        case 4:
            dotPositionMagnitude(svg_importance, y_importance, yAxis_importance, bubbleChart_importance, data)
            if (currentDirection === "up") {
                toggleAxesOpacity(svg_importance, true, true, 1)
            } else {
                toggleAxesOpacity(svg_importance, false, true, 1)
            }
            break;
        case 5:
            dotSimplify(bubbleChart_importance, data)
            if (currentDirection === "up") {
                hideStraightPath()
            } else {
                toggleAxesOpacity(svg_importance, true, true, 0)
            }
            break;
        case 6:
            if (currentDirection === "up") {
                hideBezierPath()
                toggleElementOpacity(line, 1)
            } else {
                drawStraightPath(x_importance, y_importance)
            }
            break;
        case 7:
            toggleElementOpacity(line, 0.25)
            if (currentDirection === "up") {
                toggleElementOpacity(bubbleChart_importance, 1)
            } else {
                drawBezierPath(x_importance, y_importance, bezierData)
            }
            break;
        case 8:
            if (currentDirection === "down") {
                toggleElementOpacity(line, 0)
                toggleElementOpacity(bubbleChart_importance, 0)
            }
        default:
            break;
    }
}

function init() {
    setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize(scroller_importance, figure_importance, step_importance);

    // 2. setup the scroller passing options, this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller_importance
        .setup({
            step: "#scrolly-importance article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    // setup resize event
    window.addEventListener("resize", handleResize);
}

// kick things off
init();