var ST = ST || {};

ST.MemoryLineView = function() {

    var render_ = function() {

        d3.csv('../web/ndx.csv').then(data => {
            const ndx = crossfilter(data);
            const moveMonths = ndx.dimension(d => d.month);
            // Group by total volume within move, and scale down result
            const volumeByMonthGroup = moveMonths.group().reduceSum(d => d.volume / 500000);


            const memoryChart = new dc.LineChart('#memory-chart');
            const volumeChart = new dc.BarChart('#volume-chart');

            memoryChart /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
                .renderArea(true)
                .width(990)
                .height(200)
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
        });
    };

    $(document).ready( render_ );
}();