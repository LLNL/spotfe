var ST = ST || {};

ST.CallSpot = function() {

    var get_command_ = function( type, file, lay ) {

        lay = lay || "";

        //var czcommand = "/usr/tce/bin/python3%20/usr/global/web-pages/lc/www/spot/spot.py";
        var czcommand = "/usr/tce/bin/python3%20/usr/gapps/spot/spot.py";
        var rzcommand = ST.Default.COMMAND;

        is_rzlc_target = ST.Utility.on_rz();

        var commandp = is_rzlc_target ? rzcommand : czcommand;

        //  Override if the URL contains command in it.
        var param_com = ST.Utility.get_param('command');
        if( param_com ) {
            commandp = param_com;
        }

        commandp = commandp.replace('%20', ' ');

        return commandp + ' ' + type  + ' ' + file + lay;
    };


    var is_rzlc_target;

    var ajax_ = function( obj ) {

        var file = obj.file;
        var type = obj.type;
        var success = obj.success || handle_success_;
        var layout = obj.layout || "";


        ST.Utility.init_params();

        is_rzlc_target = ST.Utility.on_rz();

        var final_command = get_command_( type, file, layout );

        console.log('final command=' + final_command);
        console.log('url=' + ST.params.get_rundata_url);

        type = ST.params.type;

        $.ajax({
            dataType:'jsonp',
            type: type,
            method: type,
            url: ST.params.get_rundata_url,
            data:   {
                'via'    : 'post',
                'route'  : '/command/' + ST.params.machine,      //  rzgenie
                'command': final_command
            }
        }).done( success ).error( handle_error_ );
    };


    var objs_by_run_id_ = {};

    //  this is the default success handler
    var handle_success_ = function(value) {

        var command_out = value.output ? value.output.command_out : value.responseText;

        if( value.error !== "" && !value.responseText) {

            ST.Utility.error( value.error );

        } else {

            var spotReturnedValue = command_out;
            var parsed_whole = JSON.parse(spotReturnedValue);

            var command_out2;
            var parsed;

            if( parsed_whole.error ) {

                var er = parsed_whole.error;
                var additional = "";

                if( er.indexOf('Failed to run command') > -1 && er.indexOf('No such file or directory') > -1 ) {
                    additional = "<br><br>Usually, this means you need to specify a command.  For example, try adding the following to the URL: &command=/usr/tce/bin/python3%20/usr/global/web-pages/lc/www/spot/spot.py";
                }

                ST.Utility.error( er + additional);


            } else {
                if (parsed_whole.layout) {
                    ST.layout_used = parsed_whole.layout;
                    parsed = parsed_whole.data;
                } else {

                    command_out2 = parsed_whole.output.command_out;
                    var data = JSON.parse(command_out2);
                    parsed = data.data;
                    ST.layout_used = data.layout;
                }
            }


            //console.dir(parsed);

            var now = Math.round( Date.now() / 1000);
            var since = ST.params.last_days * 24 * 3600;
            var min_date = ST.params.last_days == 0 ? 0 : (now - since);

            var DATE_KEY = "launchdate";

            var newp = [];

            for (var key in parsed) {

                if (newp.length < ST.params.max) {

                    var valid_obj = parsed[key];

                    //  This is a STUB!!!!!!!  STUB STUB STUB.
                    var rb = valid_obj['Region Balance'];
                    var deterministic = valid_obj.FigureOfMerit || rb || 0.5;
                    var made_up = 1557354304 - Math.floor( deterministic * 380 * 86000);

                    valid_obj[DATE_KEY] = valid_obj[DATE_KEY] || made_up;
                    //valid_obj['Tiny Nums'] = 2.7023 + (Math.random()/10);

                    //  Generate a random date for now.
                    var date = valid_obj[DATE_KEY];

                    if( !date || date > min_date ) {

                        var spot_date = new Date(date * 1000);

                        var month = spot_date.getMonth() + 1;
                        var day = spot_date.getDate();
                        var year = spot_date.getFullYear();

                        //  This is just for stub
                        //valid_obj.epoch_date = date;
                        valid_obj.formatdate = month + "/" + day + "/" + year;
                        valid_obj.run_id = "id_" + Math.floor(Math.random() * 10000);
                        valid_obj.drilldown = ['Jupyter', 'mpi', 'walltime'];
                        valid_obj.key = valid_obj.key || key;

                        for (var dimension in valid_obj) {

                            var what_is_it = ST.Utility.match_expression(valid_obj[dimension]);
                            var sda = sort_dimension_as_number_(dimension);

                            if (what_is_it.onlyNumbers || sda) {
                                valid_obj[dimension] = +valid_obj[dimension];
                            }
                        }


                        newp.push(valid_obj);
                        objs_by_run_id_[valid_obj.run_id] = valid_obj;
                    }
                }
            }


            var num_total = Object.keys(parsed).length;
            var num_past_min_date = newp.length;

            if( num_total === 0 ) {
                alert('I got 0 data objects.');
            }

            if( num_past_min_date === 0 && num_total > 0 ) {
                alert('Although you have ' + num_total + ' total data objects, you only 0 data objects with a "' + DATE_KEY + '" greater than ' + min_date +
                    '(' + ST.LAST_DAYS + '=' + ST.params.last_days + ').  If you wish to eliminate this constraint, remove "' + ST.LAST_DAYS + '" from the URL parameter list.');
            }

            newp[0]['Code Builder'] = "Filler0";
            newp[1]['Code Builder'] = "Filler1";
            /*newp[2]['Compiler Name'] = "GNU Filler";*/

            //  STUB!!

            /*ST.layout_used.charts.push({
                dimension: "Tiny Nums",
                title: "Tiny Nums",
                viz: "BarChart"
            });*/

            console.dir( ST.layout_used );


            //  This is quite lousy but drill_down needs to happen after RenderChartCollection
            //  Currently RenderChartCollection has a fatal javascript error coming from dc.js
            //  which needs to get fixed.
            try {
                if (window.RenderChartCollection) {
                    RenderChartCollection(newp, ST.layout_used);  //  ST.ReturnedDataStub.layout); //
                }
            } catch(e) {
                console.log("caught an error.");
                console.dir(e);

            } finally {

                //  execute compare right away, if we're exe_compare
                if( exe_compare_() ) {
                    drill_down_();
                }

                bind_();
            }
        }
    };



    var are_numbers_ = null;

    var sort_dimension_as_number_ = function( dimension ) {

        if( !are_numbers_ ) {

            are_numbers_ = {};

            var table = ST.layout_used.table;

            for( var x=0; x < table.length; x++ ) {

                var dim = table[x].dimension;
                are_numbers_[ dim ] = table[x].sort_as_number;
            }
        }

        return are_numbers_[ dimension ] ? are_numbers_[ dimension ] : false;
    };


    //  Certain events like filtering unbind the buttons, so need to rebind.
    var bind_ = function() {
       $('.dc-table-row .drilldown').unbind('click').bind('click', drill_down_ );
    };

    var handle_error_ = function( data ) {

        if( data.status === 200 && data.responseText ) {

            handle_success_( data );
        } else {
            console.dir(data);
            var checks;

            if( is_rzlc_target ) {
                var link = "https://rzlc.llnl.gov/";
                checks = '<li>You are making a JSONP call to the <b>RZ</b></li>' +
                    '<li>Make sure you are already authenticated with RZ.  ' +
                    'For example, you can try logging in here: <a target="_blank" href="' + link + '">RZ Link</a></li>';
            } else {
                var link = "https://lc.llnl.gov/";
                checks = '<li>You are making a JSONP call to the <b>CZ</b></li>' +
                    '<li>Make sure you are already authenticated with CZ.  ' +
                    'For example, you can try logging in here: <a target="_blank" href="' + link + '">CZ Link</a></li>';
            }

            var pu = ST.Utility.get_param('get_rundata_url');

            if (pu !== undefined) {
                checks += '<li>Is your <b>get_rundata_url</b> (' + pu + ') correct? ';
            }

            var checks2 = '<li>Return console.dir(data) has been dumped to console.  </li>' +
                '<li>FYI: data.responseText=' + data.responseText + '</li>';

            ST.Utility.error('Could not complete server call.  Things to check: <ul>' + checks + checks2 + '</ul>.');
        }
    };


    var get_keys_ = function() {

        var str = "";
        var count = 0;

        $('.dc-table-row .key').each( function() {

            var cali_key = $(this).html();
            str += ' ' + cali_key;
        });

        return str.substr(1);
    };


    var exe_compare_ = function() {
        //alert(ST.params.exe_compare);
        return ST.params.exe_compare === "1";
    };


    var drill_down_ = function() {

        if( !$(this).hasClass('drilldown')) {

            //  compare button
            var keys = get_keys_();
            var machine = "machine=" + ST.params.machine + "&";
            var xaxis = $('.compare_arguments .xaxis').val();
            var groupby = $('.compare_arguments .groupby').val();

            //localStorage.setItem('xaxis', xaxis);
            //localStorage.setItem('groupby', groupby);
            localStorage.setItem('calis', keys);
            //localStorage.setItem('location.href', location.href);

            var directory = ST.Utility.get_file();
            var command = ST.Utility.get_param('command');
            var comm = command ? '&command=' + command : "";
            var xaxis_par = '&xaxis=' + xaxis;
            var groupby_par = '&groupby=' + groupby + ST.UrlStateManager.get_chart_pars();

            var days_ago = ST.Utility.get_param(ST.LAST_DAYS);
            var last_days = days_ago ? ( "&" + ST.LAST_DAYS + "=" + days_ago ) : "";

            var goto_url = '../dur_sankey/?' + machine + 'calis=local&sf=' + directory +
                comm + xaxis_par + groupby_par + last_days;

            if( exe_compare_() ) {
                location.href = goto_url;
            } else {
                window.open( goto_url );
            }

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

            var dur = ST.params.duration_key + ' ';
            var command_par = get_command_("durations", dur + " " + appended, "" ) + "&machine=" + ST.params.machine;

            window.open('../sankey/index.html?command=' + command_par );

        } else {

            //  subject must be jupyter or walltime
            ajax_({
                file: appended,
                type: "jupyter",
                command: command,
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