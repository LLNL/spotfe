// This works on all devices/browsers, and uses IndexedDBShim as a final fallback
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
var DB = {};

// Open (or create) the database
var open = indexedDB.open("MyDatabase", 1);

DB.cacheStore = "cacheStore";
DB.open = indexedDB.open( DB.cacheStore );

// Create the schema
open.onupgradeneeded = function() {
    var db = open.result;
    var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
    var index = store.createIndex("NameIndex", ["name.last", "name.first"]);

    DB.store = db.createObjectStore( DB.cacheStore, {keyPath: "id"});
};

open.onsuccess = function() {

    DB.db = DB.open.result;
    DB.tx = DB.db.transaction(DB.cacheStore, "readwrite");
};

DB.save = function( id, obj ) {

    var store = DB.tx.objectStore(DB.cacheStore);
    store.put({id: id, value: obj});
};

DB.load = function( id, callback ) {

    var store = DB.tx.objectStore(DB.cacheStore);
    var getObj = store.get( id );

    getObj.onsuccess = function() {

        console.dir( this );
        callback();
    };
};

var other_open_success = function() {
    // Start a new transaction
    var db = open.result;
    var tx = db.transaction("MyObjectStore", "readwrite");
    var store = tx.objectStore("MyObjectStore");
    var index = store.index("NameIndex");

    // Add some data
    store.put({id: 12345, name: {first: "John", last: "Doe"}, age: 42});
    store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});

    // Query the data
    var getJohn = store.get(12345);
    var getBob = index.get(["Smith", "Bob"]);

    getJohn.onsuccess = function() {
        console.log(getJohn.result.name.first);  // => "John"
    };

    getBob.onsuccess = function() {
        console.log(getBob.result.name.first);   // => "Bob"
    };

    // Close the db when the transaction is done
    tx.oncomplete = function() {
        db.close();
    };
}