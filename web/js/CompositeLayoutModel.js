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
            ST.cali_obj_by_key[x][the_dimension] = parseInt(Math.random()*90);
        }
    };


    return {
        update_composite: update_composite_
    }
}();