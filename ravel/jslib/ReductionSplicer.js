ST.ReductionSplicer = function() {

    var MAX_STEP = 100;

    var get_ = function( events, messages ) {

        var red_ev = [];
        var red_mes = [];

        for( var x=0; x < events.length; x++ ) {

            var ev = events[x];

            if( ev.step < MAX_STEP ) {
                red_ev.push( ev );
            }
        }

        for( var y = 0; y < messages.length; y++ ) {

            var ey = messages[y];

            if( ey.recvstep < MAX_STEP ) {
                red_mes.push( ey );
            }
        }

        return {
            events: red_ev,
            messages: red_mes
        };
    };


    return {
        get: get_
    }
}();
