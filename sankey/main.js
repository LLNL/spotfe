
var render = function( data ) {

    var parsed = JSON.parse(data.output.command_out);
    console.dir( parsed );

    new Vue({
        el: '#app',
        data: {
            myInputData: parsed
        },
    });
};

$(document).ready( function() {

    //var command = "/usr/gapps/wf/web/spot/virtenv/bin/python /usr/gapps/wf/web/spot/spot.py durations /usr/gapps/wf/web/spot/data/lulesh_maximal/180927-111516_20211_r0F16Lg2yVqK.cali";
    var command = ST.Utility.get_param('command');
    command = decodeURIComponent(command);
    console.dir(command);

    var machine = ST.Utility.get_param('machine');
    var is_rz = location.href.indexOf('rzlc.llnl.gov') > -1;
    var pre = is_rz ? 'https://rzlc.llnl.gov' : 'https://lc.llnl.gov';

    $.ajax({
        dataType:'jsonp',
        url:     pre + '/lorenz/lora/lora.cgi/jsonp',
        data:   {
            'via'    : 'post',
            'route'  : '/command/' + machine,      //  rzgenie
            'command': command
        }
    }).done( render );

});

