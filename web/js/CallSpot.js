var ST = ST || {};

ST.CallSpot = function() {

    var get_command_ = function( type, file, lay, command ) {

        lay = lay || "";

        return command + ' ' + type  + ' ' + file + lay;
    };

    var ajax_ = function( obj ) {

        var file = obj.file;
        var type = obj.type;
        var success = obj.success || handle_success_;
        var layout = obj.layout || "";
        var commandp = obj.command;

        ST.Utility.init_params();

        var spotArgs = " summary data/lulesh";
        spotArgs = " summary /usr/gapps/wf/web/spot/data/lulesh";

        var command = get_command_( type, file, layout, commandp );
        console.log(command);

        $.ajax({
            dataType:'jsonp',
            type: "POST",
            url: ST.params.get_rundata_url,
            data:   {
                'via'    : 'post',
                'route'  : '/command/' + ST.params.machine,      //  rzgenie
                'command': command
            }
        }).done( success ).error( handle_error_ );
    };


    var objs_by_run_id_ = {};

    //  this is the default success handler
    var handle_success_ = function(value) {

        if( value.error !== "" ) {

            ST.Utility.error( value.error );

        } else {

            var spotReturnedValue = value.output.command_out;
            var parsed_whole = JSON.parse(spotReturnedValue);
            var parsed = parsed_whole.data;

            console.dir(parsed);

            var newp = [];

            for (var key in parsed) {

                if (newp.length < ST.params.max) {

                    var valid_obj = parsed[key];
                    var date = 1539283462;

                    var spot_date = new Date( date * 1000 );

                    var month = spot_date.getMonth() + 1;
                    var day = spot_date.getDate();
                    var year = spot_date.getFullYear();

                    //  This is just for stub
                    valid_obj.epoch_date = date;
                    valid_obj.date = month + "/" + day + "/" + year;
                    valid_obj.run_id = "id_" + Math.floor(Math.random()*10000);
                    valid_obj.drilldown = ['Jupyter', 'mpi', 'walltime'];
                    valid_obj.key = key;

                    newp.push(valid_obj);
                    objs_by_run_id_[valid_obj.run_id] = valid_obj;
                }
            }

            newp[0]['Code Builder'] = "Filler0";
            newp[1]['Code Builder'] = "Filler1";
            /*newp[2]['Compiler Name'] = "GNU Filler";
             newp[3]['Compiler Name'] = "GNU Filler";
             newp[4]['Compiler Name'] = "GNU Filler";
             newp[5]['Compiler Name'] = "GNU Filler";
             newp[6]['Compiler Name'] = "GNU Filler";
             newp[7]['Compiler Name'] = "GNU Filler";*/

            //console.dir(ST.ReturnedDataStub.layout);

            ST.layout_used = parsed_whole.layout;
            console.dir( ST.layout_used );

            if( window.RenderChartCollection ) {
                RenderChartCollection(newp, parsed_whole.layout);  //  ST.ReturnedDataStub.layout); //
            }
            bind_();
        }
    };

    //  Certain events like filtering unbind the buttons, so need to rebind.
    var bind_ = function() {
       $('.dc-table-row .drilldown').unbind('click').bind('click', drill_down_ );
    };

    var handle_error_ = function( data ) {

        var link = "https://rzlc.llnl.gov/";
        console.dir(data);

        var checks = '<li>Make sure you are already authenticated with RZ.  ' +
            'For example, you can try logging in here: <a target="_blank" href="' + link + '">RZ Link</a></li>';

        var pu = ST.Utility.get_param('get_rundata_url');

        if( pu !== undefined ) {
            checks += '<li>Is your <b>get_rundata_url</b> ('+ pu + ') correct? ';
        }

        ST.Utility.error('Could not contact rzlc.llnl.gov  Things to check: <ul>' + checks + '</ul>');
    };


    var get_keys_ = function() {

        var str = "";
        var count = 0;

        $('.dc-table-row .key').each( function() {

            str += ' ' + $(this).html();
        });

        return str.substr(1);
    };

    var drill_down_ = function() {

        if( !$(this).hasClass('drilldown')) {
            //  compare button
            var keys = get_keys_();
            var machine = "machine=" + ST.params.machine + "&";
            localStorage.setItem('calis', keys);

            var directory = ST.Utility.get_file();

            window.open('../dur_sankey/?' + machine + 'calis=local&directory=' + directory);

            return false;
        }

        var run_id = $(this).attr('run_id');
        var subject = $(this).html().toLowerCase();
        var file = ST.Utility.get_file();
        var key = objs_by_run_id_[run_id].key;
        var appended = file + '/' + key;


        console.log( "ri=" + run_id + '  do_this=' + subject );

        if (subject === 'mpi') {

            //  http://localhost:8888
            window.open('../ravel/index.html?cali_key=' + key );

        } else if( subject === "walltime" ) {

            var command = get_command_("durations", appended, "" ) + "&machine=" + ST.params.machine;

            window.open('../sankey/index.html?command=' + command );

        } else {

            //  subject must be jupyter or walltime
            ajax_({
                file: appended,
                type: "jupyter",
                "success": function(data) {

                    var command_out = data.output.command_out;
                    var url = command_out;

                    window.open(url);
                    // now go to the URL that BE tells us to go to.
                }
            });
        }
    };


    ST.params = ST.params || {};


    return {
        drilldown: drill_down_,
        bind: bind_,
        ajax: ajax_
    }
}();