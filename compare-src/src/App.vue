<template lang="pug">
#compare-window(:style="{display:'flex', flexDirection:'column'}")
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
                    ) {{ path.slice(path.lastIndexOf('/') + 1 ) }}
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
        flame-graph(
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
      return metrics[0]
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
            this.yAxis = getInitialYValue(this.runs)

        },
    },
    computed: {
        runs(){return this.filenames && window.runs ? window.runs.filter(run => this.filenames.includes(run.meta.datapath.value)): [] },
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
            return childrenPaths(this.selectedParent, this.funcPathKeys)
        },
        groupByList(){
            return [''].concat(this.xAxisList)
        },
        yAxisList(){
            const firstRun = this.runs[0] || {data:{}}
            const metrics = Object.keys(Object.values(firstRun.data)[0] || {}) 
            return metrics
        },
        selectedRun(){
            return this.hoverX ? this.groupedAndAggregated[this.hoverX.groupName][this.hoverX.runIndex] : null
        },
        groupedAndAggregated(){
            let peeledMetricData = _.map(this.runs, run => {
                const meta = _.fromPairs(_.map(run.meta, (meta, metaName) => [metaName, meta.value]))
                const data = _.fromPairs(_.map(run.data, (metrics, funcPath) => [funcPath, parseFloat(metrics[this.yAxis])] ))
                return {meta, data}
            }) 
            const orderedData = _.orderBy(peeledMetricData, item => {
                const metaval = item.meta[this.xAxis]
                return parseFloat(metaval) || metaval
            })
            
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

                runList.forEach(run => {
                    _.forEach(run.meta, (val, key) => {
                    aggregatedRun.meta[key].push(val)
                    })
                    _.forEach(run.data, (val, key) => {
                    aggregatedRun.data[key].push(val)
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
                        aggregatedRun.data[dataName] = dataList.reduce((a, b) => a + b, 0)
                        break;
                    case 'avg':
                        aggregatedRun.data[dataName] = (dataList.reduce((a, b) => a + b, 0))/dataList.length
                        break;
                    case 'max':
                        aggregatedRun.data[dataName] = _.max(dataList)
                        break;
                    case 'min':
                        aggregatedRun.data[dataName] = _.min(dataList)
                        break;
                    }
                })

                // mark how many runs were consolidated
                aggregatedRun.meta['--num records--'] = runList.length
                return aggregatedRun
                })
                return [groupByName, aggregatedValues]
                
            }))
            return aggregated
        },
    },  // end computed

    methods:{
        yAxisSelected(selectedYAxis){
            this.yAxis = selectedYAxis
            if(this.yAxisListener) this.yAxisListener(selectedYAxis)
        },
        changePath(path){
        this.selectedParent = path
        },
        toggleScaleType(){
        this.selectedScaleType = this.selectedScaleType == 'linear' ? 'log' : 'linear'
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