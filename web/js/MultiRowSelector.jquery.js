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

        return '<table>' +
            '<tr class="multi_row">' +
            '<td>' + operation_select + '</td>' +
            '<td>' + attributes_select + '</td>' +
            '<td>' +
            ReusableView.button("X", "delete_row", "myButton") +
            '</td>' +
            '</tr>' +
            '</table>' +
            '<div class="center">' +
            ReusableView.button("ADD ROW", "add_row", "myButton") +
            '</div>';
    };

    var bind_ = function( that ) {

        that.unbind('click').bind('click', delete_row_ );
    };

    var delete_row_ = function() {


    };

    return this.each( function() {

        var html = row_();
        var that = $(this);

        that.html(html);

        bind_( that );
    });
};