/**********************/
/******* d3           */
/**********************/ 

// append the svg object to the body of the page
const svg_dispersion = d3.select("#viz-dispersion")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

var tooltip_dispersion = d3.select("#viz-dispersion")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")

// add X axis
const x_dispersion = d3.scaleLinear()
    .domain([0, 13])
    .range([0, width]);
              
svg_dispersion.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "Xaxis axis")
    .style("opacity", 0)
    .call(d3.axisBottom(x_dispersion));

// add Y axis
const y_dispersion = d3.scaleLinear()
    .domain([0, 2])
    .range([height, 0]);

svg_dispersion.append("g")
    .attr("class", "Yaxis axis")
    .style("opacity", 0)
    .call(d3.axisLeft(y_dispersion));

// define helper variables
var xAxis_dispersion = d3.axisBottom().scale(x_dispersion);
var yAxis_dispersion = d3.axisLeft().scale(y_dispersion);
var toolTipState_dispersion = "title";

// add bubble chart
const bubbleChart_dispersion = svg_dispersion.append("g")
    .attr("class", "chart")
    .selectAll("dot")
    .data(data)
        .join("circle")
            .attr("class", "bubbles")
            .attr("cx", d => x_dispersion(d.index))
            .attr("cy", d => y_dispersion(1))
            .attr("r", 10)
            .style("fill", "#F2E8DC")
            .attr("stroke", "white")
            .on("mouseover", function(d) {showTooltip(d, tooltip_dispersion, toolTipState_dispersion);})
            .on("mouseleave", function(d) {hideTooltip(d, tooltip_dispersion);})

/**********************/
/******* scrollama    */
/**********************/

var scrolly_dispersion = main.select("#scrolly-dispersion");
var figure_dispersion = scrolly_dispersion.select("figure");
var step_dispersion = scrolly_dispersion.select("article").selectAll(".step");
var scroller_dispersion = scrollama();

function handleStepEnter(response) {
    console.log(response);  // response = { element, direction, index }
    let currentIndex = response.index;
    let currentDirection = response.direction;

    // add color to current step only
    step_dispersion.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // update graphic based on step
    switch(currentIndex) {
        case 0:
            toolTipState_dispersion = "title";
            if (currentDirection === "up") {
                dotColorGrey(bubbleChart_dispersion, data);
            }
            break;
        case 1:
            toolTipState_dispersion = "title score";
            dotColorSentiment(bubbleChart_dispersion, data)
            break;
        case 2:
            toolTipState_dispersion = "title score magnitude";
            dotResize(svg_dispersion, x_dispersion, xAxis_dispersion, y_dispersion, yAxis_dispersion, bubbleChart_dispersion, data)
            if (currentDirection === "up") {
                toggleAxesOpacity(svg_dispersion, true, false, 0)
            }
            break;
        default:
            break;
    }
}

function init() {
    setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize(scroller_dispersion, figure_dispersion, step_dispersion);

    // 2. setup the scroller passing options, this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller_dispersion
        .setup({
            step: "#scrolly-dispersion article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    // setup resize event
    window.addEventListener("resize", handleResize);
}

// kick things off
init();