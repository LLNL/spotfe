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

        $('.xaxis select').val( "problem_size" );
        $('.yaxis select').val("jobsize");
        $('.chart_name').val("Problem size vs Jobsize");
    };

    var submit_ = function() {


        var chart_name = $('.chart_name').val();
        var xaxis = $('.xaxis select').val();
        var yaxis = $('.yaxis select').val();

        xaxis = ST.Utility.strip(xaxis);
        yaxis = ST.Utility.strip(yaxis);

        var dimension = xaxis + "_vs_" + yaxis;

        var new_layout = {
            dimension: dimension,
            xaxis: xaxis,
            yaxis: yaxis,
            name: chart_name,
            viz: "ScatterPlot",
            show: true
        };

        ST.layout_used.charts.push( new_layout );

        ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);

        $('.composite_chart_type .close').trigger('click');
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