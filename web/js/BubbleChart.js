var ST = ST || {};

ST.BubbleChart = function() {

    var yearlyBubbleChart;

    var render_ = function( ndx ) {

        var rcht =     '<div id="yearly-bubble-chart" class="dc-chart">\
        <strong>Yearly Performance</strong> (radius: fluctuation/index ratio, color: gain/loss)\
        <a class="reset" href="javascript:ST.BubbleChart.reset();"\
           style="display: none;">reset</a>\
        <div class="clearfix"></div>\
    </div>';

        $('.row:eq(0)').append(rcht);

        // Dimension by year
        var yearlyDimension = ndx.dimension(function (d) {
            return d3.timeYear(d.dd).getFullYear();
        });

        // Maintain running tallies by year as filters are applied or removed
        var yearlyPerformanceGroup = yearlyDimension.group().reduce(
            /* callback for when data is added to the current filter results */
            function (p, v) {
                ++p.count;
                p.absGain += v.close - v.open;
                p.fluctuation += Math.abs(v.close - v.open);
                p.sumIndex += (v.open + v.close) / 2;
                p.avgIndex = p.sumIndex / p.count;
                p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
                p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
                return p;
            },
            /* callback for when data is removed from the current filter results */
            function (p, v) {
                --p.count;
                p.absGain -= v.close - v.open;
                p.fluctuation -= Math.abs(v.close - v.open);
                p.sumIndex -= (v.open + v.close) / 2;
                p.avgIndex = p.count ? p.sumIndex / p.count : 0;
                p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
                p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
                return p;
            },
            /* initialize p */
            function () {
                return {
                    count: 0,
                    absGain: 0,
                    fluctuation: 0,
                    fluctuationPercentage: 0,
                    sumIndex: 0,
                    avgIndex: 0,
                    percentageGain: 0
                };
            }
        );


        yearlyBubbleChart = dc.bubbleChart('#yearly-bubble-chart');

        yearlyBubbleChart /* dc.bubbleChart('#yearly-bubble-chart', 'chartGroup') */
        // (_optional_) define chart width, `default = 200`
            .width(990)
            // (_optional_) define chart height, `default = 200`
            .height(250)
            // (_optional_) define chart transition duration, `default = 750`
            .transitionDuration(1500)
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .dimension(yearlyDimension)
            //The bubble chart expects the groups are reduced to multiple values which are used
            //to generate x, y, and radius for each key (bubble) in the group
            .group(yearlyPerformanceGroup)
            // (_optional_) define color function or array for bubbles: [ColorBrewer](http://colorbrewer2.org/)
            .colors(d3.schemeRdYlGn[9])
            //(optional) define color domain to match your data domain if you want to bind data or color
            .colorDomain([-500, 500])
            //##### Accessors

            //Accessor functions are applied to each value returned by the grouping

            // `.colorAccessor` - the returned value will be passed to the `.colors()` scale to determine a fill color
            .colorAccessor(function (d) {
                return d.value.absGain;
            })
        // `.keyAccessor` - the `X` value will be passed to the `.x()` scale to determine pixel location
        .keyAccessor(function (p) {
            return p.value.absGain;
        })
        // `.valueAccessor` - the `Y` value will be passed to the `.y()` scale to determine pixel location
        .valueAccessor(function (p) {
            return p.value.percentageGain;
        })
        // `.radiusValueAccessor` - the value will be passed to the `.r()` scale to determine radius size;
        //   by default this maps linearly to [0,100]
        .radiusValueAccessor(function (p) {
            return p.value.fluctuationPercentage;
        })
        .maxBubbleRelativeSize(0.3)
        .x(d3.scaleLinear().domain([-2500, 2500]))
        .y(d3.scaleLinear().domain([-100, 100]))
        .r(d3.scaleLinear().domain([0, 4000]))
        //##### Elastic Scaling

        //`.elasticY` and `.elasticX` determine whether the chart should rescale each axis to fit the data.
        .elasticY(true)
        .elasticX(true)
        //`.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
        //domains as the Accessors.
        .yAxisPadding(100)
        .xAxisPadding(500)
        // (_optional_) render horizontal grid lines, `default=false`
        .renderHorizontalGridLines(true)
        // (_optional_) render vertical grid lines, `default=false`
        .renderVerticalGridLines(true)
        // (_optional_) render an axis label below the x axis
        .xAxisLabel('Index Gain')
        // (_optional_) render a vertical axis lable left of the y axis
        .yAxisLabel('Index Gain %')
        //##### Labels and  Titles

        //Labels are displayed on the chart for each bubble. Titles displayed on mouseover.
        // (_optional_) whether chart should render labels, `default = true`
        .renderLabel(true)
        .label(function (p) {
            return p.key;
        })
        // (_optional_) whether chart should render titles, `default = false`
        .renderTitle(true)
        .title(function (p) {
            return [
                p.key,
                'Index Gain: ' + ST.numberFormat(p.value.absGain),
                'Index Gain in Percentage: ' + ST.numberFormat(p.value.percentageGain) + '%',
                'Fluctuation / Index Ratio: ' + ST.numberFormat(p.value.fluctuationPercentage) + '%'
            ].join('\n');
        })
        //#### Customize Axes

        // Set a custom tick format. Both `.yAxis()` and `.xAxis()` return an axis object,
        // so any additional method chaining applies to the axis, not the chart.
        .yAxis().tickFormat(function (v) {
            return v + '%';
        });

    };

    return {
        render: render_,
        reset: function() {
            yearlyBubbleChart.filterAll();
            dc.redrawAll();
        }
    }
}();