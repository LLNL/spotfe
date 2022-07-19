<template lang="pug">
v-card
svg(width="1100", height="425", padding="100px", margin="100px")
  g(v-for='row in topdownLayout')
    g(v-for='(node, index) in row.namevals')
      rect(
        :x="row.xOffset + (row.width + row.spacing)*index"
        :y="100 + row.yOffset - node.val"
        :height="node.val"
        :width="row.width"
        rx="5" ry="5"
        fill="#4db6ac"
        opacity="0.5"
      )
      text(
        :transform="'translate(' + (row.xOffset + (index + 0.5)*(row.width) + (row.spacing*index)) + ',' + (row.yOffset + 50) + ')rotate('+ row.rotate + ')'"
        fill="#333"
        dy="0.35em"
        text-anchor="middle" ) {{ node.name }}
      rect(
        :x="row.xOffset + (row.width + row.spacing)*index"
        :y="row.yOffset"
        rx="5"
        yx="5"
        height="100"
        stroke="#448aff"
        :stroke-width='selName==node.name?3:1'
        :width="row.width"
        fill="#fff0"
        @click="topDownNodeClicked(node.name)"
      )
        title value: {{ node.rawVal }}
v-card-media
  div(margin="50px" padding='50px' width="svgWidth", height="svgHeight")
    svg(:width='svgWidth', :height='svgHeight' )
      g.links(:style='{fill:"none", stroke: "black", "stroke-opacity":0.2}')
        path(v-for='link in sankeyData.links'
          :d='horizLink(link)'
          :style='{"stroke-width": Math.max(1, link.width)}')
          title {{ link.source.name + ' -> ' + link.target.name + '\n' + format(link.value) }}
      g.nodes(
          font-family='sans-serif'
          font-size=12)
        g(v-for='(node, index) in sankeyData.nodes'
          @click='sankeyNodeClicked(node)'
        )
          rect(
            :x='node.x0'
            :y='node.y0'
            :height='node.y1 - node.y0'
            :width='node.x1 - node.x0'
            :stroke-width='node.path==selSankeyPath?3:1'
            stroke="#333"
            fill="#0ff"
          )
          rect(
            :x='node.x0'
            :y='node.y0'
            :height='(1 - runData[node.path].topdown[selTopdown])*(node.y1 - node.y0)'
            :width='node.x1 - node.x0'
            stroke="#333"
            fill="#fff"
          )
          text(:x='node.x0 -6'
            :y='(node.y1 + node.y0) / 2'
            :fill='node.path==selSankeyPath?"red":"black"'
            dy='0.35em'
            text-anchor='end'
            ) {{ node.name }}
          title {{ node.name + '\n' + format(node.value) }}
div(style='max-width: 40%')
  v-slider(label="combine under %" v-model="sliderVal" thumb-label step="1" max='20')

          FlameGraph(
                :runData='peeledData(runData, "avg")'
                :metricName='avg'
                :showTopdown='showTopdown'
                :topdownData='topdownData'
                :selectedNode='selectedNode'
                :selectedTopdownNode='selectedTopdownNode'
                :handleClick='changePath'
                )

</template>

