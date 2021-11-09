$.fn.MultiRowSelector = function( obj ) {

    var get_select_render_ = function( arr, cla ) {

        var sel = "";
        for( var x=0; x < arr.length; x++ ) {

            sel += '<option>' + arr[x] + '</option>';
        }

        if( cla === "dimension_attribute" ) {
            //sel += "<option>CONSTANT</option>";
        }

        return "<select class='"+ cla + "'>" + sel + "</select>";
    };


    var ofDrops_ = function() {

        var ofs = "";
        var ofTypes = [
            '',
            'day of week',  //  string -> mon, tue, etc.
            'day of month', //  integer
            'month of year',
            'abs()'
        ];

        for( var x = 0; x < ofTypes.length; x++ ) {
            ofs += '<option>' + ofTypes[x] + '</option>';
        }

        return '<select class="unarySelector">' + ofs +
            '</select>';
    };


    //  First row does not have an operation select.
    var row_ = function( first_row ) {

        var operation_select = get_select_render_( obj.selectors[0], "operation_sel" );
        var attributes_select = get_select_render_( obj.selectors[1], "dimension_attribute" );
        var input_const = "<input type='text' class='input_const' style='display: none;'>";

        return '<tr class="multi_row">' +
            '<td>' + ( first_row ? "" : operation_select) + '</td>' +
            '<td>' + ofDrops_() + '</td>' +
            '<td>' + attributes_select +
            input_const +
            '</td>' +
            '<td>' +
            ReusableView.button("X", "delete_row", "myButton") +
            '</td>' +
            '</tr>';
    };


    var get_operations_ = function( that ) {

        var parent = that.closest(".multi_row_selector");
        var vals = [];

        var ops = parent.find("select.dimension_attribute").each( function( ind, el ) {

            var v = $(el).val();
            var tr = $(el).closest('tr.multi_row');
            var op_sel = tr.find('.operation_sel').val();
            var unary_op = tr.find('.unarySelector').val();

            vals.push({
                attribute: v,
                operation: op_sel,
                unary_operation: unary_op
            });
        });


        console.dir( vals );
        console.dir( ops );
        return vals;
    };

    //  Let's make this publicly available so that we can run it before submits happen.
    //  OR so we don't have to wait for a onchange event to occur.
    $.fn.MultiRowSelector.get_operations = get_operations_;

    var bind_ = function( that ) {

        that.find('.delete_row').unbind('click').bind('click', delete_row_ );
        that.find('.add_row').unbind('click').bind('click', add_row_ );

        that.find('select').unbind('change').change( function() {

            var ops = get_operations_( that );
            obj.callback( ops );
        } );
    };


    var add_row_ = function() {

        var mrs = $(this).closest('.multi_row_selector');
        mrs.find('table').append( row_() );

        bind_( mrs );
    };


    var num_rows_ = function( mrs ) {

        var count = mrs.find('tr').length;

        return count;
    };


    var delete_row_ = function() {

        var mrs = $(this).closest('.multi_row_selector');

        //  can't delete the last row.
        if( num_rows_( mrs ) > 1 ) {

            $(this).closest('.multi_row').remove();
        }

    };


    return this.each( function() {

        var html = '<table class="only_multi_row_selector">' + row_( true ) + '</table>' +
            '<div class="center">' +
            ReusableView.button("ADD ROW", "add_row", "myButton") +
            '</div>';

        var that = $(this);

        that.html(html);

        bind_( that );
    });
};