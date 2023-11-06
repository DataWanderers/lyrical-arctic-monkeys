/**********************/
/******* d3           */
/**********************/ 

const albums = dispersionAlbums.map(d => d.Album);
const words = Object.keys(dispersionAlbums[0]).filter(word => word !== "Album");
const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 10]);  // light pink --> dark red; d3.max(dispersionAlbums, d => d3.max(words, w => d[w]))
const rectangle_width = 80, rectangle_height = 35;

// define svg
const svg_dispersion = d3.select("#viz-dispersion")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

svg_dispersion.selectAll("rect")
    .data(dispersionAlbums)
    .enter()
    .append("g")
    .selectAll("rect")
    .data(d => words.map(w => ({ album: d.Album, word: w, count: d[w] })))
    .enter()
    .append("rect")
    .attr("x", (d, i) => albums.indexOf(d.album) * rectangle_width)
    .attr("y", (d, i) => i * rectangle_height)
    .attr("width", rectangle_width)
    .attr("height", rectangle_height)
    .style("fill", d => colorScale(d.count));

// create labels inside each rectangle
svg_dispersion.selectAll("text")
    .data(dispersionAlbums)
    .enter()
    .append("g")
    .selectAll("text")
    .data(d => words.map(w => ({ album: d.Album, word: w, count: d[w] })))
    .enter()
    .append("text")
    .text(d => d.count) // show the count inside the rectangle
    .attr("x", (d, i) => albums.indexOf(d.album) * rectangle_width + rectangle_width / 2)
    .attr("y", (d, i) => i * rectangle_height + rectangle_height / 2)
    .style("text-anchor", "middle")
    .style("alignment-baseline", "middle")
    .style("font-size", "14px")
    .style("font-weight", "600");

// add labels for albums and words
svg_dispersion.append("g")
    .selectAll("text")
    .data(albums)
    .enter()
    .append("text")
    .text(d => d)
    .attr("x", (d, i) => i * rectangle_width + rectangle_width / 2)
    .attr("y", -10)
    .style("text-anchor", "middle")
    .style("font-size", "12px");

svg_dispersion.append("g")
    .selectAll("text")
    .data(words)
    .enter()
    .append("text")
    .text(d => d)
    .attr("x", -10)
    .attr("y", (d, i) => i * rectangle_height + rectangle_height / 2)
    .style("text-anchor", "end")
    .style("alignment-baseline", "middle");

/**********************/
/******* scrollama    */
/**********************/

var scrolly_dispersion = main.select("#scrolly-dispersion");
var figure_dispersion = scrolly_dispersion.select("figure");
var step_dispersion = scrolly_dispersion.select("article").selectAll(".step");
var scroller_dispersion = scrollama();

function handleStepEnter(response) {
    console.log(response);  // response = { element, index, direction }
    let currentIndex = response.index;
    let currentDirection = response.direction;

    // add color to current step only
    step_dispersion.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // update graphic based on step
    switch(currentIndex) {
        case 0:
            if (currentDirection === "up") {
                dotColorGrey(bubbleChart_dispersion, data)
            }
            break;
        case 1:
            dotColorSentiment(bubbleChart_dispersion, data)
            break;
        case 2:
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