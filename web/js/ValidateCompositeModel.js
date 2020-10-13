ST.ValidateCompositeModel = function() {

    var validate_ = function( ops ) {

        console.dir( ops );

        if( ops[1].attribute === "cmdline") {
            return "its cmdline.";
        }

        //  everything is okay.
        return true;
    };

    return {
        validate: validate_
    }
}();