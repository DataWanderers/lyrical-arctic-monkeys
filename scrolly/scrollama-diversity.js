/**********************/
/******* d3           */
/**********************/ 

// append the svg object to the body of the page
const svg_diversity = d3.select("#viz-diversity")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

var tooltip_diversity = d3.select("#viz-diversity")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")

// add X axis
const x_diversity = d3.scaleLinear()
    .domain([0, 13])
    .range([0, width]);
              
svg_diversity.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "Xaxis axis")
    .style("opacity", 0)
    .call(d3.axisBottom(x_diversity));

// add Y axis
const y_diversity = d3.scaleLinear()
    .domain([0, 2])
    .range([height, 0]);

svg_diversity.append("g")
    .attr("class", "Yaxis axis")
    .style("opacity", 0)
    .call(d3.axisLeft(y_diversity));


// define helper variables
var xAxis_diversity = d3.axisBottom().scale(x_diversity);
var yAxis_diversity = d3.axisLeft().scale(y_diversity);
var toolTipState_diversity = "title";

// add bubble chart
const bubbleChart_diversity = svg_diversity.append("g")
    .attr("class", "chart")
    .selectAll("dot")
    .data(data)
        .join("circle")
            .attr("class", "bubbles")
            .attr("cx", d => x_diversity(d.index))
            .attr("cy", d => y_diversity(1))
            .attr("r", 10)
            .style("fill", "#F2E8DC")
            .attr("stroke", "white")
            .on("mouseover", function(d) {showTooltip(d, tooltip_diversity, toolTipState_diversity);})
            .on("mouseleave", function(d) {hideTooltip(d, tooltip_diversity);})   

/**********************/
/******* scrollama    */
/**********************/

var scrolly_diversity = main.select("#scrolly-diversity");
var figure_diversity = scrolly_diversity.select("figure");
var step_diversity = scrolly_diversity.select("article").selectAll(".step");
var scroller_diversity = scrollama();

function handleStepEnter(response) {
    console.log(response);  // response = { element, direction, index }
    let currentIndex = response.index;
    let currentDirection = response.direction;
    
    // add color to current step only
    step_diversity.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // update graphic based on step
    switch(currentIndex) {
        case 0:
            toolTipState_diversity = "title";
            if (currentDirection === "up") {
                dotColorGrey(bubbleChart_diversity, data);
            }
            break;
        case 1:
            toolTipState_diversity = "title score";
            dotColorSentiment(bubbleChart_diversity, data)
            break;
        case 2:
            toolTipState_diversity = "title score magnitude";
            dotResize(svg_diversity, x_diversity, xAxis_diversity, y_diversity, yAxis_diversity, bubbleChart_diversity, data)
            if (currentDirection === "up") {
                toggleAxesOpacity(svg_diversity, true, false, 0)
            }
            break;
        default:
            break;
    }
}

function init() {
    setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize(scroller_diversity, figure_diversity, step_diversity);

    // 2. setup the scroller passing options, this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller_diversity
        .setup({
            step: "#scrolly-diversity article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    // setup resize event
    window.addEventListener("resize", handleResize);
}

// kick things off
init();