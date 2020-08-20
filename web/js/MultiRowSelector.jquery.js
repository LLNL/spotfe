$.fn.MultiRowSelector = function() {

    var operation_select = '<select>' +
        '<option>+</option>' +
        '<option>-</option>' +
        '<option>*</option>' +
        '<option>/</option>' +
        '<option>concat</option>' +
        '</select>';

    var attributes_select = '<select><option>JobSize</option><option>RanksPerNode</option></select>';

    var row_ = function() {

        return '<tr class="multi_row">' +
            '<td>' + operation_select + '</td>' +
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
    };

    var num_rows_ = function() {

        var mrs = $(this).closest('.multi_row_selector');
        var count = mrs.find('tr').length;

        return count;
    };

    var delete_row_ = function() {

        //  can't delete the last row.
        if( num_rows_() > 1 ) {

            $(this).closest('.multi_row').remove();
        }

    };

    return this.each( function() {

        var html = '<table>' + row_() + '</table>' +
            '<div class="center">' +
            ReusableView.button("ADD ROW", "add_row", "myButton") +
            '</div>';

        var that = $(this);

        that.html(html);

        bind_( that );
    });
};