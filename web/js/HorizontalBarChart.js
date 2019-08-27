var ST = ST || {};

ST.HorizontalBarChart = function() {

    var stackedChart_ = [];

    var render_ = function( ndx, options ) {

        var dimension_low = options.dimension.toLowerCase();
        var style = options.show ? "display: block;" : "display: none;";
        var className = 'horizontal-bar-chart-' + dimension_low;

        var rcht =     '<div instance_num="' + dimension_low + '"  ' +
            'style="' + style + '" class="' + className + '"  chart-dimension="' + dimension_low + '">  \
        <strong>' + options.title + '</strong> \
        <a class="reset horiz_reset"  style="display: none;">reset</a> \
        <div class="clearfix"></div> \
    </div> ';


        $('.row:eq(0)').append(rcht);

        stackedChart_[dimension_low] = dc.rowChart('.' + className );
        var colors = [
            '#9ecae1',
            '#3182bd',
            '#5ebd8d',
            '#bda665',
            '#bd59a1'
        ];

        var uniq_counts = {};

        // Counts per weekday
        var dayOfWeek = ndx.dimension(function (cali_object) {

            ST.Utility.validate_cali_object( cali_object, options.dimension );

            //var day = d.dd.getDay();
            var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            uniq_counts[ cali_object[ options.dimension ] ] = 1;
            return cali_object[ options.dimension ];// || "none";// day + '.' + name[day];
        });

        if( ST.cali_valid === false ) {
            //  Error on screen.
            return false;
        }

        var dayOfWeekGroup = dayOfWeek.group();

        console.dir(uniq_counts);

        var number_of_authors = Object.keys( uniq_counts ).length;
        console.log(number_of_authors);
        var height = number_of_authors * 35;

        var translate_ = {
            "willEmailYouToComplain" : "mlegendre",
            "Filler0" : "paschwanden",
            "Filler1" : "dboehma",
            "dzpolia" : "dzpolia"
        };

        // Create a row chart and use the given css selector as anchor. You can also specify
        // an optional chart group for this chart to be scoped within. When a chart belongs
        // to a specific group then any interaction with such chart will only trigger redraw
        // on other charts within the same chart group.
        // <br>API: [Row Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#row-chart)
        stackedChart_[dimension_low] /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
            .width(options.width)
            .height(options.height)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(dayOfWeekGroup)
            .dimension(dayOfWeek)
            // Assign colors to each value in the x scale domain
            .ordinalColors(colors)
            .label(function (d) {
                //return d.key.split('.')[1];
                return d.key; //translate_[d.key] || "Jim";
            })
            // Title sets the row text
            .title(function (d) {
                return d.author;  //  d.value
            })
            .elasticX(true)
            .xAxis().ticks(4);
            //.on('filtered', function(chart) {
            //    ST.UrlStateManager.user_filtered(chart, 'LeftHorizontalBarChart');
            //});


        $('.pie_reset').unbind('click').bind('click', ST.HorizontalBarChart.reset);
    };

    return {
        render: render_,
        reset: function() {

            stackedChart_.filterAll();

            dc.redrawAll();
            ST.ChartCollection.bind_sort();
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( stackedChart_, 'LeftHorizontalBarChart' );
        }

    }
}();