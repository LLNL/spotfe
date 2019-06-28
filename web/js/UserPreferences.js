ST.UserPreferences = function() {

    var render_ = function() {

        var mods = ST.LayoutAugmenterModel.get_model();

        for( var x in mods ) {

            var graph = mods[x];
            console.dir(graph);


        }

        $('.user_preferences').html( up ).show();
    };

    return {
        render: render_
    }
}();