ST.CompareArguments = function() {

    var render_ = function (fields) {

        var options = "<option value=''></option>";
        var farr = get_farr(fields);

        for (var x = 0; x < farr.length; x++) {

            var field = farr[x];
            options += '<option value="' + field + '">' + field + '</option>';
        }

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
                    "isTableActive": false
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
                    $('#compare_bottom_outer, #compare-window, .bg-color-255-255-255-0').show();
                }
            },
            created: function() {
                this.tableActive();
                window.scrollTo(0,0);
            }
        });

        new Vue({
            el: "bottom-tabs"
        });
    };


    var load_compare = function () {

        var xaxis = ST.Utility.get_param('xaxis', true);
        var groupby = ST.Utility.get_param('groupby', true);
        var yaxis = ST.Utility.get_param('yaxis', true);
        var aggregate = ST.Utility.get_param('aggregate', true);

        if (xaxis !== 'undefined') {
            ST.graph.setXaxis(xaxis);
        }

        if (groupby !== 'undefined') {
            ST.graph.setGroupBy(groupby);
        }

        if (yaxis !== 'undefined') {
            ST.graph.setYAxis(yaxis);
        }

        if (aggregate !== 'undefined') {
            ST.graph.setAggregateType(aggregate);
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