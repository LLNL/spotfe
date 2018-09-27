ST.CallSpot = function() {

    var ajax_ = function() {

        var spotArgs = "";

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
            console.dir(spotReturnedValue);
        });
    };


    $(document).ready( function() {

        ajax_();
    });
}();