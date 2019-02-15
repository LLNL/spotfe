ST.LayoutAugmenterModel = function() {

    //  The backend will not control things like width and height of charts.
    //  It's up to us here to augment the model with the correct layout attributes.
    var get_ = function( model ) {

        for( var x in model ) {

            var mod = model[x];
            mod.width = 470;
            mod.height = 370;

            if( mod.viz === "BasicLineChart" ) {
                mod.height = 320;
            }

            //  TODO: Eventually this will need to be calcualted dynamically
            if( mod.viz === "BarChart" && mod.dimension === "year") {

                mod.xrange =  [2008,2018];
                mod.xsuffix = "";
            }

            if( mod.viz === "PieChart" ) {

                mod.inner_radius = 30;
                mod.radius = 170;
            }
        }
    };

    return {
        get: get_
    }
}();