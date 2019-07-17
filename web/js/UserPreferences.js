ST.UserPreferences = function() {

    var render_ = function() {

        var charts = ST.LayoutAugmenterModel.get_model();

        charts.sort( function( a, b ) {

            if(a.dimension < b.dimension) { return -1; }
            if(a.dimension > b.dimension) { return 1; }
            return 0;
        });

        Vue.component('user-preferences', {
            data: function() {
                return {
                    seen: false,
                    mcharts: charts
                }
            },
            template: '<div>\
            <div class="user_pref_icon" v-on:click="seen=(!seen)">=</div>\
            <div class="user_pref_body" v-if="seen">\
                <div v-for="chart in mcharts" class="prow">\
                    <input type="checkbox" v-bind:checked="chart.show" v-on:click="check( chart.dimension, $event )"/>\
                    <span class="title">{{ chart.title }}</span>\
                </div>\
            </div>\
            </div>',

            methods: {
                check: function( chart_dimension, val ) {

                    var checked = val.target.checked;
                    var dome = checked ? "show" : "hide";

                    $('[chart-dimension="' + chart_dimension.toLowerCase() + '"]')[dome]();

                    var hide = checked ? " " : " --hide ";
                    var begin = ST.CallSpot.get_command_begin();

                    //  dirpath is the the Spot File <sf>
                    var sf = ST.Utility.get_file();

                    var command = begin + " showChart " + hide + " " + sf + " '" + chart_dimension + "'";

                    //  Make an AJAX call to BE about chart_dimension and value.
                    $.ajax({
                        type: 'GET',
                        url: ST.params.get_rundata_url,
                        data:   {
                            'via'    : 'post',
                            'route'  : '/command/' + ST.params.machine,      //  rzgenie
                            'command': command
                        }
                    }).done( success_ );
                }
            }
        });

        new Vue({
            "el": "#user_preferences"
        });
    };

    var success_ = function() {

    };

    return {
        render: render_
    }
}();