ST.CallSpot = function() {

    var ajax_ = function( file ) {

        var spotArgs = " summary data/lulesh";
        spotArgs = " summary /usr/gapps/wf/web/spot/data/lulesh";
        var command = '/usr/gapps/wf/web/spot/virtenv/bin/python /usr/gapps/wf/web/spot/spot.py  summary ' + file;

        $.ajax({
            dataType:'jsonp',
            url:     'https://rzlc.llnl.gov/lorenz/lora/lora.cgi/jsonp',
            data:   {
                'via'    : 'post',
                'route'  : '/command/rztopaz',      //  rzgenie
                'command': command
            }
        }).done(function(value) {

            if( value.error !== "" ) {

                error_( value.error  + "<br><br>pro tip: see Joe Chavez.");
                console.log('command=' + command);

            } else {

                var spotReturnedValue = value.output.command_out;
                var parsed = JSON.parse(spotReturnedValue);

                for( var y in parsed ) {

                    var par = parsed[y];
                    for( var z in par ) {

                        //par[z] = +par[z];

                        if( isNaN(par[z]) ) {
                          //  par[z] = 1;
                        }

                        if( z === undefined || par[z] === undefined || isNaN(par[z])) {
                            //console.log('isnu='+z + '  par[z]=' + par[z]);
                        }
                    }
                }

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
                        valid_obj.run_id = "id_" + month + "_" + day;
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

    $(document).ready( function() {

        var file = get_('sf');
        max_ = get_('max');

        var default_file = "/usr/gapps/wf/web/spot/data/lulesh_maximal";

        file = file || default_file;
        max_ = max_ || 3000;

        help_icon_(file, max_);

        ajax_(file);
    });
}();