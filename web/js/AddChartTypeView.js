ST.AddChartTypeView = function() {

    var render_ = function() {

        $.get("web/Templates/PlotType.html", function( templ ) {

            ReusableView.modal({
                "header": "Warning",
                "body": templ
            });
        });
    };

    return {
        render: render_
    }
}();