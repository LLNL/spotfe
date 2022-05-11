import Vue from 'vue'
import App from './App.vue'
import "babel-polyfill"
import localforage from 'localforage'
import _ from 'lodash'

const defaultVisibleCharts = ['walltime', 'user', 'uid', 'launchdate', 'executable', 'hostname', 'clustername', 'systime', 'cputime', 'fom' ]
const isContainer = window.ENV?.machine == 'container'
const useJsonp = window.ENV?.use_JSONP_for_lorenz_calls

async function getMain0( host, dataSetKey ) {

    var baseUrl = location.protocol + '//' + location.host + location.pathname;

    var prefix = host.startsWith('rz') ? 'rz': '';
    //var url = "https://rzlc.llnl.gov/lorenz_base/dev/pascal/mylc/mylc/cat.cgi";
    prefix = 'rz';

    var url = baseUrl + "/scripts/cat.cgi?" +
        "dataSetKey=" + dataSetKey + '/cacheToFE.json';
    //var url = "https://" + prefix + "lc.llnl.gov/lorenz_base/dev/pascal/mylc/mylc/cat.cgi";

    console.log('asking for: ' + url);

    const $ = await import('jquery')

    return new Promise((resolve, reject) => {
        $.ajax({
            url:  url
        }).then ( value  => { resolve( value ) }
            , error => { reject(error) }
        )
    })
}


async function lorenz(host, cmd){
    const baseurl = `https://${host.startsWith('rz') ? 'rz': ''}lc.llnl.gov/lorenz/lora/lora.cgi`
    if(process.env.NODE_ENV === 'development' || useJsonp){
        const $ = await import('jquery')
        return new Promise((resolve, reject) => {
            $.ajax({
                dataType:'jsonp',
                url:     baseurl + '/jsonp',
                //url: baseurl + '/command',
                //type: "POST",
                data:{
                    'via':'post',
                    'route':'/command/' + host,
                    'command':cmd,
                    }
            }).then ( function(value)  {
                resolve( value );
                }, function(error) {
                    console.dir('error 909', error);
                    ReusableView.alert('Error', error.responseText);
                reject(error);
            }
            )
        })
    } 
    else{
        const formData = new FormData()
        formData.append('command', cmd)

        return fetch( baseurl + '/command/' + host
                    , { method: 'POST' , body: formData }
                    ).then(response => response.json())
                     .then(value => value)
    }
}

export class Graph{
    constructor(selector){
        this.app = new Vue({
            el: selector,
            render: h => h('App'),
            components:{App},
        }).$children[0] 
    }

    async openJupyter(filepath, host, command){
        // args:   command: should be something like:  '/usr/gapps/spot/dev/spot.py jupyter'
        //        filepath:  absolute path to califile
        if(isContainer){
            // for container
            let response = await fetch("spotJupyter", { 
                method: "post", 
                headers: {
                    'content-type': 'application/json'
                },
                body:  JSON.stringify({filepath})
            });

            if(response.ok) {
                let ipynbjson = await response.json()
                let server = ""
                if (ipynbjson.hasOwnProperty("server")) {
                    server = ipynbjson["server"].trim()
                }
                if (server.length == 0) {
                    server = window.location.protocol + '//' + window.location.hostname
                }
                let urlpath = ipynbjson["path"]
                let auth = ""
                if (ipynbjson.hasOwnProperty("token")) {
                    auth = "?token=" + ipynbjson["token"]
                }
                let port = ""
                if (ipynbjson.hasOwnProperty("port")) {
                    port = ":" + ipynbjson["port"]
                }
                if (ipynbjson.hasOwnProperty("base")) {
                    urlpath = "/" + ipynbjson["base"] + urlpath
                }
                return server + port + urlpath + auth
            }
        } else {
            // for lorenz
            const url = await lorenz(host, `${command} ${filepath}`)
            if( url.error ) {
                ReusableView.modal({body: url.error});
            }

            return url.output.command_out
        }
    }

