
'use strict';

var ST = ST || {};
var runTable;

var SHOW_MORE_INCREASE = 100;
ST.MAX_SHOW = SHOW_MORE_INCREASE;


var dateFormatSpecifier = '%m/%d/%Y';
var dateFormat = d3.timeFormat(dateFormatSpecifier);
var dateFormatParser = d3.timeParse(dateFormatSpecifier);
ST.numberFormat = d3.format('.2f');


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
        ST.dateDimension = ndx.dimension(function (d) {
            return dateFormatParser(d.date);
        });

        //  Do Layoutspec validation
        if (!layout_spec.charts) {

            var mes = layout_spec.chart ? "chart specification should be plural: charts, not chart.  " : "";
            alert(mes + '   <b>charts</b> is not defined in layout file.')
        }


        if (layout_spec.charts.length === undefined) {
            alert('Layout charts must be of type array.');
        }

        var layout_charts = layout_spec.charts;
        var original_lc = layout_charts; // $.extend(true, {}, layout_charts);

        console.dir(original_lc);

        ST.LayoutAugmenterModel.get(layout_charts, the_data);
        ST.UserPreferences.render();

        for (var dimension in layout_charts) {

            var spec = layout_charts[dimension];
            var viz = spec.viz;

            var counts = count_unique_values_in_chart_( ndx, spec.dimension );
            spec.counts = counts;

            //  keep disabled for now.
            if( viz === "PieChart" && counts >= 8 ) {
                viz = "HorizontalBarChart";
            }

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
                    ' | <div class="reset_all">Reset All</div>',
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
                var title = {
                    "jupyter" : "Jupyter View",
                    "walltime" : "Walltime View"
                };

                for (var x in d.drilldown) {

                    var but = d.drilldown[x];
                    var drill_icon = but.toLowerCase();

                    buts += '<div run_id="' + d.run_id + '" ' +
                        'title="' + title[ drill_icon ] + '" ' +
                        'subject="' + drill_icon + '" class="drilldown myButton ' + drill_icon + ' icon">' +
                        '<div class="inner"></div>' +
                        '</div>';
                }

                var hidden = '<div class="hidden key">' + d.key + '</div>';

                return buts + hidden;
            }
        });


        ST.CompareArguments.render(the_data[0]);

        //  https://github.com/HamsterHuey/intothevoid.io/blob/master/code/2017/dcjs%20sortable%20table/dcjsSortableTable.html

        runTable
            .dimension(ST.dateDimension)
            // Data table does not use crossfilter group but rather a closure
            // as a grouping function
            .group(function (d) {

                var format = d3.format('02d');
                var date = new Date(d.date * 1000);  // used to be epoch_date
                //return date.getFullYear() + '/' + format((date.getMonth() + 1));
                return 1;
            })
            // (_optional_) max number of records to be shown, `default = 25`
            .size(ST.MAX_SHOW)    //  ST.params.max
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


        render_more_link_( the_data.length );

        ST.all_data = ST.dateDimension.top(80000);
        console.dir(ST.all_data);
        //console.dir(runTable.top(80000));

        //simply call `.renderAll()` to render all charts on the page
        dc.renderAll();

        ST.BarChart.load_filter();
        ST.PieChart.load_filter();
        ST.LeftHorizontalBarChart.load_filter();
        ST.HorizontalBarChart.load_filter();
        ST.ScatterPlot.load_filter();

        dc.redrawAll();

        //  preload ST.str_cali_keys so you can click MJ right away.
        ST.CallSpot.load_compare();

        bind_sort();
    };


    var reset_all_ = function() {

        dc.filterAll();
        dc.renderAll();

        ST.UrlStateManager.remove_all_chart_pars();

        //  The horizontal charts  have a slightly different structure where the reset link
        //  is not inside the div that gets redrawn, so we need to manually hide the horizontal reset link.
        $('.horiz_reset').hide();
    };

    var render_more_link_ = function( count ) {

        var show = ST.MAX_SHOW <= count ? 'show' : 'hide';
        $('.contain_show_more')[show]();
    };


    var count_unique_values_in_chart_ = function( ndx, dimension ) {

        var uniq_counts = {};

        var ndim = ndx.dimension(function (cali_object) {

            uniq_counts[ cali_object[ dimension ] ] = 1;
            return cali_object[ dimension ];
        });

        return Object.keys( uniq_counts ).length;
    };



    var bind_sort = function () {

        $('.reset_all').unbind('click').bind("click", reset_all_);

        $('.contain_show_more a').unbind('click').bind('click', ST.ChartCollection.show_more);

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


    var show_more_ = function() {

        ST.MAX_SHOW += SHOW_MORE_INCREASE;
        ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);
    };

    var setup_pars_ = function() {

        var xaxis = ST.Utility.get_param('xaxis');
        var groupby = ST.Utility.get_param('groupby');
        var yaxis = ST.Utility.get_param('yaxis');
        var aggregate = ST.Utility.get_param('aggregate');
        yaxis = decodeURIComponent(yaxis);
        //yaxis = yaxis.replace('\%25252523', '#');

        if( defined_(xaxis) ) {
            ST.graph.setXaxis(xaxis);
        }

        if( defined_(groupby)) {
            ST.graph.setGroupBy(groupby);
        }

        if( defined_(yaxis)) {
            ST.graph.setYAxis(yaxis);
        }

        if( defined_(aggregate)) {
            ST.graph.setAggregateType(aggregate);
        }
    };

    var defined_ = function( str ) {
        return str !== undefined && str !== "undefined";
    };


    $(document).ready( function() {
        setInterval( function() {
          //  $('.multi_jupyter').trigger('click');
        }, 4000);
    });

    function init () {

        var file = ST.Utility.get_file();
        ST.Utility.init_params();

        help_icon_(file, ST.params);

        var host = ST.Utility.get_default_machine();
        var machine = ST.Utility.get_param('machine');
        var command = ST.Utility.get_command();

        console.log('command=' + command);

        host = machine || host;

        ST.graph = new Graph('#compare_bottom_outer');

        ST.graph.getData(host, command, file)
            .then(summary => {

                ST.Utility.check_error( summary );
                console.log('summary:', summary);
                ST.CallSpot.handle_success2(summary);

                //  just for now.
                setTimeout( setup_pars_, 1000);
            }).finally( summary => {
                ST.Utility.check_error( summary );
        });

        // listen from chart
        ST.graph.addXAxisChangeListener(xAxis => {

            if( xAxis !== "undefined" ) {
                ST.UrlStateManager.update_url('xaxis', xAxis);
            }
        });

        ST.graph.addYAxisChangeListener(yAxis => {

            if( yAxis !== "undefined" ) {
                var component = encodeURIComponent(yAxis);
                ST.UrlStateManager.update_url('yaxis', component);
            }
        });

        ST.graph.addAggregateTypeChangeListener(agg =>{

            if( agg !== "undefined" ) {
                ST.UrlStateManager.update_url('aggregate', agg);
            }
        });

        ST.graph.addGroupByChangeListener(groupBy => {

            if( groupBy !== "undefined" ) {
                ST.UrlStateManager.update_url('groupby', groupBy);
            }
        });
    };

    $(document).ready(init);


    $.fn.ArrowFunctions = function (obj) {

        var arrows = "<div class='up_arrow'></div>" +
            "<div class='down_arrow'></div>";

        return this.each(function () {

            $(this).append(arrows);
            $(this).find('.up_arrow, .down_arrow').unbind('click').bind('click', obj.arrow_click);
        });
    };


    return {
        show_more: show_more_,
        RenderChartCollection: RenderChartCollection,
        bind_sort: bind_sort
    }
}();