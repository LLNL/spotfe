import Vue from 'vue'
import App from './App.vue'
import "babel-polyfill"
import localforage from 'localforage'
import _ from 'lodash'

const defaultVisibleCharts = ['walltime', 'user', 'uid', 'launchdate', 'executable', 'hostname', 'clustername', 'systime', 'cputime', 'fom' ]
const isContainer = window.ENV?.machine == 'container'
const useJsonp = window.ENV?.use_JSONP_for_lorenz_calls

async function lorenz(host, cmd){
    const baseurl = `https://${host.startsWith('rz') ? 'rz': ''}lc.llnl.gov/lorenz/lora/lora.cgi`
    if(process.env.NODE_ENV === 'development' || useJsonp){
        const $ = await import('jquery')
        return new Promise((resolve, reject) => {
            $.ajax({
                dataType:'jsonp',
                url:     baseurl + '/jsonp',
                data:{
                    'via':'post',
                    'route':'/command/' + host,
                    'command':cmd,
                    }
            }).then ( value  => { resolve( value.output.command_out) }
                    , error => { reject(error) }
            )
        })
    } 
    else{
        const formData = new FormData()
        formData.append('command', cmd)

        return fetch( baseurl + '/command/' + host
                    , { method: 'POST' , body: formData }
                    ).then(response => response.json())
                     .then(value => value.output.command_out)
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
            let response = await fetch("/spotJupyter", { 
                method: "post", 
                headers: {
                    'content-type': 'application/json'
                },
                body:  JSON.stringify({filepath})
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
                const urlpath = ipynbjson["path"]
                let auth = ""
                if (ipynbjson.hasOwnProperty("token")) {
                    auth = "?token=" + ipynbjson["token"]
                }
                let port = ""
                if (ipynbjson.hasOwnProperty("port")) {
                    port = ":" + ipynbjson["port"]
                }                
                return server + port + urlpath + auth
            }
        } else {
            // for lorenz
            const url = await lorenz(host, `${command} ${filepath}`)
            return url
        }
    }

    async openMultiJupyter(basepath, subpaths, host, command){
        // args:   command: should be something like:  '/usr/gapps/spot/dev/spot.py jupyter'
        //         filepath:  absolute path to califile
        if(isContainer){
            // for container
            let response = await fetch("/spotMultiJupyter", { 
                method: "post", 
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({basepath, subpaths})
            })
            if(response.ok) {
                let ipynbjson = await response.json()
                const server = window.location.protocol + '//' + window.location.hostname
                const urlpath = ipynbjson["path"]
                let auth = ""
                if (ipynbjson.hasOwnProperty("token")) {
                    auth = "?token=" + ipynbjson["token"]
                }
                let port = ""
                if (ipynbjson.hasOwnProperty("port")) {
                    port = ":" + ipynbjson["port"]
                }
                return server + port + urlpath + auth
            }
        } else {
            // for lorenz
            const url = await lorenz(host, `${command} ${basepath} '${JSON.stringify(subpaths)}'`)
            return url
        }
    }

    async getData(host, command, dataSetKey){

        var cachedDataGet;
        var bust_cache = ST.Utility.get_param("cache") === "0";

        if( bust_cache ) {

            cachedDataGet = {
                Runs: {},
                RunDataMeta: {},
                RunGlobalMeta: {},
                RunSetMeta: {}
            }

            console.log('Got a new cachedData.');

        } else {

            // Get Cached Data from local storage
            cachedDataGet = await localforage.getItem(dataSetKey) || {
                Runs: {},
                RunDataMeta: {},
                RunGlobalMeta: {},
                RunSetMeta: {}
            }
        }

        const cachedData = cachedDataGet;
        const cachedRunCtimes = cachedData.runCtimes || {}

        //  Round to prevent string from being too long.
        for( var x in cachedRunCtimes ) {
            cachedRunCtimes[x] = parseInt(cachedRunCtimes[x]);

            if( bust_cache ) {
                //  this should be low enough to prevent caching
                cachedRunCtimes[x] = -1;
            }
        }

        const dataRequest = {dataSetKey, cachedRunCtimes}

        // Get New  Data from backend
        let newData

        if(isContainer) {
            // first see if there is a data endpoint:  used in docker container
            let response = await fetch("/getdata", { 
                method: "post", 
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(dataRequest)
            })

            newData = await response.json()
            
        } else {
            //else we do a Lorenz call at LLNL
            try{
                newData = JSON.parse(await lorenz(host, `${command} ${dataSetKey} '` + JSON.stringify(cachedRunCtimes) + "'" ))

            }catch (e){
                console.log('Exception:');
                console.dir(e);
                newData = {Runs: {}, RunDataMeta: {}, RunGlobalMeta: {}, RunSetMeta: {}}
            }
        }

        console.log('newData: ');
        console.dir( newData );

        var runs0 = newData.Runs || newData.Pool;


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

        console.log("dataSetKey5=" + dataSetKey);
        // cache newest version of data
        await localforage.setItem(dataSetKey, cachedData)

        // add in datsetkey and datakey to globals
        _.forEach(cachedData.Runs, (run, filename) => {
            console.log("dataSetKey6=" + dataSetKey);
            run.Globals = run.Globals || {};
            run.Globals.dataSetKey = dataSetKey
            run.Globals.datapath = filename
        })
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
        this.dataSetKey = dataSetKey

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
