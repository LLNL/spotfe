ST.SeriesHier = function() {

    //  Apache request limit is 4K.  But, we need room for some extra stuff too.  let's not raise this above 3000.
    var MAX_REQUEST_LENGTH = 3000;
    var all_responses_, not_done_, section_;

    var handle_one_response_ = function( ret ) {

        //  If 1 request is sent or more than 1, the return parameters are different.
        if( ret !== "success" ) {
            var blo = ret[0] || ret;

            if( blo.output ) {
                var command_out = blo.output.command_out;
                var pcom = JSON.parse(command_out);

                all_responses_ = all_responses_.concat(pcom);
            }
        }
    };


    var increment_section_ = function( request_arr ) {

        var str_ver = request_arr.join(' ');

        if( str_ver.length > MAX_REQUEST_LENGTH ) {

            //  GO on to the next request.
            section_++;
        }
    };


    var run_ = function( predir, dirs, command ) {

        all_responses_ = [];
        var jax_calls = [];
        not_done_ = false;
        var requests = [];

        var my_dirs = dirs.split(' ');
        section_ = 0;

        for( var z=0; z < my_dirs.length; z++ ) {

            requests[ section_ ] = requests[ section_ ] || [];
            requests[ section_ ].push( my_dirs[z] );

            increment_section_( requests[ section_ ] );
        }


        for( var u =0; u < requests.length; u++ ) {

            var sec = requests[u];
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

