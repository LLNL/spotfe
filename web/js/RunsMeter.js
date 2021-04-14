ST.RunsMeter = function() {

    var meter_ = function( runs ) {

        runs = runs.slice(0,200);
        return runs;
    };

    return {
        meter: meter_
    }
}();