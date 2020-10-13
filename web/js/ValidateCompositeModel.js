ST.ValidateCompositeModel = function() {

    var validate_ = function( ops ) {

        console.dir( ops );

        var have_at_least_1_str = false;
        var have_non_plus_op = false;

        var cumulative_ops = "";
        var strs_selected = "";

        for( var z = 0; z < ops.length; z++ ) {

            var att = ops[z].attribute;
            var operation = ops[z].operation;
            var type = ST.UserPreferences.get_dimension_type_by_name( att );

            console.log(type);
            console.log(att);

            if( specific_type_is_str_( type ) ) {
                have_at_least_1_str = true;
                strs_selected += ", (<b>" + att + "</b> of type <b>" + type + "</b> is a string)";
            }

            if( operation !== undefined && operation !== "+" ) {
                have_non_plus_op = true;
            }

            if( operation !== undefined ) {
                cumulative_ops += ", " + operation;
            }
        }


        if( have_at_least_1_str && have_non_plus_op ) {

            cumulative_ops = cumulative_ops.substr(2);
            strs_selected = strs_selected.substr(2);

            return "You have selected a string type " + strs_selected + " from the attribute drop downs.  " +
                "Only + operation is permitted on string types.  <br><br>Operations you selected: <b>" + cumulative_ops + "</b>";
        }

        //  everything is okay.
        return true;
    };


    var str_types_ = ["datapath", "datasetkey", "set of path", "path", "libraries", "set of string", "cluster"];

    //  Our type system is very specific, has many string types
    var specific_type_is_str_ = function( str ) {

        return str_types_.indexOf( str ) > -1;
    };

    return {
        validate: validate_
    }
}();