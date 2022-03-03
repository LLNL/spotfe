ST.MemoryLineModel = function() {

    var check_cache_ = [];
    var legend_ = [];
    var attributes_;
    var records_cache_;


    var charts_ = [{}];

    var get_model_ = function() {
        return charts_;
    };

    var add_chart_ = function() {
        charts_.push({});
    };

    var update_traces_ = function( aj_dat ) {

        var ret3 = process_records_( aj_dat );
        var rets = ret3[0];
        //var charts = ST.MemoryLineModel.get_model().charts;

        for( var z = 0; z < charts_.length; z++ ) {

            charts_[z].trace = [];

            for (var pound_name in rets) {

                if ( !isNaN( rets[pound_name] ) &&
                    pound_name !== "block") {

                    check_cache_[z] = check_cache_[z] || {};

                    legend_[z] = legend_[z] || {};
                    attributes_[pound_name] = attributes_[pound_name] || {};

                    var alias = attributes_[pound_name]["alias"] || pound_name;

                    if (check_cache_[z][pound_name] !== false) {

                        var trace = get_trace_(ret3, pound_name);
                        charts_[z].trace.push( trace );

                        legend_[z][pound_name] = 1;
                    } else {
                        legend_[z][pound_name] = 0;
                    }
                }
            }
        }
    };


    var set_check_cache_ = function( plot_instance, got_checked, tf ) {

        check_cache_[plot_instance] = check_cache_[plot_instance] || {};
        check_cache_[plot_instance][ got_checked ] = tf;
    };

    var process_records_ = function( aj_dat ) {

        if( aj_dat ) {

            var ret2;

            if( aj_dat.output ) {
                aj_dat = aj_dat.output.command_out;
            }

            var aj_obj = ST.parse(aj_dat);

            if( aj_obj.series ) {

                //  In container.
                ret2 = aj_obj;

            } else {
                //  on Lorenz, not the container
                var ret = aj_dat.output.command_out;

                ret2 = ST.parse(ret);


                //var std = JSON.parse(ret2.std);
                //console.dir( std );
            }

            var records = ret2.series.records;

            ST.Utility.assert( records.length > 0, "Did not receive any records.  Please check to see that your cali files contain memory data.");

            //randomize_( records );

            records.sort( function( a, b ) {

                return a.block - b.block;
            });

            attributes_ = ret2.series.attributes || {};

            console.dir( ret2 );
            console.dir( records );

            records_cache_ = records;
            return records;
        }

        return records_cache_;
    };


    var randomize_ = function( records ) {

        for( var z=0; z < records.length; z++ ) {

            records[z]['sum#mem.bytes.written/mwb.time'] = Math.random()*1000 + 2000;
            records[z]['sum#mem.bytes.read/mrb.time'] = Math.random() * 500 + 3000;
            records[z]['max#sum#loop.iterations'] = Math.random() * 3000 + 200;
            records[z]['avg#mem.bytes.written/mwb.time'] = Math.random() * 6000;
            records[z]['max#sum#time.duration'] = Math.random() * 200;
            records[z]['avg#loop.iterations/time.duration'] = (Math.random() * 50) + 500;
            records[z]['max#mem.bytes.read/mrb.time'] = Math.random()*700 + (z*100);
        }
    };



    var filter_legend_by_unit_type_ = function( y ) {

        var checkbox_obj = legend_[y];
        var first_unit_type;

        for( var pound_name in checkbox_obj ) {

            var att = attributes_[pound_name];
            var unit = att['attribute.unit'];

            //  If alias is not available use pound name instead.
            var alias = att['alias'] || pound_name;

            if( !unit ) {
                var warning = "attribute.unit is not defined for "+ pound_name;
                console.log( warning );
            }

            if( !first_unit_type ) {
                first_unit_type = unit;
            }

            console.log( unit );

            if( 'MB/s' === unit ) {
                checkbox_obj[pound_name] = {
                    check: 1,
                    alias: alias
                };

            } else {
                checkbox_obj[pound_name] = {
                    check: 0,
                    alias: alias
                }
            }
        }

        return checkbox_obj;
    };

    var get_trace_ = function( ret3, attr ) {

        var att = attributes_[ attr ];
        var alias = att["alias"];

        var trace = {
            x: [],
            y: [],
            type: 'scatter',
            name: alias
        };

        for( var a=0; a < ret3.length; a++ ) {

            var obj = ret3[a];

            trace.x.push( obj.block );
            trace.y.push( obj[ attr ] );

            //  hover.
            //trace.text.push( attr );
        }

        return trace;
    };


    var get_chart_by_instance_ = function( instance ) {

        update_traces_();
        return charts_[ +instance ];
    };

    return {
        get_chart_by_instance: get_chart_by_instance_,
        filter_legend_by_unit_type: filter_legend_by_unit_type_,
        set_check_cache: set_check_cache_,
        update_traces: update_traces_,
        add_chart: add_chart_,
        get_model: get_model_
    }
}();