var ST = ST || {};

ST.BarChart = function() {

    var inst_,
        inst_num_ = 0;

    var upper_ = function( lower ) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    };

    var render_ = function( ndx, options ) {

        options = options || {};
        var dimension = options.dimension || "runtime";

        inst_num_++;

        // Determine a histogram of percent changes
        var runtime_dimension = ndx.dimension(function (d) {

            var dim = d[dimension];
            return typeof dim === 'number' ? Math.round(dim/1)*1 : dim;
        });

        var runtime_group = runtime_dimension.group();

        var rcht = '<div class="runtime-chart' + inst_num_ + '"> \
            <div class="top_left"> \
                <strong>' + upper_(dimension) + '</strong> \
                <a class="reset" href="javascript:ST.BarChart.reset();" style="display: none;">reset</a>\
            </div> \
        </div>';

        $('.row:eq(0)').append(rcht);

        inst_ = dc.barChart('.runtime-chart' + inst_num_ );

        inst_.width( options.width || 580)
            .height( options.height || 180)
            .margins( options.margins || {top: 10, right: 50, bottom: 20, left: 40})
            .dimension(runtime_dimension)
            .group(runtime_group)
            .elasticY(true)
            // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
            .centerBar(false)
            // (_optional_) set gap between bars manually in px, `default=2`
            .gap(1)
            // (_optional_) set filter brush rounding
            .round(dc.round.floor)
            .alwaysUseRounding(true)
            .x(d3.scaleLinear().domain( options.xrange || [0, 24]))
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
                return v + (options.xsuffix !== undefined ? options.xsuffix : 'h');
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