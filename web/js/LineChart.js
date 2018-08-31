var ST = ST || {};

ST.LineChart = function() {

    var moveChart_, volumeChart_;


    var render_ = function( ndx ) {

        $('.row:eq(0)').append('        <div id="monthly-move-chart"> \
            <strong>Runtime total + Runtime Average</strong> \
            <span class="reset" style="display: none;">range: <span class="filter"></span></span> \
            <a class="reset" href="javascript: ST.LineChart.reset();" \
               style="display: none;">reset</a> \
            <div class="clearfix"></div> \
        </div> \
        <div id="monthly-volume-chart"> \
        </div> ');

        moveChart_ = dc.lineChart('#monthly-move-chart');
        volumeChart_ = dc.barChart('#monthly-volume-chart');

        // Dimension by month
        var moveMonths = ndx.dimension(function (d) {
            return d.month;
        });
        // Total Runtimes per month
        var scummy = moveMonths.group().reduceSum(function (d) {
            return d.runtime;
        });
        // Group by total volume within move, and scale down result
        var volumeByMonthGroup = moveMonths.group().reduceSum(function (d) {
            return d.runtime;
        });

        //  Average runtimes by month.
        var lateral = moveMonths.group().reduce(
            function (p, v) {
                ++p.days;
                p.total += (v.runtime);
                p.avg = Math.round(p.total / p.days);
                return p;
            },
            function (p, v) {
                --p.days;
                p.total -= (v.runtime);
                p.avg = p.days ? Math.round(p.total / p.days) : 0;
                return p;
            },
            function () {
                return {days: 0, total: 0, avg: 0};
            }
        );

        moveChart_ /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
            .renderArea(true)
            .width(990)
            .height(200)
            .transitionDuration(1000)
            .margins({top: 30, right: 50, bottom: 25, left: 40})
            .dimension(moveMonths)
            .mouseZoomable(true)
            // Specify a "range chart" to link its brush extent with the zoom of the current "focus chart".
            .rangeChart(volumeChart_)
            .x(d3.scaleTime().domain([new Date(2008, 0, 1), new Date(2018, 11, 31)]))
            .round(d3.timeMonth.round)
            .xUnits(d3.timeMonths)
            .elasticY(true)
            .renderHorizontalGridLines(true)
            //##### Legend

            // Position the legend relative to the chart origin and specify items' height and separation.
            .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
            .brushOn(false)
            // Add the base layer of the stack with group. The second parameter specifies a series name for use in the
            // legend.
            // The `.valueAccessor` will be used for the base layer
            .group(lateral, 'Average Runtime per month')
            .valueAccessor(function (d) {
                return d.value.avg;
            })
            // Stack additional layers with `.stack`. The first paramenter is a new group.
            // The second parameter is the series name. The third is a value accessor.
            .stack(scummy, 'Total Runtime per month', function (d) {
                return d.value;
            })
            // Title can be called by any stack layer.
            .title(function (d) {
                var value = d.value.avg ? d.value.avg : d.value;
                if (isNaN(value)) {
                    value = 0;
                }
                return dateFormat(d.key) + '\n' + ST.numberFormat(value);
            });

        //#### Stacked Area Chart

        //Specify an area chart by using a line chart with `.renderArea(true)`.
        // <br>API: [Stack Mixin](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#stack-mixin),
        // [Line Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#line-chart)
        //#### Range Chart

        // Since this bar chart is specified as "range chart" for the area chart, its brush extent
        // will always match the zoom of the area chart.
        volumeChart_.width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
            .height(40)
            .margins({top: 0, right: 50, bottom: 20, left: 40})
            .dimension(moveMonths)
            .group(volumeByMonthGroup)
            .centerBar(true)
            .gap(1)
            .x(d3.scaleTime().domain([new Date(2002, 0, 1), new Date(2019, 11, 31)]))
            .round(d3.timeMonth.round)
            .alwaysUseRounding(true)
            .xUnits(d3.timeMonths);

    };

    return {
        render: render_,
        reset: function() {
            moveChart_.filterAll();
            volumeChart_.filterAll();
            dc.redrawAll();
        }
    }
}();