ST.ValidateCompositeModel = function() {

    var validate_ = function( ops ) {

        console.dir( ops );
        return false;
    };

    return {
        validate: validate_
    }
}();