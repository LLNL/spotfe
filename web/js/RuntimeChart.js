var ST = ST || {};

ST.RuntimeChart = function() {

    var inst_;

    var render_ = function( ndx ) {

        // Determine a histogram of percent changes
        var runtime_dimension = ndx.dimension(function (d) {
            return Math.round(d.runtime/1)*1;
        });

        var runtime_group = runtime_dimension.group();

        var rcht = '<div id="runtime-chart"> \
            <strong>Runtime</strong> \
            <a class="reset" href="javascript:ST.RuntimeChart.reset();" style="display: none;">reset</a>\
        </div>';

        $('.row:eq(0)').append(rcht);

        inst_ = dc.barChart('#runtime-chart');

        inst_ /* dc.barChart('#volume-month-chart', 'chartGroup') */
            .width(600)
            .height(180)
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .dimension(runtime_dimension)
            .group(runtime_group)
            .elasticY(true)
            // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
            .centerBar(true)
            // (_optional_) set gap between bars manually in px, `default=2`
            .gap(1)
            // (_optional_) set filter brush rounding
            .round(dc.round.floor)
            .alwaysUseRounding(true)
            .x(d3.scaleLinear().domain([0, 24]))
            .renderHorizontalGridLines(true)
            // Customize the filter displayed in the control span
            .filterPrinter(function (filters) {
                var filter = filters[0], s = '';
                s += ST.numberFormat(filter[0]) + '% -> ' + ST.numberFormat(filter[1]) + '%';
                return s;
            });

        // Customize axes
        inst_.xAxis().tickFormat(
            function (v) {
                return v + 'h';
            });
        inst_.yAxis().ticks(5);
    };

    return {
        render: render_,
        reset: function() {
            inst_.filterAll();
            dc.redrawAll();
        }
    }
}();