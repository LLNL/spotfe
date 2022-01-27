<template lang="pug">
#compare-window(:style="{display:'flex', flexDirection:'column'}")
    .updateCompareView(@click="rerenderForSelectDropdownUpdate")
    .sticky(:style="{position: 'sticky', top: 0, zIndex: 1}")
        .topbar(
            :style=`{
                backgroundColor: 'lightgray',
                padding:'5px',
                height:'40px',
                display:'flex',
                alignItems:'center',
                }` 
            )
            .selects(:style="{flex:1, display:'flex', alignItems:'center', flexWrap:'wrap'}")
                label(for="xAxis-select" style="margin:5px") X-Axis: 
                select#xAxis-select(v-model="xAxis")
                    option(v-for="option in xAxisList") {{ option }}

                label(for="aggregate-select" style="margin:5px") X-Axis Aggregate:
                select#aggregate-select(:style="{marginRight: '10px'}" v-model="selectedAggregateBy")
                    option(v-for="option in ['', 'sum','avg', 'min', 'max' ]") {{ option }}

                label(for="yAxis-select" style="margin:5px") Y-Axis: 
                select#yAxis-select(:value="yAxis" @input='yAxisSelected($event.target.value)')
                    option(v-for="option in yAxisList") {{ option }}
                    
                label(for="groupBy-select" style="margin:5px") Group By:
                select#groupBy-select(v-model="selectedGroupBy")
                    option(v-for="option in groupByList") {{ option }}
            
            
            .scale-type-button(
                :style=`{
                    borderRadius:'5px',
                    padding:'7px',
                    backgroundColor:'#666',
                    color:'white',
                    cursor:'pointer',
                    userSelect:'none',
                    }`
                @click="toggleScaleType"
                ) Set {{ selectedScaleType == 'linear' ? 'Log' : 'Linear' }}
        .legend(
            :style=`{
                display:'flex',
                justifyContent:'center',
                marginTop:'5px',
                }`
            ) 
            .legend-border(
                :style=`{
                    display:'flex',
                    flexWrap:'wrap',
                    maxWidth:'100%',
                    alignItems:'center',
                    border:'1px solid black',
                    borderRadius:'15px',
                    backgroundColor:'#eee',
                    }`
            ) 
                .legend-item(v-for="path in displayedChildrenPaths"
                    @click='togglePathVisible(path)'
                    :style=`{
                        display:'flex',
                        padding:'5px',
                        cursor:'pointer',
                        }`
                    ) 
                    .circle(
                    :style=`{
                        width:'15px',
                        height:'15px',
                        backgroundColor: disabledFuncPaths.includes(path) ? 'lightgrey': colorHash(path), borderRadius:'50px'
                        }`
                    ) 
                    .name(
                    :style=`{
                        marginLeft:'5px',
                        color: disabledFuncPaths.includes(path) ? 'lightgrey': 'black'
                        }`
                    ) {{ legendItem(path) }}
    .comparison-charts(style="padding:10px")
        view-chart(
            v-for="(runs, groupName) in groupedAndAggregated" 
            :groupName="groupName" 
            :hoverX="hoverX"
            :runs="runs" 
            :displayedChildrenPaths="difference(displayedChildrenPaths, disabledFuncPaths)"
            :selectedXAxisMetric="xAxis"
            :selectedYAxisMeta="yAxis"
            :selectedGroupBy="selectedGroupBy"
            :selectedScaleType='selectedScaleType'
            @set-node="changePath"
            @chart-hover-position-changed="setChartHoverPosition"
            @toggle-hover-position-locked="toggleHoverPositionLock"
            )
    .run-view(
        v-if="selectedRun" 
        :style=`{
            width:'100%',
            height:'270px',
            display:'flex',
            position:'sticky',
            bottom: 0,
            backgroundColor:'white',
            padding:'10px'
            }`
        )
        FlameGraph(
            :runData='selectedRun.data' 
            :selectedNode='selectedParent' 
            :handleClick='changePath'
            )
        .global-meta(
            :style=`{
            flex: 1,
            display:'flex',
            flexDirection:'column',
            minWidth:'300px',
            maxWidth:'500px',
            marginLeft:'20px',
            overflow:'scroll',
            }`
            )
            .metarow(
                v-for='(metaVal, metaName) in selectedRun.meta'
                :style=`{
                    display:'flex',
                    }` 
                )
                .name(:style="{color:'blue', fontWeight:'bold'}") {{ metaName }} 
                .val(:style="{whiteSpace:'nowrap', overflowWrap:'break-word'}") : {{ metaVal }}
</template>

<script lang="ts">
import Vue from "vue";
import Chart from './Chart.vue'
import FlameGraph from './Flamegraph.vue'
import _ from "lodash"
import {childrenPaths, colorHash} from './functions.js'

function getInitialYValue(runs){

      const firstRun = runs[0] || {data:{}}
      const metrics = Object.keys(Object.values(firstRun.data)[0] || {})

      var defMetric = metrics[0]

    var yaxis = ST.Utility.get_param("yaxis");

      if( yaxis ) {

          yaxis = decodeURIComponent(yaxis);
          return yaxis;
      }

      if( defMetric === "spot.channel" ) {
          return metrics[1]
      }
      return defMetric
}

