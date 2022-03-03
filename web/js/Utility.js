var ST = ST || {};

ST.Default = {
    COMMAND: "/usr/gapps/wf/web/spot/virtenv/bin/python", // /usr/gapps/spot/spot.py", // /usr/gapps/wf/web/spot/spot.py",
    LAYOUT: "/g/g0/pascal/default_layout.json"
};

ST.walldata_key = "walldata_key";

ST.LAST_DAYS = "launchdate_days_ago";

ST.CONSTS = {
    "SCATTER_PLOT" : "ScatterPlot",
    "COMPOSITE_PLOT": "CompositePlot",
    "UNIQUE_STR": 200,
    "MAX_HOR_BAR_CHART_STR_LEN": 100,
    "ETC_BUCKET": "Etc bucket",
    "STRCON": "_strcat_",
    "NO_UNARY_OP_SELECTED": "no unary op selected"
};

ST.parse = function( par_val ) {

    par_val = ST.Utility.fix_LC_return_err( par_val );
    return JSON.parse( par_val );
};

ST.Utility = function() {

    function getUrlVars_() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    };

    var get_param_ = function( param, decode_uri ) {

        var vars = getUrlVars_();
        var ret = vars[param];

        if( decode_uri ) {
            ret = decodeURIComponent( ret );
        }

        return ret;
    };



    var assert_ = function( bool, str, use_alert ) {

        if( !bool ) {

            if( use_alert ) {
                alert( str );
            } else {
                error_(str);
            }
        }
    };


    var check_error_ = function( data ) {

        if( data && data.error ) {

            $('.error_statement').remove();
            error_( data.error );
        }
    };

    var error_ = function( str ) {



        if( $('.error_statement').length === 0 ) {

            var html = '<div class="error_statement">' + str + '</div>';
            $('body').prepend( html );
        }
    };


    var validate_cali_object_ = function( cali_object, dimension ) {

        //  We allow blank values and false values that evaluate to false.
        //  undefined indicates an actual mismatch.
        if( cali_object[dimension] === undefined ) {

            var dimensions_available = "";
            for( var x in cali_object ) {
                dimensions_available += ', ' + x;
            }

            console.log('In the layout_spec I found <b>' + dimension + '</b>, but I could NOT find dimension <b>' + dimension + '</b> in the Data Set.  ' +
                'Data set contains the following dimensions: ' + dimensions_available.substr(1) + '.  ' +
                '<br><br>You can solve this problem in 1 of 2 ways: <ul>' +
                '<li>Add <b>' + dimension + '</b> to the dataset OR</li>' +
                '<li>Remove <b>' + dimension + '</b> from the layout file.</li>' +
                '</ul>');

            cali_object[dimension] = 0; // "not defined";
            //ST.cali_valid = false;
            //return false;
        }

        return true;
    };

    var get_file_ = function() {

        var on_memory_page = window.location.href.indexOf('memory/index.html') > 0;
        var on_walltime_page = window.location.href.indexOf('sankey/index.html') > 0;

        var file = ST.Utility.get_param("sf");
        //var default_file = "/usr/gapps/spot/datasets/lulesh2small"; // "/usr/gapps/wf/web/spot/data/lulesh_maximal";

        if( !file && !on_memory_page && !on_walltime_page ) {

            var example = "For example: /g/g0/myname/mycalifiles/";
            error_("Please provide a directory that contains dot cali files.  You can specify this in the input box below: <br>" + example);
        }

        return file;
    };


    var dur_keys_ = {
        "/usr/gapps/spot/datasets/jit_data" : "sum#time.inclusive.duration",
        "/usr/global/web-pages/lc/www/spot/lulesh2small" : "sum#time.inclusive.duration",
        "/usr/gapps/spot/datasets/lulesh2small" : "sum#time.inclusive.duration"
    };

    var get_dur_key_ = function(sf) {

        var default_key = "sum#time.inclusive.duration";
        var user_dur = ST.Utility.get_param('duration_key');

        //if( !ST.params.duration_key ) {
        //    alert('Unknown duration key for this spot file (sf) ' + sf);
        //}

        if( user_dur ) {
            return user_dur;
        }

        return dur_keys_[sf] || default_key;
    };


    var init_params_ = function() {

        var sf = get_file_();

        ST.params = ST.params || {};
        ST.params.get_rundata_url = ST.Utility.get_param('get_rundata_url');
        ST.params.max = ST.Utility.get_param('max');
        ST.params.machine = ST.Utility.get_param('machine');
        ST.params.layout = ST.Utility.get_param('layout');
        ST.params.last_days = ST.Utility.get_param(ST.LAST_DAYS) || 0;
        ST.params.exe_compare = ST.Utility.get_param('exe_compare') || 0;

        var is_rz_target = ST.Utility.on_rz();
        var quote = is_rz_target ? "'" : "";

        ST.params.duration_key = quote + get_dur_key_(sf) + quote;
        ST.params.pallet_num = ST.Utility.get_param('color') || 15;


        ST.params.max = ST.params.max || 18000;

        //  Can't start using this layout until it's placed
        if( !ST.params.layout ) {
            //  https://lc.llnl.gov/spot/dcvis/web/?sf=/usr/gapps/spot/datasets/lulesh2small&layout=/g/g0/pascal/enhanced_layout_label.json&BarChart2=0,-&PieChart1=rzgenie2

            //  We don't need to send a default layout anymore because BE will send us back a default one.
            //ST.params.layout = "/usr/gapps/spot/datasets/enhanced_layout_label.json";
        }

        if( !ST.params.machine ) {
            ST.params.machine = get_default_machine_();
        }

        //  Default to GET.  Only use POST for custom get_rundata_url
        ST.params.type = ST.params.get_rundata_url ? "POST" : "GET";
        ST.params.get_rundata_url = ST.params.get_rundata_url || get_default_url_();
    };


    var get_default_machine_ = function() {

        //"cslic", "oslic", "rzgenie"
        if( !window.ENV ) {
            alert('I could not find the global object ENV.  You must include an web/js/Environment.js file that contains an ENV object.');
        }

        if( !window.ENV.machine ) {
            alert('The ENV object must contain a machine designation.  For example: var ENV = {"machine": "cslic"};     Other examples of machine names are: oslic and rzgenie.');
        }

        return window.ENV.machine;
    };


    var on_rz_ = function() {
        return window.location.hostname === "rzlc.llnl.gov";
    };

    var get_default_url_ = function() {
        var rz = on_rz_() ? 'rz' : '';

        const isContainer = window.ENV.machine == 'container'

        if( isContainer ) {

            return '/lc.llnl.gov/lorenz/lora/lora.cgi/jsonp';
        } else {

            return 'https://' + rz + 'lc.llnl.gov/lorenz/lora/lora.cgi/jsonp';
        }
    };


    /*
     *  Tells you what this string is, useful for knowing how to sort stuff.
     *  This function returns the following object:
     *
     *  {
            alphaNumeric: false
            containsAlphabet: false
            containsNumber: true
            mixOfAlphaNumeric: false
            onlyLetters: false
            onlyNumbers: false
        }
     *
     *
     *  INPUT:
     *      input_str is something you want to figure out: "234234" or "23.2342" or "mystringing", etc
     */
    var matchExpression_ = function( str ) {

        var rgularExp = {
            contains_alphaNumeric : /\d+/, //  This regexp only works in Chrome: /^(?!-)(?!.*-)[A-Za-z0-9-]+(?<!-)$/,
            containsNumber : /\d+/,
            containsAlphabet : /[a-zA-Z]/,

            onlyLetters : /^[A-Za-z]+$/,
            onlyNumbers : /^[0-9]+$/,
            onlyMixOfAlphaNumeric : /^([0-9]+[a-zA-Z]+|[a-zA-Z]+[0-9]+)[0-9a-zA-Z]*$/
        };

        var expMatch = {};
        expMatch.containsNumber = rgularExp.containsNumber.test(str);
        expMatch.containsAlphabet = rgularExp.containsAlphabet.test(str);
        expMatch.alphaNumeric = rgularExp.contains_alphaNumeric.test(str);

        expMatch.onlyNumbers = rgularExp.onlyNumbers.test(str);
        expMatch.onlyLetters = rgularExp.onlyLetters.test(str);
        expMatch.mixOfAlphaNumeric = rgularExp.onlyMixOfAlphaNumeric.test(str);

        return expMatch;
    };


    String.prototype.hashCode = function() {

        var hash = 0, i, chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };


    var get_colors_ = function( dimension, just_pallet ) {

        var pallets = ALL_PALLETES_AVAILABLE;

        if( !pallets[ST.params.pallet_num] ) {
            alert('That pallet number is not defined.');
        }

        var ordinal_colors = pallets[ST.params.pallet_num];

        if( just_pallet ) {
            return ordinal_colors;
        }

        var num = Math.abs(dimension.hashCode());

        var color = ordinal_colors[ num % ordinal_colors.length ];
        return [color];
    };


    var format_date_ = function( d, opts ) {

        opts = opts || {};

        var date = new Date(d*1000);
        var month = parseInt(date.getMonth());
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var mon = month + 1; //months[month];
        var day = date.getDate();
        var year = date.getFullYear() - 2000; //  -2000

        var minutes = date.getMinutes();
        var hour = date.getHours();

        if( minutes < 10 ) {
            minutes = "0" + minutes;
        }

        var first_part = mon + '/' + day + '/' + year;
        var break_str = "   ";
        var formattedTime = first_part + break_str + hour + ":" + minutes;

        return opts.only_first_part ? first_part : formattedTime;
    };

    var to_array_ = function( obj ) {

        return $.map(obj, function(value, index) {
            return [index];
        });
    };


    var get_command_ = function() {

        var command = ST.Utility.get_param('command');
        return command || '/usr/gapps/spot/' + get_prefix_() + 'spot.py getData';
    };

    var is_live_ = function() {
        return location.href.indexOf('llnl.gov/spot2') > -1;
    };

    var is_sand_box_ = function() {
	return location.href.indexOf("pascal/spotfe") > -1;
    };

    var get_prefix_ = function() {

	if( is_sand_box_() ) {
		return "sand/";
 	}
	
        var dev_prefix = ST.Utility.is_live() ? "live/" : "dev/";
        return dev_prefix;
    };

    var strip_ = function( s ) {
        return s.replace(/\W/g, '');
    };


    //  User generated IDs sometimes have special characters which mess up the DOM parser.
    //  For instance: Shape_model_initial_modes:(4,3)  This key caused the following error:
    //  "DOMException: Failed to execute 'querySelector' on 'Document': 'runtime-chartshape_model_initial_modes:(4,3)' is not a valid selector.
    //
    //  SOLUTION:
    //      Filter out those pesky special characters
    //
    var filter_specials_ = function( user_generated ) {

        user_generated = user_generated.replace(/ /gi, '_');
        return user_generated.replace(/[^a-z0-9_]+/gi, '');
    };

    var round_exp_ = function( n, places ) {

        places = places || 0;

        if( n < 10 ) {
            var num = Math.round(n*10)/10;
            var suff = places === 0 ? "" : " e" + places;
            return num + suff;
        }

        return round_exp_( n/10, ++places );
    };


    // num of values has changed because of limit_unique_values
    // options.counts = ST.Utility.get_unique_value_count( options.dimension );
    var limit_unique_values_ = function( cali_obj, dimension ) {

        unique_str_[dimension] = unique_str_[dimension] || {};

        var ud = unique_str_[dimension];
        var keys = Object.keys(ud);

        if( keys.length > ST.CONSTS.UNIQUE_STR ) {

            //  Return last str because we don't want more than UNIQUE_STR different strings
            //  because it causes the HorizontalBarChart to mess up.
            return ST.CONSTS.ETC_BUCKET; // + last_uniq_str_.substr(0, ST.CONSTS.MAX_HOR_BAR_CHART_STR_LEN );
        } else {

            ud[ cali_obj[dimension] ] = 1;

            //  return real actual value.
            last_uniq_str_ = cali_obj[dimension];
            var short = cali_obj[dimension].substr(0, ST.CONSTS.MAX_HOR_BAR_CHART_STR_LEN);
            orig_str_lookup_[ short ] = cali_obj[dimension];

            return short;
        }
    };


    var lookup_orig_str_ = function( s ) {
        return orig_str_lookup_[s] || s;
    };

    var unique_str_ = {},
        last_uniq_str_ = "",
        orig_str_lookup_ = {};

    var get_unique_value_count_ = function( dimension ) {

        var ud = unique_str_[dimension];
        var keys = Object.keys(ud);
        return keys.length;
    };

    function show_tooltip_(evt, text) {

        var ht = $(event.target).parent().find('text').html();

        let tooltip = document.getElementById("tooltip");
        tooltip.innerHTML = ht;
        tooltip.style.display = "block";
        tooltip.style.left = evt.pageX + 10 + 'px';
        tooltip.style.top = evt.pageY + 10 + 'px';
    }

    function hide_tooltip_() {
        var tooltip = document.getElementById("tooltip");
        tooltip.style.display = "none";
    };


    var start_spinner_ = function() {
        $('.spinner_loader').show();
    };

    var stop_spinner_ = function() {
        $('.spinner_loader').hide();
    };

    var container_ajax_ = function( url, commandFunction, path, success) {

        const command = "/opt/conda/bin/python3 /usr/gapps/spot/backend.py " +
            "--config /usr/gapps/spot/backend_config.yaml " +
            commandFunction + " /data/" +
            path;

        console.log('container AJAX: ' + command);

        var datarequest = {
            command: command,
            filepath: path
        };

        //var data_obj = JSON.stringify(datarequest);

        $.ajax({
            type: "POST",
            url: url,
            data: datarequest,
            success: success
        });
    };


    var fix_LC_return_err_ = function( server_return_str ) {

        //  this fix only works on strings, else just return the original contents.
        if( typeof server_return_str === "string" ) {

            var index = server_return_str.lastIndexOf('}');
            var before = server_return_str.slice(0, index);

            return before + '}';
        }

        return server_return_str;
    };

    return {
        fix_LC_return_err: fix_LC_return_err_,
        container_ajax: container_ajax_,
        start_spinner: start_spinner_,
        stop_spinner: stop_spinner_,
        lookup_orig_str: lookup_orig_str_,
        show_tooltip: show_tooltip_,
        hide_tooltip: hide_tooltip_,
        get_unique_value_count: get_unique_value_count_,
        limit_unique_values: limit_unique_values_,
        strip: strip_,
        round_exp: round_exp_,
        filter_special: filter_specials_,
        get_prefix: get_prefix_,
        get_default_machine: get_default_machine_,
        check_error: check_error_,
        assert: assert_,
        is_live: is_live_,
        get_command: get_command_,
        to_array: to_array_,
        format_date: format_date_,
        get_colors: get_colors_,
        on_rz: on_rz_,
        match_expression: matchExpression_,
        validate_cali_object: validate_cali_object_,
        init_params: init_params_,
        get_file: get_file_,
        get_param: get_param_,
        error: error_
    }
}();

var Assert = ST.Utility.assert;
