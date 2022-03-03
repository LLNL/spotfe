var ST = ST || {};

ST.CallSpot = function() {

    var get_command_begin_ = function() {

        var dev_prefix = ST.Utility.get_prefix();
        var spot_dir = "%20/usr/gapps/spot/" + dev_prefix + "spot.py";

        //var czcommand = "/usr/tce/bin/python3" + spot_dir;
        var czcommand = "/usr/gapps/spot/venv_python/bin/python3" + spot_dir;
        //var rzcommand = ST.Default.COMMAND + spot_dir;

        //  We're now using this one because the one above I think the permissions were changed
        //  which prevented non-wci users from using it
        //  this won't work: drwxrwxr-x 5 chavez35 chavez35  4096 Oct  3  2018 virtenv
        var rzcommand = "/usr/global/tools/lorenz/python/optvis-env2/bin/python" + spot_dir;

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

        var url = ST.params.get_rundata_url;

        var obj = {
            timeout: 600000,
            type: rtype,
            method: rtype,
            url: url,
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
            return $.ajax(obj).done(success).error(obj.error || handle_error_);
        }
    };



    var objs_by_run_id_ = {};

    //  this is the default success handler
    //  i think is only used by ravel, right now.
    var handle_success_ = function(value) {

        var command_out = value.output ? value.output.command_out : value.responseText;

        if (value.error !== "" && !value.responseText) {

            ST.Utility.error(value.error);

        } else {

            var spotReturnedValue = command_out;
            spotReturnedValue = ST.Utility.fix_LC_return_err( spotReturnedValue );

            var parsed_whole = JSON.parse(spotReturnedValue);
            console.dir( parsed_whole );

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
                    command_out2 = ST.Utility.fix_LC_return_err(command_out2);

                    var data = JSON.parse(command_out2);
                    parsed = data.data;
                    ST.layout_used = data.layout;
                }
            }
        }
    };

    ST.cali_obj_by_key = [];
    ST.orig_obj_by_key = [];


    var get_run_set_id_ = function( whole, right_remove ) {
        return whole.replace(right_remove, "");
    };


    var is_something_showing_ = function( charts ) {

        for( var x in charts ) {

            var dimension = charts[x].dimension;
            var val = ST.Utility.get_param( ch_key_( dimension ) );

            if( val === "1" ) {
                return true;
            }
        }

        return false;
    };


    var make_table_consistent_with_charts_shown_ = function( dimension, show_chart ) {

        var table = ST.layout_used.table;

        for( var u = 0; u < table.length; u++ ) {

            var tab = table[u];

            if( tab.dimension === dimension ) {
                tab.show = show_chart;
            }
        }
    };


    var set_up_params_ = function( charts ) {

        if( is_something_showing_( charts ) ) {

            for( var x in charts ) {

                var dimension = charts[x].dimension;
                var val = ST.Utility.get_param( ch_key_( dimension ) );
                var show_chart = val === "1";

                charts[x].show = show_chart;
                make_table_consistent_with_charts_shown_( dimension, show_chart );
            }
        } else {
            //  else show whatever the default is and fix the URL parameters.
            for( var x in charts ) {

                var ch = charts[x];
                var dim_ch = ch.dimension;

                if( ch.show ) {
                    ST.UrlStateManager.update_url(ch_key_( dim_ch ), "1");
                }

                make_table_consistent_with_charts_shown_( dim_ch, ch.show );
            }
        }
    };


    var make_keys_lowercase_ = function( parsed_obj ) {

        var vobj = {};

        for( var x in parsed_obj ) {
            vobj[ x.toLowerCase() ] = parsed_obj[x];
        }

        return vobj;
    };


    var handle_success2_ = function( summ ) {

        console.dir(summ);
//        return false;

        ST.Utility.check_error( summ );

        //  use saved layout, so that added charts, and editted titles remain in layout.
        ST.layout_used =  sqs.layout_used || summ.layout;

        if( !sqs.layout_used ) {
            sqs.layout_used = summ.layout;
        }


        var charts = ST.layout_used.charts;
        set_up_params_( charts );

        parsed = summ.data;

        var now = Math.round( Date.now() / 1000);
        var since = ST.params.last_days * 24 * 3600;
        var min_date = ST.params.last_days == 0 ? 0 : (now - since);

        var DATE_KEY = "launchdate";

        var newp = [];
        var new_index = 0;
        var treat_as_number = ["timeval", "float", "double", "int", "integer"];

        ST.LayoutAugmenterModel.set_model( ST.layout_used.charts );

        for (var key in parsed) {

            if (newp.length < ST.params.max) {

                var parsed_obj = parsed[key];

                var valid_obj = parsed_obj;
                // make_keys_lowercase_( parsed_obj ); // parsed[key];

                ST.cali_obj_by_key[new_index] = valid_obj;
                ST.cali_obj_by_key[new_index].run_set_id = get_run_set_id_( ST.cali_obj_by_key[new_index].filepath, key );
                ST.cali_obj_by_key[new_index].file_path = key;
                //ST.cali_obj_by_key[new_index].experimental_composite = parseInt(Math.random()*100);
                ST.orig_obj_by_key[new_index] = $.extend({}, valid_obj);

                valid_obj.key = new_index;

                //  valid_obj.filepath = "override";
                new_index++;


                for( var att in valid_obj ) {

                    if( ST.LayoutAugmenterModel.is_unique_limited( att ) ) {
                        valid_obj[att] = ST.Utility.limit_unique_values( valid_obj, att );
                    }

                    var ty = ST.LayoutAugmenterModel.get_type( att );

                    if( treat_as_number.indexOf(ty) > -1 ) {
                        valid_obj[att] = +valid_obj[att];
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
                    var is_ale3d = valid_obj.json === "1";
                    var has_jupyter = is_ale3d ? false : true;

                    //  This is just for stub
                    //valid_obj.epoch_date = date;
                    valid_obj.formatdate = month + "/" + day + "/" + year;
                    valid_obj.run_id = "id_" + Math.floor(Math.random() * 10000);
                    valid_obj.drilldown = {
                        "jupyter": has_jupyter,    //  always exists
                        "durations":1,  //  always exists
                        "timeseries": valid_obj.timeseries || 0
                    };

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
            console.log('I got 0 data objects.');
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

        /*if( valid_obj ) {
            //  This is a STUB!!!!!!!  STUB STUB STUB.
            var rb = valid_obj['Region Balance'];
            var deterministic = valid_obj.FigureOfMerit || rb || 0.5;
            var made_up = 1557354304 - Math.floor(deterministic * 380 * 86000);
            return made_up;
        }*/

        return 1557354304;
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

            var new_index = all[c].key;
            var cali_obj = ST.cali_obj_by_key[new_index];
            var cali_key = cali_obj.file_path;

            //  it has to be a cali file, no JSON (ale3D stuff) will work.

            //  two copies of each key are returns by the dateDimension.top(Infinity) now
            //  we don't need the ones with the full path in it.
            //  can not remove duplicate with / in it or rendering won't work.
            //if( cali_key.indexOf('/') === -1 ) {
            str += ' ' + cali_key;
            //}
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

    var strip_right_ = function( s ) {

        var last_index = s.lastIndexOf('/');
        return s.substr( 0, last_index );
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

        var obj = objs_by_run_id_[run_id];
        var key = obj.key;
        var file = obj.filepath;    //file + '/' + key;
        var cali_obj = ST.cali_obj_by_key[key];
        var cali_fp = cali_obj.file_path;

        ST.CallSpot.filepath = obj.filepath;
        ST.CallSpot.cali_fp = cali_fp;

        var file_left = cali_obj.run_set_id;
        file_left = strip_right_(file_left);

        if (subject === 'mpi') {

            //  http://localhost:8888
            window.open('../ravel/index.html?cali_key=' + cali_fp );

        } else if( subject === "durations" ) {

            const runSetId = ST.Utility.get_param("sf");

            var oneRun = window.cachedData.Runs[cali_fp].Data;
            var walldata = JSON.stringify( oneRun );

            //  this is to prevent from using too much data.
            var walldata_key = ST.walldata_key;// runSetId + "_" + cali_fp;

            console.log('walldata_key=' + walldata_key);
            console.log('walldata(0,500)=' + walldata.substr(0,500) );
            console.log('walldata.length=' + walldata.length );

            //  we use up a lot of storage when we setItem, so need to clear it periodically.
            //localStorage.clear();

            localStorage.setItem( walldata_key, walldata );

            var url = 'sankey/index.html?runSetId=' + file_left +
                "&runId=" + cali_fp +
                "&title=" + cali_obj.title;

            window.open(url);

        } else if( subject === "timeseries" ) {

            window.open('memory/index.html?runSetId=' + file_left + '&runId=' + cali_fp);
        } else {

            ST.CustomTemplates.get_temps_and_show();
        }
    };


    var ch_key_ = function( dimension ) {
        return "ch_" + dimension;
    };

    ST.params = ST.params || {};


    return {
        ch_key: ch_key_,
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
