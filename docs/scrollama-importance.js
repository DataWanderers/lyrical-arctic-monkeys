/**********************/
/******* d3           */
/**********************/

const svg_importance = d3.select("#viz-importance")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(0, ${margin.right})`);

const colorMap = d3.scaleOrdinal()
    .domain(["Intro", "Verse", "Pre-Chorus", "Chorus", "Post-Chorus", "Bridge", "Instrumental", "Outro"])
    .range(d3.schemeCategory10);

const y = d3.scaleLinear().domain([0, 100]).range([height, 0])

const chartImportance = svg_importance.append("g").attr("class", "chart");

function makeChartImportanceAlbums() {
    const songSections = Object.keys(importanceAlbums[0]).filter(key => key !== "Album");
    
    const x = d3.scaleBand()
        .domain(importanceAlbums.map(d => d.Album))
        .range([0, width + margin.left])
        .padding(0.3);
    
    const stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(songSections)
        (importanceAlbums)
    
    chartImportance.selectAll("text").remove();

    var Tooltip = chartImportance.append("text")
        .attr("x", 50)
        .attr("y", -10)
        .style("opacity", 0)
        .style("font-size", 15)
    
    var area = d3.area()
        .x(function(d) { return x(d.data.Album) + x.bandwidth() / 2; })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

    chartImportance.selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return colorMap(d.key); })
        .attr("d", area)
        .on("mouseover", function(d) { mouseover(d, Tooltip, this); })
        .on("mousemove", function(d, i) { mousemove(d, i, Tooltip, songSections); })
        .on("mouseleave", function(d) { mouseleave(d, Tooltip); });
    
    chartImportance.append("g")
        .attr("transform", `translate(0, ${height + 1})`)
        .call(d3.axisBottom(x))
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .select(".domain")
        .remove();
}

const chartImportanceSongs = svg_importance.append("g").attr("class", "chart");

function makeChartImportanceSongs(album) {
    const importanceSongsAlbum = importanceSongs.filter(d => d.Album === album);
    
    const songSections = Object.keys(importanceSongs[0]).filter(key => (key !== "Album") && (key !== "Song"));

    const x = d3.scaleBand()
        .domain(importanceSongsAlbum.map(d => d.Song))
        .range([0, width + margin.left])
        .padding(0.3);

    const stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(songSections)
        (importanceSongsAlbum)

    chartImportanceSongs.selectAll("text").remove();

    var Tooltip = chartImportanceSongs.append("text")
        .attr("x", 50)
        .attr("y", -10)
        .style("opacity", 0)
        .style("font-size", 15)

    var area = d3.area()
        .x(function(d) { return x(d.data.Song) + x.bandwidth() / 2; })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

    chartImportanceSongs.selectAll(".myArea").remove();
    chartImportanceSongs.selectAll(".Xaxis").remove();

    chartImportanceSongs.selectAll()
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return colorMap(d.key); })
        .attr("d", area)
        .on("mouseover", function(d) { mouseover(d, Tooltip, this); })
        .on("mousemove", function(d, i) { mousemove(d, i, Tooltip, songSections); })
        .on("mouseleave", function(d) { mouseleave(d, Tooltip); });

    const maxLabelLength = 8;
    chartImportanceSongs.append("g")
        .attr("transform", `translate(0, ${height + 1})`)
        .call(d3.axisBottom(x))
        .attr("class", "Xaxis")
        .style("font-size", "10px")
        .selectAll("text")
        .text(function(d) {
            const label = d3.select(this).text();
            if (label.length > maxLabelLength) {
                return label.slice(0, maxLabelLength) + "...";
            }
            return label;
        })
        .style("text-anchor", "middle");

    chartImportanceSongs.select(".domain").remove();
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
            toggleChart(chartImportance, chartImportanceSongs)

            break;
        case 1:
            toggleChart(chartImportanceSongs, chartImportance)

            makeChartImportanceSongs("Favourite WN")
            break;
        case 2:
            makeChartImportanceSongs("Suck It and See")
            break;
        case 3:
            makeChartImportanceSongs("AM")
            break;
        case 4:
            toggleChart(chartImportanceSongs, chartImportance)  // needed in case of a refresh when at bottom of page

            makeChartImportanceSongs("The Car")
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
    // 3. bind scrollama event handlers
    scroller_importance
        .setup({
            step: "#scrolly-importance article .step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    // setup resize event
    window.addEventListener("resize", function() { handleResize(scroller_importance, figure_importance, step_importance); });
}

// kick things off
init();