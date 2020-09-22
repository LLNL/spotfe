ST.CompositeLayoutModel = function() {

    var update_composite_ = function() {



        for( var x=0; x < ST.cali_obj_by_key.length; x++ ) {

            var the_dimension = "multi_elapse_time";

            //  TODO: figure out the formula based on what we've saved in the layout.
            ST.cali_obj_by_key[x][the_dimension] = parseInt(Math.random()*90);
        }
    };


    return {
        update_composite: update_composite_
    }
}();