//  Global Storage, shortcut for sqs.
var sqs = {};
var sq = function() {

    //  Don't change the naem of the table or the get_directory encoding
    //  otherwise it'll reset everyone's localStorage.
    var table_name = 'chart_meta_';
    var hasLoaded_ = false;

    var get_directory_str_ = function() {

        var dir = $('#file_upload .directory').val();
        return dir;
    };

    var get_key_ = function() {
        return table_name + get_directory_str_();
    };

    function load( callback ) {

        if( typeof callback != "function" ) {
            alert("Provide a function callback.  Stat won't be loaded until this callback is called.");
            return false;
        }

        var key = get_key_();
        var my_data = JSON.parse(localStorage.getItem(key)) || {};
        var dat = my_data || "";

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

            var stat_str = JSON.stringify(sqs);
            var key = get_key_();

            localStorage.setItem(key, stat_str);

        } else {
            log("Can't save stat before loading it.");
        }
    };


    /*
        Developer function to reset invalid layouts that were created durring development.
     */
    var reset_ = function() {

        sqs.layout_used = false;
        sq.save();

        //  After page reloads, default layout will be used from the summary response.
        window.location.reload();
    };


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
        reset: reset_
    }
}();
