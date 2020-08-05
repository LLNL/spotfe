var ST = ST || {};

ST.ScatterPlot = function() {

    var inst_ = [];

    var upper_ = function( lower ) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    };


    var render_ = function( ndx, options ) {

        //  STUB
        options.buckets = typeof options.buckets === "string" ? eval(options.buckets) : options.buckets;

        options = options || {};
        var dimension = options.dimension || "runtime";

        var use_buckets = options.buckets;


        var counts = {};

        //  https://dc-js.github.io/dc.js/examples/scatter.html
        // Determine a histogram of percent changes
        var runtime_dimension = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, options.xaxis );
            ST.Utility.validate_cali_object( cali_object, options.yaxis );

            var r0 = cali_object[ options.xaxis ];
            var r1 = cali_object[ options.yaxis ];

            r0 = parseInt(r0);
            r1 = parseInt(r1);

            return [r0, r1];
        });

        if( ST.cali_valid === false ) {
            //  Error on screen.
            return false;
        }


        var domain = options.xrange;
        var ydomain = options.yrange;

        var runtime_group = runtime_dimension.group();

        var width = options.width || 580;
        var height = options.height || 180;

        var xlabel = options["xaxis"] || "";
        var ylabel = options["yaxis"] || "";

        var style = options.show ? "display: block;" : "display: none;";
        var dimension_low = dimension.toLowerCase();

        var DOM_safe_dimension = ST.Utility.filter_special( dimension_low );

        var rcht = '<div class="outer_cont scatter-chart runtime-chart' + DOM_safe_dimension + '" ' +
            'style="' + style + '" ' +
            'chart-dimension="' + DOM_safe_dimension + '"> \
            <div class="top_left"> \
                <strong class="text_chart_name">' + upper_( options.title || dimension) + '</strong> \
                <a class="reset" onclick="ST.ScatterPlot.reset(this);" style="display: none;">reset</a>\
            </div> \
        ' + ReusableView.get_hamburger() + '\
            <div class="x-label" style="width: ' + width + 'px;">' + xlabel + '</div> \
            <div class="y-label" style="width: ' + height + 'px;">' + ylabel + '</div> \
        </div>';

        $('.row:eq(0)').append(rcht);

        inst_[dimension_low] = dc.scatterPlot('.runtime-chart' + DOM_safe_dimension );

        var one_i = inst_[dimension_low];
        $('.runtime-chart' + DOM_safe_dimension).attr('instance_num', DOM_safe_dimension);

        one_i.width(width)
            .height(height)
            .x(d3.scaleLinear().domain(domain))
            .y(d3.scaleLinear().domain(ydomain))
            .brushOn(true)
            .symbolSize(8)
            .clipPadding(40)
            .yAxisLabel("This is the Y Axis!")
            .dimension(runtime_dimension)
            .group(runtime_group)
            .filterPrinter(function (filters) {

                var filter = filters[0], s = '';
                s += ST.numberFormat(filter[0]) + '% -> ' + ST.numberFormat(filter[1]) + '%';
                return s;
            }).on('filtered', function( chart ) {

            ST.UrlStateManager.user_filtered( chart, ST.CONSTS.SCATTER_PLOT);
            ST.CallSpot.load_compare();
        });

        // Customize axes
        one_i.xAxis().tickFormat(
            function (v) {

                var xax_type = ST.LayoutAugmenterModel.get_type( options.xaxis );
                var is_date = xax_type === "date";

                if( is_date ) {
                    return ST.Utility.format_date(v);
                }

                return v + (options.xsuffix !== undefined ? options.xsuffix : '');
            });

        one_i.yAxis().tickFormat( function(v) {

            var yax_type = ST.LayoutAugmenterModel.get_type( options.yaxis );
            var is_date = yax_type === "date";

            if( is_date ) {

                var opts = {"only_first_part": true};
                return ST.Utility.format_date(v, opts);
            }

            var v = +v;

            if( v >= 10000 ) {
                return ST.Utility.round_exp(v);
            }
            return v;
        });
    };


    return {
        render: render_,
        reset: function(that) {

            var grandpa = $(that).closest("[instance_num]");
            var instance_num = grandpa.attr('instance_num');

            inst_[instance_num].filterAll();

            dc.redrawAll();
            ST.ChartCollection.bind_sort();

            ST.UrlStateManager.remove_param( ST.CONSTS.SCATTER_PLOT + instance_num );
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( inst_, ST.CONSTS.SCATTER_PLOT );
        }
    }
}();