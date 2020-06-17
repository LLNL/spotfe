//  Global Storage, shortcut for sqs.
var sqs = {};
var sq = function() {

    //  Don't change the naem of the table or the get_directory encoding
    //  otherwise it'll reset everyone's localStorage.
    var table_name = 'a0';
    var hasLoaded_ = false;

    var get_directory_str_ = function() {

        var dir = $('#file_upload .directory').val();
        return dir;
    };

    function load( callback ) {

        if( typeof callback != "function" ) {
            alert("Provide a function callback.  Stat won't be loaded until this callback is called.");
            return false;
        }

        var dir = get_directory_str_();
        var my_data = JSON.parse(localStorage.getItem(table_name)) || {};
        var dat = my_data[dir] || "";
        sqs = $.extend({}, dat, sqs );

        hasLoaded_ = true;
        callback();
    }

    $(document).ready( function() {

        load( function() {

            //sqs.layout_used = sqs.layout_used || {};
        });
    });


    function save() {

        if( hasLoaded_ ) {

            var dir = get_directory_str_();
            var all = {};
            all[dir] = sqs;

            var stat_str = JSON.stringify(all);
            localStorage.setItem(table_name, stat_str);

        } else {
            log("Can't save stat before loading it.");
        }
    }


    return {
        save: save,
        /*
         *  PRECONDITION:
         *              load must be called before the sqs can be used.
         *              And, you shouldn't continue until the callback is reached.
         */
        load: load,
        /*
         *  This is the object to which you can store stuff in freely.
         */
    }
}();
