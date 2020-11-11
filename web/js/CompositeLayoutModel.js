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

                console.log('Warning, I could not find the following attribute: "' + op.attribute + '" in the cali_object.  ' +
                    'I could only find the following references: ' + fd_contents);
            }

            str += operation + make_str_if_str_( key_val );
        }

        //console.log( str );
        const regex =  new RegExp(ST.CONSTS.STRCON,'g');
        str = str.replace( regex, '+');

        var ev = eval( str );

        return ev;
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

            if( js_type === "string") {
                return "PieChart";
            }
            console.log( js_type );
        }

        return def;
    };


    var get_javascript_type_ = function( att ) {

        for( var x=0; x < ST.cali_obj_by_key.length; x++ ) {

            var obj = ST.cali_obj_by_key[x];

            return typeof obj[att];
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
            console.log( js_type );
        }

        return "int";
    };


    //  INPUT:
    //      runs from index.js, originating from the getData call.
    //      that's a different output from the summary call we get back from the BE.
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

        console.dir( ST.cali_obj_by_key );
    };


    //  sqs.layout_used.charts[22].title
    var augment_first_run_to_include_composite_charts_ = function( runs ) {

        console.dir( runs );

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
                        var stub = parseInt(Math.random() * 17) + 5;
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

    return {
        augment_first_run_to_include_composite_charts: augment_first_run_to_include_composite_charts_,
        get_js_type_based_on_cali_data_type: get_js_type_based_on_cali_data_type_,
        get_viz_type_based_on_cali_data_type: get_viz_type_based_on_cali_data_type_,
        update_composite: update_composite_
    }
}();