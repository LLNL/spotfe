ST.UrlStateManager = function() {

    //  User made a change in the chart filters.
    var user_filtered_ = function( chart, type ) {

        var filters = chart.filters();
        var aname = chart.anchorName();
        var instance_num = +aname.replace(/\D/g, '');
        var range = filters[0];
        var param = type + instance_num;

        //console.log(instance_num);

        if (range) {
            //console.log('range:', range[0], range[1]);

            var paramValue = "";

            if (type === 'PieChart') {

                for (var x = 0; x < filters.length; x++) {
                    paramValue += "," + filters[x];
                }

                paramValue = paramValue.substr(1);

            } else {
                paramValue = range[0] + ',' + range[1];
            }

            update_url_( param, paramValue );
        }
    };


    var update_url_ = function( param, val ) {

        var loc = "" + location.href;
        var newUrl = updateURLParameter(loc, param, val);

        history.pushState({}, null, newUrl);
    };


    function remove_param_(key) {

        var sourceURL = location.href;

        var rtn = sourceURL.split("?")[0],
            param,
            params_arr = [],
            queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
        if (queryString !== "") {
            params_arr = queryString.split("&");
            for (var i = params_arr.length - 1; i >= 0; i -= 1) {
                param = params_arr[i].split("=")[0];
                if (param === key) {
                    params_arr.splice(i, 1);
                }
            }
            rtn = rtn + "?" + params_arr.join("&");
        }

        history.pushState({}, null, rtn);
    };


    function updateURLParameter(url, param, paramVal){
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i=0; i<tempArray.length; i++){
                if(tempArray[i].split('=')[0] != param){
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }

        var rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    };


    //  Happens on page load, when we need to load the filters present in the URL bar.
    var load_filter_ = function( inst_, type ) {

        for( var z=0; z < 10; z++ ) {

            var params = ST.Utility.get_param( type + z );

            if( params ) {

                var sp = params.split(',');

                if( type === "PieChart" ) {

                    console.dir(sp);
                    for( var y=0; y < sp.length; y++ ) {
                        inst_[z].filter(sp[y]);
                    }

                } else {
                    inst_[z].filter(dc.filters.RangedFilter(sp[0], sp[1]));
                }
            }
        }

        ST.CallSpot.bind();
    };

    var get_chart_pars_ = function() {

        var pars = "";

        //  Happens on page load, when we need to load the filters present in the URL bar.
        for( var z=0; z < 10; z++ ) {

            var tag = "PieChart" + z;
            var par = ST.Utility.get_param(tag);

            if( par ) {
                pars += '&' + tag + '=' + par;
            }


            var tag = "BarChart" + z;
            var par = ST.Utility.get_param(tag);

            if( par ) {
                pars += '&' + tag + '=' + par;
            }
        }

        return pars;
    };

    return {
        get_chart_pars: get_chart_pars_,
        update_url: update_url_,
        remove_param: remove_param_,
        user_filtered: user_filtered_,
        load_filter: load_filter_
    }
}();