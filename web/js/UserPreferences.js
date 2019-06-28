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

                    console.dir(chart_dimension);
                    console.dir(val);
                }
            }
        });



        new Vue({
            "el": "#user_preferences"
        });
    };

    return {
        render: render_
    }
}();