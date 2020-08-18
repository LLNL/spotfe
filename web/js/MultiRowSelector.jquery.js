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
            '<div class="button">X</div>' +
            '</td>' +
            '</tr>' +
            '</table>' +
            '<div class="icon myButton add_row">\n' +
            '        <div class="inner">ADD ROW</div>\n' +
            '    </div>';
    };

    var bind_ = function( that ) {

    };

    return this.each( function() {

        var html = row_();
        var that = $(this);

        that.html(html);

        bind_( that );
    });
};