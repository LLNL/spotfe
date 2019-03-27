var ST = ST || {};

ST.Default = {
    COMMAND: "/usr/gapps/wf/web/spot/virtenv/bin/python /usr/gapps/wf/web/spot/spot.py"
};

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
        ST.params.get_rundata_url = ST.Utility.get_param('get_rundata_url');
        ST.params.max = ST.Utility.get_param('max');
        ST.params.machine = ST.Utility.get_param('machine');
        ST.params.layout = ST.Utility.get_param('layout');
        ST.params.command = ST.Utility.get_param('command');

        ST.params.max = ST.params.max || 18000;
        ST.params.machine = ST.params.machine || "rzgenie";
        ST.params.get_rundata_url = ST.params.get_rundata_url || get_default_url_();
        ST.params.command = ST.params.command || ST.Default.COMMAND;
    };


    var get_default_url_ = function() {
        var rz = window.location.hostname === "rzlc.llnl.gov" ? 'rz' : '';
        return 'https://' + rz + 'lc.llnl.gov/lorenz/lora/lora.cgi/jsonp';
    };

    return {
        validate_cali_object: validate_cali_object_,
        init_params: init_params_,
        get_file: get_file_,
        get_param: get_param_,
        error: error_
    }
}();