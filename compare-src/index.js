require("./index.css");
var $ltMAx$vue = require("vue");
var $ltMAx$lodash = require("lodash");
var $ltMAx$d3shape = require("d3-shape");
var $ltMAx$d3scale = require("d3-scale");
var $ltMAx$d3array = require("d3-array");
var $ltMAx$d3timeformat = require("d3-time-format");
var $ltMAx$md5 = require("md5");
require("babel-polyfill");
var $ltMAx$localforage = require("localforage");
var $ltMAx$jquery = require("jquery");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $parcel$global =
typeof globalThis !== 'undefined'
  ? globalThis
  : typeof self !== 'undefined'
  ? self
  : typeof window !== 'undefined'
  ? window
  : typeof global !== 'undefined'
  ? global
  : {};
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequired411"];
if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequired411"] = parcelRequire;
}
parcelRequire.register("4y64q", function(module, exports) {

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $c7753e6f10d050d3$export$2e2bcd8739ae039);


var $5d5VO = parcelRequire("5d5VO");

var $fSAnL = parcelRequire("fSAnL");


var $15uoz = parcelRequire("15uoz");
function $c7753e6f10d050d3$var$getInitialYValue(runs) {
    const firstRun = runs[0] || {
        data: {}
    };
    const metrics = Object.keys(Object.values(firstRun.data)[0] || {});
    var defMetric = metrics[0];
    var yaxis = ST.Utility.get_param("yaxis");
    if (yaxis) {
        yaxis = decodeURIComponent(yaxis);
        return yaxis;
    }
    if (defMetric === "spot.channel") return metrics[1];
    return defMetric;
}
var $c7753e6f10d050d3$export$2e2bcd8739ae039 = ($parcel$interopDefault($ltMAx$vue)).extend({
    data () {
        return {
            xAxis: 'launchdate',
            xAxisListener: null,
            yAxis: '',
            yAxisListener: null,
            selectedGroupBy: '',
            groupByListener: null,
            selectedAggregateBy: '',
            filenames: [],
            aggregateListener: null,
            rootFuncPath: '',
            selectedParent: "--root path--",
            selectedScaleType: "linear",
            hoverX: null,
            disabledFuncPaths: [],
            hoverLock: false
        };
    },
    props: [
        'path'
    ],
    mounted () {},
    watch: {
        xAxis (value) {
            if (this.xAxisListener) this.xAxisListener(value);
        },
        selectedGroupBy (value) {
            this.hoverX = null;
            if (this.groupByListener) this.groupByListener(value);
        },
        selectedAggregateBy (value) {
            if (this.aggregateListener) this.aggregateListener(value);
        },
        filenames (filenames) {
            if (filenames.length) {
                const allFuncPaths = ($parcel$interopDefault($ltMAx$lodash)).keys(this.runs[0].data);
                // if no rootFuncPath set or dataset doesn't include currently set rootFuncPath set it
                if (this.rootFuncPath == '' || !allFuncPaths.includes(this.rootFuncPath)) this.rootFuncPath = ($parcel$interopDefault($ltMAx$lodash)).min(allFuncPaths);
            }
            var yax = $c7753e6f10d050d3$var$getInitialYValue(this.runs);
            this.yAxis = yax; //this.lookupOriginalYAxis( yax );
        }
    },
    computed: {
        runs () {
            if (this && this.filenames && window.runs) {
                var fnames = this.filenames;
                //return window.runs.filter(run => this.filenames.includes(run.meta.datapath.value));
                var filtered_runs = window.runs.filter(function(run) {
                    return fnames.includes(run.meta.datapath.value);
                });
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
                }*/ return filtered_runs;
            }
            return [];
        },
        xAxisList () {
            if (this.filenames.length) {
                const firstRun = this.runs[0] || {
                    meta: {}
                };
                const metaKeys = Object.keys(firstRun.meta);
                return metaKeys;
            } else return [];
        },
        funcPathKeys () {
            return this.runs[0] ? Object.keys(this.runs[0].data) : [];
        },
        displayedChildrenPaths () {
            var chp = $15uoz.childrenPaths(this.selectedParent, this.funcPathKeys);
            console.dir(chp);
            return chp;
        },
        groupByList () {
            return [
                ''
            ].concat(this.xAxisList);
        },
        yAxisList () {
            //  These are stubs meant to be replaced with the aliases we get back from the BE.
            var aliasReplacements = {
                "avg#inclusive#sum#time.duration": "Avg time/rank",
                "sum#inclusive#sum#time.duration": "Total time",
                "min#inclusive#sum#time.duration": "Min time/rank",
                "max#inclusive#sum#time.duration": "Max time/rank"
            };
            if (window.cachedData) {
                var rdm = window.cachedData.RunDataMeta;
                for(var encoded in rdm)if (rdm[encoded].alias) {
                    var alias = rdm[encoded].alias;
                    aliasReplacements[encoded] = alias;
                }
            }
            window.aliasReplacements = aliasReplacements;
            const firstRun = this.runs[0] || {
                data: {}
            };
            var metrics = Object.keys(Object.values(firstRun.data)[0] || {});
            console.dir(firstRun);
            for(var y = 0; y < metrics.length; y++){
                var loopMetric = metrics[y];
                if (loopMetric === "spot.channel") metrics.splice(y, 1);
                loopMetric = metrics[y];
                for(var candidate in aliasReplacements)if (loopMetric === candidate) {
                    var replacement = aliasReplacements[candidate];
                    metrics[y] = replacement;
                }
            }
            return metrics;
        },
        selectedRun () {
            return this.hoverX ? this.groupedAndAggregated[this.hoverX.groupName][this.hoverX.runIndex] : null;
        },
        groupedAndAggregated () {
            var yAxisLookup = this.lookupOriginalYAxis(this.yAxis);
            var countLoops = 0;
            var peeledMetricData;
            var path = ST.Utility.get_param('sf');
            var key1 = 'peeledMetricData' + path;
            console.log('Started peeling, Using peel key: ' + key1);
            var localPeeled = localStorage.getItem(key1);
            peeledMetricData = ($parcel$interopDefault($ltMAx$lodash)).map(this.runs, (run)=>{
                var metaPair = ($parcel$interopDefault($ltMAx$lodash)).map(run.meta, (meta, metaName)=>[
                        metaName,
                        meta.value
                    ]
                );
                const meta1 = ($parcel$interopDefault($ltMAx$lodash)).fromPairs(metaPair);
                var mapPair = ($parcel$interopDefault($ltMAx$lodash)).map(run.data, function(metrics, funcPath) {
                    var metricsFloat = parseFloat(metrics[yAxisLookup]);
                    var pair = [
                        funcPath,
                        {
                            value: metricsFloat
                        }
                    ];
                    countLoops++;
                    return pair;
                });
                const data = ($parcel$interopDefault($ltMAx$lodash)).fromPairs(mapPair);
                return {
                    meta: meta1,
                    data: data
                };
            });
            localStorage.setItem(key1, peeledMetricData);
            console.log('countLoops = ' + countLoops);
            console.dir(peeledMetricData);
            const orderedData = ($parcel$interopDefault($ltMAx$lodash)).orderBy(peeledMetricData, (item)=>{
                const metaval = item.meta[this.xAxis];
                return parseFloat(metaval) || metaval;
            });
            const grouped = this.selectedGroupBy ? ($parcel$interopDefault($ltMAx$lodash)).groupBy(orderedData, (a)=>a.meta[this.selectedGroupBy]
            ) : {
                "all": orderedData
            };
            if (!this.selectedAggregateBy) return grouped;
            const aggregated = ($parcel$interopDefault($ltMAx$lodash)).fromPairs(($parcel$interopDefault($ltMAx$lodash)).map(grouped, (runList1, groupByName)=>{
                // consolidate the run list into a single run
                //   first create a run where each value of data and meta is the list of values of all the runs of the runList
                const aggregateGroups = ($parcel$interopDefault($ltMAx$lodash)).groupBy(runList1, (a)=>a.meta[this.xAxis]
                );
                const aggregatedValues = ($parcel$interopDefault($ltMAx$lodash)).map(aggregateGroups, (runList, aggregateBykey)=>{
                    const aggregatedRun = {
                        data: ($parcel$interopDefault($ltMAx$lodash)).fromPairs(($parcel$interopDefault($ltMAx$lodash)).map(runList[0].data, (val, key)=>[
                                key,
                                []
                            ]
                        )),
                        meta: ($parcel$interopDefault($ltMAx$lodash)).fromPairs(($parcel$interopDefault($ltMAx$lodash)).map(runList[0].meta, (val, key)=>[
                                key,
                                []
                            ]
                        ))
                    };
                    // create object of empty arrays
                    runList.forEach((run)=>{
                        ($parcel$interopDefault($ltMAx$lodash)).forEach(run.meta, (val, key)=>{
                            if (aggregatedRun.meta[key]) aggregatedRun.meta[key].push(val);
                        });
                        ($parcel$interopDefault($ltMAx$lodash)).forEach(run.data, (val, key)=>{
                            if (aggregatedRun.data[key]) aggregatedRun.data[key].push(val.value);
                        // console.log('list', groupByName, key, val.value, aggregatedRun.data[key])
                        });
                    });
                    // if the meta values are all the same that value is preserved else just mark it '--' to denote assorted values
                    ($parcel$interopDefault($ltMAx$lodash)).forEach(aggregatedRun.meta, (metaList, metaName)=>{
                        const uniqVals = ($parcel$interopDefault($ltMAx$lodash)).uniq(metaList);
                        aggregatedRun.meta[metaName] = uniqVals.length == 1 ? uniqVals[0] : '--';
                    });
                    // consolidate the data values into the type of aggregate
                    ($parcel$interopDefault($ltMAx$lodash)).forEach(aggregatedRun.data, (dataList, dataName)=>{
                        switch(this.selectedAggregateBy){
                            case 'sum':
                                aggregatedRun.data[dataName] = {
                                    value: dataList.reduce((a, b)=>a + b
                                    , 0)
                                };
                                break;
                            case 'avg':
                                aggregatedRun.data[dataName] = {
                                    value: dataList.reduce((a, b)=>a + b
                                    , 0) / dataList.length
                                };
                                break;
                            case 'max':
                                aggregatedRun.data[dataName] = {
                                    value: ($parcel$interopDefault($ltMAx$lodash)).max(dataList)
                                };
                                break;
                            case 'min':
                                aggregatedRun.data[dataName] = {
                                    value: ($parcel$interopDefault($ltMAx$lodash)).min(dataList)
                                };
                                break;
                        }
                    });
                    // mark how many runs were consolidated
                    aggregatedRun.meta['--num records--'] = runList.length;
                    return aggregatedRun;
                });
                return [
                    groupByName,
                    aggregatedValues
                ];
            }));
            console.log('finished aggregated...');
            return aggregated;
        }
    },
    methods: {
        legendItem (path) {
            var ret = path.slice(path.lastIndexOf('/') + 1);
            var layman_title = ST.RunDictionaryTranslator.lookupStr(ret);
            return layman_title;
        },
        //  Returns the original yAxis that looks like this "max#inclusive#duration.time"
        //  the data was originally sent to the FE with those as indexes.
        lookupOriginalYAxis (yAxis) {
            var yax = yAxis;
            for(var encoded in window.aliasReplacements){
                var alias = window.aliasReplacements[encoded];
                if (alias === yAxis) yax = encoded;
            }
            return yax;
        },
        yAxisSelected (selectedYAxis) {
            this.yAxis = selectedYAxis;
            if (this.yAxisListener) this.yAxisListener(selectedYAxis);
        },
        changePath (path) {
            this.selectedParent = path;
        },
        rerenderForSelectDropdownUpdate () {
            this.filenames.push("test823");
        },
        toggleScaleType () {
            this.selectedScaleType = this.selectedScaleType == 'linear' ? 'log' : 'linear';
            this.filenames.push("test13241234.cali");
        },
        togglePathVisible (pathToToggle) {
            this.disabledFuncPaths = ($parcel$interopDefault($ltMAx$lodash)).xor(this.disabledFuncPaths, [
                pathToToggle
            ]);
        },
        difference: ($parcel$interopDefault($ltMAx$lodash)).difference,
        colorHash: $15uoz.colorHash,
        setChartHoverPosition (groupName, runIndex) {
            if (!this.hoverLock) this.hoverX = {
                groupName: groupName,
                runIndex: runIndex
            };
        },
        toggleHoverPositionLock () {
            this.hoverLock = !this.hoverLock;
        }
    },
    components: {
        viewChart: $5d5VO.default,
        FlameGraph: $fSAnL.default
    }
});

});
parcelRequire.register("5d5VO", function(module, exports) {

$parcel$export(module.exports, "default", () => $3cb2c47eca3185ac$export$2e2bcd8739ae039);
let $3cb2c47eca3185ac$var$script;




let $3cb2c47eca3185ac$var$initialize = ()=>{
    $3cb2c47eca3185ac$var$script = (parcelRequire("6PboK"));
    if ($3cb2c47eca3185ac$var$script.__esModule) $3cb2c47eca3185ac$var$script = $3cb2c47eca3185ac$var$script.default;
    $3cb2c47eca3185ac$var$script.render = (parcelRequire("dglq5")).render;
    $3cb2c47eca3185ac$var$script.__cssModules = {};
    (parcelRequire("9InBx")).default($3cb2c47eca3185ac$var$script);
    $3cb2c47eca3185ac$var$script.__scopeId = 'data-v-7f9af9';
    $3cb2c47eca3185ac$var$script.__file = "/Users/aschwanden1/install/spot2_github/spotfe/compare-src/src/Chart.vue";
};
$3cb2c47eca3185ac$var$initialize();
if (null) {
    $3cb2c47eca3185ac$var$script.__hmrId = '7f9af9-hmr';
    null.accept(()=>{
        setTimeout(()=>{
            $3cb2c47eca3185ac$var$initialize();
            if (!__VUE_HMR_RUNTIME__.createRecord('7f9af9-hmr', $3cb2c47eca3185ac$var$script)) __VUE_HMR_RUNTIME__.reload('7f9af9-hmr', $3cb2c47eca3185ac$var$script);
        }, 0);
    });
}
var $3cb2c47eca3185ac$export$2e2bcd8739ae039 = $3cb2c47eca3185ac$var$script;

});
parcelRequire.register("6PboK", function(module, exports) {

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $5e6117824f544160$export$2e2bcd8739ae039);







var $15uoz = parcelRequire("15uoz");
var $5e6117824f544160$export$2e2bcd8739ae039 = ($parcel$interopDefault($ltMAx$vue)).extend({
    data () {
        return {
            width: '100px',
            height: '100px'
        };
    },
    props: [
        'groupName',
        'runs',
        'hoverX',
        'displayedChildrenPaths',
        'selectedXAxisMetric',
        'selectedYAxisMeta',
        'selectedGroupBy',
        'selectedScaleType'
    ],
    methods: {
        handleResize () {
            if (this.$refs.chartAreaSvg) {
                this.width = this.$refs.chartAreaSvg.clientWidth;
                this.height = this.$refs.chartAreaSvg.clientHeight;
            }
        },
        notifyChartHoverPosition (event) {
            const pixelOffset = event.offsetX;
            const runIndex = Math.round(this.x.invert(pixelOffset));
            const groupName = this.groupName;
            this.$emit('chart-hover-position-changed', groupName, runIndex);
        },
        rectClicked (event) {
            this.$emit('toggle-hover-position-locked');
        },
        colorHash: $15uoz.colorHash,
        range: ($parcel$interopDefault($ltMAx$lodash)).range
    },
    computed: {
        yticks () {
            const yticks = $ltMAx$d3array.ticks(0, this.maxYval, 10);
            return $ltMAx$d3array.zip(yticks.map(this.y), yticks);
        },
        seriesList () {
            const stackFunc = $ltMAx$d3shape.stack().keys(this.displayedChildrenPaths);
            const viewData = this.runs.map((run)=>{
                return ($parcel$interopDefault($ltMAx$lodash)).fromPairs(($parcel$interopDefault($ltMAx$lodash)).map(this.displayedChildrenPaths, (path)=>[
                        path,
                        run.data[path].value
                    ]
                ));
            });
            const stackData = stackFunc(viewData);
            return stackData;
        },
        displayedXTitles () {
            return this.runs.map((run)=>{
                var encoded_title = run.meta[this.selectedXAxisMetric];
                var is_date = !isNaN(encoded_title);
                var looked_title = ST.RunDictionaryTranslator.lookupStr(encoded_title);
                var layman_title = is_date ? encoded_title : looked_title;
                const title = layman_title;
                if ([
                    'launchdate',
                    'launchday'
                ].includes(this.selectedXAxisMetric)) return $ltMAx$d3timeformat.timeFormat("%Y-%b-%d %H:%M")(new Date(parseInt(title + '000')));
                return title;
            });
        },
        numberOfTicks () {
            return Math.min(Math.round(this.width / 50), this.runs.length);
        },
        maxYval () {
            return $ltMAx$d3array.max(this.seriesList, (d1)=>$ltMAx$d3array.max(d1, (d)=>d[1]
                )
            );
        },
        y () {
            const scale = this.selectedScaleType == 'linear' ? $ltMAx$d3scale.scaleLinear()// domain is [0, max value of seriesList]
            .domain([
                0,
                this.maxYval
            ]).range([
                this.height,
                0
            ]) : $ltMAx$d3scale.scaleLog()// domain is [0, max value of seriesList]
            .domain([
                0.00001,
                this.maxYval
            ]).range([
                this.height,
                0
            ]).clamp(true);
            return scale;
        },
        x () {
            const scale = $ltMAx$d3scale.scaleLinear().domain([
                0,
                this.runs.length - 1
            ]).range([
                0,
                this.width
            ]);
            return scale;
        },
        areaFunc () {
            return $ltMAx$d3shape.area().x((d, i)=>this.x(i)
            ).y0((d)=>this.y(d[0])
            ).y1((d)=>this.y(d[1])
            );
        }
    },
    mounted () {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.handleResize);
    }
});

});
parcelRequire.register("15uoz", function(module, exports) {

$parcel$export(module.exports, "childrenPaths", () => $0cadd5f46329fa3f$export$cba17406db42b32d);
$parcel$export(module.exports, "parentPath", () => $0cadd5f46329fa3f$export$ab57e13899b83787);
$parcel$export(module.exports, "colorHash", () => $0cadd5f46329fa3f$export$a2816e00bb6ecf08);


function $0cadd5f46329fa3f$export$cba17406db42b32d($0cadd5f46329fa3f$export$ab57e13899b83787, paths) {
    return ($parcel$interopDefault($ltMAx$lodash)).filter(paths, (path)=>path.startsWith($0cadd5f46329fa3f$export$ab57e13899b83787) && path.split('/').length - $0cadd5f46329fa3f$export$ab57e13899b83787.split('/').length == 1
    );
}
function $0cadd5f46329fa3f$export$ab57e13899b83787(path) {
    return path.split('/').slice(0, -1).join('/');
}
function $0cadd5f46329fa3f$export$a2816e00bb6ecf08(text, alpha) {
    text = text.slice(14) // remove '--root path--/'
    ;
    const reverseString = text.split("").reverse().join("");
    const hash = ($parcel$interopDefault($ltMAx$md5))(reverseString);
    const r = parseInt(hash.slice(12, 14), 16);
    const g = parseInt(hash.slice(14, 16), 16);
    const b = parseInt(hash.slice(16, 18), 16);
    return `rgb(${r}, ${g}, ${b}, 0.6)`;
}

});


