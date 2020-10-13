ST.ValidateCompositeModel = function() {

    var validate_ = function( ops ) {

        console.dir( ops );

        var have_at_least_1_str = false;
        var have_non_plus_op = false;

        for( var z = 0; z < ops.length; z++ ) {

            var att = ops[z].attribute;
            var operation = ops[z].operation;
            var type = ST.UserPreferences.get_dimension( att );

            console.log(type);
            console.log(att);

            if( type === 'string' ) {
                have_at_least_1_str = true;
            }

            if( operation !== undefined && operation !== "+" ) {
                have_non_plus_op = true;
            }
        }


        //  everything is okay.
        return true;
    };

    return {
        validate: validate_
    }
}();