var ST = ST || {};

ST.BarChart = function() {

    var inst_ = [],
        inst_num_ = 0;

    var upper_ = function( lower ) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    };

    var render_ = function( ndx, options ) {

        options = options || {};
        var dimension = options.dimension || "runtime";

        var min = 100000;
        var max = 0;

        // Determine a histogram of percent changes
        var runtime_dimension = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, dimension );

            var dim = cali_object[dimension];

            if( dim < min ) {
                min = dim;
            }
            if( dim > max ) {
                max = dim;
            }

            var ret = typeof dim === 'number' ? Math.round(dim/1)*1 : dim;
            return +ret;
        });

        var runtime_group = runtime_dimension.group();

        var width = options.width || 580;
        var height = options.height || 180;

        var xlabel = options["x-label"] || "";
        var ylabel = options["y-label"] || "";


        var rcht = '<div class="runtime-chart' + inst_num_ + '"> \
            <div class="top_left"> \
                <strong>' + upper_(dimension) + '</strong> \
                <a class="reset" onclick="ST.BarChart.reset(this);" style="display: none;">reset</a>\
            </div> \
            <div class="x-label" style="width: ' + width + 'px;">' + xlabel + '</div> \
            <div class="y-label" style="width: ' + height + 'px;">' + ylabel + '</div> \
        </div>';

        $('.row:eq(0)').append(rcht);


        inst_[inst_num_] = dc.barChart('.runtime-chart' + inst_num_ );

        var one_i = inst_[inst_num_];
        $('.runtime-chart' + inst_num_).attr('instance_num', inst_num_);

        var domain = options.xrange || [min - 1, parseInt(max) + 2];
        //domain = [0,80];
        var xinput = d3.scaleLinear().domain( domain );

        one_i.width( width )
            .height( height )
            .margins( options.margins || {top: 10, right: 50, bottom: 20, left: 40})
            .dimension(runtime_dimension)
            .group(runtime_group)
            .elasticY(true)
            .elasticX(false)  //  The reason I set elasticX to false is so that it will use the min and max numbers. for the domain.
            // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
            .centerBar(false)
            // (_optional_) set gap between bars manually in px, `default=2`
            .gap(1)
            // (_optional_) set filter brush rounding
            .round(dc.round.floor)
            .alwaysUseRounding(true)
            .x( xinput )
            .renderHorizontalGridLines(true)
            // Customize the filter displayed in the control span
            .filterPrinter(function (filters) {

                var filter = filters[0], s = '';
                s += ST.numberFormat(filter[0]) + '% -> ' + ST.numberFormat(filter[1]) + '%';
                return s;
            }).on('filtered', function( chart ) {

                ST.UrlStateManager.user_filtered( chart, 'BarChart');
            });

        // Customize axes
        one_i.xAxis().tickFormat(
            function (v) {
                return v + (options.xsuffix !== undefined ? options.xsuffix : '');
            });
        one_i.yAxis().ticks(5);

        inst_num_++;
    };


    return {
        render: render_,
        reset: function(that) {

            var grandpa = $(that).closest("[instance_num]");
            var instance_num = grandpa.attr('instance_num');

            inst_[instance_num].filterAll();

            dc.redrawAll();
            bind_sort();
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( inst_, 'BarChart' );
        }
    }
}();