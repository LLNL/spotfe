//# dc.js Getting Started and How-To Guide
'use strict';

var ST = ST || {};
var nasdaqTable;

var reduce_authors = function( data ) {

    for( var z=0; z < data.length; z++ ) {

        var rt = Math.floor((data[z].end - data[z].start)/3600);
        var mod = rt + 10;
        data[z].author = data[z % mod].author;
    }
};


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

        //  hack it for now, so that they can do the SE Paper on time.
        var demo_mode = 1;
        if( demo_mode ) {

        }


    }

    var number_of_authors = Object.keys(uniq_author_count).length;

    data.forEach(function (d) {
        d.dd = dateFormatParser(d.date);
        d.month = d3.timeMonth(d.dd); // pre-calculate month for better performance
        //d.year = d3.timeYear(d.dd);
    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.

var RenderChartCollection = function( the_data, layout_spec ) {

    console.dir( the_data );
//    ST.MakeNiceData.make( the_data );

    //  ST.ReturnedDataStub.data
    var ndx = crossfilter( the_data );
    var all = ndx.groupAll();


    // Dimension by full date
    var dateDimension = ndx.dimension(function (d) {
        return dateFormatParser(d.date);
        //return d.dd;
    });


    var layout_charts = layout_spec.charts;

    ST.LayoutAugmenterModel.get(layout_charts);


    var RENDER_GENERIC = true;

    if (RENDER_GENERIC) {

        for (var dimension in layout_charts) {

            var spec = layout_charts[dimension];
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

    // Create chart objects associated with the container elements identified by the css selector.
    // Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
    // filtered by other page controls.
    var nasdaqCount = dc.dataCount('.dc-data-count');
    nasdaqTable = dc.dataTable('.dc-data-table');

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
    for (var z in layout_spec.table) {

        var tab = layout_spec.table[z];
        columns.push(tab.dimension);
    }

    columns.push({
        label: 'Operations',
        format: function (d) {

            var buts = "";

            for (var x in d.drilldown) {

                var but = d.drilldown[x];
                buts += '<div run_id="' + d.run_id + '" class="drilldown myButton">' + but.toUpperCase() + '</div>';
            }

            var hidden = '<div class="hidden key">' + d.key + '</div>';

            return buts + hidden;
        }
    });


    //  https://github.com/HamsterHuey/intothevoid.io/blob/master/code/2017/dcjs%20sortable%20table/dcjsSortableTable.html

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

            var col = "runtime"; // "Region Balance";
            return d[col]; // d.date;
        })
        // (_optional_) sort order, `default = d3.ascending`
        .order(d3.ascending)
        // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
        .on('renderlet', function (table) {

            table.selectAll('.dc-table-group').classed('info', true);

            //  Make this happen after the render table.
            jQuery('.myButton').unbind('click').bind('click', ST.CallSpot.drilldown );

            bind_sort();
        });


    //simply call `.renderAll()` to render all charts on the page
    dc.renderAll();
    ST.BarChart.load_filter();
    ST.PieChart.load_filter();
    ST.LeftHorizontalBarChart.load_filter();

    dc.redrawAll();
    /*
     // Or you can render charts belonging to a specific chart group
     dc.renderAll('group');
     // Once rendered you can call `.redrawAll()` to update charts incrementally when the data
     // changes, without re-rendering everything
     dc.redrawAll();
     // Or you can choose to redraw only those charts associated with a specific chart group
     dc.redrawAll('group');
     */

    //Determine the current version of dc with `dc.version`
    d3.selectAll('#version').text(dc.version);


    var byDate = ndx.dimension(function (d) {
        return d.date;
    });

    var table_data = byDate.top(Infinity);
    console.dir(table_data);

    bind_sort();
};


var bind_sort = function() {

    $('.dc-data-table th').ArrowFunctions({
        arrow_click: function sort_me() {

            var target = $(event.target);
            var is_up = target.hasClass('up_arrow');
            var what_sort = target.parent().html();

            what_sort = what_sort.split('<')[0];

            console.log("now sort by: " + what_sort);
            nasdaqTable.sortBy( function(d) {

                var col = "Region Balance";
                return d[what_sort]; // d.date;
            })
                .order( is_up ? d3.ascending : d3.descending );

            dc.renderAll();
            dc.redrawAll();

            bind_sort();
        }
    });
};


$.fn.ArrowFunctions = function( obj ) {

    var arrows = "<div class='up_arrow'></div>" +
        "<div class='down_arrow'></div>";

    return this.each( function() {

        $(this).append(arrows);
        $(this).find('.up_arrow, .down_arrow').unbind('click').bind('click', obj.arrow_click );
    });
};


var help_icon_ = function( file, params ) {

    var urls = [
        "https://rzlc.llnl.gov/spot/dcvis/web/?sf=/usr/gapps/spot/datasets/jit_data&layout=/usr/gapps/spot/datasets/jit.json",
        "https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/global/web-pages/lc/www/spot/lulesh2small",
        //Asperational: https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/global/web-pages/lc/www/spot/lulesh2small&machine=oslic&command=/usr/tce/bin/python3%20/usr/global/web-pages/lc/www/spot/spot.py&get_rundata_url=https://lc.llnl.gov/lorenz/lora/lora.cgi/command/oslic",
        "https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/gapps/spot/datasets/lulesh2small&layout=/usr/gapps/spot/datasets/enhanced_layout.json",
        "https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/gapps/spot/datasets/lulesh2small&layout=/g/g0/pascal/enhanced_layout_label.json"
    ];

    var working_html = "";

    for( var x = 0; x < urls.length; x++ ) {

        var url = urls[x];
        working_html += '<div><a href="' + url + '" target="_blank">' + url + '</a></div>';
    }

    Vue.component('help-section', {
        data: function () {
            return {
                seen: false,
                max: params.max,
                file: file,
                machine: params.machine,
                layout: params.layout,
                get_rundata_url: params.get_rundata_url,
                command: params.command
            }
        },
        template: '<div>' +
        '<div class="help_icon" v-on:click="seen=(!seen)">?</div>\
        <div class="help_body" v-if="seen">\
        Using file: <span class="txt">{{ file }}</span>\
        <br>Using max: <span class="max">{{ max }}</span>\
        <br>Using machine: <span class="machine">{{ machine }}</span>\
        <br>Using layout: <span class="machine">{{ layout }}</span>\
        <br>Using get_rundata_url URL: <span class="machine">{{ get_rundata_url }}</span>\
        <br>Using command: <span class="machine">{{ command }}</span>\
        <br>You can specify the <b>s</b>pot <b>f</b>ile with sf= in the url bar.\
        <br>You can specify the <b>max</b> with max= in the url bar.\
        <br>You can specify the <b>machine</b> with machine= in the url bar. \
        <br>You can specify the <b>layout</b> with layout= in the url bar. \
        <br>You can specify the <b>get_rundata_url</b> with get_rundata_url= in the url bar.\
        <br>You can specify the <b>command</b> with command= in the url bar.\
        \
        <br><a href="../web/doc.html" target="_blank">more...</a> \
        <div>Some Working Urls</div>' +
        working_html + '</div> ' +
        '</div>',
        methods: {
        }
    });

    //  Need to find the dc.js end event handler.
    new Vue({
        el: "#help_icon"
    });
};

$(document).ready( function() {

    var file = ST.Utility.get_file();
    ST.Utility.init_params();

    help_icon_(file, ST.params );

    var layout = ST.params.layout ? ' --layout=' + ST.params.layout : "";

    ST.CallSpot.ajax({
        file: file,
        type: 'summary',
        layout: layout
    });
});
