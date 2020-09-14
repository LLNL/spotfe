var ST = ST || {};
var ENV = {
    machine: "oslic"
};

ST.MemoryLineView = function() {

    var render_ = function() {

        ST.CallSpot.ajax({
            file: '/usr/gapps/spot/datasets/lulesh_gen/100',
            type: "memory",
            success: line_render_
        });

        return true;

        var final_command = "";
        var rtype = "POST";
        var obj = {
            timeout: 600000,
            type: rtype,
            method: rtype,
            url: ST.params.get_rundata_url,
            data:   {
                'via'    : 'post',
                'route'  : '/command/' + ST.params.machine,      //  rzgenie
                'command': final_command
            }
        };

        obj.dataType = "jsonp";

        $.ajax(obj).done(finish_render_).error(finish_render_);
    };


    var charts_ = [{}];

    var render_chart_ = function() {

        var ht = "";

        for( var x=0; x < charts_.length; x++ ) {

            ht +=  '<div class="one_chart" plot_instance="' + x + '"> \
            <div class="ch_dropdown"></div>\
            <div id="my_chart' + x + '"></div>\
            </div>';
        }

        return ht;
    };

    var records_cache_;

    var randomize_ = function( records ) {

        for( var z=0; z < records.length; z++ ) {

            records[z]['sum#mem.bytes.written/mwb.time'] = Math.random()*1000 + 2000;
            records[z]['sum#mem.bytes.read/mrb.time'] = Math.random() * 500 + 3000;
            records[z]['max#sum#loop.iterations'] = Math.random() * 3000 + 200;
            records[z]['avg#mem.bytes.written/mwb.time'] = Math.random() * 6000;
        }
    };

    var attributes_;

    var process_records_ = function( aj_dat ) {

        if( aj_dat ) {

            var ret = aj_dat.output.command_out;
            var ret2 = JSON.parse( ret );
            var std = JSON.parse( ret2.std );
            var records = ret2.series.records;

            randomize_( records );

            records.sort( function( a, b ) {

                return a.block - b.block;
            });

            attributes_ = ret2.series.attributes;

            console.dir( ret2 );
            console.dir( std );
            console.dir( records );

            records_cache_ = records;
            return records;
        }

        return records_cache_;
    };


    var redraw_plot_ = function( instance ) {

        update_traces_();
        Plotly.newPlot('my_chart' + instance, traces_[instance], layout);
    };

    var checked_ = function( got_checked, event_target ) {

        var plot_instance_el = event_target.closest('[plot_instance]');
        var plot_instance = plot_instance_el.attr('plot_instance');

        check_cache_[plot_instance][ got_checked ] = true;

        //redraw_plot_( +plot_instance );
        line_render_();
    };

    var unchecked_ = function( got_checked, event_target ) {

        var plot_instance_el = event_target.closest('[plot_instance]');
        var plot_instance = plot_instance_el.attr('plot_instance');

        check_cache_[plot_instance][ got_checked ] = false;

        //redraw_plot_( +plot_instance );
        line_render_();
    };

    var check_cache_ = [];
    var traces_ = [];
    var legend_ = [];


    var update_traces_ = function( aj_dat ) {

        var ret3 = process_records_( aj_dat );
        var rets = ret3[0];

        for( var z = 0; z < charts_.length; z++ ) {

            for (var pound_name in rets) {

                if (typeof rets[pound_name] === "number" &&
                    pound_name !== "block") {

                    check_cache_[z] = check_cache_[z] || {};

                    legend_[z] = legend_[z] || {};

                    if (check_cache_[z][pound_name] !== false) {

                        var trace = get_trace_(ret3, pound_name);
                        traces_[z] = traces_[z] || [];
                        traces_[z].push(trace);

                        legend_[z][pound_name] = 1;
                    } else {
                        legend_[z][pound_name] = 0;
                    }
                }
            }
        }
    };


    var line_render_ = function( aj_dat, plus_button ) {


        var ht = render_chart_();
        traces_ = [];
        legend_ = [];

        update_traces_( aj_dat );

        //$('.one_chart').remove();
        if( 0 === $('.one_chart').length || plus_button) {

            $('.chart_container').html(ht);

            for( var y=0; y < charts_.length; y++ ) {

                var ch_inst = $('[plot_instance="' + y + '"] .ch_dropdown');

                ch_inst.CheckboxWindowManager({
                    legend: legend_[y],
                    checked: checked_,
                    unchecked: unchecked_
                });
            }
        }

        $('.plus.myButton').unbind('click').bind('click', add_chart_ );

        for( var x=0; x < charts_.length; x++ ) {
            Plotly.newPlot('my_chart' + x, traces_[x], layout);
        }
    };


    var add_chart_ = function() {

        charts_.push({});
        line_render_( false, true );

        scroll_to_bottom_();
    };


    var scroll_to_bottom_ = function() {

        $("html, body").animate({ scrollTop: $(document).height() }, 1000);
    };


    var get_trace_ = function( ret3, attr ) {

        var att = attributes_[ attr ];
        var alias = att["attribute.alias"];

        var trace = {
            x: [],
            y: [],
            type: 'scatter',
            name: alias
        };

        for( var a=0; a < ret3.length; a++ ) {

            var obj = ret3[a];

            trace.x.push( obj.block );
            trace.y.push( obj[ attr ] );

            //  hover.
            //trace.text.push( attr );
        }

        return trace;
    };



    var finish_render_ = function( aj_dat ) {

        var ret = aj_dat.output.command_out;
        var ret2 = JSON.parse( ret );
        var ret3 = JSON.parse( ret2 );

        console.dir( ret3 );

        d3.csv('../web/ndx.csv').then(data => {

            // Since its a csv file we need to format the data a bit.
            const dateFormatSpecifier = '%m/%d/%Y';
            const dateFormat = d3.timeFormat(dateFormatSpecifier);
            const dateFormatParser = d3.timeParse(dateFormatSpecifier);
            const numberFormat = d3.format('.2f');


            data.forEach(d => {
                d.dd = dateFormatParser(d.date);
                d.month = d3.timeMonth(d.dd); // pre-calculate month for better performance
                d.close = +d.close; // coerce to number
                d.open = +d.open;
            });

            ret3.forEach(d => {

            });

            const ndx = crossfilter(data);
            const moveMonths = ndx.dimension(function(d){
                console.log(d.month);
                return d.month;
            });

            // Group by total volume within move, and scale down result
            const volumeByMonthGroup = moveMonths.group().reduceSum( function(d) {
                return d.volume / 500;
            } );


            const memoryChart = new dc.lineChart('#memory-chart');
            const volumeChart = new dc.barChart('#volume-chart');

            var all = ndx.groupAll();

            var grp  = moveMonths.group();

            memoryChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
                .renderArea(true)
                .width(990)
                .height(200)
                .group( grp )
                .transitionDuration(1000)
                .margins({top: 30, right: 50, bottom: 25, left: 40})
                .dimension(moveMonths)
                .mouseZoomable(true)
                // Specify a "range chart" to link its brush extent with the zoom of the current "focus chart".
                .rangeChart(volumeChart)
                .x(d3.scaleTime().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
                .round(d3.timeMonth.round)
                .xUnits(d3.timeMonths)
                .elasticY(true)
                .renderHorizontalGridLines(true);

            volumeChart.width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
                .height(40)
                .margins({top: 0, right: 50, bottom: 20, left: 40})
                .dimension(moveMonths)
                .group(volumeByMonthGroup)
                .centerBar(true)
                .gap(1)
                .x(d3.scaleTime().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
                .round(d3.timeMonth.round)
                .alwaysUseRounding(true)
                .xUnits(d3.timeMonths);


            dc.renderAll();
        });
    };

    var layout = {
        title: "First Plot",
        xaxis: {
            title: 'Block',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 18,
                color: 'grey'
            },
            showticklabels: true,
            tickangle: 'auto',
            tickfont: {
                family: 'Old Standard TT, serif',
                size: 14,
                color: 'black'
            },
            exponentformat: 'e',
            showexponent: 'all'
        },
        yaxis: {
            title: 'See Legend',
            titlefont: {
                family: 'Arial, sans-serif',
                size: 18,
                color: 'grey'
            },
            showticklabels: true,
            tickangle: 45,
            tickfont: {
                family: 'Old Standard TT, serif',
                size: 14,
                color: 'black'
            },
            exponentformat: 'e',
            showexponent: 'all'
        }
    };


    $(document).ready( render_ );
}();