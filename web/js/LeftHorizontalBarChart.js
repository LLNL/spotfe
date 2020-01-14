var ST = ST || {};

ST.LeftHorizontalBarChart = function() {

    var horizontalStackedChart_;

    var render_ = function( ndx, options ) {

        $('.left_side').append('<div id="day-of-week-chart"> \
    <strong>User</strong> \
    <a class="reset" href="javascript: ST.LeftHorizontalBarChart.reset();" style="display: none;">reset</a> \
    <div class="clearfix"></div> \
    </div> ');

        horizontalStackedChart_ = dc.rowChart('#day-of-week-chart');
        var colors = ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'];
        colors = ['#9ecae1']; //,'#3182bd','#3182bd','#3182bd','#3182bd'];

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

        var number_of_authors = Object.keys( uniq_counts ).length;
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
        horizontalStackedChart_ /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
            .width(240)
            .height(height)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(dayOfWeekGroup)
            .dimension(dayOfWeek)
            // Assign colors to each value in the x scale domain
            .ordinalColors(colors)
            .label(function (d) {
                //return d.key.split('.')[1];
                return translate_[d.key] || "Jim";
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


    };

    return {
        render: render_,
        reset: function() {

            horizontalStackedChart_.filterAll();

            dc.redrawAll();
            ST.ChartCollection.bind_sort();
        },
        load_filter: function() {

            ST.UrlStateManager.load_filter( horizontalStackedChart_, 'LeftHorizontalBarChart' );
        }

    }
}();