<script>
  import * as d3 from 'd3'
  import * as d3s from 'd3-sankey'
  import * as _ from 'lodash'

  export default {
    props:['runData'],
    data(){ return {
      svgWidth : window.innerWidth - 100,
      // selSankeyIndex: 0,
      selSankeyPath : "main",
      selTopdown: "retiring",
      selName: "retiring",
      sliderVal: 0,
        test: 23
    }},
    methods:{
      sankeyNodeClicked(node){
        this.selSankeyPath = node.path
        // this.selSankeyIndex = node.dataIndex
      },
      topDownNodeClicked(name){
        let trnslt = {
            retiring: "retiring",
            "bad spec": "bad_speculation",
            frontend: "frontend_bound",
            backend: "backend_bound",
            mispredict: "branch_mispredict",
            "mach clr": "machine_clear",
            latency: "frontend_latency",
            bandwidth: "frontend_bandwidth",
            core: "core_bound",
            memory: "memory_bound",
            L1: "l1_bound",
            L2: "l2_bound",
            L3: "l3_bound",
            uncore: "uncore_bound",
            "mem bound": "mem_bound"
        }
            this.selTopdown = trnslt[name]
            this.selName = name
      },
        peeledData(runData, metricName){

            var z;

             let x =  _.fromPairs(_.map(runData, (metrics, funcPath) => {
                 let topdown = {}
                 _.forIn(metrics, (val, key) => {if(key.startsWith('any#any#')) topdown[key] = val})

                 if(Object.keys(topdown).length == 0) topdown = null

                 var metricValue = metrics[metricName] || 0

                 return ['-RP/' + funcPath, {value: parseFloat(metricValue), topdown}]
             }))
             x['-RP'] = {value: 0}

             //console.log('Inside peeledData(): ');
             //console.dir(x)
             return x
        }
    },
    created() {
      console.log('data', this.runData)
      this.svgHeight = 600
      this.horizLink = d3s.sankeyLinkHorizontal()  // function to generage link svgs
      this.format = d => d3.format(",.0f")(d) + " cycles"  // format tooltips

      // generate sankey function
      this.sankey = d3s.sankey()
        .nodeAlign(d3s.sankeyCenter)
        .nodeWidth(13)
        .nodePadding(10)

      // make sankey diagram responsive
      window.addEventListener("resize", () => {
        this.svgWidth = window.innerWidth -100
        })
    },
    computed:{
      sankeyData(){
        //process new format into old format
        const keysSortedByDepth = Object.keys(this.runData).sort((a, b) => a.split("/").length - b.split("/").length)
        const d = this.runData
        

        // data needs to be of the form of these two arrays
        // link elements : {source, target, value} where source and target are integers
        // node elements : {name} just requrire a name entry
        let nodes = [], links = []

        // breadth-first traversal of nodes so we can combine values under a given percentage
        let combined = {}

        let nodeNum = 0
        keysSortedByDepth.forEach((key, dataIndex) => {
          const value = d[key].duration
          const funcStack = key.split("/")
          const name = _.last(funcStack)


          // zero null and negative values
          // let re = retiring[dataIndex]
          // let fb = frontend_bound[dataIndex]
          // let bb = backend_bound[dataIndex]
          // let bs = bad_speculation[dataIndex]
          // re = (re || 0) < 0 ? 0 : re
          // fb = (fb || 0) < 0 ? 0 : fb
          // bb = (bb || 0) < 0 ? 0 : bb
          // bs = (bs || 0) < 0 ? 0 : bs

          // make link
          if(_.size(funcStack) > 1){
            const parentName = _.nth(funcStack, -2)
            const parent = _.find(nodes, node => node.name == parentName)

            if(parent){  //not root node
              const parentNum = parent.nodeNum
              const parentValue = parent.duration

              if(value >= parentValue * this.sliderVal/100){

                nodes.push(
                    { name      // required
                    , nodeNum
                    , path: key
                    , dataIndex
                    , duration: value
                    }
                )
                links.push({source: parentNum, target: nodeNum++, value})

              } else {
                let comb = combined.parentNum || {parentNum, value: 0}
                combined[parentNum] =
                  { value: value + comb.value
                  , parentNum : comb.parentNum
                  }
              }
            }
          } else {
            // root node
            nodes.push(
                { name      // required
                , nodeNum : nodeNum++
                , path: key
                , dataIndex: 0
                , duration: value
                }
            )
          }
        })

        // calculate combined
        _.forEach(combined, (vals, index) =>{
          nodes.push(
              { name: "combined"      // required
              , nodeNum
              , duration: vals.value
              }
          )
          links.push({source: vals.parentNum, target: nodeNum++, value: vals.value})
        })

        let sources = _.uniq(_.map(links, link => link.source))
        let sourceAndChildren = _.map(sources, sourceNum => [sourceNum, _.filter(links, link => sourceNum == link.source)] )

        // calculate exclusive
        // _.forEach(sourceAndChildren, ([sourceNum, childen]) =>{
        //   const sourceVal = nodes[sourceNum].duration
        //   const childrenSum = _.sumBy(childen, "value")

        //   if(sourceVal > childrenSum){
        //     nodes.push(
        //         { name: "exclusive"      // required
        //         , nodeNum
        //         , duration: sourceVal - childrenSum
        //         , level1: getLevel1(0, 0, 0, 0)
        //         }
        //     )
        //     links.push({source: sourceNum, target: nodeNum++, value: sourceVal - childrenSum})
        //   }


        // })

        // takes a key and makes a node with name, key and color
        let sank =  this.sankey
            .extent([[1, 1], [this.svgWidth - 60, this.svgHeight - 80]])  // set extents before call
            ({nodes, links})
        console.log("sank", sank)
        return sank
      },
      topdownLayout(){

          console.log('selSAnkeyPath=' + this.selSankeyPath);
          console.dir(this.runData);

            let re = this.runData[this.selSankeyPath].topdown.retiring
            let bs = this.runData[this.selSankeyPath].topdown.bad_speculation
            let fe = this.runData[this.selSankeyPath].topdown.frontend_bound
            let be = this.runData[this.selSankeyPath].topdown.backend_bound
            let mp = this.runData[this.selSankeyPath].topdown.branch_mispredict
            let mc = this.runData[this.selSankeyPath].topdown.machine_clear
            let fl = this.runData[this.selSankeyPath].topdown.frontend_latency
            let bw = this.runData[this.selSankeyPath].topdown.frontend_bandwidth
            let cb = this.runData[this.selSankeyPath].topdown.core_bound
            let mb = this.runData[this.selSankeyPath].topdown.memory_bound
            let l1 = this.runData[this.selSankeyPath].topdown.l1_bound
            let l2 = this.runData[this.selSankeyPath].topdown.l2_bound
            let l3 = this.runData[this.selSankeyPath].topdown.l3_bound
            let ub = this.runData[this.selSankeyPath].topdown.uncore_bound
            let me = this.runData[this.selSankeyPath].topdown.mem_bound
          return [
              {
                  namevals:
                      [ {name: "retiring", val: re*100, rawVal: re}
                          , {name: "bad spec", val: bs*100, rawVal: bs}
                          , {name: "frontend", val: fe*100, rawVal: fe}
                          , {name: "backend", val: be*100, rawVal: be}
                      ]
                  , xOffset: 50
                  , yOffset: 100
                  , width: 250
                  , spacing: 10
                  , rotate: 0
              }
              , {
                  namevals:
                      [ {name: "mispredict", val: mp*100, rawVal: mp}
                          , {name: "mach clr", val: mc*100, rawVal: mc}
                          , {name: "latency", val: fl*100, rawVal: fl}
                          , {name: "bandwidth", val: bw*100, rawVal: bw}
                          , {name: "core", val: cb*100, rawVal: cb}
                          , {name: "memory", val: mb*100, rawVal: mb}
                      ]
                  , xOffset: 310
                  , yOffset: 210
                  , width: 120
                  , spacing: 10
                  , rotate: 0
              }
              , {
                  namevals:
                      [ {name: "L1", val: l1*100, rawVal: l1}
                          , {name: "L2", val: l2*100, rawVal: l2}
                          , {name: "L3", val: l3*100, rawVal: l3}
                          , {name: "uncore", val: ub*100, rawVal: ub}
                          , {name: "mem bound", val: me*100, rawVal: me}
                      ]
                  , xOffset: 960
                  , yOffset: 320
                  , width: 20
                  , spacing: 5
                  , rotate: 90
              }
          ]
      }
    },
  }
</script>
<style>
.re { background: #0F0;}
.fb { background: #00f;}
.bb { background: #0ff;}
.bs { background: #f00;}
.key-dot {
    display: inline-block;
    height: 10px;
    margin-right: .5em;
    width: 10px;
}
p {
    margin: 0 !important;
}
.legend {
    position: absolute;
    top: 25px;
    right: 100px;
}
</style>
