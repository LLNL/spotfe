var ST = ST || {};

ST.NUM_BINS = 20;

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

        console.log( 'show='+ options.show );
        //  STUB
        options.buckets = typeof options.buckets === "string" ? eval(options.buckets) : options.buckets;

        options = options || {};
        var dimension = options.dimension || "runtime";

        var use_buckets = options.buckets;


        var counts = {};

        // Determine a histogram of percent changes
        var runtime_dimension = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, dimension );

            var dim = cali_object[dimension];
            dim = +dim;

            //var ret = typeof dim === 'number' ? Math.round(dim/1)*1 : dim;

            var ret;

            if( use_buckets ) {
                ret = get_bucket_( options.buckets, dim );
            } else {
                ret = Math.round(dim);
            }

            counts[ ret ] = counts[ ret ] || 0;
            counts[ ret ]++;

            return ret;
        });

        console.dir(counts);


        var domain = options.xrange;
        //domain = [0,80];
        var xrange = domain[1] - domain[0];

        var bin_me = xrange > 30;
        var runtime_group;

        if( bin_me ) {

            var binWidth = xrange / ST.NUM_BINS;
            runtime_group = runtime_dimension.group( function(d){
                return Math.floor(d / binWidth) * binWidth;
            } );
        } else {
            runtime_group = runtime_dimension.group();
        }

        var width = options.width || 580;
        var height = options.height || 180;

        var xlabel = options["x-label"] || "";
        var ylabel = options["y-label"] || "";

        var style = options.show ? "display: block;" : "display: none;";

        var rcht = '<div class="runtime-chart' + inst_num_ + '" style="' + style + '" chart-dimension="' + dimension.toLowerCase() + '"> \
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



        var xinput = d3.scaleLinear(0.25).domain( domain );

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
            .elasticX(false)  //  The reason I set elasticX to false is so that it will use the min and max numbers. for the domain.
            // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
            .centerBar( false )
            // (_optional_) set gap between bars manually in px, `default=2`
            .gap(1)
            // (_optional_) set filter brush rounding
            .round(dc.round.floor)
            //.xUnits(function() {return 20;})   //  not a function.
            .alwaysUseRounding(true)
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
            });


        /*  .xUnits(d3.time.months)
            .xUnits is what gets the bar width right (so that dc.js can count the number of visible bars).
        */
        if( bin_me ) {
            one_i.xUnits( function() {
                return ST.NUM_BINS;
            }); //.gap(5);
        }


        //  if we're going to calculate the yrange correctly it's going to get tough.
        //  https://github.com/dc-js/dc.js/issues/667
        if( false ) {
            one_i.chart(function (c) {
                var child = dc.lineChart(c);
                dc.override(child, 'yAxisMin', function () {
                    var min = d3.min(child.data(), function (layer) {
                        return d3.min(layer.values, function (p) {
                            return p.y + p.y0;
                        });
                    });
                    return dc.utils.subtract(min, child.yAxisPadding());
                });
                return child;
            });
        }

        // Customize axes
        var xticks = one_i.xAxis().tickFormat(
            function (v) {

                var is_date = options.type === "date";
                v = get_dec_v_( v, use_buckets, options.use_middling, is_date );

                return v + (options.xsuffix !== undefined ? options.xsuffix : '');
            });

        if( options["x-ticks"] ) {
            xticks.ticks( options["x-ticks"] );
        }

        one_i.yAxis().ticks( options["y-ticks"] || 5);

        inst_num_++;
    };


    var get_yrange_ = function( counts ) {

        var min = 10000000;
        var max = 0;

        for( var z in counts ) {

            var cc = counts[z];

            if( cc > max ) {
                max = cc;
            }

            if( cc < min ) {
                min = cc;
            }
        }

        var pad = (max - min) * 0.1;
        var minp = min - pad;
        minp = minp < 0 ? 0 : minp;

        return [minp, max];
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

    var get_date_ = function( d ) {

        var date = new Date(d);
        var month = parseInt(date.getMonth());
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var mon = months[month];
        var day = date.getDate();
        var year = date.getFullYear(); //  -2000

        var minutes = date.getMinutes();
        var hour = date.getHours();

        var formattedTime = year + '-' + mon + '-' + day + "   " + hour + ":" + minutes;
        return formattedTime;
    };


    var commas_ = function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };


    var get_dec_v_ = function(v, use_buckets, use_middling, is_date ) {

        if( is_date ) {
            return get_date_(v*1000);
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