parcelRequire.register("dglq5", function(module, exports) {

$parcel$export(module.exports, "render", () => $9a7d627f7ddbf1bb$export$b3890eb0ae9dca99);

const $9a7d627f7ddbf1bb$var$_withScopeId = (n)=>($ltMAx$vue.pushScopeId("data-v-7f9af9"), n = n(), $ltMAx$vue.popScopeId(), n)
;
const $9a7d627f7ddbf1bb$var$_hoisted_1 = {
    class: "chart",
    style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '5px 60px 20px 20px',
        border: '1px solid black',
        margin: '5px'
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_2 = {
    class: "groupname-title",
    style: {
        display: 'flex',
        justifyContent: 'center'
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_3 = {
    class: "chartrow",
    style: {
        width: '100%',
        display: 'flex',
        height: '240px'
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_4 = {
    class: "yaxis",
    style: {
        "display": "flex"
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_5 = {
    class: "yaxis-title",
    style: {
        width: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_6 = {
    class: "title",
    style: {
        "transform": "rotate(-90deg)"
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_7 = {
    class: "yaxis-ticks",
    style: {
        height: '100%',
        width: '75px'
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_8 = {
    height: "320px",
    viewbox: "0 0 100 100"
};
const $9a7d627f7ddbf1bb$var$_hoisted_9 = [
    "y1",
    "y2"
];
const $9a7d627f7ddbf1bb$var$_hoisted_10 = [
    "y"
];
const $9a7d627f7ddbf1bb$var$_hoisted_11 = /*#__PURE__*/ $9a7d627f7ddbf1bb$var$_withScopeId(()=>/*#__PURE__*/ $ltMAx$vue.createElementVNode("line", {
        x1: 75,
        y1: 240,
        x2: 75,
        y2: 0,
        stroke: "black",
        pointerEvents: "none"
    }, null, -1 /* HOISTED */ )
);
const $9a7d627f7ddbf1bb$var$_hoisted_12 = {
    class: "chartarea",
    ref: "chartAreaSvg",
    style: {
        flexGrow: 1
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_13 = {
    cursor: "pointer"
};
const $9a7d627f7ddbf1bb$var$_hoisted_14 = [
    "fill",
    "d",
    "onClick"
];
const $9a7d627f7ddbf1bb$var$_hoisted_15 = [
    "x1",
    "x2"
];
const $9a7d627f7ddbf1bb$var$_hoisted_16 = {
    class: "xaxis",
    style: {
        position: "relative",
        height: "75px",
        marginLeft: "75px",
        zIndex: 0
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_17 = {
    class: "xaxis-title",
    style: {
        width: '100%',
        height: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end'
    }
};
const $9a7d627f7ddbf1bb$var$_hoisted_18 = {
    class: "xaxis-title-text"
};
function $9a7d627f7ddbf1bb$export$b3890eb0ae9dca99(_ctx, _cache) {
    return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", $9a7d627f7ddbf1bb$var$_hoisted_1, [
        $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_2, [
            $ltMAx$vue.createElementVNode("div", null, $ltMAx$vue.toDisplayString(_ctx.selectedGroupBy ? _ctx.selectedGroupBy + ': ' + _ctx.groupName : ''), 1 /* TEXT */ )
        ]),
        $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_3, [
            $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_4, [
                $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_5, [
                    $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_6, $ltMAx$vue.toDisplayString(_ctx.selectedYAxisMeta), 1 /* TEXT */ )
                ]),
                $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_7, [
                    ($ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("svg", $9a7d627f7ddbf1bb$var$_hoisted_8, [
                        ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.yticks, (ytick)=>{
                            return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, [
                                $ltMAx$vue.createElementVNode("line", {
                                    x1: "70",
                                    x2: "75",
                                    y1: ytick[0],
                                    y2: ytick[0],
                                    stroke: "black",
                                    "stroke-width": "1"
                                }, null, 8 /* PROPS */ , $9a7d627f7ddbf1bb$var$_hoisted_9),
                                $ltMAx$vue.createElementVNode("text", {
                                    "text-anchor": "end",
                                    x: 65,
                                    y: ytick[0] + 4
                                }, $ltMAx$vue.toDisplayString(ytick[1]), 9 /* TEXT, PROPS */ , $9a7d627f7ddbf1bb$var$_hoisted_10)
                            ], 64 /* STABLE_FRAGMENT */ );
                        }), 256 /* UNKEYED_FRAGMENT */ )),
                        $9a7d627f7ddbf1bb$var$_hoisted_11
                    ]))
                ])
            ]),
            $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_12, [
                ($ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    "xmlns:v-on": "http://www.w3.org/1999/v-on",
                    width: "100%",
                    height: "100%",
                    viewbox: " 0 100 100",
                    onMousemove: _cache[1] || (_cache[1] = (...args)=>_ctx.notifyChartHoverPosition && _ctx.notifyChartHoverPosition(...args)
                    )
                }, [
                    $ltMAx$vue.createElementVNode("rect", {
                        width: "100%",
                        height: "100%",
                        fill: "white",
                        onClick: _cache[0] || (_cache[0] = (...args)=>_ctx.rectClicked && _ctx.rectClicked(...args)
                        )
                    }),
                    $ltMAx$vue.createElementVNode("g", $9a7d627f7ddbf1bb$var$_hoisted_13, [
                        ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.seriesList, (series)=>{
                            return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("path", {
                                fill: _ctx.colorHash(series.key),
                                d: _ctx.areaFunc(series),
                                onClick: ($event)=>_ctx.$emit('set-node', series.key)
                            }, null, 8 /* PROPS */ , $9a7d627f7ddbf1bb$var$_hoisted_14);
                        }), 256 /* UNKEYED_FRAGMENT */ ))
                    ]),
                    _ctx.hoverX && _ctx.hoverX.groupName == _ctx.groupName ? ($ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("line", {
                        key: 0,
                        x1: _ctx.x(_ctx.hoverX.runIndex),
                        y1: 240,
                        x2: _ctx.x(_ctx.hoverX.runIndex),
                        y2: 0,
                        stroke: "black",
                        pointerEvents: "none"
                    }, null, 8 /* PROPS */ , $9a7d627f7ddbf1bb$var$_hoisted_15)) : $ltMAx$vue.createCommentVNode("v-if", true)
                ], 32 /* HYDRATE_EVENTS */ ))
            ], 512 /* NEED_PATCH */ )
        ]),
        $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_16, [
            _ctx.i % Math.floor(_ctx.runs.length / _ctx.numberOfTicks) == 0 ? ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, {
                key: 0
            }, $ltMAx$vue.renderList(_ctx.displayedXTitles, (xTitle, i)=>{
                return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", {
                    class: "xaxis-ticks",
                    style: $ltMAx$vue.normalizeStyle({
                        position: 'absolute',
                        left: i / (_ctx.runs.length - 1) * _ctx.width + 'px',
                        height: '10px',
                        borderLeft: '1px solid black'
                    })
                }, [
                    $ltMAx$vue.createElementVNode("span", {
                        style: $ltMAx$vue.normalizeStyle({
                            position: 'absolute',
                            right: 0,
                            top: '10px',
                            transformOrigin: 'right',
                            transform: 'rotate(-60deg)',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px',
                            overflow: 'hidden'
                        })
                    }, $ltMAx$vue.toDisplayString(xTitle), 5 /* TEXT, STYLE */ )
                ], 4 /* STYLE */ );
            }), 256 /* UNKEYED_FRAGMENT */ )) : $ltMAx$vue.createCommentVNode("v-if", true)
        ]),
        $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_17, [
            $ltMAx$vue.createElementVNode("div", $9a7d627f7ddbf1bb$var$_hoisted_18, $ltMAx$vue.toDisplayString(_ctx.selectedXAxisMetric), 1 /* TEXT */ )
        ])
    ]);
}
if (null) null.accept(()=>{
    __VUE_HMR_RUNTIME__.rerender('7f9af9-hmr', $9a7d627f7ddbf1bb$export$b3890eb0ae9dca99);
});

});

