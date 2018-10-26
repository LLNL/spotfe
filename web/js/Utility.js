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


    return {
        get_param: get_param_
    }
}();