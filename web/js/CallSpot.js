ST.CallSpot = function() {

    var ajax_ = function( file, type, success ) {

        var spotArgs = " summary data/lulesh";
        spotArgs = " summary /usr/gapps/wf/web/spot/data/lulesh";
        var command = '/usr/gapps/wf/web/spot/virtenv/bin/python /usr/gapps/wf/web/spot/spot.py ' + type  + ' ' + file;

        $.ajax({
            dataType:'jsonp',
            url:     'https://rzlc.llnl.gov/lorenz/lora/lora.cgi/jsonp',
            data:   {
                'via'    : 'post',
                'route'  : '/command/rztopaz',      //  rzgenie
                'command': command
            }
        }).done( success ).error( handle_error_ );
    };

    var handle_success_ = function(value) {

        if( value.error !== "" ) {

            error_( value.error  + "<br><br>pro tip: see Joe Chavez.");

        } else {

            var spotReturnedValue = value.output.command_out;
            var parsed = JSON.parse(spotReturnedValue);

            var newp = [];

            for (var x in parsed) {

                if (newp.length < max_) {

                    var valid_obj = parsed[x];
                    var date = 1539283462;

                    var spot_date = new Date( date * 1000 );

                    var month = spot_date.getMonth() + 1;
                    var day = spot_date.getDate();
                    var year = spot_date.getFullYear();

                    //  This is just for stub
                    valid_obj.epoch_date = date;
                    valid_obj.date = month + "/" + day + "/" + year;
                    valid_obj.run_id = "id_" + Math.floor(Math.random()*10000);
                    valid_obj.drilldown = ['Jupyter', 'mpi', 'duration'];

                    newp.push(valid_obj);
                }
            }

            newp[0]['Code Builder'] = "Filler0";
            newp[1]['Code Builder'] = "Filler1";
            /*             newp[2]['Compiler Name'] = "GNU Filler";
             newp[3]['Compiler Name'] = "GNU Filler";
             newp[4]['Compiler Name'] = "GNU Filler";
             newp[5]['Compiler Name'] = "GNU Filler";
             newp[6]['Compiler Name'] = "GNU Filler";
             newp[7]['Compiler Name'] = "GNU Filler";*/

            console.dir(newp);
            RenderChartCollection( newp );
            bind_();
        }
    };

    //  Certain events like filtering unbind the buttons, so need to rebind.
    var bind_ = function() {
        $('.dc-chart .myButton').unbind('click').bind('click', drill_down_ );
    };

    var handle_error_ = function() {

        var link = "https://rzlc.llnl.gov/";
        error_('Could not contact rzlc.llnl.gov  Make sure you are already authenticated with RZ.  For example <a target="_blank" href="' + link + '">RZ Link</a>');
    };

    var error_ = function( str ) {

        var html = '<div class="error_statement">' + str + '</div>';
        $('body').prepend( html );
    };

    var drill_down_ = function() {

        var run_id = $(this).attr('run_id');
        var subject = $(this).html().toLowerCase();

        console.log( "ri=" + run_id + '  do_this=' + subject );

        if (subject === 'mpi') {

            //  http://localhost:8888
            window.open('../ravel/index.html');
        } else {

            var file = get_file_();

            ajax_(file, "jupyter", function(data) {

                var url = data.output.command_out;
                window.open( url );
                // now go to the URL that BE tells us to go to.
            });
        }
    };

    function getUrlVars_() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    };

    var get_ = function( param ) {
        var vars = getUrlVars_();
        return vars[param];
    };

    var help_icon_ = function( file, max ) {

        Vue.component('help-section', {
            data: function () {
                return {
                    seen: false,
                    max: max_,
                    file: file
                }
            },
            template: '<div>' +
                '<div class="help_icon" v-on:click="seen=(!seen)">?</div>\
                <div class="help_body" v-if="seen">\
                Using file: <span class="txt">{{ file }}</span>\
                <br>Using max: <span class="max">{{ max }}</span>\
                <br>You can specify the <b>s</b>pot <b>f</b>ile with sf= in the url bar.\
                <br>You can specify the <b>max</b> with max= in the url bar.\
                </div> ' +
            '</div>'
        });

        //  Need to find the dc.js end event handler.
        new Vue({
            el: "#help_icon"
        });
    };


    var max_;

    var get_file_ = function() {

        var file = get_('sf');
        var default_file = "/usr/gapps/wf/web/spot/data/lulesh_maximal";

        return file || default_file;
    };

    $(document).ready( function() {

        max_ = get_('max');

        max_ = max_ || 3000;
        var file = get_file_();

        help_icon_(file, max_);

        ajax_(file, 'summary', handle_success_ );
    });

    return {
        bind: bind_
    }
}();