parcelRequire.register("9InBx", function(module, exports) {

$parcel$export(module.exports, "default", () => $712a8874b0a98103$export$2e2bcd8739ae039);
let $712a8874b0a98103$var$NOOP = ()=>{};
var $712a8874b0a98103$export$2e2bcd8739ae039 = (script)=>{};

});


parcelRequire.register("fSAnL", function(module, exports) {

$parcel$export(module.exports, "default", () => $b8f81ee8d27ee574$export$2e2bcd8739ae039);
let $b8f81ee8d27ee574$var$script;



let $b8f81ee8d27ee574$var$initialize = ()=>{
    $b8f81ee8d27ee574$var$script = (parcelRequire("3y8cW"));
    if ($b8f81ee8d27ee574$var$script.__esModule) $b8f81ee8d27ee574$var$script = $b8f81ee8d27ee574$var$script.default;
    $b8f81ee8d27ee574$var$script.render = (parcelRequire("63Qr3")).render;
    (parcelRequire("frRW6")).default($b8f81ee8d27ee574$var$script);
    $b8f81ee8d27ee574$var$script.__scopeId = 'data-v-0519b0';
    $b8f81ee8d27ee574$var$script.__file = "/Users/aschwanden1/install/spot2_github/spotfe/compare-src/src/Flamegraph.vue";
};
$b8f81ee8d27ee574$var$initialize();
if (null) {
    $b8f81ee8d27ee574$var$script.__hmrId = '0519b0-hmr';
    null.accept(()=>{
        setTimeout(()=>{
            $b8f81ee8d27ee574$var$initialize();
            if (!__VUE_HMR_RUNTIME__.createRecord('0519b0-hmr', $b8f81ee8d27ee574$var$script)) __VUE_HMR_RUNTIME__.reload('0519b0-hmr', $b8f81ee8d27ee574$var$script);
        }, 0);
    });
}
var $b8f81ee8d27ee574$export$2e2bcd8739ae039 = $b8f81ee8d27ee574$var$script;

});
parcelRequire.register("3y8cW", function(module, exports) {

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $295ae9f065be038e$export$2e2bcd8739ae039);

var $4ay5s = parcelRequire("4ay5s");

var $15uoz = parcelRequire("15uoz");

var $295ae9f065be038e$export$2e2bcd8739ae039 = {
    props: [
        'runData',
        'selectedNode',
        'handleClick',
        'showTopdown',
        'topdownData',
        'metricName',
        'showTopdown',
        'selectedTopdownNode'
    ],
    computed: {
        collapsedFuncPaths () {
            let collapsedNodes = [];
            const names = this.selectedNode.split('/').slice(0, -1);
            for(let i = 1; i <= names.length; i++)collapsedNodes.push(names.slice(0, i).join('/'));
            return collapsedNodes;
        }
    },
    methods: {
        title (funcPath) {
            var encoded_title = `${funcPath.split('/').slice(-1)[0]} (${this.runData[funcPath].value})`;
            var layman_title = ST.RunDictionaryTranslator.lookupStr(encoded_title);
            return layman_title;
        },
        addInclusive (selectedRunData) {
            // recursively sum up inclusive times
            const funcPathKeys = Object.keys(selectedRunData);
            let inclusiveData = {};
            function addInclusiveNode(nodeName) {
                const myValue = selectedRunData[nodeName].value;
                const topdown = selectedRunData[nodeName].topdown;
                const childrenFuncPaths = $15uoz.childrenPaths(nodeName, funcPathKeys);
                // if no children set value
                if (!childrenFuncPaths.length) inclusiveData[nodeName] = {
                    inclusive: myValue,
                    exclusive: myValue,
                    topdown: topdown
                };
                else {
                    childrenFuncPaths.forEach((path)=>addInclusiveNode(path)
                    );
                    const childrenNodes = ($parcel$interopDefault($ltMAx$lodash)).filter(inclusiveData, (value, key)=>childrenFuncPaths.includes(key)
                    );
                    const childrenSum = ($parcel$interopDefault($ltMAx$lodash)).sumBy(childrenNodes, (node)=>node.inclusive
                    );
                    inclusiveData[nodeName] = {
                        inclusive: ($parcel$interopDefault($ltMAx$lodash)).max([
                            myValue,
                            childrenSum
                        ]),
                        exclusive: myValue,
                        topdown: topdown
                    };
                }
            }
            addInclusiveNode(($parcel$interopDefault($ltMAx$lodash)).min(funcPathKeys));
            return inclusiveData;
        }
    },
    components: {
        FlamegraphNode: $4ay5s.default
    }
};

});
parcelRequire.register("4ay5s", function(module, exports) {

$parcel$export(module.exports, "default", () => $30928993a6c70f6b$export$2e2bcd8739ae039);
let $30928993a6c70f6b$var$script;




let $30928993a6c70f6b$var$initialize = ()=>{
    $30928993a6c70f6b$var$script = (parcelRequire("5y236"));
    if ($30928993a6c70f6b$var$script.__esModule) $30928993a6c70f6b$var$script = $30928993a6c70f6b$var$script.default;
    $30928993a6c70f6b$var$script.render = (parcelRequire("hBKNf")).render;
    $30928993a6c70f6b$var$script.__cssModules = {};
    (parcelRequire("bi55b")).default($30928993a6c70f6b$var$script);
    $30928993a6c70f6b$var$script.__scopeId = 'data-v-4af12e';
    $30928993a6c70f6b$var$script.__file = "/Users/aschwanden1/install/spot2_github/spotfe/compare-src/src/FlamegraphNode.vue";
};
$30928993a6c70f6b$var$initialize();
if (null) {
    $30928993a6c70f6b$var$script.__hmrId = '4af12e-hmr';
    null.accept(()=>{
        setTimeout(()=>{
            $30928993a6c70f6b$var$initialize();
            if (!__VUE_HMR_RUNTIME__.createRecord('4af12e-hmr', $30928993a6c70f6b$var$script)) __VUE_HMR_RUNTIME__.reload('4af12e-hmr', $30928993a6c70f6b$var$script);
        }, 0);
    });
}
var $30928993a6c70f6b$export$2e2bcd8739ae039 = $30928993a6c70f6b$var$script;

});
parcelRequire.register("5y236", function(module, exports) {

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $40a1b79c928b177b$export$2e2bcd8739ae039);

var $15uoz = parcelRequire("15uoz");
var $40a1b79c928b177b$export$2e2bcd8739ae039 = {
    props: [
        'selectedNode',
        'selectedTopdownNode',
        'showTopdown',
        'topdownData',
        'runData',
        'funcPath',
        'handleClick', 
    ],
    computed: {
        title () {
            if (!window.ST) return "";
            else {
                var encoded_title = `${this.funcPath.split('/').slice(-1)[0]} (${this.runData[this.funcPath].exclusive})`;
                var layman_title = ST.RunDictionaryTranslator.lookupStr(encoded_title);
                return layman_title;
            }
        },
        iAmSelected () {
            return this.selectedNode == this.funcPath;
        },
        allFuncPaths () {
            return Object.keys(this.runData);
        },
        myInclusive () {
            return this.runData[this.funcPath].inclusive;
        },
        exclusiveWidthPercent () {
            // css doesn't like a width to be 0% so if it is zero just return 0 without the %
            if (this.myInclusive == 0) return 0;
            const width = this.runData[this.funcPath].exclusive / this.myInclusive * 100;
            if (width == 0) return 0;
            return width + "%";
        },
        inclusiveWidthPercent () {
            return this.funcPath == this.selectedNode ? '100%' : this.myInclusive / this.runData[$15uoz.parentPath(this.funcPath)].inclusive * 100 + '%';
        }
    },
    methods: {
        colorHash: $15uoz.colorHash,
        parentPath: $15uoz.parentPath,
        childrenPaths: $15uoz.childrenPaths,
        inclusiveBackground (funcPath) {
            return `repeating-linear-gradient( 45deg, #fff, #fff 10px, ${$15uoz.colorHash(this.funcPath)} 10px, ${$15uoz.colorHash(this.funcPath)} 20px)`;
        }
    },
    name: 'FlamegraphNode'
};

});

