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
                "header": mode + "  Chart",
                "body": templ,
                "classes" : "composite_chart_type " + mode.toLowerCase() + "_mode"
            });

            setup_dimensions_();
            setup_defaults_();

            show_based_context_( load_obj.chart_type || "multi" );

            $('.composite_chart_type .submit').unbind("click").bind('click', submit_ );
            $('.composite_chart_type .delete').unbind("click").bind('click', delete_ );
            $('.composite_chart_type .pick_chart_type_sel').unbind('change').change( chart_type_changed_ );

            $('.chart_name:eq(0)').focus();
        });
    };


    var operation_select = [
        '+', '-', '*', '/', ST.CONSTS.STRCON
    ];

    var attributes_select = [];

    var get_attributes_ = function() {

        var dims = ST.UserPreferences.get_dimensions();
        var ht = [];

        for( var x=0; x < dims.length; x++ ) {
            ht.push( dims[x] );
        }

        return ht;
    };


    var show_based_context_ = function( ch_type ) {

        if( edit_mode_ === false ) {

            //  NEW --------------------------------------
            $('.composite_chart_type .axis_row').hide();
            $('.composite_chart_type .pick_chart_type').show();

        } else {

            //  Edit Mode.
            $('.composite_chart_type .pick_chart_type').hide();
            ren_delete_( false );
        }

        attributes_select = get_attributes_();

        //  EDIT
        if( ch_type === "multi") {

            $('.multi_row_selector').MultiRowSelector({
                selectors: [ operation_select, attributes_select ],
                callback: drop_selected_
            });

            ren_delete_( true );

            var first_dropdown = $('.composite_chart_type .multi_row:eq(0) .dimension_attribute').val();
            $('.composite_chart_type .chart_name').val( first_dropdown );

        } else {
            $('.multi_row_selector').html("");
        }

        if( ch_type === ST.CONSTS.COMPOSITE_PLOT && edit_mode_ ) {
            ren_delete_(true);
        }

        //  EDIT
        if( ch_type === "scatter" ) {

            //  is scatter chart, only scatter chart shows axis rows.
            $('.composite_chart_type .axis_row').show();

            if( edit_mode_ ) {
                ren_delete_(true);
            }

            var xaxis_sel = $('.composite_chart_type .xaxis select').val();
            var yaxis_sel = $('.composite_chart_type .yaxis select').val();
            var vs = xaxis_sel + " vs " + yaxis_sel;

            $('.composite_chart_type .chart_name').val( vs );

        } else {
            //  is NOT a scatter chart
            $('.composite_chart_type .axis_row').hide();
        }

        if( edit_mode_ === false ) {
            ren_delete_( false );
        }
    };


    var ren_delete_ = function( show ) {

        if( show ) {
            $('.composite_chart_type .delete').attr('display', 'inline-block').show();
        } else {
            $('.composite_chart_type .delete').hide();
        }
    };


    var chart_type_changed_ = function() {

        var ch_type = $('.composite_chart_type .pick_chart_type_sel').val().toLowerCase();

        show_based_context_( ch_type );
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
        remove_by_dimension_( ST.layout_used.table, loaded_dimension_ );

        sqs.layout_used = ST.layout_used;
        sq.save();

        ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);

        $('.composite_chart_type .close').trigger('click');
    };


    var setup_defaults_ = function () {

        load_obj_ = load_obj_ || {};

        var ch_name = load_obj_.chart_name;

        if( load_obj_.is_scatter_chart && !load_obj_.chart_name ) {
            ch_name = "Problem size vs Jobsize";
        }

        var xaxis = load_obj_["x_label"] || "problem_size";
        var yaxis = load_obj_["y_label"] || "jobsize";

        $('.xaxis select').val( xaxis ).change(update_chart_name_);
        $('.yaxis select').val( yaxis ).change(update_chart_name_);

        $('.composite_chart_type .chart_name').val( ch_name );
    };


    var make_new_dimension_ = function( xaxis, yaxis ) {
        return xaxis + "_vs_" + yaxis;
    };


    var is_adding_multi_row_ = function() {

        return $('.only_multi_row_selector').length > 0;
    };


    var close_modal_ = function() {

        $('.composite_chart_type .close').trigger('click');
    };


    var submit_ = function() {

        //  this is based on if the person selects composite chart type or the scatter plot
        if( is_adding_multi_row_() ) {

            composite_chart_type_submit_();
            return true;
        }

        var chart_name = $('.chart_name').val();
        var xaxis = $('.xaxis select').val() || "";
        var yaxis = $('.yaxis select').val() || "";

        xaxis = ST.Utility.strip(xaxis);
        yaxis = ST.Utility.strip(yaxis);

        var dimension = make_new_dimension_( xaxis, yaxis );


        close_modal_();

        if( edit_mode_ ) {

            var old_layout = remove_by_dimension_( sqs.layout_used.charts, loaded_dimension_ );

            if( load_obj_.is_scatter_chart ) {

                old_layout.dimension = make_new_dimension_(xaxis, yaxis);
                old_layout.xaxis = xaxis;
                old_layout.yaxis = yaxis;
            }

            old_layout.name = chart_name;
            old_layout.title = chart_name;

            //sqs.layout_used.charts.push(old_layout);
            console.log('old_index = ' + old_layout.old_index);
            sqs.layout_used.charts.splice( old_layout.old_index, 0, old_layout );
            sq.save();

            ST.layout_used = sqs.layout_used;

            ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);
            //  ST.graph.editScatterplot(new_layout);
        } else {

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

            if( validate_have_( ST.layout_used, new_layout )) {

                var mess = "You already have a chart with x-axis: <b>" + xaxis + "</b> and y-axis: <b>"+ yaxis + "</b>";
                ReusableView.alert("Warning", mess );
            } else {

                sqs.layout_used.charts.push(new_layout);
                ST.layout_used = sqs.layout_used;

                sq.save();

                ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);

                //ST.graph.addScatterplot(new_layout);
            }
        }
    };


    var gen_dimension_ = function( ops ) {

        var dim = "";

        for( var y=0; y < ops.length; y++ ) {
            dim += ops[y].attribute + "_";
        }

        return dim;
    };


    var operations_;

    var drop_selected_ = function( operations ) {

        operations_ = operations;
        set_up_chart_name_( operations );
    };



    var set_up_chart_name_ = function( ops ) {

        var ht = "";

        for( var z=0; z < ops.length; z++ ) {

            var op = ops[z];
            var ope = op.operation || "";

            ht += ope + op.attribute;
        }

        $('.chart_name').val( ht );
    };


    var composite_chart_type_submit_ = function() {

        //  having only one instance to worry about makes it easier.
        var con =$('.multi_row_selector');

        //  get latest ops instead of waiting for select drop down onchange event.
        var operations_just_now = $.fn.MultiRowSelector.get_operations( con );
        var valid = ST.ValidateCompositeModel.validate( operations_just_now );

        if( valid !== true ) {

            ReusableView.alert('Composite chart inputs not valid', valid);
            return false;
        }

        var chart_name = $('.chart_name').val();

        if( !operations_just_now ) {
            ReusableView.alert('operations have not been set.');
        }

        var operations = operations_just_now;

        var dimension = gen_dimension_( operations );
        //var viz = "BarChart";
        var viz = ST.CompositeLayoutModel.get_viz_type_based_on_cali_data_type( operations );

        var new_layout2 = {
            dimension: dimension,
            title: chart_name,
            //xaxis: xaxis,
            //yaxis: yaxis,
            name: chart_name,
            viz: viz,
            show: true,
            composite_layout: {
                operations: operations
            }
        };


        var new_layout = $.extend({}, new_layout2 );

        sqs.layout_used.charts.push(new_layout);
        ST.layout_used = sqs.layout_used;

        var data_type = ST.CompositeLayoutModel.get_js_type_based_on_cali_data_type( operations );

        ST.layout_used.table.push({
            dimension: dimension,
            label: chart_name,
            //label: "Experimental",
            type: data_type,
            show: true
        });

        sq.save();

        //  TODO: Need to call rerender.
        ST.ChartCollection.RenderChartCollection(ST.newp, ST.layout_used);  //  ST.ReturnedDataStub.layout); //

        close_modal_();
    };


    var remove_by_dimension_ = function( charts, dimension ) {

        for( var x=0; x < charts.length; x++ ) {

            var chart = charts[x];
            if( dimension === chart.dimension ) {

                var old = $.extend({}, charts[x] );
                charts.splice( x, 1 );
                old.old_index = x;
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


    $(document).ready( function() {

        //  just for development.
        setTimeout( function() {

            //$('.plus_icon').trigger('click');
        }, 3000);
    });

    return {
        render: render_
    }
}();