var ST = ST || {};

ST.HorizontalBarChart = function() {

    var stackedChart_ = [],
        axis_chart_;

    var render_ = function( ndx, options ) {

        var dimension_low = options.dimension.toLowerCase();
        var style = options.show ? "display: block;" : "display: none;";
        var className = 'horizontal-bar-chart-' + dimension_low;
        var axis_chart_name = className + '_bar';

        var rcht = '<div class="outer_holder"> \
        <strong class="options_title">' + options.title + '</strong> \
        <a class="reset horiz_reset"  style="display: none;">reset</a> \
            <div instance_num="' + dimension_low + '"  ' +
            'style="' + style + '" class="horizontal-bar-chart ' + className + '"  chart-dimension="' + dimension_low + '">  \
        <div class="clearfix"></div> \
    </div>\
    <div class="' + axis_chart_name + ' the_bar"></div>' +
            '</div>';


        $('.row:eq(0)').append(rcht);

        axis_chart_ = dc.rowChart('.' + axis_chart_name);

        stackedChart_[dimension_low] = dc.rowChart('.' + className );
        var colors = [
            '#9ecae1'
        ];


        // Counts per weekday
        var dayOfWeek = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, options.dimension );
            return cali_object[ options.dimension ];
        });

        if( ST.cali_valid === false ) {
            //  Error on screen.
            return false;
        }

        var dayOfWeekGroup = dayOfWeek.group();


        options.height = options.counts * 30;

        // Create a row chart and use the given css selector as anchor. You can also specify
        // an optional chart group for this chart to be scoped within. When a chart belongs
        // to a specific group then any interaction with such chart will only trigger redraw
        // on other charts within the same chart group.
        // <br>API: [Row Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#row-chart)

        stackedChart_[dimension_low]
            .width(options.width)
            .height(options.height)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(dayOfWeekGroup)
            .on('filtered', function(chart) {

                ST.UrlStateManager.user_filtered(chart, 'HorizontalBarChart');
            })
            .dimension(dayOfWeek)
            // Assign colors to each value in the x scale domain
            .ordinalColors(colors)
            .label(function (d) {
                return d.key;
            })
            // Title sets the row text
            .title(function (d) {
                return d.author;  //  d.value
            })
            .elasticX(true)
            .xAxis().ticks(4);


        var dayOfWeek2 = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, options.dimension );
            return cali_object[ options.dimension ];
        });

        var dayOfWeekGroup2 = dayOfWeek2.group();

        axis_chart_.width(options.width)
            .height(options.height)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(dayOfWeekGroup2)
            .dimension(dayOfWeek2)
            // Assign colors to each value in the x scale domain
            .ordinalColors(colors)
            .label(function (d) {
                return d.key;
            })
            // Title sets the row text
            .title(function (d) {
                return d.author;  //  d.value
            })
            .elasticX(true)
            .xAxis().ticks(4);


        if( ST.cali_valid === false ) {
            //  Error on screen.
            return false;
        }

        $('.horiz_reset').unbind('click').bind('click', ST.HorizontalBarChart.reset);
    };


    return {
        render: render_,
        reset: function() {

            var instance_num = $(this).parent().find('[instance_num]').attr('instance_num');
            
            stackedChart_[instance_num].filterAll();
            dc.redrawAll();

            ST.ChartCollection.bind_sort();
            ST.UrlStateManager.remove_param( 'HorizontalBarChart' + instance_num );
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( stackedChart_, 'HorizontalBarChart' );
        }
    }
}();