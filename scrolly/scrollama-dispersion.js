/**********************/
/******* d3           */
/**********************/ 

const words = Object.keys(dispersionAlbums[0]).filter(word => word !== "Album");
const albums = dispersionAlbums.map(d => d.Album);
const songs = dispersionSongs.map(d => d.Song);

const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 8]);
const rectangle_height = height / words.length

const svg_dispersion = d3.select("#viz-dispersion")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const chartDispersionAlbums = svg_dispersion.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

function makeChartDispersionAlbums() {
    const rectangle_width = width / albums.length;

    chartDispersionAlbums.selectAll("rect")
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

    chartDispersionAlbums.selectAll("text")
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

    chartDispersionAlbums.append("g")
        .selectAll("text")
        .data(albums)
        .enter()
        .append("text")
        .text(d => d)
        .attr("x", (d, i) => i * rectangle_width + rectangle_width / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-size", "12px");

    chartDispersionAlbums.append("g")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .text(d => d)
        .attr("x", -10)
        .attr("y", (d, i) => i * rectangle_height + rectangle_height / 2)
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle");
}

const chartDispersionSongs = svg_dispersion.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

const songsPerAlbum = {};
dispersionSongs.forEach(song => {
    const album = song.Album;
    if (songsPerAlbum[album]) {
        songsPerAlbum[album] += 1;
    } else {
        songsPerAlbum[album] = 1;
    }
});

let cumulativeSongsCount = 0;
const cumulativeSongs = {};
for (const album in songsPerAlbum) {
    cumulativeSongsCount += songsPerAlbum[album];
    cumulativeSongs[album] = cumulativeSongsCount;
}

function makeChartDispersionSongs() {
    const rectangle_width = width / songs.length;

    chartDispersionSongs.selectAll()
        .data(dispersionSongs)
        .enter()
        .append("g")
        .selectAll()
        .data(d => words.map(w => ({ album: d.Album, song: d.Song, word: w, count: d[w] })))
        .enter()
        .append("rect")
        .attr("x", (d, i) => songs.indexOf(d.song) * rectangle_width)
        .attr("y", (d, i) => i * rectangle_height)
        .attr("width", rectangle_width)
        .attr("height", rectangle_height)
        .style("fill", d => colorScale(d.count));
    
    chartDispersionSongs.selectAll()
        .data(dispersionSongs)
        .enter()
        .selectAll()
        .data((d, i, data) => [{ song: d.Song, isLastSong: (i === data.length - 1) || (data[i + 1].__data__.Album !== d.Album) }] )
        .enter()
        .filter((d, i, data) => {
            if (d.isLastSong && d.song !== songs[songs.length - 1]) {
              return true;
            }
            return false;
        })
        .append("line")
        .attr("x1", d => (songs.indexOf(d.song) + 1) * rectangle_width)
        .attr("x2", d => (songs.indexOf(d.song) + 1) * rectangle_width)
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "grey")
        .style("stroke-width", 1);
    
    chartDispersionSongs.append("g")
        .selectAll("text")
        .data(albums)
        .enter()
        .append("text")
        .text(d => d)
        .attr("x", d => cumulativeSongs[d] * rectangle_width - (songsPerAlbum[d] * rectangle_width))
        .attr("y", -10)
        .style("text-anchor", "start")
        .style("font-size", "12px");

    chartDispersionSongs.append("g")
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .text(d => d)
        .attr("x", -10)
        .attr("y", (d, i) => i * rectangle_height + rectangle_height / 2)
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle");
}

/**********************/
/******* scrollama    */
/**********************/

var scrolly_dispersion = main.select("#scrolly-dispersion");
var figure_dispersion = scrolly_dispersion.select("figure");
var step_dispersion = scrolly_dispersion.select("article").selectAll(".step");
var scroller_dispersion = scrollama();

// initialize charts
makeChartDispersionAlbums()
makeChartDispersionSongs()
toggleChart(chartDispersionAlbums, chartDispersionSongs)

function handleStepEnter(response) {
    console.log(response);  // response = { element, index, direction }
    let currentIndex = response.index;

    // add color to current step only
    step_dispersion.classed("is-active", function(d, i) {
        return i === currentIndex;
    });

    // update graph based on step
    switch(currentIndex) {
        case 0:
            toggleChart(chartDispersionAlbums, chartDispersionSongs)

            break;
        case 1:
            toggleChart(chartDispersionSongs, chartDispersionAlbums)
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
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