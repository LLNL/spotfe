ST.CompositeLayoutModel = function() {

    var update_composite_ = function() {

        var ch = sqs.layout_used.charts;

        for (var y = 0; y < ch.length; y++) {

            var ch_i = ch[y];

            if (ch_i.composite_layout) {

                update_one_plot_( ch_i.composite_layout, ch_i.dimension );
            }
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

            str += operation + key_val;
        }

        console.log( str );
        var ev = eval( str );

        return ev;
    };


    return {
        update_composite: update_composite_
    }
}();