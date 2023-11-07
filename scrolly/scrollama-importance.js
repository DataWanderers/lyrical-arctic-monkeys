/**********************/
/******* d3           */
/**********************/ 

const songSections = Object.keys(importanceAlbums[0]).filter(key => key !== "Album");

const svg_importance = d3.select("#viz-importance")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(0, ${margin.right})`);

const chartImportance = svg_importance.append("g").attr("class", "chart");

function makeChartImportanceAlbums() {
    const x = d3.scaleBand()
        .domain(importanceAlbums.map(d => d.Album))
        .range([0, width + margin.left])
        .padding(0.3);
    
    chartImportance.append("g")
        .attr("transform", `translate(0, ${height + 2})`)
        .call(d3.axisBottom(x))
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .select(".domain")
        .remove();

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0])
    
    const color = d3.scaleOrdinal()
        .domain(songSections)
        .range(d3.schemeDark2);
    
    const stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(songSections)
        (importanceAlbums)
    
    var Tooltip = chartImportance.append("text")
        .attr("x", 50)
        .attr("y", -10)
        .style("opacity", 0)
        .style("font-size", 15)
    
    var mouseover = function(d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this).style("stroke", "black").style("opacity", 1)
    }
    
    var mousemove = function(d, i) {
        Tooltip.text(songSections[i])
    }
    
    var mouseleave = function(d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    }
    
    var area = d3.area()
        .x(function(d) { return x(d.data.Album) + x.bandwidth() / 2; })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

    chartImportance.selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
    
    // const xScale = d3.scaleBand()
    //     .domain(songSections)
    //     .range([0, width])
    //     .padding(0.1);

    // const yScale = d3.scaleBand()
    //     .domain(importanceAlbums.map(d => d.Album))
    //     .range([0, height]);

    // const colorScale = d3.scaleSequential(d3.interpolateBlues)
    //     .domain([0, d3.max(importanceAlbums, d => d3.max(songSections, s => d[s]))]);

    // chartImportance.selectAll(".bar")
    //     .data(importanceAlbums)
    //     .enter()
    //     .append("g")
    //     .attr("class", "album")
    //     .attr("transform", d => `translate(0, ${yScale(d.Album)})`)
    //     .selectAll(".bar")
    //     .data(d => songSections.map(s => ({ section: s, value: d[s] })))
    //     .enter()
    //     .append("rect")
    //     .attr("class", "bar")
    //     .attr("x", d => xScale(d.section))
    //     .attr("y", 0)
    //     .attr("width", xScale.bandwidth())
    //     .attr("height", yScale.bandwidth())
    //     .style("fill", d => colorScale(d.value));

    // chartImportance.selectAll(".section-label")
    //     .data(songSections)
    //     .enter()
    //     .append("text")
    //     .attr("class", "section-label")
    //     .text(d => d)
    //     .attr("x", d => xScale(d) + xScale.bandwidth() / 2)
    //     .attr("y", height + 20)
    //     .style("text-anchor", "middle");

    // chartImportance.selectAll(".album-label")
    //     .data(importanceAlbums)
    //     .enter()
    //     .append("text")
    //     .attr("class", "album-label")
    //     .text(d => d.Album)
    //     .attr("x", -10)
    //     .attr("y", d => yScale(d.Album) + yScale.bandwidth() / 2)
    //     .style("font-size", "12px")
    //     .style("text-anchor", "end")
    //     .style("alignment-baseline", "middle");
}

const chartImportanceLine = svg_importance.append("g").attr("class", "chart");

function makeLineChartImportance() {
}

const chartImportanceSongs = svg_importance.append("g").attr("class", "chart");

function makeChartImportanceSongs() {

}

/**********************/
/******* scrollama    */
/**********************/ 

var scrolly_importance = main.select("#scrolly-importance");
var figure_importance = scrolly_importance.select("figure");
var step_importance = scrolly_importance.select("article").selectAll(".step");
var scroller_importance = scrollama();

// initialize chart
makeChartImportanceAlbums()

function handleStepEnter(response) {
    console.log(response);  // response = { element, index, direction }
    let currentIndex = response.index;

    // add color to current step only
    step_importance.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // update graph based on step
    switch(currentIndex) {
        case 0:
            break;
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
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