parcelRequire.register("hBKNf", function(module, exports) {

$parcel$export(module.exports, "render", () => $cd1a308e9290fd60$export$b3890eb0ae9dca99);

const $cd1a308e9290fd60$var$_withScopeId = (n)=>($ltMAx$vue.pushScopeId("data-v-4af12e"), n = n(), $ltMAx$vue.popScopeId(), n)
;
const $cd1a308e9290fd60$var$_hoisted_1 = [
    "title"
];
const $cd1a308e9290fd60$var$_hoisted_2 = {
    class: "children",
    style: {
        display: 'flex'
    }
};
function $cd1a308e9290fd60$export$b3890eb0ae9dca99(_ctx, _cache) {
    const _component_FlamegraphNode = $ltMAx$vue.resolveComponent("FlamegraphNode", true);
    return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", {
        class: "flamenode",
        style: $ltMAx$vue.normalizeStyle({
            width: _ctx.inclusiveWidthPercent,
            display: 'flex',
            flexDirection: 'column'
        })
    }, [
        !_ctx.title.startsWith('--root') ? ($ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", {
            key: 0,
            class: "inclusive",
            style: $ltMAx$vue.normalizeStyle({
                display: 'flex',
                alignItems: 'center',
                height: '25px',
                background: _ctx.inclusiveBackground(_ctx.funcPath)
            })
        }, [
            $ltMAx$vue.createElementVNode("div", {
                class: "exclusive-white-buffer",
                onClick: _cache[1] || (_cache[1] = ($event)=>_ctx.handleClick(_ctx.funcPath)
                ),
                style: $ltMAx$vue.normalizeStyle({
                    width: _ctx.exclusiveWidthPercent,
                    display: 'inline-block',
                    backgroundColor: 'white',
                    position: 'relative',
                    border: _ctx.showTopdown ? '1px solid black' : ''
                })
            }, [
                $ltMAx$vue.createElementVNode("div", {
                    class: "exclusive",
                    style: $ltMAx$vue.normalizeStyle({
                        display: 'flex',
                        position: 'relative',
                        alignItems: 'center',
                        height: '25px',
                        backgroundColor: _ctx.colorHash(_ctx.funcPath),
                        cursor: 'pointer',
                        width: _ctx.showTopdown ? _ctx.topdownData[_ctx.selectedTopdownNode].flame : '100%',
                        border: _ctx.iAmSelected ? '3px solid black' : ''
                    })
                }, null, 4 /* STYLE */ ),
                $ltMAx$vue.createElementVNode("div", {
                    class: "text",
                    onClick: _cache[0] || (_cache[0] = ($event)=>_ctx.handleClick(_ctx.funcPath)
                    ),
                    style: $ltMAx$vue.normalizeStyle({
                        width: _ctx.exclusiveWidthPercent,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        position: 'absolute',
                        top: '3px',
                        left: '3px'
                    }),
                    title: _ctx.title
                }, $ltMAx$vue.toDisplayString(_ctx.title), 13 /* TEXT, STYLE, PROPS */ , $cd1a308e9290fd60$var$_hoisted_1)
            ], 4 /* STYLE */ )
        ], 4 /* STYLE */ )) : $ltMAx$vue.createCommentVNode("v-if", true),
        $ltMAx$vue.createElementVNode("div", $cd1a308e9290fd60$var$_hoisted_2, [
            ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.childrenPaths(_ctx.funcPath, _ctx.allFuncPaths), (fp)=>{
                return $ltMAx$vue.openBlock(), $ltMAx$vue.createBlock(_component_FlamegraphNode, {
                    runData: _ctx.runData,
                    selectedNode: _ctx.selectedNode,
                    selectedTopdownNode: _ctx.selectedTopdownNode,
                    topdownData: _ctx.topdownData,
                    showTopdown: _ctx.showTopdown,
                    funcPath: fp,
                    handleClick: _ctx.handleClick
                }, null, 8 /* PROPS */ , [
                    "runData",
                    "selectedNode",
                    "selectedTopdownNode",
                    "topdownData",
                    "showTopdown",
                    "funcPath",
                    "handleClick"
                ]);
            }), 256 /* UNKEYED_FRAGMENT */ ))
        ])
    ], 4 /* STYLE */ );
}
if (null) null.accept(()=>{
    __VUE_HMR_RUNTIME__.rerender('4af12e-hmr', $cd1a308e9290fd60$export$b3890eb0ae9dca99);
});

});

