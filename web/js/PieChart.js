var ST = ST || {};

ST.PieChart = function() {

    var quarterChart = [];

    var render_ = function( ndx, spec ) {

        var width = spec.width || 180;
        var height = spec.height || 180;
        var radius = spec.radius || 80;
        var inner_radius = spec.inner_radius || 0;
        var dimension_low = spec.dimension.toLowerCase();

        var style = spec.show ? "display: block;" : "display: none;";

        var rcht =     '<div instance_num="' + dimension_low + '"  ' +
            'style="' + style + '" class="quarter-chart-' + dimension_low + '"  chart-dimension="' + dimension_low + '">  \
        <strong>' + spec.title + '</strong> \
        <a class="reset pie_reset"  style="display: none;">reset</a> \
        <div class="clearfix"></div> \
    </div> ';

        $('.row:eq(0)').append(rcht);


        // Summarize volume by quarter
        var quarter = ndx.dimension(function ( cali_object) {

            ST.Utility.validate_cali_object( cali_object, spec.dimension );
            return cali_object[spec.dimension];
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

        quarterChart[dimension_low] = dc.pieChart('.quarter-chart-' + dimension_low );
        quarterChart[dimension_low] /* dc.pieChart('#quarter-chart', 'chartGroup') */
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

        //quarterChart[dl].dimension = spec.dimension;

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