// This works on all devices/browsers, and uses IndexedDBShim as a final fallback
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

var DB = {};

DB.cacheStore = "cacheStore0";

DB.init = function( callback ) {

    DB.open = indexedDB.open(DB.cacheStore);

// Create the schema
    DB.open.onupgradeneeded = function () {

        DB.db = DB.open.result;
        DB.store = DB.db.createObjectStore(DB.cacheStore, {keyPath: "id"});
    };

    DB.open.onsuccess = function () {

        DB.db = DB.open.result;
        DB.tx = DB.db.transaction(DB.cacheStore, "readwrite");
        callback();
    };
};

DB.save = function( id, obj ) {

    DB.tx = DB.db.transaction(DB.cacheStore, "readwrite");

    var store = DB.tx.objectStore(DB.cacheStore);
    store.put({id: id, value: obj});
};

DB.load = function( id, callback ) {

    DB.tx = DB.db.transaction(DB.cacheStore, "readwrite");
    var store = DB.tx.objectStore(DB.cacheStore);

    var getObj = store.get( id );

    getObj.onsuccess = function() {

        console.dir( this.result );

        if( callback ) {

            var passIn = this.result ? this.result.value : false;
            callback( passIn );
        }
    };
};

DB.summaryKey = function() {
    var path = ST.Utility.get_param('sf');
    return 'summaryStore' + path;
};

DB.saveSummary = function( summary ) {

    var key = DB.summaryKey();
    DB.save( key, summary );
};

DB.getSummary = function( callback ) {

    var key = DB.summaryKey();
    DB.load( key, callback );
};

var onceGetSummary = function() {

    if( !window.onceGetSum ) {

        window.onceGetSum = 1;
        //  ideally this should be guaranteed to happen before the getData call.
        DB.getSummary(function (cacheSum) {

            window.cacheSum = cacheSum;
        });
    }
};

