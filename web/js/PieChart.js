var ST = ST || {};

ST.PieChart = function() {

    var quarterChart = [];

    var render_ = function( ndx, spec ) {

        var width = spec.width || 180;
        var height = spec.height || 180;
        var radius = spec.radius || 80;
        var inner_radius = spec.inner_radius || 0;
        var dimension_low = spec.dimension.toLowerCase();
        dimension_low = dimension_low.replace('.', '');

        var DOM_safe_dimension = ST.Utility.filter_special( dimension_low );

        var style = spec.show ? "display: block;" : "display: none;";
        var composite_chart = spec["composite_layout"] ? ST.CONSTS.COMPOSITE_PLOT : "";

        var rcht =     '<div instance_num="' + DOM_safe_dimension + '"  ' +
            'style="' + style + '" ' +
            'class="outer_cont ' + composite_chart +
            ' quarter-chart-' + DOM_safe_dimension + '"  ' +
            'chart-dimension="' + DOM_safe_dimension + '">  \
        <strong class="text_chart_name">' + spec.title + '</strong> \
        <a class="reset pie_reset"  style="display: none;">reset</a> \
        ' + ReusableView.get_hamburger() + '\
        <div class="clearfix"></div> \
    </div> ';

        $('.row:eq(0)').append(rcht);


        // Summarize volume by quarter
        var quarter = ndx.dimension(function ( cali_object) {

            ST.Utility.validate_cali_object( cali_object, spec.dimension );
            return cali_object[spec.dimension] || 0;
        });

        if( ST.cali_valid === false ) {
            //  Error on screen.
            return false;
        }

        var quarterGroup = quarter.group().reduceSum(function (d) {
            //  This can be whatever variable you want to sum up in the pie chart, for example total runtime, etc.
            return 1;
        });

        var colors = ST.Utility.get_colors( spec.dimension, true );

        quarterChart[DOM_safe_dimension] = dc.pieChart('.quarter-chart-' + DOM_safe_dimension );
        quarterChart[DOM_safe_dimension] /* dc.pieChart('#quarter-chart', 'chartGroup') */
            .width( width )
            .height(height )
            .radius( radius )
            .innerRadius(inner_radius)
            .dimension(quarter)
            .group(quarterGroup)
            .on('filtered', function(chart) {

                ST.UrlStateManager.user_filtered(chart, 'PieChart');
                ST.CallSpot.load_compare();
            })
            .ordinalColors([
                '#9bdb8d',
                '#eb8b8e',
                '#bf82d5',
                '#ffb661',
                '#6fbfff',
                '#a3b7cc',
                '#ace7ff',
                '#ccaa44',
                '#77bb22',
                '#dd2277'
            ]);

        $('.pie_reset').unbind('click').bind('click', ST.PieChart.reset);
    };

    return {
        render: render_,
        reset: function() {

            var instance_num = $(this).parent().attr('instance_num');
            quarterChart[instance_num].filterAll();
            dc.redrawAll();

            ST.ChartCollection.bind_sort();
            ST.UrlStateManager.remove_param( 'PieChart' + instance_num );
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( quarterChart, 'PieChart' );
        }
    }
}();