
var dirme = function( cali ) {

    var dir = "/usr/gapps/wf/web/spot/data/lulesh_minimal/";
    return dir + " " + cali + ' ';
};

var get_dirs_ = function() {

    var calis = localStorage.getItem('calis');
    var spi = calis.split(' ');

    spi = spi.splice(0,68);
    calis = spi.join(' ');
    return calis;

    //var calis = ST.Utility.get_param("calis");
    //return calis;
};


$(document).ready(  function() {

    var dirs = dirme("180926-171347_114610_dFcHlCXdiuQG.cali") +
                dirme("180926-171354_114737_llIMtdhrtFBl.cali") +
                dirme("180926-171351_45280_H6AUaDgoCQ0n.cali") +
                dirme("180926-171348_171822_1yPFpzkcG7G3.cali");

    dirs = get_dirs_();
    console.dir(dirs);

    //var dir = "/usr/gapps/wf/web/spot/data/lulesh_maximal/";

    var dir = ST.Utility.get_param('directory');
    var predir = " " + dir + " --filenames ";
    var command = ST.Utility.get_param('command');
    command = decodeURIComponent(command);

    ST.CallSpot.ajax({
        file: predir + dirs,
        command: command,
        type: 'hierarchical',
        success: init
    });
});


var init = function( dat ) {

    if( dat.error ) {
        $('body').append( '<span class="error">' + dat.error + '</span>');
    }

    const data = JSON.parse(dat.output.command_out);// put data from server here obtained from "spot.py durations2 <filepath1> [filepath2]*"

    console.dir(data);

    var xaxis = localStorage.getItem('xaxis');
    var groupby = localStorage.getItem('groupby');

    console.log('xaxis=' + xaxis + '   groupby=' + groupby);


// elm init from main.js
    let app = Elm.Main.init(
        {
            node: document.querySelector('#durations-chart'),
        //    flags: {rootName: data.durationLists[0].funcPath.split('/').shift()}
        })

    app.ports.setData.send(data);

    /*
// stratify incoming data
    const stratFunc = d3.stratify()
        .id(d => d.funcPath.split("/").pop())
        .parentId(d => d.funcPath.split("/").slice(-2, -1))
    const stratData = stratFunc(data.durationLists)


    function setSeriesList(parentPath) {
        let node = stratData
        // set node to parentpath node by walking path
        parentPath.split('/').slice(1).forEach(childId => node = node.children.find(node => node.id == childId))

        //format children nodes for display
        const seriesList = node.children.map(
            child => ({
                name: child.id + (child.height ? '*' : '')
                , data: child.data.durationList.map(
                    duration => ({
                        y: duration
                        , drilldown: child.height
                        , key: child.data.funcPath
                    }))
            })
        )
        // sets series on chart
        while (myChart.series.length > 0) myChart.series[0].remove(false)
        for (let series of seriesList) myChart.addSeries(series, false)
        myChart.redraw()
    }

    function onDrilldown(event) {
        if (event.points) {  // x-axis date clicked
            console.log('event', event)
            setSankey(event.point.category)
        } else { // chart area clicked
            const path = event.point.options.key
            setPath(path)
        }
    }

// to elm
    function setPath(pathName) {
        app.ports.setPath.send(pathName)
    }

    function setSankey(filename) {
        //builds a function that takes your data and creates the (links, nodes) data for a SVG sankey graph
        const index = data.filepaths.findIndex(filepath => filepath.endsWith(filename))
        const sankeyGraphFunc = d3.sankey()
            .nodeAlign(d3.sankeyCenter)
            .nodeWidth(13)
            .nodePadding(10)
            .links((durationLists, index) =>
                durationLists.map(({durationList, funcPath}) => {
                    let pathArray = funcPath.split('/')
                    if (pathArray.length > 1) {
                        return {
                            source: pathArray.slice(0, -1).join("/"),
                            target: funcPath,
                            value: durationList[index]
                        }
                    }
                }).filter(d => d != undefined)
            )
            .nodeId(d => d.funcPath)
            .nodes(durationLists => durationLists.map(durationList => ({funcPath: durationList.funcPath})))
            .extent([[1, 1], [1200 - 10, 600 - 10]])

        // builds a function that creates link paths for svg sankey
        const horizLink = d3.sankeyLinkHorizontal()

        //finally process a sankdey given a file (index)
        const graph = sankeyGraphFunc(data.durationLists, index)
        graph.links = graph.links.map(link => ({
            dPath: horizLink(link)
            , sourceFuncPath: link.source.funcPath
            , targetFuncPath: link.target.funcPath
            , width: link.width
        } ))
        graph.nodes = graph.nodes.map(node => ({
            x0: node.x0
            , y0: node.y0
            , x1: node.x1
            , y1: node.y1
            , funcPath: node.funcPath
        }))
        graph.filename = filename

        app.ports.setSankey.send(graph)
    }


// from elm
    app.ports.updateChartSeries.subscribe(setSeriesList)

// options for chart.  div#chartElementId is rendered in the Elm app
    var myChart = Highcharts.chart('chartElementId', {
            chart: {
                type: 'area',
                zoomType: 'xy',
                resetZoomButton: {
                    theme: {
                        fill: 'black',
                        stroke: 'silver',
                        r: 10,
                        style: {color: 'white'},
                        states: {
                            hover: {
                                fill: '#41739D',
                                style: {
                                    color: 'white'
                                }
                            }
                        }
                    }
                },
                events: {
                    drilldown: onDrilldown
                }
            },
            // dont show drillup button (off screen)
            drilldown: {drillUpButton: {position: {x: -100, y: -100}}},

            plotOptions: {
                series: {
                    marker: {
                        enabled: false,
                        radius: 2
                    },
                    stacking: 'normal',
                },
                area: {
                    trackByArea: true
                } //allows clicking on area to drilldown
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.y}</b><br/>',
                split: true
            },
            credits: {
                enabled: false
            },
            title: {
                text: data.filepaths[0].slice(0, data.filepaths[0].lastIndexOf('/'))
            },
            xAxis: {
                categories: data.filepaths.map(fp => fp.split('/').pop()),
                title: {text: "cali filename"}
            },
            yAxis: [{ // time axis
                title: {
                    text: "duration"
                }
            },
            ],
        }
    );*/


};