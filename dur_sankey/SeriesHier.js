ST.SeriesHier = function() {

    var all_responses_, not_done_;

    var handle_one_response_ = function( ret ) {

        var command_out = ret[0].output.command_out;
        var pcom = JSON.parse(command_out);

        all_responses_ = all_responses_.concat( pcom );
    };


    var get_input_section_ = function( total ) {

        return total.splice( index, 20 );
    };


    var run_ = function( predir, dirs, command ) {

        all_responses_ = [];
        var jax_calls = [];
        not_done_ = false;
        var sections = [];

        var my_dirs = dirs.split(' ');

        for( var z=0; z < my_dirs.length; z++ ) {

            var section = parseInt(z / 10);

            sections[ section ] = sections[ section ] || [];
            sections[ section ].push( my_dirs[z] );
        }


        for( var u =0; u < sections.length; u++ ) {

            var sec = sections[u];
            var sec_str = sec.join(' ');

            var jj = ST.CallSpot.ajax({
                file: predir + " " + sec_str,
                command: command,
                type: 'hierarchical'
            });

            jax_calls.push( jj );
        }

        $.when.apply($, jax_calls).then( function() {

            for(var arg = 0; arg < arguments.length; ++ arg) {

                var arr = arguments[arg];
                handle_one_response_(arr);
            }

            init_with_ar_(all_responses_);
        } );

    };

    return {
        run: run_
    }
}();

