//# dc.js Getting Started and How-To Guide
'use strict';

var ST = ST || {};

/* jshint globalstrict: true */
/* global dc,d3,crossfilter */

// ### Create Chart Objects

// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.
var nasdaqCount = dc.dataCount('.dc-data-count');
var nasdaqTable = dc.dataTable('.dc-data-table');

// ### Anchor Div for Charts
/*
// A div anchor that can be identified by id
    <div id='your-chart'></div>
// Title or anything you want to add above the chart
    <div id='chart'><span>Days by Gain or Loss</span></div>
// ##### .turnOnControls()

// If a link with css class `reset` is present then the chart
// will automatically hide/show it based on whether there is a filter
// set on the chart (e.g. slice selection for pie chart and brush
// selection for bar chart). Enable this with `chart.turnOnControls(true)`

// dc.js >=2.1 uses `visibility: hidden` to hide/show controls without
// disrupting the layout. To return the old `display: none` behavior,
// set `chart.controlsUseVisibility(false)` and use that style instead.
    <div id='chart'>
       <a class='reset'
          href='javascript:myChart.filterAll();dc.redrawAll();'
          style='visibility: hidden;'>reset</a>
    </div>
// dc.js will also automatically inject the current filter value into
// any html element with its css class set to `filter`
    <div id='chart'>
        <span class='reset' style='visibility: hidden;'>
          Current filter: <span class='filter'></span>
        </span>
    </div>
*/

//### Load your data

var reduce_authors = function( data ) {

    for( var z=0; z < data.length; z++ ) {

        var rt = Math.floor((data[z].end - data[z].start)/3600);
        var mod = rt + 10;
        data[z].author = data[z % mod].author;
    }
};

