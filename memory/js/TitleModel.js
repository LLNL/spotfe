ST.TitleModel = function() {

    var mappings = {
        "MemBW": "Memory Bandwidth",
        "Iter": "Iterations",
        "Time": "Time"
    };


    //  only charts that are checked get passed into here.
    var get_title_ = function( charts ) {

        var title = {};
        var all = {};

        for( var x=0; x < charts.length; x++ ) {

            var chart = charts[x];
            var label = chart.name;

            all[ label ] = 1;

            for( var y in mappings ) {

                if( label && label.indexOf(y) > -1 ) {
                    title[ mappings[y] ] = 1;
                }
            }
        }

        var keys = Object.keys(title);

        if( keys.length === 0 ) {
            return obj_keys_to_str_(all);
        }

        return obj_keys_to_str_(title);
    };

    var obj_keys_to_str_ = function( obj ) {

        var str = "";
        for( var x in obj ) {
            str += ", " + x;
        }

        if( str === "" ) {
            return "";
        }

        return str.substr(2);
    };


    return {
        get_title: get_title_
    }
}();