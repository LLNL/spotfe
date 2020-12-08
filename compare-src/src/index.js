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
                const url = 'http://localhost:8888/notebooks/' + filepath.slice(0, -4) + "ipynb"
                window.open(url)
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
                const url = 'http://localhost:8888/notebooks/combo.ipynb'
                window.open(url)
            }
        } else {
            // for lorenz
            const url = await lorenz(host, `${command} ${basepath} '${JSON.stringify(subpaths)}'`)
            return url
        }
    }

    async getData(host, command, dataSetKey){

        // Get Cached Data from local storage 
        const cachedData = await localforage.getItem(dataSetKey) || {Runs: {}, RunDataMeta: {}, RunGlobalMeta: {}, RunSetMeta: {}}

        const cachedRunCtimes = cachedData.runCtimes || {}

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
                newData = {Runs: {}, RunDataMeta: {}, RunGlobalMeta: {}, RunSetMeta: {}}
            }
        }

        console.dir( newData );

        // Merge new data with cached
        cachedData.Runs = Object.assign(cachedData.Runs, newData.Runs)
        cachedData.RunDataMeta = Object.assign(cachedData.RunDataMeta, newData.RunDataMeta)
        cachedData.RunGlobalMeta = Object.assign(cachedData.RunGlobalMeta, newData.RunGlobalMeta)
        cachedData.RunSetMeta = Object.assign(cachedData.RunSetMeta, newData.RunSetMeta)
        cachedData.runCtimes = newData.runCtimes

        // delete runs from cache that were deleted on backend
        const deletedRuns = newData.deletedRuns || []
        deletedRuns.forEach(deletedRun => delete cachedData.Runs[deletedRun])

        // cache newest version of data
        await localforage.setItem(dataSetKey, cachedData)

        // add in datsetkey and datakey to globals
        _.forEach(cachedData.Runs, (run, filename) => {
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

        for( const [globalName, globalValue] of Object.entries(cachedData.RunGlobalMeta)){
            const globType = globalValue.type
            const show = visibleCharts.includes(globalName)
            summary.layout.charts.push( 
                { 'dimension' : globalName
                , 'title': globalName
                , 'type': globType
                , 'viz': ['int', 'double', 'timeval', 'date', 'long'].includes(globType) ? 'BarChart' : 'PieChart'
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
        console.log("yAxisName: " + yAxisName);
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
