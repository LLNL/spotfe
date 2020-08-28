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


    var render_chart_ = function() {

        return '<div class="one_chart"> \
            <div class="ch_dropdown"></div>\
            <div id="my_chart"></div>\
            </div>';
    };

    var process_records_ = function( aj_dat ) {

        if( aj_dat ) {

            var ret = aj_dat.output.command_out;
            var ret2 = JSON.parse( ret );
            var std = JSON.parse( ret2.std );
            var records = ret2.series.records;

            records.sort( function( a, b ) {

                return a.block - b.block;
            });

            console.dir( ret2 );
            console.dir( std );
            console.dir( records );

            return records;
        }
    };


    var line_render_ = function( aj_dat ) {

        var ret3 = process_records_( aj_dat );

        var ht = render_chart_();

        $('.chart_container').html( ht );
        $('.ch_dropdown').CheckboxWindowManager();

        var traces = [];
        var rets = ret3[0];

        for( var pound_name in rets ) {

            if( typeof rets[pound_name] === "number" && pound_name !== "block" ) {

                var trace = get_trace_( ret3, pound_name );
                traces.push( trace );
            }
        }

        var layout = {
            title: "First Plot"
        };

        Plotly.newPlot('my_chart', traces, layout );
    };


    var get_trace_ = function( ret3, attr ) {

        var trace = {
            x: [],
            y: [],
            type: 'scatter'
        };

        for( var a=0; a < ret3.length; a++ ) {

            var obj = ret3[a];
            trace.x.push( obj.block );
            trace.y.push( obj[ attr ] );
        }

        return trace;
    };



    var finish_render2_ = function( aj_dat ) {


        console.dir( ret3 );

        d3.csv('../web/ndx.csv').then(data => {

            // Since its a csv file we need to format the data a bit.
            const dateFormatSpecifier = '%m/%d/%Y';
            const dateFormat = d3.timeFormat(dateFormatSpecifier);
            const dateFormatParser = d3.timeParse(dateFormatSpecifier);
            const numberFormat = d3.format('.2f');


            ret3.forEach(d => {
                //d.dd = dateFormatParser(d.date);
                //d.month = d3.timeMonth(d.dd); // pre-calculate month for better performance
                d.month = d.block;
                d.close = +d.iter_per_sec; // coerce to number
                d.open = +d.mem_read_bw;
            });

            ret3.forEach(d => {

            });

            const ndx = crossfilter(ret3);
            const moveMonths = ndx.dimension(function(d) {
                return d.block;
            });

            // Group by total volume within move, and scale down result
            const volumeByMonthGroup = moveMonths.group().reduceSum( function(d) {
                return d.iter_per_sec;
            } );


            const memoryChart = new dc.lineChart('#memory-chart');
            const volumeChart = new dc.barChart('#volume-chart');

            var all = ndx.groupAll();

            var runtime_dimension = ndx.dimension(function (cali_object) {
                return Math.random()*1000;
            });

            var grp  = moveMonths.group( function(d) {

                var rr = parseInt(Math.random()*10);
                //console.log(rr);
                return rr;
            });

            var domain = [0,10];
            var domain0 = d3.scaleLinear(0.25).domain( domain );
            var yrange = d3.scaleLinear(0.25).domain( [0,100] );

            memoryChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
                .renderArea(true)
                .width(590)
                .height(500)
                .group( grp )
                .transitionDuration(1000)
                .margins({top: 30, right: 50, bottom: 25, left: 40})
                .dimension(moveMonths)
                .mouseZoomable(true)
                // Specify a "range chart" to link its brush extent with the zoom of the current "focus chart".
                .rangeChart(volumeChart)
                .x( domain0 )
                // .x(d3.scaleTime().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
                // .round(d3.timeMonth.round)
                // .xUnits(d3.timeMonths)
                //.y( yrange )
                .elasticY(true)
                .renderHorizontalGridLines(true);

            volumeChart.width(590) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
                .height(40)
                .margins({top: 10, right: 50, bottom: 20, left: 40})
                .dimension(moveMonths)
                .group(volumeByMonthGroup)
                .centerBar(true)
                .x( domain0 )
                .gap(1)
                .alwaysUseRounding(true);
            //.x(d3.scaleTime().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
            //.round(d3.timeMonth.round)
            //.xUnits(d3.timeMonths);


            dc.renderAll();
        });
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

    $(document).ready( render_ );
}();