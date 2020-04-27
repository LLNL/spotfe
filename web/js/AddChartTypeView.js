ST.AddChartTypeView = function() {

    var render_ = function() {

        $.get("web/Templates/PlotType.html?" + Math.random(), function( templ ) {

            ReusableView.modal({
                "header": "Add New Composite Chart Type",
                "body": templ,
                "classes" : "composite_chart_type"
            });

            setup_dimensions_();
            setup_defaults_();

            $('.composite_chart_type .submit').unbind("click").bind('click', submit_ );
        });
    };


    var setup_defaults_ = function () {

        $('.xaxis select').val( "problem_size" ).change(update_chart_name_);
        $('.yaxis select').val("jobsize").change(update_chart_name_);
        $('.composite_chart_type .chart_name').val("Problem size vs Jobsize");
    };


    var update_chart_name_ = function() {

        var xaxis = $('.xaxis select').val();
        var yaxis = $('.yaxis select').val();

        var name = xaxis + " vs " + yaxis;

        $('.composite_chart_type .chart_name').val( name );
    };


    var submit_ = function() {

        var chart_name = $('.chart_name').val();
        var xaxis = $('.xaxis select').val();
        var yaxis = $('.yaxis select').val();

        xaxis = ST.Utility.strip(xaxis);
        yaxis = ST.Utility.strip(yaxis);

        var dimension = xaxis + "_vs_" + yaxis;


        var new_layout2 = {
            dimension: dimension,
            title: chart_name,
            xaxis: xaxis,
            yaxis: yaxis,
            name: chart_name,
            viz: ST.CONSTS.SCATTER_PLOT,
            show: true
        };

        var new_layout = $.extend({}, new_layout2 );

        $('.composite_chart_type .close').trigger('click');

        if( validate_have_( ST.layout_used, new_layout )) {

            var mess = "You already have a chart with x-axis: <b>" + xaxis + "</b> and y-axis: <b>"+ yaxis + "</b>";
            ReusableView.alert("Warning", mess );
        } else {

            ST.layout_used.charts.push(new_layout);
            ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);

            ST.graph.addScatterplot(new_layout);
        }
    };


    var validate_have_ = function( ls, new_layout ) {

        for( var y=0; y < ls.charts.length; y++ ) {

            var ch = ls.charts[y];
            if( ch.xaxis === new_layout.xaxis && ch.yaxis === new_layout.yaxis ) {
                return true;
            }
        }

        return false;
    };


    var setup_dimensions_ = function() {

        var dims = ST.UserPreferences.get_dimensions();

        var ht = "";
        for( var x=0; x < dims.length; x++ ) {

            ht += "<option>" + dims[x] + "</option>";
        }

        $('.composite_chart_type .xaxis, .composite_chart_type .yaxis').html('<select>' + ht + '</select>');
    };

    return {
        render: render_
    }
}();