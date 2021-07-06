var ST = ST || {};

ST.HorizontalBarChart = function() {

    var stackedChart_ = [],
        axis_chart_;

    var render_ = function( ndx, options ) {

        var dimension_low = options.dimension.toLowerCase();
        var style = options.show ? "display: block;" : "display: none;";
        var DOM_safe_dimension = ST.Utility.filter_special( dimension_low );
        var className = 'horizontal-bar-chart-' + DOM_safe_dimension;
        var axis_chart_name = className + '_bar';
        var composite_chart = options["composite_layout"] ? ST.CONSTS.COMPOSITE_PLOT : "";

        var rcht = '\
    <div class="outer_holder outer_cont"> \
        <strong class="text_chart_name">' + options.title + '</strong> \
        <a class="reset horiz_reset"  style="display: none;">reset</a> \
        <div instance_num="' + DOM_safe_dimension + '"  ' +
            'style="' + style + '" ' +
            'class="horizontal-bar-chart ' +
            composite_chart + ' ' + className + '"  ' +
            'chart-dimension="' + DOM_safe_dimension + '">  \
        ' + ReusableView.get_hamburger() + '\
            <div class="clearfix"></div> \
        </div>\
        <div class="' + axis_chart_name + ' the_bar"></div>' +
            '</div>';


        $('.row:eq(0)').append(rcht);

        axis_chart_ = dc.rowChart('.' + axis_chart_name);

        stackedChart_[DOM_safe_dimension] = dc.rowChart('.' + className );
        var colors = [
            '#9ecae1'
        ];


        // Counts per weekday
        var dayOfWeek = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, options.dimension );
            return cali_object[ options.dimension ] || 0;
            //return ST.Utility.limit_unique_values( cali_object, options.dimension );
        });

        if( ST.cali_valid === false ) {
            //  Error on screen.
            return false;
        }

        var dayOfWeekGroup = dayOfWeek.group();

        //options.counts = ST.Utility.get_unique_value_count( options.dimension );
        options.height = 30 + (options.counts * 30);


        // Create a row chart and use the given css selector as anchor. You can also specify
        // an optional chart group for this chart to be scoped within. When a chart belongs
        // to a specific group then any interaction with such chart will only trigger redraw
        // on other charts within the same chart group.
        // <br>API: [Row Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#row-chart)

        stackedChart_[DOM_safe_dimension]
            .width(options.width)
            .height(options.height)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(dayOfWeekGroup)
            .on('filtered', function(chart) {

                ST.UrlStateManager.user_filtered(chart, 'HorizontalBarChart');
                ST.CallSpot.load_compare();
            })
            .dimension(dayOfWeek)
            // Assign colors to each value in the x scale domain
            .ordinalColors(colors)
            .label(function (d) {
                return d.key;
            })
            // Title sets the hover over.
            .title(function (d) {
                return ST.Utility.lookup_orig_str( d.key );  //  d.value
            })
            .elasticX(true)
            .xAxis().ticks(4);



        var dayOfWeek2 = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, options.dimension );
            return cali_object[ options.dimension ] || 0;
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

            //  HorizontalBarChart needs to hide reset anchor manually because anchor position is outside of other div.
            //  Do this last just in case there's an error.
            $(this).hide();
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( stackedChart_, 'HorizontalBarChart' );
        }
    }
}();