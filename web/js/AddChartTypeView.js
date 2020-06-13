ST.AddChartTypeView = function() {

    var edit_mode_, loaded_dimension_, load_obj_;

    var render_ = function( edit_mode, load_obj ) {

        load_obj = load_obj || {};
        load_obj_ = load_obj;

        loaded_dimension_ = load_obj ? load_obj.dimension : false;
        edit_mode_ = edit_mode === true;

        $.get("web/Templates/PlotType.html?" + Math.random(), function( templ ) {

            var mode = edit_mode_ ? "Edit": "Add";

            ReusableView.modal({
                "header": mode + " Composite Chart Type",
                "body": templ,
                "classes" : "composite_chart_type " + mode.toLowerCase() + "_mode"
            });

            setup_dimensions_();
            setup_defaults_();

            if( !load_obj.is_scatter_chart && edit_mode_ ) {

                //  is NOT a scatter chart
                $('.composite_chart_type .axis_row, .composite_chart_type .delete').hide();
            } else {

                //  is scatter chart
                $('.composite_chart_type .axis_row');
                $(' .composite_chart_type .delete').attr('display', 'inline-block');
            }

            $('.composite_chart_type .submit').unbind("click").bind('click', submit_ );
            $('.composite_chart_type .delete').unbind("click").bind('click', delete_ );
        });
    };


    var setup_defaults_ = function () {

        load_obj_ = load_obj_ || {};

        var ch_name = loaded_dimension_ || "Problem size vs Jobsize";
        var xaxis = load_obj_["x_label"] || "problem_size";
        var yaxis = load_obj_["y_label"] || "jobsize";

        $('.xaxis select').val( xaxis ).change(update_chart_name_);
        $('.yaxis select').val( yaxis ).change(update_chart_name_);

        $('.composite_chart_type .chart_name').val( ch_name );
    };


    var update_chart_name_ = function() {

        var xaxis = $('.xaxis select').val();
        var yaxis = $('.yaxis select').val();

        var name = xaxis + " vs " + yaxis;

        $('.composite_chart_type .chart_name').val( name );
    };


    var delete_ = function() {

        remove_by_dimension_( ST.layout_used.charts, loaded_dimension_ );
        remove_by_dimension_( ST.layout_used.scatterplots, loaded_dimension_ );

        ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);

        $('.composite_chart_type .close').trigger('click');
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

        if( edit_mode_ ) {

            var old_layout = remove_by_dimension_( ST.layout_used.charts, loaded_dimension_ );

            old_layout.name = chart_name;
            old_layout.title = chart_name;
            old_layout.axis = xaxis;
            old_layout.yaxis = yaxis;

            ST.layout_used.charts.push(old_layout);
            ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);
            //  ST.graph.editScatterplot(new_layout);
        } else {

            if( validate_have_( ST.layout_used, new_layout )) {

                var mess = "You already have a chart with x-axis: <b>" + xaxis + "</b> and y-axis: <b>"+ yaxis + "</b>";
                ReusableView.alert("Warning", mess );
            } else {

                ST.layout_used.charts.push(new_layout);
                sqs.layout_used.charts.push(new_layout);
                sq.save();

                ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);

                //ST.graph.addScatterplot(new_layout);
            }
        }
    };


    var remove_by_dimension_ = function( charts, dimension ) {

        for( var x=0; x < charts.length; x++ ) {

            var chart = charts[x];
            if( dimension === chart.dimension ) {

                var old = $.extend({}, charts[x] );
                charts.splice( x, 1 );
                return old;
            }
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