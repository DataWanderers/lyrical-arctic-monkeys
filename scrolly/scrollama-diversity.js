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

// create scales for x and y axes
const xScale_diversity = d3.scaleLinear()
    .domain([0, d3.max(diversityAlbums, d => d.Maximum)]).nice()
    .range([0, width]);

const yScale_diversity = d3.scaleBand()
    .domain(diversityAlbums.map(d => d.Album))
    .range([0, height])
    .padding(0.3);

// define colors
const colorScale_diversity = d3.scaleOrdinal()
    .domain(["Minimum", "Median", "Maximum"])
    .range(["blue", "orange", "red"]);

// add axes
svg_diversity.append("g")
    .call(d3.axisLeft(yScale_diversity))
    .style("font-size", "12px");

svg_diversity.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale_diversity));

// add x-axis label
svg_diversity.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("text-anchor", "middle")
    .text("Lexical diversity (%)");

svg_diversity.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale_diversity));

// create dots for Minimum, Median, and Maximum values
const dotRadius = 5;
diversityAlbums.forEach(d => {
    // Add connecting line between Minimum and Maximum first
    svg_diversity.append("line")
        .attr("x1", xScale_diversity(d.Minimum))
        .attr("x2", xScale_diversity(d.Maximum))
        .attr("y1", yScale_diversity(d.Album) + yScale_diversity.bandwidth() / 2)
        .attr("y2", yScale_diversity(d.Album) + yScale_diversity.bandwidth() / 2)
        .style("stroke", "black")
        .style("stroke-width", 1);

    keys = ["Minimum", "Median", "Maximum"];
    keys.forEach(key => {
        svg_diversity.append("circle")
            .attr("class", key)
            .attr("cx", xScale_diversity(d[key]))
            .attr("cy", yScale_diversity(d.Album) + yScale_diversity.bandwidth() / 2)
            .attr("r", dotRadius)
            .style("fill", colorScale_diversity(key))
    });
});

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
            if (currentDirection === "up") {
                dotColorGrey(bubbleChart_diversity, data);
            }
            break;
        case 1:
            dotColorSentiment(bubbleChart_diversity, data)
            break;
        case 2:
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