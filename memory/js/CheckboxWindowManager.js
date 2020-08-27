$.fn.CheckboxWindowManager = function() {

    return this.each( function(el) {

        $(this).append('<div class="CheckboxWindowManager">' + boxes_() + "</div>" +
            "<div class='checkbox_open_close'>views</div>");

        $('[type="checkbox"]').unbind('click').bind('click', checked_ );
        $('.checkbox_open_close').unbind('click').bind('click', open_close_ );

        bind_lm_handlers_();
    });

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

    var win_name_,
        parents_ = {};

    var checked_ = function() {

        win_name_ = $(this).parent().find('.txt').html();
        win_name_ = win_name_.toLowerCase();

        var becoming_checked = $(this).is(':checked');
        var varRe = myLayout.root.getItemsByFilter( find_ );

        //var varRe = myLayout.getComponent(win_name_);

        //console.dir( ret );


        console.log('check: ' + win_name_ + "   ch=" + becoming_checked );

        var spec_child = specs_[win_name_];

        if( becoming_checked ) {


        } else {

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
};
