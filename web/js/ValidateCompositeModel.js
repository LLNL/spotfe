ST.ValidateCompositeModel = function() {

    var validate_ = function( ops ) {

        console.dir( ops );

        for( var z = 0; z < ops.length; z++ ) {

            var att = ops[z].attribute;
            console.log(att);
        }

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