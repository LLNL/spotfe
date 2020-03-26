ST.UserPreferences = function() {

    var update_layout_ = function( chart_dimension, checked ) {

        chart_dimension = chart_dimension.toLowerCase();

        var charts = ST.layout_used.charts;
        var tables = ST.layout_used.table;

        for( var x=0; x < charts.length; x++ ) {

            var chart = charts[x];
            var dlc = chart.dimension.toLowerCase();

            if( dlc === chart_dimension ) {
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

        ST.layout_used.charts.sort( function( a, b ) {

            if(a.dimension < b.dimension) { return -1; }
            if(a.dimension > b.dimension) { return 1; }
            return 0;
        });

        console.dir( ST.layout_used.charts );

        if( $('.user_pref_icon').length > 0 ) {
            //  Means it's already rendered and thus should auto update.
            return true;
        }

        $.get("web/Templates/UserPreferences.html", init_pref_);
    };


    var init_pref_ = function( pref_html ) {

        Vue.component('user-preferences', {
            data: function() {
                return {
                    seen: false,
                    mcharts: ST.layout_used.charts
                }
            },
            template: pref_html,

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

        $('.plus_icon').unbind('click').bind('click', ST.AddChartTypeView.render );
    };


    var get_dimensions_ = function() {

        var charts = ST.layout_used.charts;
        var dimensions = [];

        for( var x=0; x < charts.length; x++ ) {

            var chart = charts[x];

            var dlc = chart.dimension.toLowerCase();
            dimensions.push(dlc);
        }
        return dimensions;
    };

    return {
        render: render_,
        get_dimensions: get_dimensions_
    }
}();