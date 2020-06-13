//  Global Storage, shortcut for sqs.
var sqs = {};
var sq = function() {

    var table_name = 'a13';
    var hasLoaded_ = false;

    function load( callback ) {

        if( typeof callback != "function" ) {
            alert("Provide a function callback.  Stat won't be loaded until this callback is called.");
            return false;
        }

        var my_data = JSON.parse(localStorage.getItem(table_name)) || {};
        sqs = $.extend({}, my_data, sqs );

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