    async openMultiJupyter(basepath, subpaths, host, command, selected_notebook){
        // args:   command: should be something like:  '/usr/gapps/spot/dev/spot.py jupyter'
        //         filepath:  absolute path to califile
        if(isContainer){
            // for container
            let response = await fetch("spotMultiJupyter", { 
                method: "post", 
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({basepath, subpaths, selected_notebook})
            })
            if(response.ok) {
                let ipynbjson = await response.json()
                let server = ""
                if (ipynbjson.hasOwnProperty("server")) {
                    server = ipynbjson["server"].trim()
                }
                if (server.length == 0) {
                    server = window.location.protocol + '//' + window.location.hostname
                }
                let urlpath = ipynbjson["path"]
                let auth = ""
                if (ipynbjson.hasOwnProperty("token")) {
                    auth = "?token=" + ipynbjson["token"]
                }
                let port = ""
                if (ipynbjson.hasOwnProperty("port")) {
                    port = ":" + ipynbjson["port"]
                }
                if (ipynbjson.hasOwnProperty("base")) {
                    urlpath = "/" + ipynbjson["base"] + urlpath
                }
                return server + port + urlpath + auth
            }
        } else {
            // for lorenz
            const url = await lorenz(host, `${command} ${basepath} '${JSON.stringify(subpaths)}'`);

            console.log('urL:');
            console.dir(url);

            if( url.error ) {
                ReusableView.modal({body: url.error});
            }

            return url.output.command_out
        }
    }


    async getData(host, command, dataSetKey) {

        //var rzz = await lorenz(host, "cat /g/g0/pascal/zdeb/full/cacheToFE.json");
        //console.dir(rzz);
        //  https://rzlc.llnl.gov/lorenz/lora/lora.cgi/jsonp
        console.log('host=' + host + '   command=' + command);

        var arr = command.split(' ');
        var spotPy = arr[0];

        var comm = spotPy + ` getCacheFileDate ${dataSetKey}`;
        var res = '{"mtime": 3000900800}';

        if (!isContainer) {
            var res0 = await lorenz(host, comm)
            res = res0.output.command_out
        }

        res = ST.Utility.fix_LC_return_err( res );

        var cacheResult = JSON.parse(res);
        var mtime = cacheResult.mtime;

        var cachedDataGet;
        var bust_cache = ST.Utility.get_param("cache") === "0";


        if (bust_cache) {

            cachedDataGet = {
                Runs: {},
                RunDataMeta: {},
                RunGlobalMeta: {},
                RunSetMeta: {}
            }

            console.log('Got a new cachedData...');

        } else {

            // Get Cached Data from local storage
            cachedDataGet = await localforage.getItem(dataSetKey) || {
                Runs: {},
                RunDataMeta: {},
                RunGlobalMeta: {},
                RunSetMeta: {}
            }

            console.log('cachedDataGet:');
            console.dir(cachedDataGet);

            var keys0 = Object.keys(cachedDataGet.Runs);

            if( keys0 && keys0.length === 0 ) {

                console.log('localforage came up with no runs, so bust cache.');
                bust_cache = 1;
            }
        }

        return this.afterCachedDataGet( cachedDataGet, bust_cache, mtime, dataSetKey, host, command );
    };


