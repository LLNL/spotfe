<template lang="pug">
.chart
</template>

<script>
    import Vue from 'vue'
import _ from "lodash"
import {stack, area} from 'd3-shape'
import {scaleLinear,scaleLog} from 'd3-scale'
import {max, ticks, zip} from 'd3-array'
import {timeFormat} from 'd3-time-format'
import {colorHash} from './functions.js'


export default {

    data(){ return {
        width: '100px',
        height:'100px'
    }},


    props: [ 'groupName',
             'runs',
             'hoverX',
             'displayedChildrenPaths',
             'selectedXAxisMetric',
             'selectedYAxisMeta',
             'selectedGroupBy',
             'selectedScaleType'
            ],


    methods: {

        handleResize(){
            if(this.$refs.chartAreaSvg){
                this.width = this.$refs.chartAreaSvg.clientWidth
                this.height = this.$refs.chartAreaSvg.clientHeight
            }
        },
        notifyChartHoverPosition(event){
            const pixelOffset = event.offsetX
            const runIndex =  Math.round(this.x.invert(pixelOffset))
            const groupName = this.groupName

            this.$emit('chart-hover-position-changed', groupName, runIndex)

        },
        rectClicked(event){
            this.$emit('toggle-hover-position-locked')

        },
        colorHash,
        range: _.range,
    },


    computed:{
        yticks(){
            const yticks = ticks(0, this.maxYval, 10)
            return zip(yticks.map(this.y), yticks)
        },
        seriesList(){
            const stackFunc = stack().keys(this.displayedChildrenPaths)
            const viewData = this.runs.map(run => {return _.fromPairs(_.map(this.displayedChildrenPaths, path => [path, run.data[path].value]))})
            const stackData =  stackFunc(viewData)
            return stackData
        },
        displayedXTitles(){
            return this.runs.map(run => {

                var encoded_title = run.meta[this.selectedXAxisMetric]
                var is_date = !isNaN(encoded_title);

                var looked_title = ST.RunDictionaryTranslator.lookupStr( encoded_title );
                var layman_title = is_date ? encoded_title : looked_title;

                const title = layman_title
                if (['launchdate', 'launchday'].includes(this.selectedXAxisMetric)){
                    return timeFormat("%Y-%b-%d %H:%M")(new Date(parseInt(title + '000')))
                }
                return title
            })
        },
        numberOfTicks(){
            return Math.min(Math.round(this.width/50), this.runs.length)

        },
        maxYval(){
            return max(this.seriesList, d => max(d, d => d[1]))

        },
        y(){
            const scale = this.selectedScaleType == 'linear' ?
                scaleLinear()
                    // domain is [0, max value of seriesList]
                    .domain([0,  this.maxYval])
                    .range([this.height, 0])
                : scaleLog()
                    // domain is [0, max value of seriesList]
                    .domain([0.00001,  this.maxYval])
                    .range([this.height, 0])
                    .clamp(true)
            return scale

        },
        x(){
            const scale =  scaleLinear()
                .domain([0, this.runs.length -1])
                .range([0, this.width])
            return scale
        },
        areaFunc(){
            return area()
                .x((d, i) => this.x(i))
                .y0(d => this.y(d[0]))
                .y1(d => this.y(d[1]))
        },
    },

    mounted(){
        this.handleResize()
        window.addEventListener('resize', this.handleResize)
    },

    beforeDestroy(){
        window.removeEventListener('resize', this.handleResize)
    },
}

</script>

<style scoped>
*{
    margin:0px;
    box-sizing: border-box;
}
</style>