export default Vue.extend({
    data() { return {
        xAxis: 'launchdate',
        xAxisListener: null,
        yAxis: '',
        yAxisListener: null,
        selectedGroupBy: '',
        groupByListener: null,
        selectedAggregateBy: '',
        filenames:[],
        aggregateListener: null,
        rootFuncPath: '',
        selectedParent: "--root path--",
        selectedScaleType: "linear",
        hoverX: null,
        disabledFuncPaths: [],
        hoverLock: false,
    }},
    props: ['path'],
    mounted() {
    },
    watch:{
        xAxis(value){
            if(this.xAxisListener) this.xAxisListener(value)
        },
        selectedGroupBy(value){
            this.hoverX = null;
            if(this.groupByListener) this.groupByListener(value)
        },
        selectedAggregateBy(value){
            if(this.aggregateListener) this.aggregateListener(value)
        },
        filenames(filenames){
            if(filenames.length){
                const allFuncPaths = _.keys(this.runs[0].data)
                // if no rootFuncPath set or dataset doesn't include currently set rootFuncPath set it
                if(this.rootFuncPath == '' || !allFuncPaths.includes(this.rootFuncPath)){
                    this.rootFuncPath = _.min(allFuncPaths)
                }

            }
            var yax = getInitialYValue(this.runs)
            this.yAxis = yax; //this.lookupOriginalYAxis( yax );
        },
    },
    computed: {
        runs(){

            if( this && this.filenames && window.runs ) {

                var fnames = this.filenames;
                //return window.runs.filter(run => this.filenames.includes(run.meta.datapath.value));
                var filtered_runs = window.runs.filter( function(run) {
                    return fnames.includes(run.meta.datapath.value);
                } );

                //var localGroupedAndAggregated = this.groupedAndAggregated;

/*                if( !window.doFullRuns ) {

                    filtered_runs = ST.RunsMeter.meter( filtered_runs );

                    setTimeout( function() {

                        window.doFullRuns = 1;
                        this.runs.push({"filler": 2});
                        this.runs.pop();

                        $('.updateCompareView').trigger('click');

                        console.log('Trigger get full runs.');

                    }, 4000 );
                } else {
                    console.log('Got Full.');
                }*/

                return filtered_runs;
            }

            return [];
        },
        xAxisList(){
            if (this.filenames.length){

                const firstRun = this.runs[0] || {meta:{}}
                const metaKeys = Object.keys(firstRun.meta)

                return metaKeys
            } else {
                return []
            }
        },
        funcPathKeys(){
            return this.runs[0] ? Object.keys(this.runs[0].data) : []
        },
        displayedChildrenPaths(){
            var chp = childrenPaths(this.selectedParent, this.funcPathKeys)
            console.dir(chp);
            return chp;
        },
        groupByList(){
            return [''].concat(this.xAxisList)
        },
        yAxisList(){

            //  These are stubs meant to be replaced with the aliases we get back from the BE.
             var aliasReplacements = {
                "avg#inclusive#sum#time.duration" : "Avg time/rank",
                 "sum#inclusive#sum#time.duration" : "Total time",
                "min#inclusive#sum#time.duration" : "Min time/rank",
                 "max#inclusive#sum#time.duration" : "Max time/rank"
            };

            if( window.cachedData ) {

                var rdm = window.cachedData.RunDataMeta;

                for( var encoded in rdm ) {

                    if( rdm[encoded].alias ) {
                        var alias = rdm[encoded].alias;
                        aliasReplacements[encoded] = alias;
                    }
                }
            }

            window.aliasReplacements = aliasReplacements;

            const firstRun = this.runs[0] || {data:{}}
            var metrics = Object.keys(Object.values(firstRun.data)[0] || {})

            console.dir(firstRun);

            for( var y=0; y < metrics.length; y++ ) {

                var loopMetric = metrics[y];

                if( loopMetric === "spot.channel" ) {
                    metrics.splice(y,1);
                }

                loopMetric = metrics[y];

                for( var candidate in aliasReplacements ) {

                    if( loopMetric === candidate ) {

                        var replacement = aliasReplacements[candidate];
                        metrics[y] = replacement;
                    }
                }
            }

            return metrics;
        },
        selectedRun(){
            return this.hoverX ? this.groupedAndAggregated[this.hoverX.groupName][this.hoverX.runIndex] : null;
        },
        groupedAndAggregated(){

            var yAxisLookup = this.lookupOriginalYAxis( this.yAxis );

            var countLoops = 0;
            var peeledMetricData;

            var path = ST.Utility.get_param('sf');
            var key = 'peeledMetricData' + path;
            console.log('Started peeling, Using peel key: ' + key);

            var localPeeled = localStorage.getItem(key);

            if( localPeeled && false ) {
                peeledMetricData = localPeeled;
            } else {
                peeledMetricData = _.map(this.runs, run => {

                    var metaPair = _.map(run.meta, (meta, metaName) => [metaName, meta.value]);
                    const meta = _.fromPairs(metaPair);

                    var mapPair = _.map(run.data, function (metrics, funcPath) {

                        var metricsFloat = parseFloat(metrics[yAxisLookup]);
                        var pair = [funcPath, {value: metricsFloat}];
                        countLoops++;

                        return pair;
                    });

                    const data = _.fromPairs(mapPair)

                    return {meta, data}
                });

                localStorage.setItem(key, peeledMetricData);
            }

            console.log( 'countLoops = ' + countLoops );
            console.dir( peeledMetricData );

            const orderedData = _.orderBy(peeledMetricData, item => {
                const metaval = item.meta[this.xAxis]
                return parseFloat(metaval) || metaval
            });

            const grouped = this.selectedGroupBy ? _.groupBy(orderedData, a => a.meta[this.selectedGroupBy]) : {"all": orderedData}
            if(!this.selectedAggregateBy) return grouped

            const aggregated = _.fromPairs(_.map(grouped, (runList, groupByName) => {
                // consolidate the run list into a single run

                //   first create a run where each value of data and meta is the list of values of all the runs of the runList
                const aggregateGroups = _.groupBy(runList, a => a.meta[this.xAxis])
                const aggregatedValues = _.map(aggregateGroups, (runList, aggregateBykey) => {
                    const aggregatedRun = {
                        data: _.fromPairs(_.map(runList[0].data, (val, key) => [key, []] )), 
                        meta: _.fromPairs(_.map(runList[0].meta, (val, key) => [key, []] )),
                    }


                    // create object of empty arrays

                    runList.forEach(run => {
                        _.forEach(run.meta, (val, key) => {
                            if( aggregatedRun.meta[key] ) {
                                aggregatedRun.meta[key].push(val);
                            }
                        })
                        _.forEach(run.data, (val, key) => {

                            if( aggregatedRun.data[key] ) {
                                aggregatedRun.data[key].push(val.value);
                            }

                            // console.log('list', groupByName, key, val.value, aggregatedRun.data[key])
                        })
                    })

                    // if the meta values are all the same that value is preserved else just mark it '--' to denote assorted values
                    _.forEach(aggregatedRun.meta, (metaList, metaName) => {
                        const uniqVals = _.uniq(metaList)
                        aggregatedRun.meta[metaName] =  uniqVals.length == 1 ? uniqVals[0]: '--'
                    })
                    
                    // consolidate the data values into the type of aggregate
                    _.forEach(aggregatedRun.data, (dataList, dataName) => {
                        switch(this.selectedAggregateBy){
                        case 'sum':
                            aggregatedRun.data[dataName] = { value: dataList.reduce((a, b) => a + b, 0) }
                            break;
                        case 'avg':
                            aggregatedRun.data[dataName] = { value: (dataList.reduce((a, b) => a + b, 0))/dataList.length }
                            break;
                        case 'max':
                            aggregatedRun.data[dataName] = { value: _.max(dataList) }
                            break;
                        case 'min':
                            aggregatedRun.data[dataName] = { value: _.min(dataList) }
                            break;
                        }
                    })

                    // mark how many runs were consolidated
                    aggregatedRun.meta['--num records--'] = runList.length
                    return aggregatedRun
                    })
                    return [groupByName, aggregatedValues]
                    
                }))

            console.log('finished aggregated...');
            return aggregated
        },
    },  // end computed

    methods:{
        legendItem( path ) {

            var ret = path.slice(path.lastIndexOf('/') + 1;

            var layman_title = ST.RunDictionaryTranslator.lookupStr( ret );
            return layman_title;
        },
        //  Returns the original yAxis that looks like this "max#inclusive#duration.time"
        //  the data was originally sent to the FE with those as indexes.
        lookupOriginalYAxis( yAxis ) {

            var yax = yAxis;

            for( var encoded in window.aliasReplacements ) {

                var alias = window.aliasReplacements[ encoded ];
                if( alias === yAxis ) {
                    yax = encoded;
                }
            }

            return yax;
        },
        yAxisSelected(selectedYAxis){

            this.yAxis = selectedYAxis

            if(this.yAxisListener) {
                this.yAxisListener(selectedYAxis);
            }
        },
        changePath(path){
        this.selectedParent = path
        },
        rerenderForSelectDropdownUpdate() {
            this.filenames.push("test823");
        },
        toggleScaleType(){
            this.selectedScaleType = this.selectedScaleType == 'linear' ? 'log' : 'linear'
            this.filenames.push("test13241234.cali");
        },
        togglePathVisible(pathToToggle){
        this.disabledFuncPaths =  _.xor(this.disabledFuncPaths, [pathToToggle])
        },
        difference: _.difference,
        colorHash,
        setChartHoverPosition(groupName, runIndex){
        if(!this.hoverLock){
            this.hoverX = {groupName, runIndex}
        }
        },
        toggleHoverPositionLock(){
        this.hoverLock = !this.hoverLock
        },
    },
    components: {
        viewChart: Chart,
        FlameGraph
    }
})
</script>

<style lang="scss" scoped>
select{
  margin-right: 10px;
}
*{
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-size: 8pt;
  margin: 0px;
  box-sizing:border-box;
}

</style>
