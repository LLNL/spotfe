function getChildrenNames(runData, parentPath) {
  const parentPathList = parentPath.split('/')
  // get list of children
  let childrenNames = []
  for (let pathKey in runData) {
    const childPathList = pathKey.split('/')
    if (pathKey.startsWith(parentPath) && childPathList.length === parentPathList.length + 1) {
      childrenNames.push(childPathList.pop())
    }
  }
  return childrenNames
}

Vue.component('sankey-diagram', {
    template: `<div>
        <svg class="mt-5" :width="svgWidth" :height="svgHeight">
            <g class="links" :style="{fill:'none', stroke: '#070', 'stroke-opacity':0.2}">
                <path v-for="link in sankeyData.links" :d="horizLink(link)" :style="{'stroke-width': Math.max(1, link.width)}"></path>
            </g>
            <g class="nodes" font-family="sans-serif" font-size="14">
                <g v-for="node in sankeyData.nodes">
                    <rect :x="node.x0" :y="node.y0" @click="nodeClicked(node.key)" :height="node.y1 - node.y0" :width="node.x1 - node.x0"
                    :style="{fill: node.color, stroke: '#000'}"></rect><text :x="node.x0 - 6" :y="(node.y1 + node.y0) / 2" dy="0.35em"
                    text-anchor="end">{{ node.name }}</text>
                    <title>{{ node.name +  format(node.value) }}</title>
                </g>
            </g>
        </svg>
        </div>
    `,
    props:['runData'],
    data(){ return {
      svgWidth : window.innerWidth - 100,
    }},
    created() {
      this.svgHeight = 500
      this.horizLink = d3.sankeyLinkHorizontal()  // function to generage link svgs
      this.format = d => d3.format(",.3f")(d) + " sec"  // format tooltips

      // generate sankey function
      this.sankey = d3.sankey()
        .nodeAlign(d3.sankeyCenter)
        .nodeWidth(13)
        .nodePadding(10)

      // make sankey diagram responsive
      window.addEventListener("resize", () => {
        this.svgWidth = window.innerWidth -100
        })
    },
    computed:{
      sankeyData(){
        // data needs to be of the form of these two arrays
        // link elements : {source, target, value} where source and target are integers
        // node elements : {name} just requrire a name entry
        let nodes = [], links = []

        // takes a key and makes a node with name, key and color
        function processNode (key) {
          return {
            name : key.split('/').pop(),
            key,  // used later to click on to show change graph
            color: '#00ff00',
          }
        }

        // breadth-first traversal of nodes so we can combine values under a given percentage
        let parentNodeNum = 0
        let childNodeNum = 1

        //main node is shortest key
        const main_node = Object.keys(this.runData).reduce((prevVal, currVal) => (currVal.length <  prevVal.length) ? currVal: prevVal)

        nodes.push(processNode(main_node))

        while(parentNodeNum < nodes.length){
          const parentNode = nodes[parentNodeNum]

          for(const childName of getChildrenNames(this.runData, parentNode.key)){
            const childKey = parentNode.key + '/' + childName
            const value = this.runData[childKey]
            if(value == 0) {}
            else {
              nodes.push(processNode(childKey))
              links.push({source: parentNodeNum, target: childNodeNum++, value})
            }
          }
          parentNodeNum++
        }
        return this.sankey
            .extent([[1, 1], [this.svgWidth - 10, this.svgHeight - 6]])  // set extents before call
            ({nodes, links})
      },
    }
})