ST.CompositeLayoutModel = function() {

    var update_composite_ = function() {

        if( sqs.layout_used ) {
            var ch = sqs.layout_used.charts;

            for (var y = 0; y < ch.length; y++) {

                var ch_i = ch[y];

                if (ch_i.composite_layout) {

                    update_one_plot_(ch_i.composite_layout, ch_i.dimension);
                }
            }
        } else {
            console.log('sqs.layout not yet defined, so skipping update_composite_()');
        }
    };


    var update_one_plot_ = function( cl, the_dimension ) {

        for( var x=0; x < ST.cali_obj_by_key.length; x++ ) {

            //  TODO: figure out the formula based on what we've saved in the layout.
            var result = apply_formula_( cl.operations, ST.cali_obj_by_key[x] );

            ST.cali_obj_by_key[x][the_dimension] = result;
            //parseInt(Math.random()*90);
        }
    };


    var apply_formula_ = function( operations, formula_data ) {

        var str = "";

        for( var g=0; g < operations.length; g++ ) {

            var op = operations[g];
            var operation = op.operation || "";
            var key_val = formula_data[ op.attribute ] || 0;

            if( !formula_data[ op.attribute ] ) {

                var fd_contents = "";

                for( var y in formula_data ) {
                    fd_contents += ", " + y;
                }

                //console.log('Warning, I could not find the following attribute: "' + op.attribute + '" in the cali_object.  ' +
                //    'I could only find the following references: ' + fd_contents);
            }

            var operator_value = make_str_if_str_( key_val );
            str += operation + add_unary_( operator_value, op.unary_operation, op.const_binary_in );
        }

        //console.log( str );
        const regex =  new RegExp(ST.CONSTS.STRCON,'g');
        str = str.replace( regex, '+');

        var ev = eval( str );

        return ev;
    };


    var add_unary_ = function( val, unary_operation, const_binary_in ) {

        for( var ofTypeWordIndex in $.fn.MultiRowSelector.ofTypes ) {

            var def_obj = $.fn.MultiRowSelector.ofTypes[ ofTypeWordIndex ];

            if( def_obj && def_obj.display === unary_operation ) {

                var call_ret = "";

                if( def_obj.call_func ) {

                    call_ret = def_obj.call_func.replace( 'REPLACE_SUBJECT', val );

                    if( typeof const_binary_in === "string" ) {
                        const_binary_in = '"' + const_binary_in + '"';
                    }

                    call_ret = call_ret.replace('CONST_BINARY_IN', const_binary_in );

                    return call_ret;
                }
            }
        }

        return val;
    };


    //  this value could be a string or it might not be.
    var make_str_if_str_ = function( s ) {

        if( isNaN(s) ) {
            //  quotes allow the JS eval to work correctly.
            return '"' + s + '"';
        }else {
            //  it's a number then no quotes needed.
            return s;
        }
    };


    var get_viz_type_based_on_cali_data_type_ = function( ops ) {

        var def = "BarChart";

        for( var x=0; x < ops.length; x++ ) {

            var obo = ops[x];
            var attribute = obo.attribute;
            var js_type = get_javascript_type_( attribute );

            //  this is the case where you are using a unary operator to
            //  override the type.  for example: Day_of_week_str( launchdate )
            //  would return type str, not int.
            if( obo.ret_type && obo.ret_type !== ST.CONSTS.NO_UNARY_OP_SELECTED) {
                js_type = obo.ret_type;
            }

            if( js_type === "string") {
                return "PieChart";
            }
        }

        return def;
    };


    var get_javascript_type_ = function( att ) {

        for( var x=0; x < ST.cali_obj_by_key.length; x++ ) {

            var obj = ST.cali_obj_by_key[x];

            var ty = typeof obj[att];
            if( ty === 'string' ) {

                //  attempt to convert to a number.
                var convert = +obj[att];

                if( isNaN( convert ) || convert === undefined ) {
                    return 'string';
                } else {
                    return 'number';
                }
            } else {
                //  probably a number.
                return ty;
            }
        }
    };


    var get_js_type_based_on_cali_data_type_ = function( ops ) {

        for( var x=0; x < ops.length; x++ ) {

            var obo = ops[x];
            var attribute = obo.attribute;
            var js_type = get_javascript_type_( attribute );

            if( js_type === "string") {
                return "string";
            }
        }

        return "int";
    };


    //  INPUT:
    //      runs from index.js, originating from the getData call.
    //      that's a different output from the summary call we get back from the BE.
    //
    //  OBJECTIVE:
    //      Sync runs to ST.cali_obj_by_key so it's up to date
    //
    //  Use output of this function to feed the handle_success of Callspot.js
    //  to populate the ST.cali_obj_by_key store which is needed for the augment_first function.
    var update_cali_obj_with_CS_compatible_ = function( runs ) {

        ST.cali_obj_by_key = ST.cali_obj_by_key || {};

        for( var x=0; x < runs.length; x++ ) {

            var run_key = x + "";
            var meta = runs[x].meta;

            ST.cali_obj_by_key[ run_key ] = ST.cali_obj_by_key[ run_key ] || {};

            for( var meta_att in meta ) {

                var obj = meta[meta_att];
                var val = obj.value;

                ST.cali_obj_by_key[ run_key ][ meta_att] = val;
            }
        }
    };


    //  sqs.layout_used.charts[22].title
    var augment_first_run_to_include_composite_charts_ = function( runs ) {

        update_cali_obj_with_CS_compatible_( runs );
        update_composite_();

        if( sqs.layout_used ) {

            var already_have = runs[0].meta;
            var charts = sqs.layout_used.charts;

            for (var x = 0; x < charts.length; x++) {

                var chart = charts[x];
                var dimension = chart.dimension;
                var title = chart.title;

                if (!already_have[dimension]) {

                    for (var z = 0; z < runs.length; z++) {

                        var run_key = z + "";
                        var run_obj = ST.cali_obj_by_key[run_key];
                        var val = run_obj ? run_obj[dimension] : -1;

                        runs[z].meta[title] = {
                            type: "int",
                            value: val
                        }
                    }
                }
            }
        }

        return runs;
    };


    //  For the benefit of the compare view, we need to update runs which will then be returned to window.runs
    var remove_composite_chart_from_runs_ = function( dimension ) {

        var title = get_title_( dimension );
        console.log('title=' + title);

        for (var z = 0; z < window.runs.length; z++) {

            delete window.runs[z].meta[title];
        }
    };


    var get_title_ = function( dimension ) {

        var charts = sqs.layout_used.charts;
        for( var x=0; x < charts.length; x++ ) {

            var dim = charts[x].dimension;
            if( dim.toLowerCase() === dimension.toLowerCase() ) {

                return charts[x].title;
            }
        }

        return "title not found";
    };


    var log_ = function() {

        for( var x in sqs.layout_used.charts) {

            var obj = sqs.layout_used.charts[x];
            if(obj.composite_layout) {
                console.log( obj );
            }
        }
    };


    var pad_right_ = function(s) {
        var s2 = s + "                             ";
        var s3 = s2.slice(0, 16);
        return s3;
    };

    var show_composites_ = function() {

        var sep = " = ";
        console.log('============================================================');

        for( var x in sqs.layout_used.charts) {

            var obj = sqs.layout_used.charts[x];

            if(obj.composite_layout) {

                console.log( pad_right_("Title") + sep + obj.title );
                console.log( pad_right_("Viz") + sep + obj.viz );

                var ops = obj.composite_layout.operations;

                for( var y=0; y < ops.length; y++ ) {

                    var op = ops[y];

                    for( var att in op ) {

                        var con = op[att];
                        console.log( pad_right_( att ) + sep + con );
                    }

                    if( y < (ops.length -1)) {
                        console.log('----------------------------------------');
                    }
                }

                console.log('============================================================');
            }
        }
    };


    return {
        log: log_,
        show_composites: show_composites_,
        remove_composite_chart_from_runs: remove_composite_chart_from_runs_,
        augment_first_run_to_include_composite_charts: augment_first_run_to_include_composite_charts_,
        get_js_type_based_on_cali_data_type: get_js_type_based_on_cali_data_type_,
        get_viz_type_based_on_cali_data_type: get_viz_type_based_on_cali_data_type_,
        update_composite: update_composite_
    }
}();