    async afterCachedDataGet( cachedDataGet, bust_cache, mtime, dataSetKey, host, command ) {

        const cachedData = cachedDataGet;
        const cachedRunCtimes = cachedData.runCtimes || {};

        //  Round to prevent string from being too long.
        for (var x in cachedRunCtimes) {
            cachedRunCtimes[x] = parseInt(cachedRunCtimes[x]);

            if (bust_cache) {
                //  this should be low enough to prevent caching
                cachedRunCtimes[x] = -1;
            }
        }

        const dataRequest = {dataSetKey, cachedRunCtimes};

        // Get New  Data from backend
        let newData;

        var cacheSum = window.cacheSum;
        var cacheDate = window.cacheSum ? window.cacheSum.date : 0;

        console.log('mtime: ' + mtime + '   cacheDate=' + cacheDate);

        var cacheFileFound = parseInt(mtime) !== 2000400500;

        //  if the file modification time for the server side cache is newer then use it.
        if (mtime > cacheDate) {
            console.log('mtime is newer so need to bust cache.');
            bust_cache = true;
        }

        if (cacheSum && cacheSum.summary && !bust_cache && !isContainer) {

            newData = cacheSum.summary;
            console.log('was able to find cache.');

        } else {

            console.log('could not find cache.');

            if (isContainer) {

                // first see if there is a data endpoint:  used in docker container
                let response = await fetch("getdata", {
                    method: "post",
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(dataRequest)
                });

                var txt = await response.text();

                for (var x = 0; x < 15; x++) {
                    txt = txt.replace(',,', ',');
                }

                newData = JSON.parse(txt);
                //newData = await response.json()

            } else {
                //else we do a Lorenz call at LLNL
                try {

                    var lor_response;

                    if (cacheFileFound) {

                        //  Use the super fast cat.cgi to output things really fast.
                        lor_response = await getMain0(host, dataSetKey);
                        newData = JSON.parse(lor_response);
                    } else {

                        console.log('cache file not found, making lorenz call.')
                        lor_response = await lorenz(host, `${command} ${dataSetKey} '` + JSON.stringify(cachedRunCtimes) + "'");

                        console.dir( lor_response );

                        if( lor_response.status === "ERROR" ) {
                            ST.Utility.error( lor_response.error );
                        }

                        if( lor_response.output.command_out.indexOf('ERROR') > -1 ) {

                            ST.Utility.error(lor_response.output.command_out);
                            return false;
                        }

                        if (lor_response.error !== "") {
                            ST.Utility.error(lor_response.error);
                            return false;
                        }

                        newData = lor_response.output.command_out;
                    }

                    if (newData.foundReport) {
                        console.log(newData.foundReport);
                    }


                    var pd = newData;

                    if( typeof newData === "string" ) {
                        newData = ST.Utility.fix_LC_return_err( newData );
                        pd = JSON.parse(newData);
                    }

                    if( pd.dictionary ) {
                        //  this is for the walltime page.
                        var dstr = JSON.stringify( pd.dictionary );
                        var sf = ST.Utility.get_param("sf");
                        var key = "page_dictionary_" + sf;

                        console.log('page key: ' + key);

                        localStorage.setItem(key, dstr);
                    }

                    DB.saveSummary(newData);
                } catch (e) {

                    console.log('Exception: ');
                    console.dir(e);
                    newData = {Runs: {}, RunDataMeta: {}, RunGlobalMeta: {}, RunSetMeta: {}}
                }
            }
        }

        if( typeof newData === 'string') {

            newData = ST.Utility.fix_LC_return_err( newData );
            newData = JSON.parse(newData);
        }

        //  newData is too big to always print out.
        console.log('991B newData:  ');
        console.dir( newData.Runs );

        //newData = ST.RunDictionaryTranslator.translate( newData );
        ST.RunDictionaryTranslator.set(newData.dictionary);

        var runs0 = newData.Runs;

        //  this will make jupyter button disappear.
        if (newData.dictionary) {
            ST.CallSpot.is_ale3d = true;
        }


        console.log('runs before cacheDa84:');
        console.dir(runs0);

        for(var x in runs0 ) {

            var el = runs0[x].Data;

            var da=el;

            for( var root in da) {

                var obj=da[root];

                for( var z in obj) {
                    obj[z] = +obj[z];
                }
            }
        }

        console.dir(runs0);

        // Merge new data with cached
        cachedData.Runs = Object.assign(cachedData.Runs, runs0);
        cachedData.RunDataMeta = Object.assign(cachedData.RunDataMeta, newData.RunDataMeta)
        cachedData.RunGlobalMeta = Object.assign(cachedData.RunGlobalMeta, newData.RunGlobalMeta)
        cachedData.RunSetMeta = Object.assign(cachedData.RunSetMeta, newData.RunSetMeta)
        cachedData.runCtimes = newData.runCtimes

        // delete runs from cache that were deleted on backend
        const deletedRuns = newData.deletedRuns || []
        deletedRuns.forEach(deletedRun => delete cachedData.Runs[deletedRun])

        window.cachedData = cachedData;

        // add in datsetkey and datakey to globals
        _.forEach(cachedData.Runs, (run, filename) => {

            run.Globals = run.Globals || {};
            run.Globals.dataSetKey = dataSetKey
            run.Globals.datapath = filename
        });
        cachedData.RunGlobalMeta.dataSetKey = {type:'string'}
        cachedData.RunGlobalMeta.datapath = {type:'string'}


        const baseMetrics = {}
        for(let metric in cachedData.RunDataMeta){
            baseMetrics[metric] = 0.0
        }

        const funcPaths = new Set()
        const metricNames = new Set()

        let runs = []

        const filenames = Object.keys(cachedData.Runs)

        filenames.map(filename => {
            const fileData = cachedData.Runs[filename].Data
            const run = {'data': fileData}

            // pad the data
            for(const [funcPath, metrics] of Object.entries(fileData)){
                funcPaths.add(funcPath)
                for (let [metricName, val] of Object.entries(metrics)){
                    metricNames.add(metricName)
                }
            }
            run.meta = {}
            const globals = cachedData.Runs[filename].Globals
            for (const [metricName, value] of Object.entries(globals)){
                const metricMeta = cachedData.RunGlobalMeta[metricName]
                const type = metricMeta ? metricMeta.type : "string"
                
                run.meta[metricName] = {value, type}
            }
            runs.push(run)
        })

        runs.forEach(run => {
            funcPaths.forEach(funcPath => {
                run.data['--root path--/' + funcPath] = {...baseMetrics, ...run.data[funcPath]}
                delete run.data[funcPath]
            })
            run.data['--root path--'] = baseMetrics
        }) 

        // set data values
        this.dataSetKey = dataSetKey;


        var lr0 = $.extend({}, cachedData );
        //var lr = lr0.Runs;
        var arr = {};

        for( var run_id_x in cachedData.Runs ) {

            var a_run = $.extend({}, cachedData.Runs[run_id_x]);
            a_run.Data = {"blank":1};

            arr[ run_id_x ] = a_run;
        }

        lr0.Runs = arr;
        //  this is just the Meta data.  the actual "Data" is stored in cachedData
        //  and will be sent to the durations page from CallSpot.js
//        await localforage.setItem(dataSetKey, {'Runs': arr});
        await localforage.setItem(dataSetKey, lr0);

        //  The first run's meta object is used to determine what the drop down select options should be.
        window.runs = ST.CompositeLayoutModel.augment_first_run_to_include_composite_charts(runs);

        this.compare(filenames)

        // 4. return summary
        const summary = {data: {}, layout: {charts: [], table: []}}
        const visibleCharts = await localforage.getItem("show:" + dataSetKey) || defaultVisibleCharts

        for (const [filename, fileContents] of Object.entries(cachedData.Runs)){
            summary.data[filename] = { ...fileContents.Globals, filepath: dataSetKey + '/' + filename}
        }

        var barCharts = ['unsigned int', 'int', 'double', 'timeval', 'date', 'long'];

        for( const [globalName, globalValue] of Object.entries(cachedData.RunGlobalMeta)){
            const globType = globalValue.type
            const show = visibleCharts.includes(globalName)
            summary.layout.charts.push( 
                { 'dimension' : globalName
                , 'title': globalName
                , 'type': globType
                , 'viz': barCharts.includes(globType) ? 'BarChart' : 'PieChart'
                , 'show': show
                }
            )
            summary.layout.table.push(
                { 'dimension' : globalName
                , 'label': globalName
                , 'type': globType
                , 'show': show
                }
            )
        }

        summary.layout.scatterplots = await localforage.getItem('scatterplots:' + this.dataSetKey) || []

        return summary
    }