parcelRequire.register("bi55b", function(module, exports) {

$parcel$export(module.exports, "default", () => $8385517800ff0dc6$export$2e2bcd8739ae039);
let $8385517800ff0dc6$var$NOOP = ()=>{};
var $8385517800ff0dc6$export$2e2bcd8739ae039 = (script)=>{};

});



parcelRequire.register("63Qr3", function(module, exports) {

$parcel$export(module.exports, "render", () => $469bb275872bb446$export$b3890eb0ae9dca99);

const $469bb275872bb446$var$_hoisted_1 = {
    class: "flamegraph",
    style: {
        flex: 2,
        minWidth: '600px',
        overflow: 'scroll'
    }
};
const $469bb275872bb446$var$_hoisted_2 = [
    "onClick"
];
const $469bb275872bb446$var$_hoisted_3 = {
    class: "text",
    style: {
        marginLeft: '3px',
        overflow: 'hidden',
        cursor: 'pointer'
    }
};
function $469bb275872bb446$export$b3890eb0ae9dca99(_ctx, _cache) {
    const _component_FlamegraphNode = $ltMAx$vue.resolveComponent("FlamegraphNode");
    return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", $469bb275872bb446$var$_hoisted_1, [
        $ltMAx$vue.createElementVNode("div", {
            class: "rootbutton",
            onClick: _cache[0] || (_cache[0] = ($event)=>_ctx.handleClick('--root path--')
            ),
            style: $ltMAx$vue.normalizeStyle({
                backgroundColor: '#ddd',
                textAlign: 'center',
                border: _ctx.selectedNode == '--root path--' ? 'solid 1px black' : ''
            })
        }, "/", 4 /* STYLE */ ),
        _ctx.funcPath != '--root path--' ? ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, {
            key: 0
        }, $ltMAx$vue.renderList(_ctx.collapsedFuncPaths, (funcPath)=>{
            return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", {
                class: "collapsed-parent",
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    height: '25px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                },
                onClick: ($event)=>_ctx.handleClick(funcPath)
            }, [
                $ltMAx$vue.createElementVNode("div", $469bb275872bb446$var$_hoisted_3, $ltMAx$vue.toDisplayString(_ctx.title(funcPath)), 1 /* TEXT */ )
            ], 8 /* PROPS */ , $469bb275872bb446$var$_hoisted_2);
        }), 256 /* UNKEYED_FRAGMENT */ )) : $ltMAx$vue.createCommentVNode("v-if", true),
        $ltMAx$vue.createVNode(_component_FlamegraphNode, {
            runData: _ctx.addInclusive(_ctx.runData),
            selectedNode: _ctx.selectedNode,
            selectedTopdownNode: _ctx.selectedTopdownNode,
            topdownData: _ctx.topdownData,
            funcPath: _ctx.selectedNode,
            handleClick: _ctx.handleClick,
            showTopdown: _ctx.showTopdown
        }, null, 8 /* PROPS */ , [
            "runData",
            "selectedNode",
            "selectedTopdownNode",
            "topdownData",
            "funcPath",
            "handleClick",
            "showTopdown"
        ])
    ]);
}
if (null) null.accept(()=>{
    __VUE_HMR_RUNTIME__.rerender('0519b0-hmr', $469bb275872bb446$export$b3890eb0ae9dca99);
});

});

parcelRequire.register("frRW6", function(module, exports) {

$parcel$export(module.exports, "default", () => $b3f337377885913e$export$2e2bcd8739ae039);
let $b3f337377885913e$var$NOOP = ()=>{};
var $b3f337377885913e$export$2e2bcd8739ae039 = (script)=>{};

});



