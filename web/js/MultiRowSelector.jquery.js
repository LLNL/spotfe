$.fn.MultiRowSelector = function( obj ) {

    var get_select_render_ = function( arr ) {

        var sel = "";
        for( var x=0; x < arr.length; x++ ) {

            sel += '<option>' + arr[x] + '</option>';
        }

        return "<select>" + sel + "</select>";
    };

    //  First row does not have an operation select.
    var row_ = function( first_row ) {

        var operation_select = get_select_render_( obj.selectors[0] );
        var attributes_select = get_select_render_( obj.selectors[1] );

        return '<tr class="multi_row">' +
            '<td>' + ( first_row ? "" : operation_select) + '</td>' +
            '<td>' + attributes_select + '</td>' +
            '<td>' +
            ReusableView.button("X", "delete_row", "myButton") +
            '</td>' +
            '</tr>';
    };

    var bind_ = function( that ) {

        that.find('.delete_row').unbind('click').bind('click', delete_row_ );
        that.find('.add_row').unbind('click').bind('click', add_row_ );
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