var ST = ST || {};

ST.Utility = function() {

    function getUrlVars_() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    };

    var get_param_ = function( param ) {
        var vars = getUrlVars_();
        return vars[param];
    };

    var error_ = function( str ) {

        if( $('.error_statement').length === 0 ) {

            var html = '<div class="error_statement">' + str + '</div>';
            $('body').prepend( html );
        }
    };

    var validate_cali_object_ = function( cali_object, dimension ) {

        //  We allow blank values and false values that evaluate to false.
        //  undefined indicates an actual mismatch.
        if( cali_object[dimension] === undefined ) {

            var dimensions_available = "";
            for( var x in cali_object ) {
                dimensions_available += ', ' + x;
            }

            ST.Utility.error('From layout_spec, could not find dimension <b>' + dimension + '</b> in Data Set.  ' +
                'Data set contains the following dimensions: ' + dimensions_available.substr(1) + '.  Probable solution: Change layout spec to match data.');
        }
    };

    var get_file_ = function() {

        var file = ST.Utility.get_param('sf');
        var default_file = "/usr/gapps/spot/datasets/lulesh2small"; // "/usr/gapps/wf/web/spot/data/lulesh_maximal";

        return file || default_file;
    };

    var init_params_ = function() {

        ST.params = ST.params || {};
        ST.params.max = ST.Utility.get_param('max');
        ST.params.machine = ST.Utility.get_param('machine');
        ST.params.layout = ST.Utility.get_param('layout');

        ST.params.max = ST.params.max || 18000;
        ST.params.machine = ST.params.machine || "rzgenie";
    };

    return {
        validate_cali_object: validate_cali_object_,
        init_params: init_params_,
        get_file: get_file_,
        get_param: get_param_,
        error: error_
    }
}();