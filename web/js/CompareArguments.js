ST.CompareArguments = function() {

    var render_ = function (fields) {

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
                '<div class="myButton icon multi_jupyter" v-on:click="multiJupyter()" title="Open all Jupyter files selected below">' +
                    '<div class="inner"></div>' +
                    '<div class="tiny_letter">M</div>' +
                '</div>' +
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
                },
                multiJupyter: function() {

                    ST.Utility.start_spinner();

                    var cali_keys = ST.CallSpot.get_keys();// ST.str_cali_keys;
                    var cali_count = cali_keys.split(' ').length;
                    var cali_keys_arr = cali_keys.split(' ');

                    //  cali_path is /usr/gapps/spot/datasets/lulesh_gen/500/5.cali
                    var file_path = $('.directory').val();
                    var cali_quoted = " \"" + cali_keys + "\"";
                    var total_send = file_path + cali_quoted;
                    var limit = 15000; // 1700;
                    var t_count = total_send.length;

                    //limit = 50000;
                    console.log("t_count = " + t_count );


                    if( cali_count <= 1 ) {

                        ReusableView.warning("Less than 2 rows are selected.  Please select 2 or more rows to compare.");
                        ST.Utility.stop_spinner();
                        return false;
                    }

                    if( t_count > limit ) {

                        ReusableView.warning("Too many rows selected.  Please narrow the selection.  <br>" +
                                "request chars = " + t_count + "  limit = " + limit);
                        ST.Utility.stop_spinner();
                        return false;
                    }

                    var host = ST.params.machine;
                    var command = ST.CallSpot.get_command_begin() + " multi_jupyter";

                    console.dir( cali_keys_arr );
                    console.log( "host=" + host + "    command = " + command );

                    ST.graph.openMultiJupyter( file_path, cali_keys_arr, host, command ).then( finish_multi_ );
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


    var finish_multi_ = function(data) {

        ST.Utility.stop_spinner();

        ST.Utility.check_error( data );
        var command_out = data; // data.output.command_out;
        var url = command_out;
        console.log('co=' + command_out);

        window.open(url);
        // now go to the URL that BE tells us to go to.
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


    return {
        render: render_
    }
}();