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


    var handle_etc_buckets_ = function() {

        var dim_to_idx_ = make_column_index_( ST.layout_used.table );
        console.dir( dim_to_idx_ );

        for( var x=0; x < ST.cali_obj_by_key.length; x++ ) {

            var cobj = ST.cali_obj_by_key[x];

            for( var att in cobj ) {

                if( cobj[att] === ST.CONSTS.ETC_BUCKET ) {

                    var actual_val = ST.orig_obj_by_key[ x ][ att ];
                    console.log( "key: " + x + "  att: " + att + "   actual: " + actual_val);
                }
            }
        }
    };


    return {
        handle_etc_buckets: handle_etc_buckets_
    }
}();