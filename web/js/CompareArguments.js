ST.CompareArguments = function() {

    var render_ = function (fields) {

        var options = "<option value=''></option>";
        var farr = get_farr(fields);

        for (var x = 0; x < farr.length; x++) {

            var field = farr[x];
            options += '<option value="' + field + '">' + field + '</option>';
        }

        //  '<a id="bookmarkme" href="javascript: void(0)" rel="sidebar">Bookmark</a>' +
        var ht = '<select class="xaxis">' + options + '</select>' +
            '<select class="groupby">' + options + '</select>' +
            '<div class="xaxis_label">Xaxis:</div>' +
            '<div class="groupby_label">Group By:</div>';

        $('.compare_arguments').html(ht);

        $('.compare_arguments .xaxis, .compare_arguments .groupby').unbind('change').bind('change', function () {

            var cla = $(this).attr('class');
            var val = $(this).val();
            val = val.replace(/#/, '');

            ST.UrlStateManager.update_url(cla, val);
        });

        var last_days = ST.Utility.get_param(ST.LAST_DAYS) || "";

        $('.launch_container').html('<div class="launcher">' +
            '<div class="days_label">launchdate days ago: </div>' +
            '<input type="text" class="launchdate_days_ago" value="' + last_days + '"/>' +
            '<div class="launch_button myButton icon">' +
            '<div class="inner"></div>' +
            '</div>' +
            '</div>');

        $('.launch_button').unbind('click').bind('click', function () {

            var val = $('.launchdate_days_ago').val();
            ST.UrlStateManager.update_url("launchdate_days_ago", val);
            location.reload();
        });

        load_compare();
    };


    var load_compare = function () {

        var xaxis = ST.Utility.get_param('xaxis', true);
        var groupby = ST.Utility.get_param('groupby', true);

        if (xaxis !== 'undefined') {

            $('.compare_arguments .xaxis').val(xaxis)
                .change( function() {

                    var val = $(this).val();
                    setXAxis(val);
                });
        }

        if (groupby !== 'undefined') {

            $('.compare_arguments .groupby').val(groupby)
                .change( function() {

                    var gval = $(this).val();
                    setGroupBy(gval);
                });
        }
    };


    var get_farr = function (fields) {

        var farr = ST.Utility.to_array(fields);

        farr.sort(function (a, b) {

            a = a.toLowerCase();
            b = b.toLowerCase();

            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }

            return 0;
        });

        return farr;
    };


    return {
        render: render_
    }
}();