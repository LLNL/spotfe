// This works on all devices/browsers, and uses IndexedDBShim as a final fallback
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

var DB = {};

DB.cacheStore = "cacheStore4";

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

DB.save = function( id, obj, callback ) {

    DB.tx = DB.db.transaction(DB.cacheStore, "readwrite");

    const store = DB.tx.objectStore(DB.cacheStore);

    store.onsuccess = function( ret ) {
        //callback( ret );
    };
    store.error = function( err ) {
        console.dir( err );
    };

    console.log('putting');
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
    var epochDate = parseInt( Date.now() / 1000 );

    var summaryWrap = {
        'summary': summary,
        'date': epochDate
    };

    DB.save( key, summaryWrap );
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


import Vue from 'vue'
import App from './WalltimeApp.vue'
import "babel-polyfill"
import localforage from 'localforage'

// parse search parameters form URL
const params = new URLSearchParams(new URL(window.location).search)
const runSetId = params.get("runSetId")
const runId = params.get("runId")

var ST = ST || {};
ST.replaceYAxisWithValue = function( fd ) {

    for( var x in fd ) {
        fd["value"] = fd[x].yAxis;
    }
};

DB.init( function() {

DB.load( runSetId, function( runSet ) {
//localforage.getItem(runSetId)
//    .then(runSet => {
        var fileData = runSet.Runs[runId];
        console.log('runId:' + runId);
        console.log('runset:');
        console.dir(runSet);
        console.log('fileData:');
        console.dir(fileData);

        for (const [key, val] of Object.entries(fileData.Globals)){
            const type_ = runSet.RunGlobalMeta[key] ? runSet.RunGlobalMeta[key].type : "string"
            fileData.Globals[key] = {value: fileData.Globals[key], type: type_ }
        }

        const flags = {filename: runId, data: fileData.Data, meta: fileData.Globals}

        //ST.replaceYAxisWithValue( fileData );

        return new Vue({
            el: "main",
            render: h => h(App, {
                props:{
                    filename: runId, 
                    data: fileData.Data ,
                    meta: fileData.Globals
                },
            }),
        })
        
    })
});
document.title = runId
