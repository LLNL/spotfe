/*
EtcBucket is a Performance optimization feature of the Horizontal Bar Charts.  In Cases where there are hundreds or
thousands of unique values to HorizontalBarChart, dc.js will slow down to an unacceptable level.  Reducing the number
of Bars to less than say 50 or so, mitigates this.

The EtcBucket module that I wrote, reduces the number of unique values for a given field to a certain constant limit,
for those fields that contains too many unique values.  This makes the chart perform better.  But, users would still
like to see some of those unique values.  So, I wrote a caching system which saves those unique values in a separate
cache.  After DC.js renders all the charts, I have an algorithm which references my cache and starts, asynchronously
loading those values into the bottom table DOM.  This way, we can have the best of both worlds.  We still get good
performance and users can still check the table which contains all the unique values.

 */
ST.EtcBucket = function() {

    var make_column_index_ = function( table_spec ) {

        var di = {};
        var col_num = 0;

        for( var v = 0; v < table_spec.length; v++ ) {

            var spec = table_spec[v];

            if( spec.show === true ) {
                di[ spec.dimension ] = col_num++;
            }
        }

        return di;
    };

    var cali_key_, dim_to_idx_;

    var handle_etc_buckets_ = function() {

        dim_to_idx_ = make_column_index_(ST.layout_used.table);

        cali_key_ = 0;
    };

    var interval_handle_buckets_ = function() {

        //  This means about 500 per second.
        var end = parseInt(cali_key_) + 50;

        if( ST.cali_obj_by_key ) {

            for (cali_key_ = cali_key_; cali_key_ < ST.cali_obj_by_key.length; cali_key_++) {

                var cobj = ST.cali_obj_by_key[cali_key_];

                for (var att in cobj) {

                    if (cobj[att] === ST.CONSTS.ETC_BUCKET) {

                        var actual_val = ST.orig_obj_by_key[cali_key_][att];
                        //console.log("key: " + cali_key_ + "  att: " + att + "   actual: " + actual_val);


                        var column = dim_to_idx_[att];

                        var krow = $('[key="' + cali_key_ + '"]').parent().parent();
                        var dc_table_column = krow.find("._" + column);

                        dc_table_column.html(actual_val);
                    }
                }

                if (cali_key_ > end) {
                    return true;
                }
            }
        }
    };

    setInterval(interval_handle_buckets_, 100);


    return {
        //  call this everytime there's an input change or a render.
        handle_etc_buckets: handle_etc_buckets_
    }
}();