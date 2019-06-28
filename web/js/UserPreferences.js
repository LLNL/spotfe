ST.UserPreferences = function() {

    var render_ = function() {

        var charts = ST.LayoutAugmenterModel.get_model();

        for( var x in charts ) {

            charts[x].show = charts[x].show || true;
        }


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

                    console.dir(chart_dimension);
                    console.dir(checked);

                    //  Make an AJAX call to BE about chart_dimension and value.
                    $.ajax({
                        type: 'GET',
                        url: ST.params.get_rundata_url,
                        data:   {
                            //'via'    : 'post',
                            //'route'  : '/command/' + ST.params.machine,      //  rzgenie
                            'command': 'chart_show',
                            'dimension': chart_dimension,
                            'checked': checked
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