parcelRequire.register("asRSA", function(module, exports) {

$parcel$export(module.exports, "render", () => $01f753dff44a36fb$export$b3890eb0ae9dca99);

const $01f753dff44a36fb$var$_withScopeId = (n)=>($ltMAx$vue.pushScopeId("data-v-d63769"), n = n(), $ltMAx$vue.popScopeId(), n)
;
const $01f753dff44a36fb$var$_hoisted_1 = {
    id: "compare-window",
    style: {
        display: 'flex',
        flexDirection: 'column'
    }
};
const $01f753dff44a36fb$var$_hoisted_2 = {
    class: "sticky",
    style: {
        position: 'sticky',
        top: 0,
        zIndex: 1
    }
};
const $01f753dff44a36fb$var$_hoisted_3 = {
    class: "topbar",
    style: {
        backgroundColor: 'lightgray',
        padding: '5px',
        height: '40px',
        display: 'flex',
        alignItems: 'center'
    }
};
const $01f753dff44a36fb$var$_hoisted_4 = {
    class: "selects",
    style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap'
    }
};
const $01f753dff44a36fb$var$_hoisted_5 = /*#__PURE__*/ $01f753dff44a36fb$var$_withScopeId(()=>/*#__PURE__*/ $ltMAx$vue.createElementVNode("label", {
        for: "xAxis-select",
        style: {
            "margin": "5px"
        }
    }, "X-Axis: ", -1 /* HOISTED */ )
);
const $01f753dff44a36fb$var$_hoisted_6 = /*#__PURE__*/ $01f753dff44a36fb$var$_withScopeId(()=>/*#__PURE__*/ $ltMAx$vue.createElementVNode("label", {
        for: "aggregate-select",
        style: {
            "margin": "5px"
        }
    }, "X-Axis Aggregate:", -1 /* HOISTED */ )
);
const $01f753dff44a36fb$var$_hoisted_7 = /*#__PURE__*/ $01f753dff44a36fb$var$_withScopeId(()=>/*#__PURE__*/ $ltMAx$vue.createElementVNode("label", {
        for: "yAxis-select",
        style: {
            "margin": "5px"
        }
    }, "Y-Axis: ", -1 /* HOISTED */ )
);
const $01f753dff44a36fb$var$_hoisted_8 = [
    "value"
];
const $01f753dff44a36fb$var$_hoisted_9 = /*#__PURE__*/ $01f753dff44a36fb$var$_withScopeId(()=>/*#__PURE__*/ $ltMAx$vue.createElementVNode("label", {
        for: "groupBy-select",
        style: {
            "margin": "5px"
        }
    }, "Group By:", -1 /* HOISTED */ )
);
const $01f753dff44a36fb$var$_hoisted_10 = {
    class: "legend",
    style: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '5px'
    }
};
const $01f753dff44a36fb$var$_hoisted_11 = {
    class: "legend-border",
    style: {
        display: 'flex',
        flexWrap: 'wrap',
        maxWidth: '100%',
        alignItems: 'center',
        border: '1px solid black',
        borderRadius: '15px',
        backgroundColor: '#eee'
    }
};
const $01f753dff44a36fb$var$_hoisted_12 = [
    "onClick"
];
const $01f753dff44a36fb$var$_hoisted_13 = {
    class: "comparison-charts",
    style: {
        "padding": "10px"
    }
};
const $01f753dff44a36fb$var$_hoisted_14 = {
    key: 0,
    class: "run-view",
    style: {
        width: '100%',
        height: '270px',
        display: 'flex',
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'white',
        padding: '10px'
    }
};
const $01f753dff44a36fb$var$_hoisted_15 = {
    class: "global-meta",
    style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: '300px',
        maxWidth: '500px',
        marginLeft: '20px',
        overflow: 'scroll'
    }
};
const $01f753dff44a36fb$var$_hoisted_16 = {
    class: "metarow",
    style: {
        display: 'flex'
    }
};
const $01f753dff44a36fb$var$_hoisted_17 = {
    class: "name",
    style: {
        color: 'blue',
        fontWeight: 'bold'
    }
};
const $01f753dff44a36fb$var$_hoisted_18 = {
    class: "val",
    style: {
        whiteSpace: 'nowrap',
        overflowWrap: 'break-word'
    }
};
function $01f753dff44a36fb$export$b3890eb0ae9dca99(_ctx, _cache) {
    const _component_view_chart = $ltMAx$vue.resolveComponent("view-chart");
    const _component_FlameGraph = $ltMAx$vue.resolveComponent("FlameGraph");
    return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", $01f753dff44a36fb$var$_hoisted_1, [
        $ltMAx$vue.createElementVNode("div", {
            class: "updateCompareView",
            onClick: _cache[0] || (_cache[0] = (...args)=>_ctx.rerenderForSelectDropdownUpdate && _ctx.rerenderForSelectDropdownUpdate(...args)
            )
        }),
        $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_2, [
            $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_3, [
                $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_4, [
                    $01f753dff44a36fb$var$_hoisted_5,
                    $ltMAx$vue.withDirectives($ltMAx$vue.createElementVNode("select", {
                        id: "xAxis-select",
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event)=>_ctx.xAxis = $event
                        )
                    }, [
                        ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.xAxisList, (option)=>{
                            return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("option", null, $ltMAx$vue.toDisplayString(option), 1 /* TEXT */ );
                        }), 256 /* UNKEYED_FRAGMENT */ ))
                    ], 512 /* NEED_PATCH */ ), [
                        [
                            $ltMAx$vue.vModelSelect,
                            _ctx.xAxis
                        ]
                    ]),
                    $01f753dff44a36fb$var$_hoisted_6,
                    $ltMAx$vue.withDirectives($ltMAx$vue.createElementVNode("select", {
                        id: "aggregate-select",
                        style: {
                            marginRight: '10px'
                        },
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event)=>_ctx.selectedAggregateBy = $event
                        )
                    }, [
                        ($ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList([
                            '',
                            'sum',
                            'avg',
                            'min',
                            'max'
                        ], (option)=>{
                            return $ltMAx$vue.createElementVNode("option", null, $ltMAx$vue.toDisplayString(option), 1 /* TEXT */ );
                        }), 64 /* STABLE_FRAGMENT */ ))
                    ], 512 /* NEED_PATCH */ ), [
                        [
                            $ltMAx$vue.vModelSelect,
                            _ctx.selectedAggregateBy
                        ]
                    ]),
                    $01f753dff44a36fb$var$_hoisted_7,
                    $ltMAx$vue.createElementVNode("select", {
                        id: "yAxis-select",
                        value: _ctx.yAxis,
                        onInput: _cache[3] || (_cache[3] = ($event)=>_ctx.yAxisSelected($event.target.value)
                        )
                    }, [
                        ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.yAxisList, (option)=>{
                            return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("option", null, $ltMAx$vue.toDisplayString(option), 1 /* TEXT */ );
                        }), 256 /* UNKEYED_FRAGMENT */ ))
                    ], 40 /* PROPS, HYDRATE_EVENTS */ , $01f753dff44a36fb$var$_hoisted_8),
                    $01f753dff44a36fb$var$_hoisted_9,
                    $ltMAx$vue.withDirectives($ltMAx$vue.createElementVNode("select", {
                        id: "groupBy-select",
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event)=>_ctx.selectedGroupBy = $event
                        )
                    }, [
                        ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.groupByList, (option)=>{
                            return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("option", null, $ltMAx$vue.toDisplayString(option), 1 /* TEXT */ );
                        }), 256 /* UNKEYED_FRAGMENT */ ))
                    ], 512 /* NEED_PATCH */ ), [
                        [
                            $ltMAx$vue.vModelSelect,
                            _ctx.selectedGroupBy
                        ]
                    ])
                ]),
                $ltMAx$vue.createElementVNode("div", {
                    class: "scale-type-button",
                    style: {
                        borderRadius: '5px',
                        padding: '7px',
                        backgroundColor: '#666',
                        color: 'white',
                        cursor: 'pointer',
                        userSelect: 'none'
                    },
                    onClick: _cache[5] || (_cache[5] = (...args)=>_ctx.toggleScaleType && _ctx.toggleScaleType(...args)
                    )
                }, "Set " + $ltMAx$vue.toDisplayString(_ctx.selectedScaleType == 'linear' ? 'Log' : 'Linear'), 1 /* TEXT */ )
            ]),
            $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_10, [
                $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_11, [
                    ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.displayedChildrenPaths, (path)=>{
                        return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", {
                            class: "legend-item",
                            onClick: ($event)=>_ctx.togglePathVisible(path)
                            ,
                            style: {
                                display: 'flex',
                                padding: '5px',
                                cursor: 'pointer'
                            }
                        }, [
                            $ltMAx$vue.createElementVNode("div", {
                                class: "circle",
                                style: $ltMAx$vue.normalizeStyle({
                                    width: '15px',
                                    height: '15px',
                                    backgroundColor: _ctx.disabledFuncPaths.includes(path) ? 'lightgrey' : _ctx.colorHash(path),
                                    borderRadius: '50px'
                                })
                            }, null, 4 /* STYLE */ ),
                            $ltMAx$vue.createElementVNode("div", {
                                class: "name",
                                style: $ltMAx$vue.normalizeStyle({
                                    marginLeft: '5px',
                                    color: _ctx.disabledFuncPaths.includes(path) ? 'lightgrey' : 'black'
                                })
                            }, $ltMAx$vue.toDisplayString(_ctx.legendItem(path)), 5 /* TEXT, STYLE */ )
                        ], 8 /* PROPS */ , $01f753dff44a36fb$var$_hoisted_12);
                    }), 256 /* UNKEYED_FRAGMENT */ ))
                ])
            ])
        ]),
        $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_13, [
            ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.groupedAndAggregated, (runs, groupName)=>{
                return $ltMAx$vue.openBlock(), $ltMAx$vue.createBlock(_component_view_chart, {
                    groupName: groupName,
                    hoverX: _ctx.hoverX,
                    runs: runs,
                    displayedChildrenPaths: _ctx.difference(_ctx.displayedChildrenPaths, _ctx.disabledFuncPaths),
                    selectedXAxisMetric: _ctx.xAxis,
                    selectedYAxisMeta: _ctx.yAxis,
                    selectedGroupBy: _ctx.selectedGroupBy,
                    selectedScaleType: _ctx.selectedScaleType,
                    onSetNode: _ctx.changePath,
                    onChartHoverPositionChanged: _ctx.setChartHoverPosition,
                    onToggleHoverPositionLocked: _ctx.toggleHoverPositionLock
                }, null, 8 /* PROPS */ , [
                    "groupName",
                    "hoverX",
                    "runs",
                    "displayedChildrenPaths",
                    "selectedXAxisMetric",
                    "selectedYAxisMeta",
                    "selectedGroupBy",
                    "selectedScaleType",
                    "onSetNode",
                    "onChartHoverPositionChanged",
                    "onToggleHoverPositionLocked"
                ]);
            }), 256 /* UNKEYED_FRAGMENT */ ))
        ]),
        _ctx.selectedRun ? ($ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", $01f753dff44a36fb$var$_hoisted_14, [
            $ltMAx$vue.createVNode(_component_FlameGraph, {
                runData: _ctx.selectedRun.data,
                selectedNode: _ctx.selectedParent,
                handleClick: _ctx.changePath
            }, null, 8 /* PROPS */ , [
                "runData",
                "selectedNode",
                "handleClick"
            ]),
            $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_15, [
                ($ltMAx$vue.openBlock(true), $ltMAx$vue.createElementBlock($ltMAx$vue.Fragment, null, $ltMAx$vue.renderList(_ctx.selectedRun.meta, (metaVal, metaName)=>{
                    return $ltMAx$vue.openBlock(), $ltMAx$vue.createElementBlock("div", $01f753dff44a36fb$var$_hoisted_16, [
                        $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_17, $ltMAx$vue.toDisplayString(metaName), 1 /* TEXT */ ),
                        $ltMAx$vue.createElementVNode("div", $01f753dff44a36fb$var$_hoisted_18, ": " + $ltMAx$vue.toDisplayString(metaVal), 1 /* TEXT */ )
                    ]);
                }), 256 /* UNKEYED_FRAGMENT */ ))
            ])
        ])) : $ltMAx$vue.createCommentVNode("v-if", true)
    ]);
}
if (null) null.accept(()=>{
    __VUE_HMR_RUNTIME__.rerender('d63769-hmr', $01f753dff44a36fb$export$b3890eb0ae9dca99);
});

});

