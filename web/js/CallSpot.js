ST.CallSpot = function() {

    var ajax_ = function() {

        var spotArgs = " summary data/lulesh";
        spotArgs = " summary /usr/gapps/wf/web/spot/data/lulesh";
        var command = '/usr/gapps/wf/web/spot/virtenv/bin/python /usr/gapps/wf/web/spot/spot.py  summary /usr/gapps/wf/web/spot/data/lulesh_maximal';

        $.ajax({
            dataType:'jsonp',
            url:     'https://rzlc.llnl.gov/lorenz/lora/lora.cgi/jsonp',
            data:   {
                'via'    : 'post',
                'route'  : '/command/rztopaz',
                'command': command
            }
        }).done(function(value) {

            if( value.error !== "" ) {

                error_( value.error  + "<br><br>pro tip: see Joe Chavez.");
                console.log('command=' + command);

            } else {

                var spotReturnedValue = value.output.command_out;
                var parsed = JSON.parse(spotReturnedValue);

                var newp = [];

                for (var x in parsed) {

                    if (newp.length < 4500) {
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
            }
        }).error(function() {

            var link = "https://rzlc.llnl.gov/";
            error_('Could not contact rzlc.llnl.gov  Make sure you are already authenticated with RZ.  For example <a target="_blank" href="' + link + '">RZ Link</a>');
        });
    };

    var error_ = function( str ) {

        var html = '<div class="error_statement">' + str + '</div>';
        $('body').prepend( html );
    };


    $(document).ready( function() {

        ajax_();
    });
}();