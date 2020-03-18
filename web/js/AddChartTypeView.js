ST.AddChartTypeView = function() {

    var render_ = function() {

        $.get("web/Templates/PlotType.html?" + Math.random(), function( templ ) {

            ReusableView.modal({
                "header": "Add New Composite Chart Type",
                "body": templ,
                "classes" : "composite_chart_type"
            });

            setup_dimensions_();

            $('.composite_chart_type .submit').unbind("click").bind('click', submit_ );
        });
    };


    var submit_ = function() {

        var chart_name = $('.chart_name').val();
        var xaxis = $('.xaxis select').val();
        var yaxis = $('.yaxis select').val();

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