parcelRequire.register("dF7ib", function(module, exports) {

$parcel$export(module.exports, "default", () => $9f24c2c671b17396$export$2e2bcd8739ae039);
let $9f24c2c671b17396$var$NOOP = ()=>{};
var $9f24c2c671b17396$export$2e2bcd8739ae039 = (script)=>{};

});


$parcel$export(module.exports, "Graph", () => $4fa36e821943b400$export$614db49f3febe941);

let $622b3ba819d084fb$var$script;




let $622b3ba819d084fb$var$initialize = ()=>{
    $622b3ba819d084fb$var$script = (parcelRequire("4y64q"));
    if ($622b3ba819d084fb$var$script.__esModule) $622b3ba819d084fb$var$script = $622b3ba819d084fb$var$script.default;
    $622b3ba819d084fb$var$script.render = (parcelRequire("asRSA")).render;
    $622b3ba819d084fb$var$script.__cssModules = {};
    (parcelRequire("dF7ib")).default($622b3ba819d084fb$var$script);
    $622b3ba819d084fb$var$script.__scopeId = 'data-v-d63769';
    $622b3ba819d084fb$var$script.__file = "/Users/aschwanden1/install/spot2_github/spotfe/compare-src/src/App.vue";
};
$622b3ba819d084fb$var$initialize();
if (null) {
    $622b3ba819d084fb$var$script.__hmrId = 'd63769-hmr';
    null.accept(()=>{
        setTimeout(()=>{
            $622b3ba819d084fb$var$initialize();
            if (!__VUE_HMR_RUNTIME__.createRecord('d63769-hmr', $622b3ba819d084fb$var$script)) __VUE_HMR_RUNTIME__.reload('d63769-hmr', $622b3ba819d084fb$var$script);
        }, 0);
    });
}
var $622b3ba819d084fb$export$2e2bcd8739ae039 = $622b3ba819d084fb$var$script;





const $4fa36e821943b400$var$defaultVisibleCharts = [
    'walltime',
    'user',
    'uid',
    'launchdate',
    'executable',
    'hostname',
    'clustername',
    'systime',
    'cputime',
    'fom'
];
const $4fa36e821943b400$var$isContainer = window.ENV?.machine == 'container';
const $4fa36e821943b400$var$useJsonp = window.ENV?.use_JSONP_for_lorenz_calls;

async function $4fa36e821943b400$var$getMain0(host, dataSetKey) {
    var baseUrl = location.protocol + '//' + location.host + location.pathname;
    var prefix = host.startsWith('rz') ? 'rz' : '';
    //var url = "https://rzlc.llnl.gov/lorenz_base/dev/pascal/mylc/mylc/cat.cgi";
    prefix = 'rz';
    var url = baseUrl + "/scripts/cat.cgi?" + "dataSetKey=" + dataSetKey + '/cacheToFE.json';
    //var url = "https://" + prefix + "lc.llnl.gov/lorenz_base/dev/pascal/mylc/mylc/cat.cgi";
    console.log('asking for: ' + url);
    const $ = await $4fa36e821943b400$importAsync$6f3738794d14228e;
    return new Promise((resolve, reject)=>{
        $.ajax({
            url: url
        }).then((value)=>{
            resolve(value);
        }, (error)=>{
            reject(error);
        });
    });
}

