var ST = ST || {};

window.ENV = window.ENV || {
    machine: 'oslic'
};

ST.MemoryLineView = function() {

    var render_ = function() {

        var runSetId = ST.Utility.get_param('runSetId');
        var runId = ST.Utility.get_param('runId');

        //  //'/usr/gapps/spot/datasets/lulesh_gen/100',
        var path = runSetId + " " + runId;

        //window.ENV.machine = 'container';

        const isContainer = window.ENV.machine == 'container'

        if( isContainer ) {

            container_ajax_();
        } else {

            ST.CallSpot.ajax({
                file: path,
                type: "getTimeseriesData",
                success: line_render_
            });
        }

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

        $.ajax(obj).done(from_lorenz_finish_).error(from_lorenz_finish_);
    };

    var container_ajax_ = function() {

        var runSetId = ST.Utility.get_param('runSetId');
        var runId = ST.Utility.get_param('runId');
        //runId = runId.replace(/\/data/, "");

        //  Now need a space in between *.cali and the rest of it.
        runId = runId.replace(/\/(?=[^\/]*$)/, ' ');

        //  //'/usr/gapps/spot/datasets/lulesh_gen/100',
        var path = runId;
        var url = "/sankey/getTimeseriesData";

        ST.Utility.container_ajax( url, 'getTimeseriesData', path, line_render_ );
    };


    var render_inst_ = function( x ) {

        return '<div class="one_chart" plot_instance="' + x + '"> \
            <div class="ch_dropdown"></div>\
            <div id="my_chart' + x + '"></div>\
            </div>';
    };

    var render_chart_ = function() {

        var ht = "";
        var charts = ST.MemoryLineModel.get_model();

        for( var x=0; x < charts.length; x++ ) {

            ht += render_inst_(x);
        }

        return ht;
    };


    var redraw_plot_ = function( instance ) {

        //update_traces_();
        var chart = ST.MemoryLineModel.get_chart_by_instance( instance );
        console.dir( chart );

        var trace = chart.trace;

        layout.title = ST.TitleModel.get_title( trace );

        Plotly.newPlot('my_chart' + instance, trace, layout);
    };


    var sync_dom_checks_to_model_ = function( plot_instance_el ) {

        var plot_instance = plot_instance_el.attr('plot_instance');

        plot_instance_el.find('.check_line').each( function( index, el ) {

            var checked = $(el).find('[type="checkbox"]').is(":checked");
            var check_type = $(el).attr('check_type');

            console.log( plot_instance, check_type, checked );
            ST.MemoryLineModel.set_check_cache( plot_instance, check_type, checked );
        });

        redraw_plot_( +plot_instance );
    };


    var checked_ = function( got_checked, event_target ) {

        var plot_instance_el = event_target.closest('[plot_instance]');
        sync_dom_checks_to_model_( plot_instance_el );
    };


    var unchecked_ = function( got_checked, event_target ) {

        var plot_instance_el = event_target.closest('[plot_instance]');
        sync_dom_checks_to_model_( plot_instance_el );
    };


    var add_chart_render_ = function() {

        var charts = ST.MemoryLineModel.get_model();
        var inst = charts.length - 1;

        var ht = render_inst_( inst );
        $('.chart_container').append( ht );

        post_render_( inst );

        //make_checkbox_dropdown_( inst );
    };


    var make_checkbox_dropdown_ = function( inst ) {

        var ch_inst = $('[plot_instance="' + inst + '"] .ch_dropdown');
        console.log( ch_inst.length );
        var legend = ST.MemoryLineModel.filter_legend_by_unit_type( inst );

        ch_inst.CheckboxWindowManager({
            legend: legend,
            checked: checked_,
            unchecked: unchecked_
        });
    };


    var post_render_ = function( inst ) {

        ST.MemoryLineModel.update_traces();

        var charts = ST.MemoryLineModel.get_model();
        make_checkbox_dropdown_( inst );

        var trace = charts[ inst ].trace;
        console.dir( trace );

        Plotly.newPlot('my_chart' + inst, trace, layout);

        var plot_inst_el = $('[plot_instance="' + inst + '"]');
        sync_dom_checks_to_model_( plot_inst_el );
    };


    var line_render_ = function( aj_dat, plus_button ) {

        var ht = render_chart_();

        ST.MemoryLineModel.update_traces( aj_dat );
        var charts = ST.MemoryLineModel.get_model();

        //$('.one_chart').remove();
        if( 0 === $('.one_chart').length || plus_button) {

            $('.chart_container').html(ht);
            post_render_(0);
        }

        $('.plus.myButton').unbind('click').bind('click', add_chart_ );
    };


    var add_chart_ = function() {

        ST.MemoryLineModel.add_chart();
        //line_render_( false, true );

        add_chart_render_();
        scroll_to_bottom_();
    };


    var scroll_to_bottom_ = function() {

        $("html, body").animate({ scrollTop: $(document).height() }, 1000);
    };

    var from_lorenz_finish_ = function( aj_dat ) {

        var ret = aj_dat.output.command_out;

        var ret2 = ST.parse( ret );

        var ret3 = ST.parse( ret2 );

        finish_render_( ret3 );
    };


    var finish_render_ = function( ret3 ) {


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
        title: "Memory Bandwidth",
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

    return {
        sync_dom_checks_to_model: sync_dom_checks_to_model_
    }
}();
