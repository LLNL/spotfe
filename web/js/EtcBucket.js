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
        console.dir(dim_to_idx_);

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
                        console.log("key: " + cali_key_ + "  att: " + att + "   actual: " + actual_val);

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