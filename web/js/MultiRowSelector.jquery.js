$.fn.MultiRowSelector = function( obj ) {

    var get_select_render_ = function( arr, cla ) {

        var sel = "";

        for( var x=0; x < arr.length; x++ ) {

            sel += '<option>' + arr[x] + '</option>';
        }

        return "<select class='"+ cla + "'>" + sel + "</select>";
    };


    var ofDrops_ = function() {

        var ofs = "";

        var ofTypes = $.fn.MultiRowSelector.ofTypes;

        var ofTypesArr = [];
        for( var x in ofTypes ) {
            ofTypesArr.push( ofTypes[x] );
        }

        ofTypesArr.sort( function(a,b) {

            if( a.display < b.display ) {
                return -1;
            }

            if( a.display > b.display ) {
                return 1;
            }

            return 0;
        });

        for( var y=0; y < ofTypesArr.length; y++ ) {

            var obj = ofTypesArr[ y ];
            ofs += '<option>' + obj.display + '</option>';
        }

        return '<select class="unarySelector">' +
            //  means user doesn't want any unary operator for this row
            '<option></option>' + ofs +
            '</select>';
    };


    //  First row does not have an operation select.
    var row_ = function( first_row ) {

        var top_row = "";
        if( first_row ) {
            top_row = '<tr class="header_row">' +
                '<td>Binary Ops</td>' +
                '<td>Unary Operations</td>' +
                '<td>Operand</td>' +
                '<td></td>' +
                '</tr>';
        }

        var operation_select = get_select_render_( obj.selectors[0], "operation_sel" );
        var attributes_select = get_select_render_( obj.selectors[1], "dimension_attribute" );
        var input_const = "<input type='text' class='input_const' style='display: none;'>";

        return top_row + '<tr class="multi_row">' +
            '<td>' + ( first_row ? "" : operation_select) + '</td>' +
            '<td>' + ofDrops_() + '</td>' +
            //'<td><input type="text" class="const_binary_in"></td>' +
            '<td class="right_select_col">' + attributes_select +
            input_const +
            '</td>' +
            '<td>' +
            ReusableView.button("X", "delete_row", "myButton") +
            '</td>' +
            '</tr>';
    };


    var get_returning_type_for_unary_ = function( unary_op ) {

        for( var x in $.fn.MultiRowSelector.ofTypes ) {

            var obj = $.fn.MultiRowSelector.ofTypes[x];

            if( obj.display === unary_op ) {
                return obj.type_return;
            }
        }

        return ST.CONSTS.NO_UNARY_OP_SELECTED;
    };


    var get_operations_ = function( that ) {

        var parent = that.closest(".multi_row_selector");
        var vals = [];

        var ops = parent.find(".multi_row").each( function( ind, el ) {

            var v = $(el).find('select.dimension_attribute').val();
            var tr = $(el); //  $(el).closest('tr.multi_row');
            var op_sel = tr.find('.operation_sel').val();
            var unary_op = tr.find('.unarySelector').val();
            var const_binary_in = tr.find('.const_binary_in').val();
            var ret_type = get_returning_type_for_unary_( unary_op );

            vals.push({
                attribute: v,
                operation: op_sel,
                unary_operation: unary_op,
                const_binary_in: const_binary_in,
                ret_type: ret_type
            });
        });


        console.dir( vals );
        console.dir( ops );
        return vals;
    };


    var change_unary_selector_ = function( event ) {

        var targ = event.target;
        var changedTo = $(targ).val();

        if( targ.className === "unarySelector" ) {

            var tr = $(targ).parent().parent();
            var td_right = tr.find('.right_select_col');

            if (changedTo === "const( float )" || changedTo === "const( str )" ) {

                td_right.html('<input type="text" class="const_binary_in">');
            } else {

                var attributes_select = get_select_render_(obj.selectors[1], "dimension_attribute");

                td_right.html(attributes_select);
                var mrs = tr.closest('.multi_row_selector');
                bind_(mrs);
            }
        }
    };

    //  Let's make this publicly available so that we can run it before submits happen.
    //  OR so we don't have to wait for a onchange event to occur.
    $.fn.MultiRowSelector.get_operations = get_operations_;


    var bind_ = function( that ) {

        that.find('.delete_row').unbind('click').bind('click', delete_row_ );
        that.find('.add_row').unbind('click').bind('click', add_row_ );

        that.find('select').unbind('change').change( function( event ) {

            change_unary_selector_( event );
            var ops = get_operations_( that );
            obj.callback( ops );
        } );

        that.find('.help_button').unbind('click').bind('click', help_button_);
    };


    var help_button_ = function() {

        ReusableView.modal({
           header: "Help",
           body: "Unary operations happen before binary operations." +
               "<br><br>Binary operations happen according to operator presendence." +
               "<br><br>strcat is needed to combine two strings."
        });
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

        var help = ReusableView.button('?', 'help_button', 'myButton');

        var html = help + '<table class="only_multi_row_selector">' +
            row_( true ) +
            '</table>' +
            '<div class="center">' +
            ReusableView.button("ADD ROW", "add_row", "myButton") +
            '</div>';

        var that = $(this);

        that.html(html);

        bind_( that );
    });
};


