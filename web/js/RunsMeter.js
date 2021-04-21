ST.RunsMeter = function() {

    var storedRuns_;

    var meter_ = function( runs ) {

        if( !storedRuns_ ) {
            storedRuns_ = runs;
        }

        runs = runs.slice(0, 100);

        return runs;
    };

    return {
        meter: meter_
    }
}();