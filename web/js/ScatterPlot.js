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
        var runtime_group;

        runtime_group = runtime_dimension.group();

        var width = options.width || 580;
        var height = options.height || 180;

        var xlabel = options["x-label"] || "";
        var ylabel = options["y-label"] || "";

        var style = options.show ? "display: block;" : "display: none;";
        var dimension_low = dimension.toLowerCase();

        var DOM_safe_dimension = filter_specials_( dimension_low );

        //  Just for testing.
        //console.log(filter_specials_("shape_model_initial_modes:(4,3)!@#$$%^&*(8342347-+={{{}}}}[[[[]]\\..//,,,"));

        var rcht = '<div class="runtime-chart' + DOM_safe_dimension + '" style="' + style + '" chart-dimension="' + dimension_low + '"> \
            <div class="top_left"> \
                <strong>' + upper_( options.title || dimension) + '</strong> \
                <a class="reset" onclick="ST.BarChart.reset(this);" style="display: none;">reset</a>\
            </div> \
            <div class="x-label" style="width: ' + width + 'px;">' + xlabel + '</div> \
            <div class="y-label" style="width: ' + height + 'px;">' + ylabel + '</div> \
        </div>';

        $('.row:eq(0)').append(rcht);

        inst_[dimension_low] = dc.scatterPlot('.runtime-chart' + DOM_safe_dimension );

        var one_i = inst_[dimension_low];
        $('.runtime-chart' + DOM_safe_dimension).attr('instance_num', dimension_low);


        //one_i.xUnits()
        one_i.width(width)
    .height(height)
    .x(d3.scaleLinear().domain(domain))
    .brushOn(true)
    .symbolSize(8)
    .clipPadding(40)
    .yAxisLabel("This is the Y Axis!")
    .dimension(runtime_dimension)
    .group(runtime_group);

/*        width( width )
            .height( height )
            .margins( options.margins || {top: 10, right: 50, bottom: 20, left: 40})
            .dimension(runtime_dimension)
            .group(runtime_group)
            .elasticX(false)  //  The reason I set elasticX to false is so that it will use the min and max numbers. for the domain.
            // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
            .centerBar( false )
            // (_optional_) set gap between bars manually in px, `default=2`
            .gap(1)
            // (_optional_) set filter brush rounding
            .round( dc.round.floor)
            //.xUnits(function() {return 20;})   //  not a function.
            //.alwaysUseRounding(true)
            .x( use_buckets ? xinput2 : xinput )
            .elasticY(true)
            //  This can correctly get and set the yrange, but there will be a problem when you select other charts, thus altering
            //  the histogram results, because as you filter the histogram results then go out of range.
            //.y( d3.scaleLinear().domain( get_yrange_(counts)) )
            .renderHorizontalGridLines(true)
            .ordinalColors(ST.Utility.get_colors( options.dimension ))
            // Customize the filter displayed in the control span
            .filterPrinter(function (filters) {

                var filter = filters[0], s = '';
                s += ST.numberFormat(filter[0]) + '% -> ' + ST.numberFormat(filter[1]) + '%';
                return s;
            }).on('filtered', function( chart ) {

                ST.UrlStateManager.user_filtered( chart, 'BarChart');
                ST.CallSpot.load_compare();
            });*/
    };


    //  User generated IDs sometimes have special characters which mess up the DOM parser.
    //  For instance: Shape_model_initial_modes:(4,3)  This key caused the following error:
    //  "DOMException: Failed to execute 'querySelector' on 'Document': 'runtime-chartshape_model_initial_modes:(4,3)' is not a valid selector.
    //
    //  SOLUTION:
    //      Filter out those pesky special characters
    //
    var filter_specials_ = function( user_generated ) {

        return user_generated.replace(/[^a-z0-9_]+/gi, '');
    };


    String.prototype.hashCode = function() {

        var hash = 0, i, chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };


    var get_middling_ = function( v ) {

        var spli = v.split('-');
        var before_dash = +spli[0];
        var after_dash = +spli[1];
        var avg = (before_dash + after_dash) / 2;

        return round2_(before_dash);
    };


    var round2_ = function( i ) {
        return Math.round( i * 10000 ) / 10000;
    };


    var commas_ = function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };


    var get_dec_v_ = function(v, use_buckets, use_middling, is_date ) {

        if( is_date ) {
            return ST.Utility.format_date(v);
        }

        if( use_buckets ) {
            return use_middling ? get_middling_(v) : commas_(v);
        }

        for( var x=13; x < 30; x++ ) {

            v = +v;

            var low = Math.pow( 10, x );
            var lowp = Math.pow( 10, x + 1 );

            if ( v >= low && v < lowp ) {

                var mv = parseInt(v / low );

                return mv + 'e' + x;
            }
        }

        return commas_(v);
    };


    return {
        render: render_,
        reset: function(that) {

            var grandpa = $(that).closest("[instance_num]");
            var instance_num = grandpa.attr('instance_num');

            inst_[instance_num].filterAll();

            dc.redrawAll();
            ST.ChartCollection.bind_sort();

            ST.UrlStateManager.remove_param( 'BarChart' + instance_num );
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( inst_, 'BarChart' );
        }
    }
}();