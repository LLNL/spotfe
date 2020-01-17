ST.UserPreferences = function() {

    var update_layout_ = function( chart_dimension, checked ) {

        chart_dimension = chart_dimension.toLowerCase();

        var charts = ST.layout_used.charts;
        var tables = ST.layout_used.table;

        for( var x=0; x < charts.length; x++ ) {

            var chart = charts[x];

            if( chart.dimension.toLowerCase() === chart_dimension ) {
                chart.show = checked;
            }
        }

        for( var y=0; y < tables.length; y++ ) {

            var table = tables[y];

            if( table.dimension.toLowerCase() === chart_dimension ) {
                table.show = checked;
            }
        }
    };


    var render_ = function() {

        var lay = $.extend( true, {}, ST.layout_used );
        var charts = ST.layout_used.charts; // ST.LayoutAugmenterModel.get_model();

        charts.sort( function( a, b ) {

            if(a.dimension < b.dimension) { return -1; }
            if(a.dimension > b.dimension) { return 1; }
            return 0;
        });

        console.dir( charts );
        if( $('.user_pref_icon').length > 0 ) {
            //  Means it's already rendered and thus should auto update.
            return true;
        }

        Vue.component('user-preferences', {
            data: function() {
                return {
                    seen: false,
                    mcharts: charts
                }
            },
            template: '<div>\
            <div class="user_pref_icon icon myButton" v-on:click="seen=(!seen)">\
            <div class="inner"></div>\
            </div>\
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

                    update_layout_( chart_dimension, checked );

                    //  Need to reload the whole page otherwise there's no way to dynamically remove columns from table.
                    ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);

                    //  Persist checkbox changes in localStorage.
                    ST.graph.setChartVisible( chart_dimension, checked );
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