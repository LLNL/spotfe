<template lang="pug">
.chart(
    :style=`{
        display:'flex',
        flexDirection:'column',
        alignItems:'stretch',
        padding:'5px 60px 20px 20px',
        border:'1px solid black',
        margin:'5px'
        }`
    )
    .groupname-title(
        :style=`{
            display:'flex',
            justifyContent:'center'
            }`
        )
        div {{ selectedGroupBy ? selectedGroupBy + ': ' + groupName : '' }}
    .chartrow(
        :style=`{
            width:'100%',
            display:'flex',
            height:'240px',
            }`
        )
        .yaxis(
            style="display:flex"
            )
            .yaxis-title(
                :style=`{
                    width:0,
                    display:'flex',
                    alignItems:'center',
                    justifyContent: 'center',
                    }`
                )
                .title(
                    style="transform:rotate(-90deg)"
                    )  {{ selectedYAxisMeta }}
            .yaxis-ticks(
                :style="{height:'100%', width:'75px'}"
                )
                svg(
                    height="320px" 
                    viewbox="0 0 100 100"
                    )
                    //- tick marks and text
                    template(v-for="ytick in yticks")
                        line( 
                            x1="70"
                            x2="75" 
                            :y1="ytick[0]" 
                            :y2="ytick[0]" 
                            stroke="black" 
                            stroke-width="1"
                            )
                        text(text-anchor='end' 
                            :x='65' 
                            :y='ytick[0] + 4'
                            )  {{ytick[1]}}
                    //- axis line
                    line(
                        :x1="75"
                        :y1="240"
                        :x2="75"
                        :y2="0"
                        stroke="black"
                        pointerEvents="none"
                        )
        .chartarea(ref='chartAreaSvg' :style="{flexGrow:1}")
            svg(
                xmlns="http://www.w3.org/2000/svg"
                xmlns:v-on="http://www.w3.org/1999/v-on"
                width="100%" 
                height="100%" 
                viewbox=" 0 100 100"
                v-on:mousemove="notifyChartHoverPosition"

                )
                rect(
                    width="100%"
                    height="100%"
                    fill="white"
                    v-on:click='rectClicked'
                    )
                //- areas curves
                g(cursor='pointer')
                    path(
                        v-for="series in seriesList" 
                        :fill="colorHash(series.key)" 
                        :d="areaFunc(series)"
                        v-on:click="$emit('set-node', series.key)"
                        )
                //- selection line
                line(
                    v-if="hoverX && hoverX.groupName == groupName"
                    :x1="x(hoverX.runIndex)"
                    :y1="240"
                    :x2="x(hoverX.runIndex)"
                    :y2="0"
                    stroke="black"
                    pointerEvents="none"
                    )

    .xaxis(
        :style=`{
            position:"relative",
            height:"75px",
            marginLeft:"75px",
            zIndex:0
            }`
        )
        .xaxis-ticks(
            v-for="(xTitle, i) in displayedXTitles" 
            v-if="(i % Math.floor(runs.length/numberOfTicks)) == 0"
            :style=`{
                position:'absolute',
                left: i/(runs.length-1)*width + 'px',
                height:'10px',
                borderLeft:'1px solid black'
                }`
            )
            span(
                :style=`{
                    position:'absolute',
                    right:0,
                    top:'10px',
                    transformOrigin:'right',
                    transform:'rotate(-60deg)',
                    whiteSpace:'nowrap',
                    maxWidth:'150px',
                    overflow:'hidden'
                    }`
                ) {{ xTitle }}
    .xaxis-title(
        :style=`{
            width:'100%',
            height: '50px',
            display: 'flex',
            justifyContent:'center',
            alignItems: 'flex-end'
            }`
        )
        .xaxis-title-text {{ selectedXAxisMetric}}
            
</template>

<script lang="ts">
import Vue from 'vue'
import _ from "lodash"
import {stack, area} from 'd3-shape' 
import {scaleLinear,scaleLog} from 'd3-scale' 
import {max, ticks, zip} from 'd3-array'
import {timeFormat} from 'd3-time-format'
import {colorHash} from './functions.js'

export default Vue.extend({

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
})
</script>
<style lang="scss" scoped>
*{
    margin:0px;
    box-sizing: border-box;
}
</style>
