var ST = ST || {};

ST.BarChart = function() {

    var inst_ = [],
        inst_num_ = 0;

    var upper_ = function( lower ) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    };

    var get_bucket_ = function( buckets, number ) {

        number = +number;

        for( var z=0; z < buckets.length; z++ ) {

            var bucket = buckets[z];
            var spli = bucket.split('-');

            var first = spli[0];
            var second = spli[1];

            if( number >= first && number <= second ) {
                return bucket;
            }
        }

        return "could not find bucket";
    };


    var render_ = function( ndx, options ) {

        //  STUB
        //options.buckets = ['0-5', '5-10', '10-15', '15-20'];
        options.buckets = typeof options.buckets === "string" ? eval(options.buckets) : options.buckets;

        options = options || {};
        var dimension = options.dimension || "runtime";

        var min = 100000;
        var max = 0;
        var use_buckets = options.buckets;

        // Determine a histogram of percent changes
        var runtime_dimension = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, dimension );

            var dim = cali_object[dimension];
            dim = +dim;

            if( dim < min ) {
                min = dim;
            }
            if( dim > max ) {
                max = dim;
            }

            var ret = typeof dim === 'number' ? Math.round(dim/1)*1 : dim;

            if( use_buckets ) {
                return get_bucket_( options.buckets, ret );
            } else {
                return Math.round(ret);

                //ret = +ret;
                //var down = Math.round(ret/1000);
                //return ret > 1000 ? down + 'e3' : ret;
            }
        });

        var runtime_group = runtime_dimension.group();

        var width = options.width || 580;
        var height = options.height || 180;

        var xlabel = options["x-label"] || "";
        var ylabel = options["y-label"] || "";


        var rcht = '<div class="runtime-chart' + inst_num_ + '"> \
            <div class="top_left"> \
                <strong>' + upper_( options.title || dimension) + '</strong> \
                <a class="reset" onclick="ST.BarChart.reset(this);" style="display: none;">reset</a>\
            </div> \
            <div class="x-label" style="width: ' + width + 'px;">' + xlabel + '</div> \
            <div class="y-label" style="width: ' + height + 'px;">' + ylabel + '</div> \
        </div>';

        $('.row:eq(0)').append(rcht);


        inst_[inst_num_] = dc.barChart('.runtime-chart' + inst_num_ );

        var one_i = inst_[inst_num_];
        $('.runtime-chart' + inst_num_).attr('instance_num', inst_num_);

        var domain = options.xrange || [min - 1, parseInt(max) + 1];
        //domain = [0,80];

        var xinput = d3.scaleLinear().domain( domain );

        if( use_buckets ) {
            domain = options.buckets;
            var xinput2 = d3.scaleOrdinal().domain(domain);

            one_i.xUnits(dc.units.ordinal);
        }

        //one_i.xUnits()


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
            .x( use_buckets ? xinput2 : xinput )
            .renderHorizontalGridLines(true)
            //.ordinalColors(['green', 'blue'])
            // Customize the filter displayed in the control span
            .filterPrinter(function (filters) {

                var filter = filters[0], s = '';
                s += ST.numberFormat(filter[0]) + '% -> ' + ST.numberFormat(filter[1]) + '%';
                return s;
            }).on('filtered', function( chart ) {

                ST.UrlStateManager.user_filtered( chart, 'BarChart');
            });

        // Customize axes
        var xticks = one_i.xAxis().tickFormat(
            function (v) {

                v = get_dec_v_( v, use_buckets);

                return v + (options.xsuffix !== undefined ? options.xsuffix : '');
            });

        if( options["x-ticks"] ) {
            xticks.ticks( options["x-ticks"] );
        }

        one_i.yAxis().ticks( options["y-ticks"] || 5);

        inst_num_++;
    };


    var get_dec_v_ = function(v, use_buckets ) {

        if( use_buckets ) {
            return v;
        }

        for( var x=3; x < 15; x++ ) {

            v = +v;

            var low = Math.pow( 10, x );
            var lowp = Math.pow( 10, x + 1 );

            if ( v >= low && v < lowp ) {

                var mv = parseInt(v / low );

                return mv + 'e' + x;
            }
        }

        return v;
    };

    var round_ = function( v ) {

        var v2 = Math.round(v * 10);
        return v2 / 10;
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