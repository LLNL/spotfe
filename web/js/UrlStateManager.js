ST.UrlStateManager = function() {

    //  User made a change in the chart filters.
    var user_filtered_ = function( chart, type ) {

        var filters = chart.filters();
        var aname = chart.anchorName();
        var instance_num = +aname.replace(/\D/g, '');
        var range = filters[0];
        var param = type + instance_num;
        var cdim = $(aname).attr('chart-dimension');

        if( !cdim ) {
            return false;
        }

        var dimension = cdim.toLowerCase();

        //  need to manually show reset because reset link is outside of horizontal-bar-chart
        var horBar = $('[chart-dimension="' + dimension + '"]');
        horBar.closest('.outer_holder').find('.horiz_reset').show();


        if (range) {

            var paramValue = "";

            if (type === 'PieChart' || type === "HorizontalBarChart" ) {

                for (var x = 0; x < filters.length; x++) {
                    paramValue += "," + encodeURIComponent(filters[x]);
                }

                paramValue = paramValue.substr(1);

            } else if( type === "BarChart" ) {
                paramValue = encodeURIComponent(range[0]) + ',' + encodeURIComponent(range[1]);

            } else if( type === ST.CONSTS.SCATTER_PLOT ) {
                paramValue = encodeURIComponent(range[0][0]) + ',' + encodeURIComponent(range[0][1]) + ',' +
                             encodeURIComponent(range[1][0]) + ',' + encodeURIComponent(range[1][1]);
            }

            update_url_( dimension, paramValue );
        } else {

            //  This means they unclicked all the filters for that one.
            remove_param_( dimension );
        }
    };


    var update_slash_ = function( new_slash ) {

        var newl = location.href.replace(/dur_sankey\//, new_slash);
        history.pushState({}, null, newl);
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

        for( var dimension in inst_ ) {

            var inst = inst_[dimension];
            var params = ST.Utility.get_param(dimension);

            if( params ) {

                console.log(params);
                var sp = params.split(',');

                if( type === "PieChart" || type === "HorizontalBarChart" ) {

                    console.dir(sp);
                    for( var y=0; y < sp.length; y++ ) {

                        var comp = decodeURIComponent(sp[y]);
                        inst.filter(comp);
                    }

                } else if( type === "BarChart" ) {

                    var part0 = decodeURIComponent(sp[0]);
                    var part1 = decodeURIComponent(sp[1]);

                    var rfilter = dc.filters.RangedFilter( part0, part1);

                    inst.filter(rfilter);
                } else if( type === ST.CONSTS.SCATTER_PLOT ) {


                }
            }
        }

        ST.CallSpot.bind();
    };



    var get_chart_pars_ = function() {

        var pars = "";

        var charts = ST.layout_used.charts;

        //  Happens on page load, when we need to load the filters present in the URL bar.
        for( var z=0; z < charts.length; z++ ) {

            var tag = charts[z].dimension.toLowerCase();
            var par = ST.Utility.get_param(tag);

            if( par ) {
                pars += '&' + tag + '=' + par;
            }
        }

        return pars;
    };


    var remove_all_chart_pars_ = function() {

        for( var z=0; z < 10; z++ ) {

            var tag = "PieChart" + z;
            remove_param_(tag);

            var tag = "BarChart" + z;
            remove_param_(tag);

            var tag = ST.CONSTS.SCATTER_PLOT + z;
            remove_param_(tag);
        }

        //dc.redrawAll();
        ST.ChartCollection.bind_sort();
    };


    return {
        update_slash: update_slash_,
        remove_all_chart_pars: remove_all_chart_pars_,
        get_chart_pars: get_chart_pars_,
        update_url: update_url_,
        remove_param: remove_param_,
        user_filtered: user_filtered_,
        load_filter: load_filter_
    }
}();