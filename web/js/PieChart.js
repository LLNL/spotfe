var ST = ST || {};

ST.PieChart = function() {

    var quarterChart = [];
    var id_ = 0;

    var render_ = function( ndx, spec ) {

        var width = spec.width || 180;
        var height = spec.height || 180;
        var radius = spec.radius || 80;
        var inner_radius = spec.inner_radius || 0;
        var dl = spec.dimension.toLowerCase();

        var rcht =     '<div instance_num="' + id_ + '" id="quarter-chart' + id_ + '"  chart-dimension="' + dl + '">  \
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

        var quarterGroup = quarter.group().reduceSum(function (d) {
            //  This can be whatever variable you want to sum up in the pie chart, for example total runtime, etc.
            return 1;
        });

        var colors = ST.Utility.get_colors( spec.dimension, true );

        quarterChart[id_] = dc.pieChart('#quarter-chart' + id_ );
        quarterChart[id_] /* dc.pieChart('#quarter-chart', 'chartGroup') */
            .width( width )
            .height(height )
            .radius( radius )
            .innerRadius(inner_radius)
            .dimension(quarter)
            .group(quarterGroup)
            .on('filtered', function(chart) {
                ST.UrlStateManager.user_filtered(chart, 'PieChart');
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
        id_++;
    };

    return {
        render: render_,
        reset: function() {

            var instance_num = $(this).parent().attr('instance_num');
            quarterChart[instance_num].filterAll();
            dc.redrawAll();
            bind_sort();
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( quarterChart, 'PieChart' );
        }
    }
}();