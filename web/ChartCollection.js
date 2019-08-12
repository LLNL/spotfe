
'use strict';

var ST = ST || {};
var runTable;



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

    data[z].buttons = data[z].data;
}

var number_of_authors = Object.keys(uniq_author_count).length;

data.forEach(function (d) {
    d.dd = dateFormatParser(d.date);
    d.month = d3.timeMonth(d.dd); // pre-calculate month for better performance
    //d.year = d3.timeYear(d.dd);
});


ST.ChartCollection = function() {
    //  Create Crossfilter Dimensions and Groups
    //  See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.

    var RenderChartCollection = function (the_data, layout_spec) {

        console.dir(the_data);
        var GLOB_DAT = the_data;
        //  ST.MakeNiceData.make( the_data );
        //          options.buckets = ['0-0.3', '0.3-0.6', '0.6-10', '10-15', '15-20'];

        $('.chart_container').html("");

        //  ST.ReturnedDataStub.data
        var ndx = crossfilter(the_data);
        var all = ndx.groupAll();

        ST.NDX = ndx;

        // Dimension by full date
        var dateDimension = ndx.dimension(function (d) {
            return dateFormatParser(d.date);
        });

        //  Do Layoutspec validation
        if (!layout_spec.charts) {

            var mes = layout_spec.chart ? "chart specification should be plural: charts, not chart.  " : "";
            alert(mes + '   <b>charts</b> is not defined in layout file.')
        }

        if (layout_spec.charts.length === undefined) {
            alert('Layout charts must be of type array.')
        }

        var layout_charts = layout_spec.charts;
        var original_lc = layout_charts; // $.extend(true, {}, layout_charts);

        console.dir(original_lc);

        ST.LayoutAugmenterModel.get(layout_charts, the_data);
        ST.UserPreferences.render();

        for (var dimension in layout_charts) {

            var spec = layout_charts[dimension];
            var viz = spec.viz;

            if (ST[viz] && ST[viz].render) {

                if( spec.show ) {
                    ST[viz].render(ndx, spec);
                }
            } else {
                console.log('Sorry.  Viz type viz=' + viz + ' is not supported.');
            }
        }


        var dataCount = dc.dataCount('.dc-data-count');
        runTable = dc.dataTable('.dc-data-table');

        dataCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
            .dimension(ndx)
            .group(all)
            // (_optional_) `.html` sets different html when some records or all records are selected.
            // `.html` replaces everything in the anchor with the html given using the following function.
            // `%filter-count` and `%total-count` are replaced with the values obtained.
            .html({
                some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll(); ST.UrlStateManager.remove_all_chart_pars();\'>Reset All</a>',
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

            if( tab.show ) {

                if (tab.type === "date") {

                    columns.push({
                        label: tab.label,
                        format: function (cali_obj, spec) {

                            console.dir(spec);

                            var dimension = this.label;
                            var val = cali_obj[ dimension ];

                            return ST.Utility.format_date(val);
                        }
                    });

                } else {

                    columns.push(tab.dimension);
                }
            }
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


        render_compare_arguments(the_data[0]);

        //  https://github.com/HamsterHuey/intothevoid.io/blob/master/code/2017/dcjs%20sortable%20table/dcjsSortableTable.html

        runTable
            .dimension(dateDimension)
            // Data table does not use crossfilter group but rather a closure
            // as a grouping function
            .group(function (d) {

                var format = d3.format('02d');
                var date = new Date(d.date * 1000);  // used to be epoch_date
                //return date.getFullYear() + '/' + format((date.getMonth() + 1));
                return 1;
            })
            // (_optional_) max number of records to be shown, `default = 25`
            .size(10000)    //  ST.params.max
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
                jQuery('.compare_button, .dc-table-column .drilldown').unbind('click').bind('click', ST.CallSpot.drilldown);

                bind_sort();
            });


        //simply call `.renderAll()` to render all charts on the page
        dc.renderAll();
        ST.BarChart.load_filter();
        ST.PieChart.load_filter();
        ST.LeftHorizontalBarChart.load_filter();

        dc.redrawAll();

        bind_sort();
    };


    var get_farr = function (fields) {

        var farr = ST.Utility.to_array(fields);

        farr.sort(function (a, b) {

            a = a.toLowerCase();
            b = b.toLowerCase();

            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }

            return 0;
        });

        return farr;
    };


    var render_compare_arguments = function (fields) {

        var options = "<option value=''></option>";
        var farr = get_farr(fields);

        for (var x = 0; x < farr.length; x++) {

            var field = farr[x];
            options += '<option value="' + field + '">' + field + '</option>';
        }

        //  '<a id="bookmarkme" href="javascript: void(0)" rel="sidebar">Bookmark</a>' +
        var ht = '<select class="xaxis">' + options + '</select>' +
            '<select class="groupby">' + options + '</select>' +
            '<div class="xaxis_label">Xaxis:</div>' +
            '<div class="groupby_label">Group By:</div>';

        $('.compare_arguments').html(ht);

        $('.compare_arguments .xaxis, .compare_arguments .groupby').unbind('change').bind('change', function () {

            var cla = $(this).attr('class');
            var val = $(this).val();
            val = val.replace(/#/, '');

            ST.UrlStateManager.update_url(cla, val);
        });

        var last_days = ST.Utility.get_param(ST.LAST_DAYS) || "";

        $('.launch_container').html('<div class="launcher">' +
            '<div class="days_label">launchdate days ago: </div>' +
            '<input type="text" class="launchdate_days_ago" value="' + last_days + '"/>' +
            '<div class="launch_button myButton">RELOAD</div>' +
            '</div>');

        $('.launch_button').unbind('click').bind('click', function () {

            var val = $('.launchdate_days_ago').val();
            ST.UrlStateManager.update_url("launchdate_days_ago", val);
            location.reload();
        });

        load_compare();
    };


    var load_compare = function () {

        var xaxis = ST.Utility.get_param('xaxis', true);
        var groupby = ST.Utility.get_param('groupby', true);

        if (xaxis !== 'undefined') {
            $('.compare_arguments .xaxis').val(xaxis);
        }

        if (groupby !== 'undefined') {
            $('.compare_arguments .groupby').val(groupby);
        }
    };


    var bind_sort = function () {

        //  for some reason, dc.js capitalizes column headings, thus messing up the sort
        //  reference when they click on the arrow click.
        var normalize_indexes_ = function (obj) {

            var nobj = {};

            for (var x in obj) {
                var lower = x.toLowerCase();
                nobj[lower] = obj[x];
            }

            return nobj;
        };


        $('.dc-data-table th').ArrowFunctions({
            arrow_click: function sort_me() {

                var target = $(event.target);
                var is_up = target.hasClass('up_arrow');
                var what_sort = target.parent().html();

                what_sort = what_sort.split('<')[0].toLowerCase();

                console.log("now sort by: " + what_sort);
                runTable.sortBy(function (d) {

                    var nobj = normalize_indexes_(d);

                    var col = "Region Balance";
                    return nobj[what_sort]; // d.date;
                })
                    .order(is_up ? d3.ascending : d3.descending);

                dc.renderAll();
                dc.redrawAll();

                bind_sort();
            }
        });
    };


    $.fn.ArrowFunctions = function (obj) {

        var arrows = "<div class='up_arrow'></div>" +
            "<div class='down_arrow'></div>";

        return this.each(function () {

            $(this).append(arrows);
            $(this).find('.up_arrow, .down_arrow').unbind('click').bind('click', obj.arrow_click);
        });
    };


    $(document).ready(function () {

        var file = ST.Utility.get_file();
        ST.Utility.init_params();

        help_icon_(file, ST.params);

        var layout = ST.params.layout ? ' --layout=' + ST.params.layout : "";

        ST.CallSpot.ajax({
            file: file,
            type: 'summary',
            layout: layout
        });
    });

    return {
        RenderChartCollection: RenderChartCollection,
        bind_sort: bind_sort
    }
}();