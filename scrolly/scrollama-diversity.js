/**********************/
/******* d3           */
/**********************/ 

const svg_diversity = d3.select("#viz-diversity")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const colorScale_diversity = d3.scaleOrdinal()
    .domain(["Minimum", "Median", "Maximum", "Diversity"])
    .range(["blue", "orange", "red", "green"]);

const x = d3.scaleLinear().domain([0, 100]).range([0, width]);

const chartDiversity = svg_diversity.append("g").attr("class", "chart");

function makeChartDiversityAlbums() {
    const keys = ["Minimum", "Median", "Maximum"];

    chartDiversity.append("g")
        .attr("transform", `translate(0, ${height})`)    
        .call(d3.axisBottom(x));

    chartDiversity.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .style("text-anchor", "middle")
        .text("Lexical diversity (%)");

    const y = d3.scaleBand()
        .domain(diversityAlbums.map(d => d.Album))
        .range([0, height])
        .padding(0.3);

    const yAxis = chartDiversity.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "Yaxis")
        .style("font-size", "12px");

    yAxis.selectAll("text")
        .attr("album", d => d)
        .style("opacity", 1.0);

    diversityAlbums.forEach(d => {
        chartDiversity.append("line")
            .attr("class", "line")
            .attr("album", d.Album)
            .attr("x1", x(d.Minimum))
            .attr("x2", x(d.Maximum))
            .attr("y1", y(d.Album) + y.bandwidth() / 2)
            .attr("y2", y(d.Album) + y.bandwidth() / 2)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("display", "block")
            .transition()
            .duration(1000);

        keys.forEach(key => {
            chartDiversity.append("circle")
                .attr("class", "circle")
                .attr("album", d.Album)
                .attr("cx", x(d[key]))
                .attr("cy", y(d.Album) + y.bandwidth() / 2)
                .attr("r", 5)
                .style("fill", colorScale_diversity(key))
                .style("display", "block")
                .transition()
                .duration(1000);
        });
    });
}

const chartDiversitySongs = svg_diversity.append("g").attr("class", "chart");

chartDiversitySongs.append("g")
    .attr("transform", `translate(0, ${height})`)    
    .call(d3.axisBottom(x));

chartDiversitySongs.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 5)
    .style("text-anchor", "middle")
    .text("Lexical diversity (%)");

function makeChartDiversitySongs(album) {
    const keys = ["Diversity"]
    const diversitySongsAlbum = diversitySongs.filter(d => d.Album === album);

    const y = d3.scaleBand()
        // .domain(diversitySongsAlbum.map(d => (d.Song.length > 14) ? d.Song.substring(0, 14) + "..." : d.Song))
        .domain(diversitySongsAlbum.map(d => d.Song))
        .range([0, height])
        .padding(0.3);

    chartDiversitySongs.selectAll(".Yaxis").remove();
    chartDiversitySongs.selectAll(".circle").remove();

    chartDiversitySongs.append("g")
        .call(d3.axisLeft(y))
        .attr("class", "Yaxis")
        .style("font-size", "12px")
        .style("font-style", "italic")
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "1.1em");

    diversitySongsAlbum.forEach(d => {
        keys.forEach(key => {
            chartDiversitySongs.append("circle")
                .attr("class", "circle")
                .attr("cx", x(d[key]))
                .attr("cy", y(d.Song) + y.bandwidth() / 2)
                .attr("r", 5)
                .style("fill", colorScale_diversity(key))
                .style("display", "block")
                .transition()
                .duration(1000);
        });
    });
}

function toggleElementsVisibility(chart, show, albumsToShow) {
    chart.selectAll(".line")
        .filter(function() {
            return albumsToShow.includes(d3.select(this).attr("album"));
        })
        .style("display", show ? "block" : "none");

    chart.selectAll(".circle")
        .filter(function() {
            return albumsToShow.includes(d3.select(this).attr("album"));
        })
        .style("display", show ? "block" : "none");

    chart.selectAll(".Yaxis")
        .selectAll("text")
        .filter(function() {
            return albumsToShow.includes(d3.select(this).attr("album"));
        })
        .style("opacity", show ? 1.0 : 0.2);
}

function toggleChart(chart1, chart2) {  // chart1 is on, chart2 is off
    chart1.style("display", "block");
    chart2.style("display", "none");
}

/**********************/
/******* scrollama    */
/**********************/

var scrolly_diversity = main.select("#scrolly-diversity");
var figure_diversity = scrolly_diversity.select("figure");
var step_diversity = scrolly_diversity.select("article").selectAll(".step");
var scroller_diversity = scrollama();

// initialize chart
makeChartDiversityAlbums(chartDiversity)

function handleStepEnter(response) {
    console.log(response);  // response = { element, index, direction }
    let currentIndex = response.index;

    // add color to current step only
    step_diversity.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // update graphic based on step
    switch(currentIndex) {
        case 0:
            toggleElementsVisibility(chartDiversity, true, ["WPSIATWIN", "Favourite WN", "Humbug", "Suck It and See", "AM", "TBH & Casino", "The Car"])
            break;
        case 1:
            toggleChart(chartDiversity, chartDiversitySongs)

            toggleElementsVisibility(chartDiversity, false, ["Favourite WN", "Humbug", "Suck It and See", "AM", "TBH & Casino", "The Car"])
            toggleElementsVisibility(chartDiversity, true, ["WPSIATWIN"])
            break;
        case 2:
            toggleChart(chartDiversitySongs, chartDiversity)

            makeChartDiversitySongs("WPSIATWIN")
            break;
        case 3:
            toggleChart(chartDiversity, chartDiversitySongs)

            toggleElementsVisibility(chartDiversity, false, ["WPSIATWIN", "Favourite WN", "Humbug", "Suck It and See", "TBH & Casino", "The Car"])
            toggleElementsVisibility(chartDiversity, true, ["AM"])
            break;
        case 4:
            toggleChart(chartDiversitySongs, chartDiversity)

            makeChartDiversitySongs("AM")
            break;
        case 5:
            toggleChart(chartDiversity, chartDiversitySongs)

            toggleElementsVisibility(chartDiversity, false, ["AM"])
            toggleElementsVisibility(chartDiversity, true, ["The Car"])
            break;
        case 6:
            toggleChart(chartDiversitySongs, chartDiversity)

            makeChartDiversitySongs("The Car")
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