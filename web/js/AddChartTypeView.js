ST.AddChartTypeView = function() {

    var render_ = function() {

        $.get("web/Templates/PlotType.html?" + Math.random(), function( templ ) {

            ReusableView.modal({
                "header": "Add New Composite Chart Type",
                "body": templ
            });
        });
    };

    return {
        render: render_
    }
}();