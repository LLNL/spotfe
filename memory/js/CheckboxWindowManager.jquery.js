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


    var open_close_ = function( that ) {

        that.find('.CheckboxWindowManager').toggle();
    };

    var win_name_;

    var checked_ = function() {

        win_name_ = $(this).parent().find('.txt').html();
        win_name_ = win_name_.toLowerCase();

        var becoming_checked = $(this).is(':checked');


        console.log('check: ' + win_name_ + "   ch=" + becoming_checked );

        if( becoming_checked ) {

            if( obj.checked ) {

                var et = $(event.target);
                var thing = et.parent().find("div.txt").html();
                obj.checked( thing, et );
            }
        } else {

            if( obj.unchecked ) {

                var et = $(event.target);
                var thing = et.parent().find("div.txt").html();
                obj.unchecked( thing, et );
            }
        }

        bind_lm_handlers_();
    };


    var boxes_ = function() {

        var ht = "";
        for( var x in specs_ ) {

            ht += box_( x, specs_[x].check, specs_[x].alias );
        }

        return ht;
    };

    var box_ = function( str, checked, alias ) {

        var sc = str.toLowerCase();
        var checked = checked ? ' checked="checked" ' : "";

        return "<div class='check_line' check_type='" + sc + "'>" +
            "<input type='checkbox' " + checked + "/>" +
            "<div class='txt'>" + alias + "</div>" +
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

        var that = $(this);
        that.find('.CheckboxWindowManager').remove();

        that.html('<div class="CheckboxWindowManager">' + boxes_() + "</div>" +
            "<div class='checkbox_open_close'>views</div>");

        that.find('[type="checkbox"]').unbind('click').bind('click', checked_ );

        that.find('.checkbox_open_close').unbind('click').bind('click', function() {
            open_close_( that );
        });

        bind_lm_handlers_();
    });
};
