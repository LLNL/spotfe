ST.ReturnedDataStub = {
    layout: {
        charts: [
            {
                viz: "PieChart",
                title: "Compiler names + Compiler Version",
                dimension: "Compiler Name"
            },
            {
                viz: "LeftHorizontalBarChart",
                title: "Code Builder",
                dimension: "Code Builder"
            },
            {
                //  eventually will be HorizontalBarChart
                //  for now using PieChart because HorizontalBarChart is not supported yet.
                viz: "PieChart",
                title: "Compiler Flags",
                dimension: "Compiler Flags"
            },
            {
                viz: "BarChart",
                dimension: "Problem Size"
            },
            {
                viz: "BarChart",
                title: "Number of Regions",
                dimension: "Number of Regions"
            },
/*            {
                //  BubbleChart is not completely supported yet and won't be for a while.
                //  But here is the interface.
                viz: "BubbleChart",
                xaxis: "Region Balance",
                yaxis: "region_cost"
            },
            {
                viz: "BarChart",
                title: "Iterations",
                dimension: "Iterations"
            }*/
        ],
        table: [
            //  For now, we only support label and dimension must be the same.
            //  Eventually, the two will be able to differ, that way you can
            //  title the column different than the dimension name.
            {
                label: 'date',
                dimension: 'date'
            },
            {
                label: 'cali.caliper.version',
                dimension: 'cali.caliper.version'
            },
            {
                label: 'Problem Size',
                dimension: 'Problem Size'
            },
            {
                label: 'Region Balance',
                dimension: 'Region Balance'
            }
        ]
    },
    data: [
        {
            "run_id": 1,
            "start": 1333700653,
            "end": 1333749727,
            "compiler_name_plus_compiler_version": "GNU 2.1 - GNU 2.4",
            "code_builder": "Tsung-Dao (T.D.) Lee",
            "problem_size": 3,
            "program": "umt",
            "flags": "-F -Millenium ",
            "number_of_regions": 2,
            "region_balance": 4,
            "region_cost": 5,
            "max_iterations": 7,
            "drilldown": ["mpi", "perf c", "duration"]
        },
        {
            "run_id": 2,
            "start": 1333700653,
            "end": 1333749727,
            "compiler_name_plus_compiler_version": "GNU 1.0",
            "code_builder": "Tsung-Dao (T.D.) Lee",
            "problem_size": 3,
            "program": "umt",
            "flags": "-OPUS 6 ",
            "number_of_regions": 2,
            "region_balance": 4,
            "region_cost": 5,
            "max_iterations": 7,
            "drilldown": ["mpi", "duration"]
        },
        {
            "run_id": 3,
            "start": 1333700653,
            "end": 1333749727,
            "compiler_name_plus_compiler_version": "Visual Studios 5",
            "code_builder": "Tsung-Dao (T.D.) Lee",
            "problem_size": 2,
            "program": "umt",
            "flags": "-DATA -MIN",
            "number_of_regions": 2,
            "region_balance": 4,
            "region_cost": 5,
            "max_iterations": 7,
            "drilldown": ["mpi", "perf c"]
        },
        {
            "run_id": 4,
            "start": 1333700653,
            "end": 1333749727,
            "compiler_name_plus_compiler_version": "Visual Studios 6",
            "code_builder": "James Downy",
            "problem_size": 4,
            "program": "lulesh",
            "flags": "-W 283 -MINI",
            "number_of_regions": 5,
            "region_balance": 3,
            "region_cost": 12,
            "max_iterations": 17,
            "drilldown": ["mpi"]
        },
        {
            "run_id": 5,
            "start": 1333700653,
            "end": 1333749727,
            "compiler_name_plus_compiler_version": "Visual Studios 6",
            "code_builder": "Roger Lumberg",
            "problem_size": 4,
            "program": "lulesh",
            "flags": "-F -Millenium ",
            "number_of_regions": 1,
            "region_balance": 3,
            "region_cost": 4,
            "max_iterations": 11,
            "drilldown": ["duration"]
        },
        {
            "run_id": 6,
            "start": 1333700653,
            "end": 1333749727,
            "compiler_name_plus_compiler_version": "Visual Studios 5",
            "code_builder": "Huckleberry Finn",
            "problem_size": 4,
            "program": "umt",
            "flags": "-F -Millenium ",
            "number_of_regions": 2,
            "region_balance": 3,
            "region_cost": 12,
            "max_iterations": 17,
            "drilldown": ["mpi", "perf c", "duration"]
        },
        {
            "run_id": 7,
            "start": 1333700653,
            "end": 1333749727,
            "compiler_name_plus_compiler_version": "Visual Studios 5",
            "code_builder": "Tsung-Dao (T.D.) Lee",
            "problem_size": 5,
            "program": "umt",
            "flags": "-F -Millenium ",
            "number_of_regions": 6,
            "region_balance": 3,
            "region_cost": 12,
            "max_iterations": 17,
            "drilldown": ["mpi", "perf c", "duration"]
        },
    ]
};

//  This was 2nd iteration data driven.
var OLD_CHART_ARRAY = [
    {
        viz: "BasicLineChart",
        dimensions: ['runtime', 'runtime2', 'runtime']
    },
    {
        viz: "BubbleChart"
    },
    {
        viz: "BarChart",
        dimension: "runtime"
    },
    {
        viz: "BarChart",
        dimension: "year"
    },
    {
        viz: "PieChart",
        title: "Thermal Variance",
        dimension: "thermal_variance"
    },
    {
        viz: "PieChart",
        title: "Program",
        dimension: "program"
    }
];

var MAIN_TABLE_OLD_COLUMNS = [
    // Use the `d.date` field; capitalized automatically
    'date',
    'program',
    'version',
    {
        label: 'User',
        format: function(d) {
            return d.author
        }
    },
    'runtime',
    {
        // Specify a custom format for column 'Change' by using a label with a function.
        label: 'Thermal',
        format: function (d) {
            return ST.numberFormat(d.thermal);
        }
    },
    {
        label: 'Performance',
        format: function( d ) {
            return d.scientific_performance;
        }
    },
    {
        label: 'Operations',
        format: function(d) {

            var buts = "";

            for( var x in d.buttons ) {

                var but = d.buttons[x];
                buts += '<div class="myButton">' + but.toUpperCase() + '</div>';
            }

            return buts;
        }
    }

];