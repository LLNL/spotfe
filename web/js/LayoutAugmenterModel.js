ST.LayoutAugmenterModel = function() {

    var model_;

    //  The backend will not control things like width and height of charts.
    //  It's up to us here to augment the model with the correct layout attributes.
    var get_ = function( model, data ) {

        model_ = model;

        for( var x in model ) {

            var mod = model[x];
            mod.width = 680;
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

                attr = attr.toLowerCase();

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

                spec[attr].count = spec[attr].count || 0;
                spec[attr].count++;
            }
        }



        for( var mx in model ) {

            var mod = model[mx];

            if( mod.viz === ST.CONSTS.SCATTER_PLOT ) {

                Assert( model[mx].xaxis, "model[mx] has no xaxis.  All ScatterPlots must have an xaxis designation in their layout.");

                var xaxis = model[mx].xaxis;
                var yaxis = model[mx].yaxis;

                Assert( spec[xaxis], "The xaxis listed (" + xaxis + ") was not found in the spec.");

                var xmin = spec[xaxis].min - 1;
                var xmax = (+spec[xaxis].max) + 1;

                var ymin = spec[yaxis].min - 1;
                var ymax = spec[yaxis].max + 1;

                model[mx].xrange = [ xmin, xmax];
                model[mx].yrange = [ ymin, ymax ];
            }

            //  Don't override a layout generated buckets.
            if( mod.viz === "BarChart" && !model[mx].buckets ) {

                var attr = model[mx].dimension;
                spec[attr] = spec[attr] || {};

                spec[attr].distance = spec[attr].max - spec[attr].min;

                var bar_width;
                var first_bar_barrier = 0;

                //  Use buckets to create sub-integer support.
                if( ST.BarChart.should_i_bin( spec[attr].distance, spec[attr].has_decimal ) ) {

                    bar_width = spec[attr].distance / ST.NUM_BINS;
                    first_bar_barrier = bar_width;
                } else {
                    bar_width = 1;
                }

                //options.buckets = "['0-0.2', '0.2-0.4', '0.4-0.6', '0.6-1', '1-10']";

                spec[attr].min = +spec[attr].min;
                spec[attr].max = +spec[attr].max;

                model[mx].xrange = [spec[attr].min - first_bar_barrier, spec[attr].max + bar_width];
                model[mx].has_decimal = spec[attr].has_decimal;


                var xr = model[mx].xrange;

                if( bar_width !== 1 && false ) {

                    var before_dash = xr[0];
                    var after_dash = xr[0] + bar_width;

                    model[mx].buckets = [];
                    model[mx].use_middling = true;

                    do {
                        before_dash += bar_width;
                        after_dash += bar_width;

                        var before = round_( before_dash );
                        var after = round_( after_dash );

                        var dash_str = before + '-' + after;

                        model[mx].buckets.push(dash_str);

                    } while( after_dash < xr[1] );

                    model[mx].buckets = JSON.stringify( model[mx].buckets );
                }
            }
        }
    };


    var round_ = function( i ) {
        return i; //Math.round( i * 10 ) / 10;
    };

    var get_viz_ = function( dimension ) {

        var mod = get_mod_(dimension);
        return mod ? mod.viz : "mod not found";
    };

    var get_mod_ = function( dimension ) {

        for( var x=0; x < model_.length; x++ ) {

            var mod = model_[x];

            if( dimension === mod.dimension ) {
                return mod;
            }
        }

        return false;
    };

    var get_type_ = function( dimension ) {

        var mod = get_mod_(dimension);
        return mod ? mod.type : "mod not found";
    };

    var is_unique_limited_ = function( dimension ) {

        model_ = ST.layout_used.charts;
        var type = get_type_( dimension );
        return type === "string" || type === "set of string";
    };

    var set_model_ = function( model ) {
        model_ = model;
    };

    return {
        set_model: set_model_,
        get: get_,
        get_model: function() {
            return model_;
        },
        get_viz: get_viz_,
        get_type: get_type_,
        is_unique_limited: is_unique_limited_
    }
}();