var ST = ST || {};

ST.BarChart = function() {

    var inst_ = [],
        inst_num_ = 0;

    var upper_ = function( lower ) {
        return lower.charAt(0).toUpperCase() + lower.substr(1);
    };

    //  This is the part where the actual data is placed into the bucket we want it to be in.
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
        options.buckets = typeof options.buckets === "string" ? eval(options.buckets) : options.buckets;

        options = options || {};
        var dimension = options.dimension || "runtime";

        var use_buckets = options.buckets;


        // Determine a histogram of percent changes
        var runtime_dimension = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, dimension );

            var dim = cali_object[dimension];
            dim = +dim;

            //var ret = typeof dim === 'number' ? Math.round(dim/1)*1 : dim;
            var ret = dim;

            if( use_buckets ) {
                return get_bucket_( options.buckets, ret );
            } else {
                return Math.round(ret);
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


        var domain = options.xrange;
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
            //.xUnits(.1)   //  not a function.
            .alwaysUseRounding(true)
            .x( use_buckets ? xinput2 : xinput )
            .renderHorizontalGridLines(true)
            .ordinalColors(get_colors_( options.dimension ))
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

                v = get_dec_v_( v, use_buckets, options.use_middling);

                return v + (options.xsuffix !== undefined ? options.xsuffix : '');
            });

        if( options["x-ticks"] ) {
            xticks.ticks( options["x-ticks"] );
        }

        one_i.yAxis().ticks( options["y-ticks"] || 5);

        inst_num_++;
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


    var get_colors_ = function( dimension ) {

        var pallets = ALL_PALLETES_AVAILABLE;

        if( !pallets[ST.params.pallet_num] ) {
            alert('That pallet number is not defined.');
        }

        var ordinal_colors = pallets[ST.params.pallet_num];
        var num = Math.abs(dimension.hashCode());

        var color = ordinal_colors[ num % ordinal_colors.length ];
        return [color];
    };


    var get_middling_ = function( v ) {

        var spli = v.split('-');
        var before_dash = +spli[0];
        var after_dash = +spli[1];
        var avg = (before_dash + after_dash) / 2;

        return round2_(avg);
    };


    var round2_ = function( i ) {
        return Math.round( i * 100 ) / 100;
    };


    var get_dec_v_ = function(v, use_buckets, use_middling ) {

        if( use_buckets ) {
            return use_middling ? get_middling_(v) : v;
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

            ST.UrlStateManager.remove_param( 'BarChart' + instance_num );
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( inst_, 'BarChart' );
        }
    }
}();