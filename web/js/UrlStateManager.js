ST.UrlStateManager = function() {

    //  User made a change in the chart filters.
    var user_filtered_ = function(chart, type) {

        var filters = chart.filters();
        var aname = chart.anchorName();
        var instance_num = +aname.replace(".runtime-chart", "");

        console.log(instance_num);

        if(filters.length) {
            var range = filters[0];
            console.log('range:', range[0], range[1]);
            console.dir(filters);

            var param = type + instance_num;
            var paramValue = range[0] + ',' + range[1];

            var newUrl = updateURLParameter( location.href, param, paramValue );

            history.pushState({}, null, newUrl);
        }
        else {
            console.log('no filters');
        }
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
                inst_[z].filter(dc.filters.RangedFilter(sp[0], sp[1]));
            }
        }

        ST.CallSpot.bind();
    };

    return {
        user_filtered: user_filtered_,
        load_filter: load_filter_
    }
}();