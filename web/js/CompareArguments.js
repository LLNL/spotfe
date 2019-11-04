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
            '<div class="groupby_label">Group By:</div>' +
            '<div class="yaxis_label">Yaxis:</div>' +
            '<div class="aggregate_label">Aggregate:</div>' +
            '<select class="yaxis"><option>min#inclusive#sum#time.duration</option><option>avg#inclusive#sum#time.duration</option><option>max#inclusive#sum#time.duration</option></select>' +
            '<select class="aggregate"><option></option><option>sum</option><option>avg</option><option>min</option><option>max</option></select>';

        $('.compare_arguments').html(ht);

        $('.compare_arguments .xaxis, .compare_arguments .groupby, .compare_arguments .yaxis, .compare_arguments .aggregate').unbind('change').bind('change', function () {

            var cla = $(this).attr('class');
            var val = $(this).val();

            //  # in duration specification is not a valid URL component.
            val = encodeURIComponent(val);

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
        load_tabs_();
    };


    var load_tabs_ = function() {

        Vue.component('bottom-tabs', {
            data: function() {
                return {
                    "isTableActive": true
                }
            },
            template: '<div class="bottom_tab_outer">' +
                '<div v-bind:class="{ active: isTableActive }" class="table-tab" v-on:click="tableActive()">TABLE</div>' +
                '<div v-bind:class="{ active: !isTableActive }" class="compare-tab" v-on:click="compareActive()">COMPARE</div>' +
                '</div>',
            methods: {
                tableActive: function() {

                    this.isTableActive = true;

                    $('.table-outer').show();
                    $('#compare_bottom_outer, #compare-window').hide();
                },
                compareActive: function() {

                    this.isTableActive = false;

                    $('.table-outer').hide();
                    $('#compare_bottom_outer, #compare-window').show();
                }
            }
        });

        new Vue({
            el: "bottom-tabs"
        });

        //$('body:eq(0)').scrollTo(0);
    };


    var load_compare = function () {

        var xaxis = ST.Utility.get_param('xaxis', true);
        var groupby = ST.Utility.get_param('groupby', true);
        var yaxis = ST.Utility.get_param('yaxis', true);
        var aggregate = ST.Utility.get_param('aggregate', true);

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

        if (yaxis !== 'undefined') {

            $('.compare_arguments .yaxis').val(yaxis)
                .change( function() {

                    var val = $(this).val();
                    setYAxis(val);
                });
        }

        if (aggregate !== 'undefined') {

            $('.compare_arguments .aggregate').val(aggregate)
                .change( function() {

                    var gval = $(this).val();
                    setAggregate(gval);
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