ST.UrlStateManager = function() {

    var filtered_ = function(chart) {

        var filters = chart.filters();
        if(filters.length) {
            var range = filters[0];
            console.log('range:', range[0], range[1]);
            console.dir(filters);
        }
        else {
            console.log('no filters');
        }
    };

    return {
        filtered: filtered_
    }
}();