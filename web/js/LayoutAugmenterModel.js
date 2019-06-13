ST.LayoutAugmenterModel = function() {

    //  The backend will not control things like width and height of charts.
    //  It's up to us here to augment the model with the correct layout attributes.
    var get_ = function( model, data ) {

        for( var x in model ) {

            var mod = model[x];
            mod.width = 470;
            mod.height = 370;

            if( mod.viz === "BasicLineChart" ) {
                mod.height = 320;
            }

            //  TODO: Eventually this will need to be calcualted dynamically
            if( mod.viz === "BarChart" && mod.dimension === "year") {

                mod.xrange =  [2008,2018];
                mod.xsuffix = "";
            }

            if( mod.viz === "PieChart" ) {

                mod.inner_radius = 30;
                mod.radius = 170;
            }
        }

        bucket_sub_integer_( model, data );
    };


    var bucket_sub_integer_ = function( model, data ) {

        var spec = {};
        var len = data.length;

        for( var z=0; z < len; z++ ) {

            var dat = data[z];

            for( var attr in dat ) {

                if( !spec[attr] ) {
                    spec[attr] = {
                        min: 100000000000,
                        max: 0
                    };
                }

                var val = dat[attr];

                if( +val > spec[attr].max ) {
                    spec[attr].max = val;
                }

                if( +val < spec[attr].min ) {
                    spec[attr].min = val;
                }

                if( +val !== parseInt(val) ) {
                    spec[attr].has_decimal = true;
                }
            }
        }


        var SUB_INTEGER_LIMIT = 8;

        for( var mx in model ) {

            var mod = model[mx];

            //  Don't override a layout generated buckets.
            if( mod.viz === "BarChart" && !model[mx].buckets) {

                var attr = model[mx].dimension;
                spec[attr].distance = spec[attr].max - spec[attr].min;

                var bar_width;

                if (spec[attr].distance >= SUB_INTEGER_LIMIT || !spec[attr].has_decimal ) {
                    bar_width = 1;
                } else {
                    //  Use buckets to create sub-integer support.
                    bar_width = spec[attr].distance / SUB_INTEGER_LIMIT;

                    //options.buckets = "['0-0.2', '0.2-0.4', '0.4-0.6', '0.6-1', '1-10']";
                }

                spec[attr].min = +spec[attr].min;
                spec[attr].max = +spec[attr].max;

                model[mx].xrange = [spec[attr].min - bar_width, spec[attr].max + bar_width];
                var xr = model[mx].xrange;

                if( bar_width !== 1 ) {

                    var before_dash = xr[0];
                    var after_dash = xr[0] + bar_width;

                    model[mx].buckets = [];
                    model[mx].use_middling = false;

                    do {
                        before_dash += bar_width;
                        after_dash += bar_width;

                        before_dash = round_( before_dash );
                        after_dash = round_( after_dash );

                        var dash_str = before_dash + '-' + after_dash;

                        model[mx].buckets.push(dash_str);

                    } while( after_dash < xr[1] );

                    model[mx].buckets = JSON.stringify( model[mx].buckets );
                }

                console.dir(mod);
            }
        }
    };


    var round_ = function( i ) {
        return Math.round( i * 10 ) / 10;
    };


    return {
        get: get_
    }
}();