//Data can be loaded through regular means with your
//favorite javascript library
//
//```javascript
//d3.csv('data.csv').then(function(data) {...});
//d3.json('data.json').then(function(data) {...});
//jQuery.getJson('data.json', function(data){...});
//```
    // Since its a csv file we need to format the data a bit.
    var dateFormatSpecifier = '%m/%d/%Y';
    var dateFormat = d3.timeFormat(dateFormatSpecifier);
    var dateFormatParser = d3.timeParse(dateFormatSpecifier);
    ST.numberFormat = d3.format('.2f');


    var data = SPOT_DATA.runs;

    //  Reduce # of authors
    //reduce_authors(data);

    var uniq_author_count = {};

    for( var z=0; z < data.length; z++ ) {

        uniq_author_count[data[z].author] = 1;

        var spot_date = new Date( data[z].start * 1000 );

        var month = spot_date.getMonth() + 1;
        var day = spot_date.getDate();
        var year = spot_date.getFullYear();

        data[z].date = month + "/" + day + "/" + year;
        data[z].year = year;

        var diff = data[z].end - data[z].start;

        data[z].runtime = parseInt(diff/3600);
        data[z].runtime2 = parseInt(diff/1200);

        var mult = data[z].program === "umt" ? 2 : 1;
        data[z].thermal = data[z].runtime * mult * 3; //data[z].runtime > 11 ? 500 : 50; //parseInt(Math.random()*500);
        data[z].scientific_performance = parseInt(z);

        data[z].figure_of_merit = data[z].scientific_performance / (data[z].runtime || 1) * 6;

        data[z].thermal_variance = (data[z].runtime >= 8) ? "Above" : "Below";

//        data[z].buttons = data[z].buttons || (Math.random() * 4 > 2 ? ["ravel", "vale43d", "spot"] : ["spot"]);
        data[z].buttons = data[z].data;
    }

    var number_of_authors = Object.keys(uniq_author_count).length;

    data.forEach(function (d) {
        d.dd = dateFormatParser(d.date);
        d.month = d3.timeMonth(d.dd); // pre-calculate month for better performance
        //d.year = d3.timeYear(d.dd);
    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.

var RenderChartCollection = function( the_data ) {

    //  ST.ReturnedDataStub.data
    var ndx = crossfilter( the_data );
    var all = ndx.groupAll();


    // Dimension by full date
    var dateDimension = ndx.dimension(function (d) {
        return dateFormatParser(d.date);
        //return d.dd;
    });


    //  this will eventually come from the BE.
    var layout_spec = ST.ReturnedDataStub.layout.charts;

    ST.LayoutAugmenterModel.get(layout_spec);


    var RENDER_GENERIC = true;

    if (RENDER_GENERIC) {

        for (var dimension in layout_spec) {

            var spec = layout_spec[dimension];
            var viz = spec.viz;

            if (ST[viz] && ST[viz].render) {

                ST[viz].render(ndx, spec);
            } else {
                console.log('Sorry.  Viz type viz=' + viz + ' is not supported.');
            }

        }

    } else {

        ST.BubbleChart.render(ndx);

        ST.PieChart.render(ndx, {
            title: "Thermal Variance",
            iterator_attribute: "thermal_variance",
            inner_radius: 30
        });

        ST.PieChart.render(ndx, {
            title: "Program",
            iterator_attribute: "program",
            inner_radius: 0
        });


        ST.HorizontalBarChart.render();
        ST.BarChart.render(ndx);
        ST.LineChart.render(ndx, {
            width: 900,
            height: 200
        });
    }

    //#### Data Count

    // Create a data count widget and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Data Count Widget](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#data-count-widget)
    //
    //```html
    //<div class='dc-data-count'>
    //  <span class='filter-count'></span>
    //  selected out of <span class='total-count'></span> records.
    //</div>
    //```

    nasdaqCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
        .dimension(ndx)
        .group(all)
        // (_optional_) `.html` sets different html when some records or all records are selected.
        // `.html` replaces everything in the anchor with the html given using the following function.
        // `%filter-count` and `%total-count` are replaced with the values obtained.
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
            ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });

    //#### Data Table

    // Create a data table widget and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Data Table Widget](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#data-table-widget)
    //
    // You can statically define the headers like in
    //
    // ```html
    //    <!-- anchor div for data table -->
    //    <div id='data-table'>
    //       <!-- create a custom header -->
    //       <div class='header'>
    //           <span>Date</span>
    //           <span>Open</span>
    //           <span>Close</span>
    //           <span>Change</span>
    //           <span>Volume</span>
    //       </div>
    //       <!-- data rows will filled in here -->
    //    </div>
    // ```
    // or do it programmatically using `.columns()`.
    var columns = [];
    for (var z in ST.ReturnedDataStub.layout.table) {

        var tab = ST.ReturnedDataStub.layout.table[z];
        columns.push(tab.dimension);
    }

    columns.push({
        label: 'Operations',
        format: function (d) {

            var buts = "";

            for (var x in d.drilldown) {

                var but = d.drilldown[x];
                buts += '<div class="myButton">' + but.toUpperCase() + '</div>';
            }

            return buts;
        }
    });


    nasdaqTable
        .dimension(dateDimension)
        // Data table does not use crossfilter group but rather a closure
        // as a grouping function
        .group(function (d) {

            var format = d3.format('02d');
            var date = new Date(d.epoch_date * 1000);
            return date.getFullYear() + '/' + format((date.getMonth() + 1));
        })
        // (_optional_) max number of records to be shown, `default = 25`
        .size(250)
        // There are several ways to specify the columns; see the data-table documentation.
        // This code demonstrates generating the column header automatically based on the columns.
        .columns(columns)

        // (_optional_) sort using the given field, `default = function(d){return d;}`
        .sortBy(function (d) {
            return d.date;
        })
        // (_optional_) sort order, `default = d3.ascending`
        .order(d3.ascending)
        // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
        .on('renderlet', function (table) {
            table.selectAll('.dc-table-group').classed('info', true);

            //  Make this happen after the render table.
            jQuery('.myButton').unbind('click').bind('click', function () {

                var subject = $(this).html().toLowerCase();

                if (subject === 'mpi') {

                    //  http://localhost:8888
                    window.open('../ravel/index.html');
                }
            });
        });


    //simply call `.renderAll()` to render all charts on the page
    dc.renderAll();
    /*
     // Or you can render charts belonging to a specific chart group
     dc.renderAll('group');
     // Once rendered you can call `.redrawAll()` to update charts incrementally when the data
     // changes, without re-rendering everything
     dc.redrawAll();
     // Or you can choose to redraw only those charts associated with a specific chart group
     dc.redrawAll('group');
     */


//#### Versions

//Determine the current version of dc with `dc.version`
    d3.selectAll('#version').text(dc.version);
};
