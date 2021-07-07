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

        if( $('.user_pref_icon').length > 0 ) {
            //  Means it's already rendered and thus should auto update.
            return true;
        }

        $.get("web/Templates/UserPreferences.html", init_pref_);
    };


    var sort_charts_by_title_ = function( a, b ) {

	var at = a.title.toLowerCase();
	var bt = b.title.toLowerCase();

	return at > bt ? 1 : -1;
    };


    var init_pref_ = function( pref_html ) {

        ST.layout_used.charts.sort( sort_charts_by_title_ );

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
                    //ST.graph.setChartVisible( chart_dimension, checked );

                    for( var x in sqs.layout_used.charts ) {

                        var chart = sqs.layout_used.charts[x];

                        if( chart.dimension === chart_dimension ) {

                            console.log("checked: " + checked);
                            chart.show = checked;
                            sq.save();
                        }
                    }

                    var dim_ch = ST.CallSpot.ch_key( chart_dimension );

                    if( checked ) {
                        ST.UrlStateManager.update_url(dim_ch, "1");
                    } else {
                        ST.UrlStateManager.remove_param(dim_ch);
                    }
                }
            }
        });

        new Vue({
            "el": "#user_preferences"
        });

        $('.plus_icon').unbind('click').bind('click', function() {

            ST.AddChartTypeView.render( false, {
                is_scatter_chart: true
            });
        });
    };

    var dim_idx_by_name_ = {};


    var get_dimensions_ = function( allowed_types ) {

        var axis_selection_types = ["double", "long", "int", "date", "path", "string", "set of string", "set of path", "unsigned int"];
        axis_selection_types = allowed_types || axis_selection_types;

        var charts = ST.layout_used.charts;
        var dimensions = [];

        //  We don't want composite types to b used in teh select drop down yet.  we don't support hat yet.
        var allow_any_type = false;

        for( var x=0; x < charts.length; x++ ) {

            var chart = charts[x];
            var dlc = chart.dimension.toLowerCase();

            if( axis_selection_types.indexOf(chart.type) > -1 || allow_any_type ) {
                dimensions.push(dlc);
                dim_idx_by_name_[ dlc ] = chart.type;
            }
        }
        return dimensions;
    };


    var get_dimension_type_by_name_ = function( name ) {

        return dim_idx_by_name_[ name ];
    };

    return {
        render: render_,
        get_dimensions: get_dimensions_,
        get_dimension_type_by_name: get_dimension_type_by_name_
    }
}();
