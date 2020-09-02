$.fn.CheckboxWindowManager = function( obj ) {

    var specs_ = obj.legend;

    var bind_lm_handlers_ = function() {

        $('.lm_close_tab').unbind('click').bind('click', closed_clicked_ );
        $('.lm_header .lm_controls>li').css({"display": "none"});
    };


    var closed_clicked_ = function() {

        var title = $(this).parent().find('.lm_title').html().toLowerCase();
        console.log(title);

        $('[check_type="' + title + '"] input').prop('checked', '');
    };


    var open_close_ = function() {

        $('.CheckboxWindowManager').toggle();
    };

    var win_name_;

    var checked_ = function() {

        win_name_ = $(this).parent().find('.txt').html();
        win_name_ = win_name_.toLowerCase();

        var becoming_checked = $(this).is(':checked');


        console.log('check: ' + win_name_ + "   ch=" + becoming_checked );

        if( becoming_checked ) {

            if( obj.checked ) {

                var thing = $(event.target).parent().find("div.txt").html();
                obj.checked( thing );
            }
        } else {

            if( obj.unchecked ) {

                var thing = $(event.target).parent().find("div.txt").html();
                obj.unchecked( thing);
            }
        }

        bind_lm_handlers_();
    };


    var boxes_ = function() {

        var ht = "";
        for( var x in specs_ ) {
            ht += box_( x );
        }

        return ht;
    };

    var box_ = function( str ) {

        var sc = str.toLowerCase();

        return "<div class='check_line' check_type='" + sc + "'>" +
            "<input type='checkbox' checked='checked'/>" +
            "<div class='txt'>" + str + "</div>" +
            "</div>";
    };

    var window_out_ = function() {

        var target = $(event.target);
        var top_bar = target.closest('.CheckboxWindowManager');
        var inside_topbar = top_bar.length;
        var has = target.hasClass('checkbox_open_close');

        if( !inside_topbar && !has) {
            $('.CheckboxWindowManager').hide();
        }
    };

    $("body").unbind('click.window_out').bind('click.window_out', window_out_ );


    return this.each( function(el) {

        $(this).find('.CheckboxWindowManager').remove();

        $(this).html('<div class="CheckboxWindowManager">' + boxes_() + "</div>" +
            "<div class='checkbox_open_close'>views</div>");

        $(this).find('[type="checkbox"]').unbind('click').bind('click', checked_ );
        $('.checkbox_open_close').unbind('click').bind('click', open_close_ );

        bind_lm_handlers_();
    });
};
