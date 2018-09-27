var ST = ST || {};

ST.PieChart = function() {

    var quarterChart = [];
    var id_ = 0;

    var render_ = function( ndx, spec ) {

        var width = spec.width || 180;
        var height = spec.height || 180;
        var radius = spec.radius || 80;
        var inner_radius = spec.inner_radius || 0;

        var rcht =     '<div dom_id="' + id_ + '" id="quarter-chart' + id_ + '">  \
        <strong>' + spec.title + '</strong> \
        <a class="reset pie_reset"  style="display: none;">reset</a> \
        <div class="clearfix"></div> \
    </div> ';

        $('.row:eq(0)').append(rcht);


        // Summarize volume by quarter
        var quarter = ndx.dimension(function (d) {
            return d[spec.dimension];
        });

        var quarterGroup = quarter.group().reduceSum(function (d) {
            //  This can be whatever variable you want to sum up in the pie chart, for example total runtime, etc.
            return 1;
        });

        quarterChart[id_] = dc.pieChart('#quarter-chart' + id_ );
        quarterChart[id_] /* dc.pieChart('#quarter-chart', 'chartGroup') */
            .width( width )
            .height(height )
            .radius( radius )
            .innerRadius(inner_radius)
            .dimension(quarter)
            .group(quarterGroup);

        $('.pie_reset').unbind('click').bind('click', ST.PieChart.reset);
        id_++;
    };

    return {
        render: render_,
        reset: function() {

            var dom_id = $(this).parent().attr('dom_id');
            quarterChart[dom_id].filterAll();
            dc.redrawAll();
        }
    }
}();