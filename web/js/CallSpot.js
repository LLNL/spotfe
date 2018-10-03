ST.CallSpot = function() {

    var ajax_ = function() {

        var spotArgs = " summary data/lulesh";
        spotArgs = " summary /usr/gapps/wf/web/spot/data/lulesh";

        $.ajax({
            dataType:'jsonp',
            url:     'https://rzlc.llnl.gov/lorenz/lora/lora.cgi/jsonp',
            data:   {
                'via'    : 'post',
                'route'  : '/command/rztopaz',
                'command': 'bash <<BASH_INPUT\n/usr/gapps/wf/web/spot/virtenv/bin/python /usr/gapps/wf/web/spot/spot.py ' + spotArgs + '\nBASH_INPUT\n'
            }
        }).done(function(value) {

            var spotReturnedValue = value.output.command_out;
            var parsed = JSON.parse( spotReturnedValue );

            var newp = [];

            for( var x in parsed ) {

                if( newp.length < 4500 ) {
                    newp.push(parsed[x][0]);
                }
            }

            newp[0]['Code Builder'] = "Filler0";
            newp[1]['Code Builder'] = "Filler1";
            newp[2]['Compiler Name'] = "GNU Filler";
            newp[3]['Compiler Name'] = "GNU Filler";
            newp[4]['Compiler Name'] = "GNU Filler";
            newp[5]['Compiler Name'] = "GNU Filler";
            newp[6]['Compiler Name'] = "GNU Filler";
            newp[7]['Compiler Name'] = "GNU Filler";

            ST.ReturnedDataStub.data = newp;
            console.dir(newp);
            RenderChartCollection();
        }).error(function() {

            var link = "https://rzlc.llnl.gov/";

            $('body').prepend('<div class="error_statement">Could not contact rzlc.llnl.gov  Make sure you have internet connection and are already authenticated with RZ.  For example <a target="_blank" href="' + link + '">RZ Link</a> </div>');
        });
    };


    $(document).ready( function() {

        ajax_();
    });
}();