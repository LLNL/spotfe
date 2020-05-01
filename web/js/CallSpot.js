var ST = ST || {};

ST.CallSpot = function() {

    var get_command_begin_ = function() {

        var dev_prefix = ST.Utility.get_prefix();
        var spot_dir = "%20/usr/gapps/spot/" + dev_prefix + "spot.py";

        //var czcommand = "/usr/tce/bin/python3" + spot_dir;
        var czcommand = "/usr/gapps/spot/venv_python/bin/python3" + spot_dir;
        var rzcommand = ST.Default.COMMAND + spot_dir;

        is_rzlc_target = ST.Utility.on_rz();

        var commandp = is_rzlc_target ? rzcommand : czcommand;

        //  Override if the URL contains command in it.
        var param_com = ST.Utility.get_param('command');
        if( param_com ) {
            commandp = param_com;
        }

        commandp = commandp.replace('%20', ' ');
        return commandp;
    };


    var get_command_ = function( type, file, lay ) {

        lay = lay || "";

        return get_command_begin_() + ' ' + type  + ' ' + file + lay;
    };


    var is_rzlc_target;

    var ajax_ = function( obj ) {

        var file = obj.file;
        var type = obj.type;
        var success = obj.success || handle_success_;
        var layout = obj.layout || "";
        var is_h = type === 'hierarchical';


        ST.Utility.init_params();

        is_rzlc_target = ST.Utility.on_rz();

        var final_command = get_command_( type, file, layout );


        var rtype = ST.params.type;
        if( is_h ) {
            // rtype = "POST";
        }

        var obj = {
            timeout: 600000,
            type: rtype,
            method: rtype,
            url: ST.params.get_rundata_url,
            data:   {
                'via'    : 'post',
                'route'  : '/command/' + ST.params.machine,      //  rzgenie
                'command': final_command
            }
        };

        obj.dataType = "jsonp";
        if( !is_h ) {
        }

        if( is_h ) {
            return $.ajax(obj);
        } else {
            return $.ajax(obj).done(success).error(handle_error_);
        }
    };



    var objs_by_run_id_ = {};

    //  this is the default success handler
    var handle_success_ = function(value) {

        var command_out = value.output ? value.output.command_out : value.responseText;

        if (value.error !== "" && !value.responseText) {

            ST.Utility.error(value.error);

        } else {

            var spotReturnedValue = command_out;
            var parsed_whole = JSON.parse(spotReturnedValue);

            var command_out2;
            var parsed;

            if (parsed_whole.error) {

                var er = parsed_whole.error;
                var additional = "";

                if (er.indexOf('Failed to run command') > -1 && er.indexOf('No such file or directory') > -1) {
                    additional = "<br><br>Usually, this means you need to specify a command.  For example, try adding the following to the URL: &command=/usr/tce/bin/python3%20/usr/global/web-pages/lc/www/spot/spot.py";
                }

                ST.Utility.error(er + additional);


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
        }
    };


    var handle_success2_ = function( summ ) {

        ST.Utility.check_error( summ );

        ST.layout_used = summ.layout;
        parsed = summ.data;

        var now = Math.round( Date.now() / 1000);
        var since = ST.params.last_days * 24 * 3600;
        var min_date = ST.params.last_days == 0 ? 0 : (now - since);

        var DATE_KEY = "launchdate";

        var newp = [];
        var first = "";

        for (var key in parsed) {

            if (newp.length < ST.params.max) {

                var valid_obj = parsed[key];

                if( first === "" && valid_obj.cmdline) {
                    first = valid_obj.cmdline;
                }

                //  stub.  for debugging.
                valid_obj.file_path = valid_obj.key;
                //valid_obj.key = (Math.random()*10000) + "";


                //valid_obj.cmdline = valid_obj.cmdline.substr(0,100); //first || "test";

                for( var att in valid_obj ) {

                    if( att === "cmdline" ) {
                        valid_obj[att] = ST.Utility.limit_unique_values( valid_obj, att );
                    }
                }

                if( !valid_obj[DATE_KEY] ) {
                    valid_obj[DATE_KEY] = get_made_up_date_();
                }

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
                    valid_obj.drilldown = ['Jupyter', 'walltime'];
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
            return true;
        }

        if( num_past_min_date === 0 && num_total > 0 ) {
            alert('Although you have ' + num_total + ' total data objects, you only 0 data objects with a "' + DATE_KEY + '" greater than ' + min_date +
                '(' + ST.LAST_DAYS + '=' + ST.params.last_days + ').  If you wish to eliminate this constraint, remove "' + ST.LAST_DAYS + '" from the URL parameter list.');
        }


        //  This is quite lousy but drill_down needs to happen after RenderChartCollection
        //  Currently RenderChartCollection has a fatal javascript error coming from dc.js
        //  which needs to get fixed.
        try {
            if (ST && ST.ChartCollection ) {

                ST.newp = newp;
                ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);  //  ST.ReturnedDataStub.layout); //
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
    };


    //  Just in case they didn't give us a launchdate, still need it for filtering purposes.
    //  that input box at the left side above the table.
    var get_made_up_date_ = function() {

        //  This is a STUB!!!!!!!  STUB STUB STUB.
        var rb = valid_obj['Region Balance'];
        var deterministic = valid_obj.FigureOfMerit || rb || 0.5;
        var made_up = 1557354304 - Math.floor( deterministic * 380 * 86000);
        return made_up;
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
        var all = ST.dateDimension.top(Infinity);
        var len = all.length;

        for( var c=0; c < len; c++ ) {

            var cali_key = all[c].key;
            str += ' ' + cali_key;
        }

        return str.substr(1);
    };


    var exe_compare_ = function() {
        //alert(ST.params.exe_compare);
        return ST.params.exe_compare === "1";
    };



    var load_compare_ = function() {

        //  compare button
        var keys = get_keys_();
        localStorage.setItem('calis', keys);

        var akeys = keys.split(' ');

        try {
            ST.graph.compare(akeys);
        } catch( e ) {
            //  we end up here when akeys is empty, which happens when the user
            //  doesn't select anything in the ScatterPlot.
            console.dir(e);
        }
    };


    var drill_down_ = function() {

        if( !$(this).hasClass('drilldown')) {

            load_compare_();
            return false;
        }

        var command = ST.Utility.get_param('command');

        var run_id = $(this).attr('run_id');
        var subject = $(this).attr('subject').toLowerCase();
        var file = ST.Utility.get_file();
        var key = objs_by_run_id_[run_id].key;
        var appended = objs_by_run_id_[run_id].filepath;    //file + '/' + key;


        if (subject === 'mpi') {

            //  http://localhost:8888
            window.open('../ravel/index.html?cali_key=' + key );

        } else if( subject === "walltime" ) {

            window.open('sankey/index.html?runSetId=' + file + "&runId=" + key );

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
        get_keys: get_keys_,
        load_compare: load_compare_,
        handle_success2: handle_success2_,
        handle_success: handle_success_,
        get_command_begin: get_command_begin_,
        drilldown: drill_down_,
        bind: bind_,
        ajax: ajax_
    }
}();