    async addScatterplot(options){
        const key = "scatterplots:" + this.dataSetKey
        const scatterplots = await localforage.getItem(key) || []
        scatterplots.push(options)
        localforage.setItem(key, scatterplots)
    }

    async setChartVisible(globalName, visible=true){
        const showGlobals = new Set(await localforage.getItem("show:" + this.dataSetKey) || defaultVisibleCharts)
        if(visible){
            showGlobals.add(globalName)
        } else
            showGlobals.delete(globalName)
        localforage.setItem("show:" + this.dataSetKey, Array.from(showGlobals))
    }

    compare(filenames){
        filenames = filenames || this.last_filenames;
        this.app.filenames = filenames
        this.last_filenames = filenames;
    }

    //------------------ controls functions

    addXAxisChangeListener(listener){
        this.app.xAxisListener = listener
    }

    addYAxisChangeListener(listener){
        this.app.yAxisListener = listener
    }

    addAggregateTypeChangeListener(listener){
        this.app.aggregateListener = listener
    }

    addGroupByChangeListener(listener){
        this.app.groupByListener = listener
    }

    setXaxis(xAxisName){
        this.app.xAxis = xAxisName
    }

    setYAxis(yAxisName){
        console.log('setting yAxis -----> ' + yAxisName);
        this.app.yAxis = yAxisName
    }

    setAggregateType(aggregateType){
        this.app.selectedAggregateBy = aggregateType
    }

    setGroupBy(groupBy){
        this.app.selectedGroupBy = groupBy
    }
}

window.Graph = Graph
