ST.MemoryLineModel = function() {

    var model_ = {
        charts: []
    };

    var get_model_ = function() {
        return model_;
    };

    var add_chart_ = function() {
        model_.charts.push({});
    };

    return {
        add_chart: add_chart_,
        get_model: get_model_
    }
}();