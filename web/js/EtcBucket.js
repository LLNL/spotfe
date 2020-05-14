ST.EtcBucket = function() {

        var handle_etc_buckets_ = function() {

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