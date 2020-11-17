ST.ValidateCompositeModel = function() {

    var str_types_ = ["datapath", "set of path", "path", "libraries", "set of string", "cluster", "user", "string"];

    //  Our type system is very specific, has many string types
    var specific_type_is_str_ = function( str ) {

        return str_types_.indexOf( str ) > -1;
    };


    var validate_ = function( ops ) {

        console.dir( ops );

        var have_at_least_1_str = false;
        var have_non_strcon_op = false;

        var cumulative_ops = "";
        var strs_selected = "";

        for( var z = 0; z < ops.length; z++ ) {

            var att = ops[z].attribute;
            var operation = ops[z].operation;
            var type = ST.UserPreferences.get_dimension_type_by_name( att );

            console.log("type: " + type);
            console.log("attr: " + att);

            if( specific_type_is_str_( type ) ) {
                have_at_least_1_str = true;
                strs_selected += ", (<b>" + att + "</b> of type <b>" + type + "</b> is a string)";
            }

            if( operation !== undefined && operation !== ST.CONSTS.STRCON ) {
                have_non_strcon_op = true;
            }

            if( operation !== undefined ) {
                cumulative_ops += ", " + operation;
            }
        }


        if( have_at_least_1_str && have_non_strcon_op ) {

            cumulative_ops = cumulative_ops.substr(2);
            strs_selected = strs_selected.substr(2);

            return "You have selected a string type " + strs_selected + " from the attribute drop downs.  " +
                "Only <b>" + ST.CONSTS.STRCON + "</b> operation is permitted on string types.  <br><br>Operations you selected: <b>" + cumulative_ops + "</b>";
        }

        //  everything is okay.
        return true;
    };


    var validate_name_ = function( name ) {

        var already_present = window.runs[0].meta[name];

        return already_present ? "You already have a chart with the name: " + name : true;
    };


    var validate_dimension_ = function( generated_dimension ) {

        var already_dim = ST.cali_obj_by_key[0][generated_dimension];

        return already_dim ? "There is already a chart with these operations: " + generated_dimension : true;
    };

    return {
        validate: validate_,
        validate_dimension: validate_dimension_,
        validate_name: validate_name_
    }
}();