async function $4fa36e821943b400$var$lorenz(host, cmd) {
    const baseurl = `https://${host.startsWith('rz') ? 'rz' : ''}lc.llnl.gov/lorenz/lora/lora.cgi`;
    var response, value1;
    {
        const $ = await $4fa36e821943b400$importAsync$6f3738794d14228e;
        return new Promise((resolve, reject)=>{
            $.ajax({
                dataType: 'jsonp',
                url: baseurl + '/jsonp',
                //url: baseurl + '/command',
                //type: "POST",
                data: {
                    'via': 'post',
                    'route': '/command/' + host,
                    'command': cmd
                }
            }).then(function(value) {
                resolve(value);
            }, function(error) {
                console.dir('error 909', error);
                ReusableView.alert('Error', error.responseText);
                reject(error);
            });
        });
    }
}
class $4fa36e821943b400$export$614db49f3febe941 {
    constructor(selector){
        this.app = new ($parcel$interopDefault($ltMAx$vue))({
            el: selector,
            render: (h)=>h('App')
            ,
            components: {
                App: $622b3ba819d084fb$export$2e2bcd8739ae039
            }
        }).$children[0];
    }
    async openJupyter(filepath, host, command) {
        // args:   command: should be something like:  '/usr/gapps/spot/dev/spot.py jupyter'
        //        filepath:  absolute path to califile
        if ($4fa36e821943b400$var$isContainer) {
            // for container
            let response = await fetch("spotJupyter", {
                method: "post",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    filepath: filepath
                })
            });
            if (response.ok) {
                let ipynbjson = await response.json();
                let server = "";
                if (ipynbjson.hasOwnProperty("server")) server = ipynbjson["server"].trim();
                if (server.length == 0) server = window.location.protocol + '//' + window.location.hostname;
                let urlpath = ipynbjson["path"];
                let auth = "";
                if (ipynbjson.hasOwnProperty("token")) auth = "?token=" + ipynbjson["token"];
                let port = "";
                if (ipynbjson.hasOwnProperty("port")) port = ":" + ipynbjson["port"];
                if (ipynbjson.hasOwnProperty("base")) urlpath = "/" + ipynbjson["base"] + urlpath;
                return server + port + urlpath + auth;
            }
        } else {
            // for lorenz
            const url = await $4fa36e821943b400$var$lorenz(host, `${command} ${filepath}`);
            if (url.error) ReusableView.modal({
                body: url.error
            });
            return url.output.command_out;
        }
    }
    async openMultiJupyter(basepath, subpaths, host, command) {
        // args:   command: should be something like:  '/usr/gapps/spot/dev/spot.py jupyter'
        //         filepath:  absolute path to califile
        if ($4fa36e821943b400$var$isContainer) {
            // for container
            let response = await fetch("spotMultiJupyter", {
                method: "post",
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    basepath: basepath,
                    subpaths: subpaths
                })
            });
            if (response.ok) {
                let ipynbjson = await response.json();
                let server = "";
                if (ipynbjson.hasOwnProperty("server")) server = ipynbjson["server"].trim();
                if (server.length == 0) server = window.location.protocol + '//' + window.location.hostname;
                let urlpath = ipynbjson["path"];
                let auth = "";
                if (ipynbjson.hasOwnProperty("token")) auth = "?token=" + ipynbjson["token"];
                let port = "";
                if (ipynbjson.hasOwnProperty("port")) port = ":" + ipynbjson["port"];
                if (ipynbjson.hasOwnProperty("base")) urlpath = "/" + ipynbjson["base"] + urlpath;
                return server + port + urlpath + auth;
            }
        } else {
            // for lorenz
            const url = await $4fa36e821943b400$var$lorenz(host, `${command} ${basepath} '${JSON.stringify(subpaths)}'`);
            console.log('urL:');
            console.dir(url);
            if (url.error) ReusableView.modal({
                body: url.error
            });
            return url.output.command_out;
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
        if (!$4fa36e821943b400$var$isContainer) {
            var res0 = await $4fa36e821943b400$var$lorenz(host, comm);
            res = res0.output.command_out;
        }
        res = ST.Utility.fix_LC_return_err(res);
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
            };
            console.log('Got a new cachedData...');
        } else {
            // Get Cached Data from local storage
            cachedDataGet = await ($parcel$interopDefault($ltMAx$localforage)).getItem(dataSetKey) || {
                Runs: {},
                RunDataMeta: {},
                RunGlobalMeta: {},
                RunSetMeta: {}
            };
            console.log('cachedDataGet:');
            console.dir(cachedDataGet);
            var keys0 = Object.keys(cachedDataGet.Runs);
            if (keys0 && keys0.length === 0) {
                console.log('localforage came up with no runs, so bust cache.');
                bust_cache = 1;
            }
        }
        return this.afterCachedDataGet(cachedDataGet, bust_cache, mtime, dataSetKey, host, command);
    }
    async afterCachedDataGet(cachedDataGet, bust_cache, mtime, dataSetKey, host, command) {
        const cachedData = cachedDataGet;
        const cachedRunCtimes = cachedData.runCtimes || {};
        //  Round to prevent string from being too long.
        for(var x in cachedRunCtimes){
            cachedRunCtimes[x] = parseInt(cachedRunCtimes[x]);
            if (bust_cache) //  this should be low enough to prevent caching
            cachedRunCtimes[x] = -1;
        }
        const dataRequest = {
            dataSetKey: dataSetKey,
            cachedRunCtimes: cachedRunCtimes
        };
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
        if (cacheSum && cacheSum.summary && !bust_cache && !$4fa36e821943b400$var$isContainer) {
            newData = cacheSum.summary;
            console.log('was able to find cache.');
        } else {
            console.log('could not find cache.');
            if ($4fa36e821943b400$var$isContainer) {
                // first see if there is a data endpoint:  used in docker container
                let response = await fetch("/getdata", {
                    method: "post",
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(dataRequest)
                });
                var txt = await response.text();
                for(var x = 0; x < 15; x++)txt = txt.replace(',,', ',');
                newData = JSON.parse(txt);
            //newData = await response.json()
            } else //else we do a Lorenz call at LLNL
            try {
                var lor_response;
                if (cacheFileFound) {
                    //  Use the super fast cat.cgi to output things really fast.
                    lor_response = await $4fa36e821943b400$var$getMain0(host, dataSetKey);
                    newData = JSON.parse(lor_response);
                } else {
                    console.log('cache file not found, making lorenz call.');
                    lor_response = await $4fa36e821943b400$var$lorenz(host, `${command} ${dataSetKey} '` + JSON.stringify(cachedRunCtimes) + "'");
                    console.dir(lor_response);
                    if (lor_response.status === "ERROR") ST.Utility.error(lor_response.error);
                    if (lor_response.output.command_out.indexOf('ERROR') > -1) {
                        ST.Utility.error(lor_response.output.command_out);
                        return false;
                    }
                    if (lor_response.error !== "") {
                        ST.Utility.error(lor_response.error);
                        return false;
                    }
                    newData = lor_response.output.command_out;
                }
                if (newData.foundReport) console.log(newData.foundReport);
                var pd = newData;
                if (typeof newData === "string") {
                    newData = ST.Utility.fix_LC_return_err(newData);
                    pd = JSON.parse(newData);
                }
                if (pd.dictionary) {
                    //  this is for the walltime page.
                    var dstr = JSON.stringify(pd.dictionary);
                    var sf = ST.Utility.get_param("sf");
                    var key = "page_dictionary_" + sf;
                    console.log('page key: ' + key);
                    localStorage.setItem(key, dstr);
                }
                DB.saveSummary(newData);
            } catch (e) {
                console.log('Exception: ');
                console.dir(e);
                newData = {
                    Runs: {},
                    RunDataMeta: {},
                    RunGlobalMeta: {},
                    RunSetMeta: {}
                };
            }
        }
        if (typeof newData === 'string') {
            newData = ST.Utility.fix_LC_return_err(newData);
            newData = JSON.parse(newData);
        }
        //  newData is too big to always print out.
        console.log('991B newData:  ');
        console.dir(newData.Runs);
        //newData = ST.RunDictionaryTranslator.translate( newData );
        ST.RunDictionaryTranslator.set(newData.dictionary);
        var runs0 = newData.Runs;
        //  this will make jupyter button disappear.
        if (newData.dictionary) ST.CallSpot.is_ale3d = true;
        console.log('runs before cacheDa84:');
        console.dir(runs0);
        for(var x in runs0){
            var el = runs0[x].Data;
            var da = el;
            for(var root in da){
                var obj = da[root];
                for(var z in obj)obj[z] = +obj[z];
            }
        }
        console.dir(runs0);
        // Merge new data with cached
        cachedData.Runs = Object.assign(cachedData.Runs, runs0);
        cachedData.RunDataMeta = Object.assign(cachedData.RunDataMeta, newData.RunDataMeta);
        cachedData.RunGlobalMeta = Object.assign(cachedData.RunGlobalMeta, newData.RunGlobalMeta);
        cachedData.RunSetMeta = Object.assign(cachedData.RunSetMeta, newData.RunSetMeta);
        cachedData.runCtimes = newData.runCtimes;
        // delete runs from cache that were deleted on backend
        const deletedRuns = newData.deletedRuns || [];
        deletedRuns.forEach((deletedRun)=>delete cachedData.Runs[deletedRun]
        );
        window.cachedData = cachedData;
        // add in datsetkey and datakey to globals
        ($parcel$interopDefault($ltMAx$lodash)).forEach(cachedData.Runs, (run, filename)=>{
            run.Globals = run.Globals || {};
            run.Globals.dataSetKey = dataSetKey;
            run.Globals.datapath = filename;
        });
        cachedData.RunGlobalMeta.dataSetKey = {
            type: 'string'
        };
        cachedData.RunGlobalMeta.datapath = {
            type: 'string'
        };
        const baseMetrics = {};
        for(let metric in cachedData.RunDataMeta)baseMetrics[metric] = 0;
        const funcPaths = new Set();
        const metricNames = new Set();
        let runs = [];
        const filenames = Object.keys(cachedData.Runs);
        filenames.map((filename)=>{
            const fileData = cachedData.Runs[filename].Data;
            const run = {
                'data': fileData
            };
            // pad the data
            for (const [funcPath, metrics] of Object.entries(fileData)){
                funcPaths.add(funcPath);
                for (let [metricName, val] of Object.entries(metrics))metricNames.add(metricName);
            }
            run.meta = {};
            const globals = cachedData.Runs[filename].Globals;
            for (const [metricName, value] of Object.entries(globals)){
                const metricMeta = cachedData.RunGlobalMeta[metricName];
                const type = metricMeta ? metricMeta.type : "string";
                run.meta[metricName] = {
                    value: value,
                    type: type
                };
            }
            runs.push(run);
        });
        runs.forEach((run)=>{
            funcPaths.forEach((funcPath)=>{
                run.data['--root path--/' + funcPath] = {
                    ...baseMetrics,
                    ...run.data[funcPath]
                };
                delete run.data[funcPath];
            });
            run.data['--root path--'] = baseMetrics;
        });
        // set data values
        this.dataSetKey = dataSetKey;
        var lr0 = $.extend({}, cachedData);
        //var lr = lr0.Runs;
        var arr = {};
        for(var run_id_x in cachedData.Runs){
            var a_run = $.extend({}, cachedData.Runs[run_id_x]);
            a_run.Data = {
                "blank": 1
            };
            arr[run_id_x] = a_run;
        }
        lr0.Runs = arr;
        //  this is just the Meta data.  the actual "Data" is stored in cachedData
        //  and will be sent to the durations page from CallSpot.js
        //        await localforage.setItem(dataSetKey, {'Runs': arr});
        await ($parcel$interopDefault($ltMAx$localforage)).setItem(dataSetKey, lr0);
        //  The first run's meta object is used to determine what the drop down select options should be.
        window.runs = ST.CompositeLayoutModel.augment_first_run_to_include_composite_charts(runs);
        this.compare(filenames);
        // 4. return summary
        const summary = {
            data: {},
            layout: {
                charts: [],
                table: []
            }
        };
        const visibleCharts = await ($parcel$interopDefault($ltMAx$localforage)).getItem("show:" + dataSetKey) || $4fa36e821943b400$var$defaultVisibleCharts;
        for (const [filename1, fileContents] of Object.entries(cachedData.Runs))summary.data[filename1] = {
            ...fileContents.Globals,
            filepath: dataSetKey + '/' + filename1
        };
        var barCharts = [
            'unsigned int',
            'int',
            'double',
            'timeval',
            'date',
            'long'
        ];
        for (const [globalName, globalValue] of Object.entries(cachedData.RunGlobalMeta)){
            const globType = globalValue.type;
            const show = visibleCharts.includes(globalName);
            summary.layout.charts.push({
                'dimension': globalName,
                'title': globalName,
                'type': globType,
                'viz': barCharts.includes(globType) ? 'BarChart' : 'PieChart',
                'show': show
            });
            summary.layout.table.push({
                'dimension': globalName,
                'label': globalName,
                'type': globType,
                'show': show
            });
        }
        summary.layout.scatterplots = await ($parcel$interopDefault($ltMAx$localforage)).getItem('scatterplots:' + this.dataSetKey) || [];
        return summary;
    }
    async addScatterplot(options) {
        const key = "scatterplots:" + this.dataSetKey;
        const scatterplots = await ($parcel$interopDefault($ltMAx$localforage)).getItem(key) || [];
        scatterplots.push(options);
        ($parcel$interopDefault($ltMAx$localforage)).setItem(key, scatterplots);
    }
    async setChartVisible(globalName, visible = true) {
        const showGlobals = new Set(await ($parcel$interopDefault($ltMAx$localforage)).getItem("show:" + this.dataSetKey) || $4fa36e821943b400$var$defaultVisibleCharts);
        if (visible) showGlobals.add(globalName);
        else showGlobals.delete(globalName);
        ($parcel$interopDefault($ltMAx$localforage)).setItem("show:" + this.dataSetKey, Array.from(showGlobals));
    }
    compare(filenames) {
        filenames = filenames || this.last_filenames;
        this.app.filenames = filenames;
        this.last_filenames = filenames;
    }
    //------------------ controls functions
    addXAxisChangeListener(listener) {
        this.app.xAxisListener = listener;
    }
    addYAxisChangeListener(listener) {
        this.app.yAxisListener = listener;
    }
    addAggregateTypeChangeListener(listener) {
        this.app.aggregateListener = listener;
    }
    addGroupByChangeListener(listener) {
        this.app.groupByListener = listener;
    }
    setXaxis(xAxisName) {
        this.app.xAxis = xAxisName;
    }
    setYAxis(yAxisName) {
        console.log('setting yAxis -----> ' + yAxisName);
        this.app.yAxis = yAxisName;
    }
    setAggregateType(aggregateType) {
        this.app.selectedAggregateBy = aggregateType;
    }
    setGroupBy(groupBy) {
        this.app.selectedGroupBy = groupBy;
    }
}
window.Graph = $4fa36e821943b400$export$614db49f3febe941;


//# sourceMappingURL=index.js.map