$.fn.MultiRowSelector.get_day_of_week_int = function( val ) {

    var mod = val % 7;
    return mod;
};

$.fn.MultiRowSelector.get_day_of_week_str = function( val ) {

    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var mod = val % 7;

    return days[mod];
};

$.fn.MultiRowSelector.get_day_of_month_int = function( val ) {

    var date = new Date( val * 1000 );

    //  return day of month.
    return date.getDate();
};

$.fn.MultiRowSelector.get_month_of_year_int = function( val ) {

    var date = new Date( val * 1000 );

    //  return month number.
    return date.getMonth();
};

$.fn.MultiRowSelector.get_month_of_year_str = function( val ) {

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var month_index = $.fn.MultiRowSelector.get_month_of_year_int( val );

    //  return month number.
    return months[ month_index ] || "not a month";
};

$.fn.MultiRowSelector.abs_float = function( val ) {

    return Math.abs( val );
};

$.fn.MultiRowSelector.negate_float = function( val ) {
    return -1 * val;
};

$.fn.MultiRowSelector.modulo_float = function( val, const_binary_in ) {
    return val % const_binary_in;
};

$.fn.MultiRowSelector.const_float = function( val, const_binary_in ) {
    return +const_binary_in;
};

$.fn.MultiRowSelector.const_str = function( val, const_binary_in ) {
    return ("" + const_binary_in);
};

/*
    WARNING:
        DO NOT change the indexes, otherwise, the saved ofTypes indexes will
        be messed up in people's caches.
 */
$.fn.MultiRowSelector.ofTypes = {
    '1':{
        "call_func": "$.fn.MultiRowSelector.get_day_of_week_str( REPLACE_SUBJECT )",
        "display": "day of week str",
        "type_return": "string"
    },  //  string -> mon, tue, etc.
    '1.5':{
        "call_func": "$.fn.MultiRowSelector.get_day_of_week_int( REPLACE_SUBJECT )",
        "display": "day of week int",
        "type_return": "int"
    },  //  string -> mon, tue, etc.
    '2':{
        "call_func": "$.fn.MultiRowSelector.get_day_of_month_int( REPLACE_SUBJECT )",
        "display": "day of month int",
        "type_return": "int"
    }, //  integer
    '3':{
        "call_func": "$.fn.MultiRowSelector.get_month_of_year_int( REPLACE_SUBJECT )",
        "display": "month of year int",
        "type_return": "int"
    },
    '3.5':{
        "call_func": "$.fn.MultiRowSelector.get_month_of_year_str( REPLACE_SUBJECT )",
        "display": "month of year str",
        "type_return": "string"
    },
    '4':{
        "call_func": "$.fn.MultiRowSelector.abs_float( REPLACE_SUBJECT )",
        "display": "abs()",
        "type_return": "float"
    },
    '5':{
        "call_func": "$.fn.MultiRowSelector.negate_float( REPLACE_SUBJECT )",
        "display": "negate()",
        "type_return": "float"
    },
    //  THIS IS NOT a unary operator.  i don't think we'll use this again.
/*    '6':{
        "call_func": "$.fn.MultiRowSelector.modulo_float( REPLACE_SUBJECT, CONST_BINARY_IN )",
        "display": "modulo()"
    },*/
    '7':{
        "call_func": "$.fn.MultiRowSelector.const_str( REPLACE_SUBJECT, CONST_BINARY_IN )",
        "display": "const( str )",
        "type_return": "string"
    },
    '8':{
        "call_func": "$.fn.MultiRowSelector.const_float( REPLACE_SUBJECT, CONST_BINARY_IN )",
        "display": "const( float )",
        "type_return": "float"
    }
};


