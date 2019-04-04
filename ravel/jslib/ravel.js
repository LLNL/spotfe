//  come from ajax calls.
var navigate, ravel_init;

var validate_obj = function(o) {

  if( o && typeof o === 'object') {

  } else {
    alert('Validate object failed.  ['+o+'] is not a object, but is expected to be.  Caller: ' + validate_obj.caller);
  }
};

var validate_number = function(v) {
  if( typeof v === 'number') {

  } else {
    console.log('Validate number failed.  ['+v+'] is not a number, but is expected to be.  Caller: ' + arguments.callee.caller.name);
  }
  if(v < 0) {
      console.log('Validate number.  V is negative.  V='+v);
  }
};

var ravel = {
    get_data_state: false,
    data: null,
    items: null,
    lanes: null,
    first: null,
    coloring_type: 0,
    selected_rect: null,
    ordering: 0,
    order_change: false,
    scroll_y: false,
    all_lanes: false,
    even_change: false,

    clicked: false,
    cursor: {
      "x": 0,
      "y": 0,
      "width": 1
    },

    margin: {
      top: 20,
      right: 20,
      bottom: 10,
      left: 20
    },
    miniHeight: 60,
    scaleHeight: 20,
    colorBarHeight: 30,

    min_time: 0,
    max_time: 1,
    max_step: 0,
    current_span: 1,
    current_step_span: 1
  };


  ravel.calc_window_sizes = function () {

    var physical_div = d3.select(RV.parent_anchor + '.physical-div').node();

    //  physical div is only present when ravel charts are present.
    if( physical_div ) {

      ravel.full_mini_height = ravel.miniHeight + ravel.scaleHeight + ravel.margin.top;
      ravel.width = physical_div.offsetWidth - 5;
      ravel.gantt_width = ravel.width - ravel.margin.left - ravel.margin.right;
      ravel.full_height = $(document).height() - $('body').offset().top;
      ravel.step_height = d3.select(RV.parent_anchor + '.step-div').node().offsetHeight;
      ravel.physical_height = physical_div.offsetHeight;

      if (ravel.physical_height <= 0 ) {
        /*ravel.physical_gantt_height = ravel.full_height - ravel.full_mini_height - 2 * ravel.margin.top - ravel.margin.bottom;
        ravel.physical_gantt_height /= 2;
        ravel.step_gantt_height = ravel.physical_gantt_height - ravel.colorBarHeight;
        ravel.physical_gantt_height -= ravel.scaleHeight;
        */

      } else {

        ravel.physical_gantt_height = ravel.physical_height - 2 * ravel.margin.top - ravel.margin.bottom - ravel.scaleHeight;
        ravel.step_gantt_height = ravel.step_height - 2 * ravel.margin.top - ravel.margin.bottom - ravel.colorBarHeight;
      }
    }

  }; // end ravel.resize

  ravel.resize = function () {

    return false;

    //  No need to resize if our chart isn't loaded yet.
    if( ravel.mini_x_scale ) {

      //ravel.mini_x_scale.range([0, ravel.gantt_width]);
      //ravel.step_mini_x_scale.range([0, ravel.gantt_width]);
      //ravel.phys_x_scale.range([0, ravel.gantt_width]);
      //ravel.step_x_scale.range([0, ravel.gantt_width]);

      //ravel.phys_x_axis.scale(ravel.phys_x_scale);
      //ravel.step_x_axis.scale(ravel.step_x_scale);
      //ravel.mini_x_axis.scale(ravel.mini_x_scale);
      //ravel.step_mini_x_axis.scale(ravel.step_mini_x_scale);

      ravel.phys_y_scale.range([0, ravel.physical_gantt_height]);
      ravel.step_y_scale.range([0, ravel.step_gantt_height]);

      ravel.step
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.step_gantt_height);

      ravel.phys
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.physical_gantt_height);

      ravel.mini
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.miniHeight);

      ravel.step_clip
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.step_gantt_height);

      ravel.step_lanes_clip
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.step_gantt_height);

      ravel.physical_clip
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.physical_gantt_height);

      ravel.physical_lanes_clip
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.physical_gantt_height);

      // White backgrounds for the views
      ravel.step_background
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.step_gantt_height);

      ravel.phys_background
        .attr('width', ravel.gantt_width)
        .attr('height', ravel.physical_gantt_height);

//      ravel.phys_axis
//        .attr('transform', 'translate(0,' + ravel.physical_gantt_height + ')')
//        .call(ravel.phys_x_axis);

//      ravel.step_axis
//        .attr('transform', 'translate(0,' + ravel.step_gantt_height + ')')
//        .call(ravel.step_x_axis);

      ravel.mini_axis
        .call(ravel.mini_x_axis);

      // Draw a white background for the overview
      ravel.mini_background
        .attr("width", ravel.gantt_width);
//
//      ravel.draw_step();
//     ravel.draw_physical();
    }
  }


  ravel.splitter_change = function () {
    ravel.calc_window_sizes();
    ravel.resize();
  };

  window.onresize = function(event) {
    ravel.calc_window_sizes();
    ravel.resize();
  }

  ravel.zoom_function = function ( gantt_brush, gbg, phys_x_scale, mini_x_scale, anchor_index ) {

    // ignore zoom-by-brush and onload
    if ((!d3.event || !d3.event.transform) || d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;

    var t = d3.event.transform;

    //  xscale_domain is the new minimum and maximum on the scale, after we've zoomed in or zoomed out.
    //  It's an array of 2 numbers [min X, max X]
    var xscale_domain = t.rescaleX(mini_x_scale).domain();

    //  This function controls the X Scale initial setup.
    phys_x_scale.domain(xscale_domain);

    //  This is responsible for setting the overview bar to the
    //  correct length and allowing it move the physical graph above it.
    var mapped = phys_x_scale.range().map(t.invertX, t);
    //console.dir(mapped);

    gbg.call(gantt_brush.move, mapped);

    var domain = phys_x_scale.domain();

    ravel.get_data(d3.max([0, Math.round(domain[0])]), Math.round(domain[1]), anchor_index, phys_x_scale);
  }; // End zoom_function();


  var init_ravel = function() {

    ravel.calc_window_sizes();
    var overview_per = 14; //( (ravel.full_mini_height + 15) / ravel.full_height) * 100;
    var trad_per = 92 - (overview_per*2);
    var step_per = trad_per;

    Split([RV.parent_anchor + '.step-div',
      RV.parent_anchor + '.physical-div',
      RV.parent_anchor + '.overview-div',
      RV.parent_anchor + '.step-overview-div'], {
      direction: 'vertical',
      sizes: [step_per, trad_per, overview_per, overview_per],
      minSize: [0, 0],
      onDrag: ravel.splitter_change
    });

    ravel.calc_window_sizes();

    ravel.physical_label_events = [];
    ravel.step_label_events = [];

    ravel.typecolor = d3.scaleLinear()
      .domain([1,2])
      .range(["lightblue", "lightblue"]);
    ravel.bordercolor = d3.scaleLinear()
      .domain([1,2])
      .range(["blue", "blue"]);
    ravel.parentcolor = d3.scaleLinear()
      .domain([0, 2])
      .range(['dimgray', 'lightgray']);

    ravel.mini_x_scale = ravel.mini_x_scale || [];

    ravel.mini_x_scale[RV.parent_index] = d3.scaleLinear()
      .domain([ravel.min_time, ravel.max_time])
      .range([0, ravel.gantt_width])

    ravel.step_mini_x_scale = ravel.step_mini_x_scale || [];

    ravel.step_mini_x_scale[RV.parent_index] = d3.scaleLinear()
      .domain([ravel.min_time, ravel.max_time])
      .range([0, ravel.gantt_width])


    ravel.mini_y_scale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, ravel.miniHeight]);

    ravel.phys_x_scale = ravel.phys_x_scale || [];

    ravel.phys_x_scale[RV.parent_index] = d3.scaleLinear()
      .domain([ravel.min_time, ravel.min_time + ravel.current_span])
      .range([0, ravel.gantt_width]);

    ravel.step_x_scale = ravel.step_x_scale || [];

    ravel.step_x_scale[RV.parent_index] = d3.scaleLinear()
      .domain([ravel.min_step, ravel.min_step + ravel.current_step_span])
      .range([0, ravel.gantt_width]);

    ravel.ext = d3.extent(1);
    ravel.show_ext = [0,1];
    ravel.phys_y_scale = d3.scaleLinear()
      .domain([ravel.show_ext[0], ravel.show_ext[1]])
      .range([0, ravel.physical_gantt_height]);

    ravel.step_y_scale = d3.scaleLinear()
      .domain([ravel.show_ext[0], ravel.show_ext[1]])
      .range([0, ravel.step_gantt_height]);

    var current_index = parseInt(RV.parent_index);

    ravel.step_zoom = ravel.step_zoom || [];

    ravel.step_zoom[current_index] = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [ravel.gantt_width, ravel.step_gantt_height]])
      .extent([[0, 0], [ravel.gantt_width, ravel.step_gantt_height]])
      .on('zoom', function() {

        var brush = ravel.gantt_brush_step[current_index];
        var gbg = ravel.gantt_brush_step_group[current_index];
        var ps = ravel.step_x_scale[current_index];
        var mx = ravel.step_mini_x_scale[current_index];

        ravel.step_zoom_function( brush, gbg, ps, mx, current_index);
      });

    ravel.gantt_brush = ravel.gantt_brush || [];

    ravel.gantt_brush[RV.parent_index] = d3.brushX()
      .extent([[0, 0], [ravel.gantt_width, ravel.miniHeight]])
      .on("brush end", function() {
        ravel.gantt_brush_function( current_index );
      });


    ravel.zoom = ravel.zoom || [];

    ravel.zoom[current_index] = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [ravel.gantt_width, ravel.physical_gantt_height]])
      .extent([[0, 0], [ravel.gantt_width, ravel.physical_gantt_height]])
      .on('zoom', function( ev ) {

        var brush = ravel.gantt_brush[current_index];
        var gbg = ravel.gantt_brush_group[current_index];
        var ps = ravel.phys_x_scale[current_index];
        var mx = ravel.mini_x_scale[current_index];

        //console.log('ind=' + current_index);

        //  Make sure to send the right brush otherwise, the graph will become disconnected from the overview bar.
        ravel.zoom_function( brush, gbg, ps, mx, current_index );
      });

    ravel.gantt_brush_step = ravel.gantt_brush_step || [];
    ravel.gantt_brush_step[RV.parent_index] = d3.brushX()
      .extent([[0, 0], [ravel.gantt_width, ravel.miniHeight]])
      .on("brush end", function() {
        ravel.gantt_brush_step_function( current_index );
      });

    ravel.logical = ravel.logical || [];

    ravel.logical[RV.parent_index] = d3.select(RV.parent_anchor + '.step-div')
      .append('svg:svg')
      .attr('width', '100%')
      .attr('height', '97%') // Hack to get around overhang issue fighting with inline block
      .attr('class', 'logical')
      .call(ravel.step_zoom[current_index]);

    ravel.step = ravel.logical[RV.parent_index].append('g')
      .attr('transform', 'translate(' + ravel.margin.left + ',' + ravel.margin.top + ')')
      .attr('width', ravel.gantt_width)
      .attr('height', ravel.step_gantt_height)
      .attr('class', 'step');

    ravel.step_clip = ravel.step.append('defs').append('clipPath')
      .append('rect')
      .attr('width', ravel.gantt_width)
      .attr('height', ravel.step_gantt_height);

    ravel.step_lanes_clip = ravel.step.append('defs').append('clipPath')
      .append('rect')
      .attr('width', ravel.gantt_width)
      .attr('height', ravel.step_gantt_height);

    // White backgrounds for the views
    ravel.step_background = ravel.step.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', ravel.gantt_width)
      .attr('height', ravel.step_gantt_height)
      .attr('stroke', 0)
      .attr('fill', 'white')
      .attr('class', 'step_background');

    // draw the items for the main view, use a clip-path for the ones that
    // are slightly outside of our drawing area
    ravel.stepRects = ravel.step.append('g')
      .attr('clip-path', 'url(#step_clip)');

    ravel.physical = ravel.physical || [];

    ravel.physical[ RV.parent_index ] = d3.selectAll( RV.parent_anchor + '.physical-div')
      .append('svg:svg')
      .attr('width', '100%')
      .attr('height', '97%') // Hack to get around overhang issue fighting with inline block
      .attr('class', 'physical')
      .call(ravel.zoom[current_index]);

    ravel.phys = ravel.physical[RV.parent_index].append('g')
      .attr('transform', 'translate(' + ravel.margin.left + ',' + ravel.margin.top + ')')
      .attr('width', ravel.gantt_width)
      .attr('height', ravel.physical_gantt_height)
      .attr('class', 'phys');

    ravel.physical_clip = ravel.phys.append('defs').append('clipPath')
      .append('rect')
      .attr('width', ravel.gantt_width)
      .attr('height', ravel.physical_gantt_height);

    ravel.physical_lanes_clip = ravel.phys.append('defs').append('clipPath')
      .append('rect')
	.attr('width', ravel.gantt_width)
	.attr('height', ravel.physical_gantt_height);

    // White backgrounds for the views
    ravel.phys_background = ravel.phys.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', ravel.gantt_width)
      .attr('height', ravel.physical_gantt_height)
      .attr('stroke', 0)
      .attr('fill', 'white')
      .attr('class', 'phys_background');

    // draw the items for the main view, use a clip-path for the ones that
    // are slightly outside of our drawing area
    ravel.physRects = ravel.phys.append('g')
      .attr('clip-path', 'url(#clip)');

    ravel.overview = d3.select(RV.parent_anchor + '.overview-div')
      .append('svg:svg')
      .attr('height', ravel.full_mini_height)
      .attr('width', '100%')
      .attr('class', 'overview')

    ravel.mini = ravel.overview.append('g')
      .attr('transform', 'translate(' + ravel.margin.left + ',' + ravel.margin.top + ')')
      .attr('width', ravel.gantt_width) //ravel.miniWidth)
      .attr('height', ravel.miniHeight)
      .attr('class', 'mini')
      .on('click', ravel.handle_click);


    ravel.step_overview = d3.select(RV.parent_anchor + '.step-overview-div')
      .append('svg:svg')
      .attr('height', ravel.full_mini_height)
      .attr('width', '100%')
      .attr('class', 'overview step-overview')

    ravel.step_mini = ravel.step_overview.append('g')
      .attr('transform', 'translate(' + ravel.margin.left + ',' + ravel.margin.top + ')')
      .attr('width', ravel.gantt_width) //ravel.miniWidth)
      .attr('height', ravel.miniHeight)
      .attr('class', 'mini')
      .on('click', ravel.handle_click);


    ravel.counter_scale = d3.scaleLinear()
      .interpolate(d3.interpolateLab)
      .domain([1, 50, 100])
      .range(['lightblue', 'khaki', 'firebrick']);

    ravel.phys_x_axis = ravel.phys_x_axis || [];
    ravel.step_x_axis = ravel.step_x_axis || [];

    // draw the x axes on the charts
    ravel.phys_x_axis[current_index] = d3.axisBottom(ravel.phys_x_scale[current_index]);
    ravel.step_x_axis[current_index] = d3.axisBottom(ravel.step_x_scale[current_index]);
    ravel.mini_x_axis = d3.axisBottom(ravel.mini_x_scale[current_index]);
    ravel.step_mini_x_axis = d3.axisBottom(ravel.step_mini_x_scale[current_index]);

    ravel.step_event_layer = ravel.step_event_layer || [];
    ravel.step_event_layer[current_index] = null;

    ravel.phys_layers = ravel.phys_layers || [];
    ravel.phys_layers[current_index] = [];
    ravel.phys_comm_event_layer = ravel.phys_comm_event_layer || [];
    ravel.phys_comm_event_layer[current_index] = null;

    ravel.phys_comm_message_layer = ravel.phys_comm_message_layer || [];
    ravel.phys_comm_message_layer[current_index] = null;
  };


  ravel.init_display = function () {

    ravel.parent_events_inst = ravel.parent_events_inst || [];
    ravel.parent_events_inst[RV.parent_index] = ravel.data.parent_events;

    /*
        Set the startime and stoptime to mintime and maxtime.
        This was originally defined at the end of ravel_init.json but we're no
        longer doing ajax calls for subsets.
     */
    ravel.data.stoptime = ravel.data.maxtime;
    ravel.data.starttime = ravel.data.mintime;


    validate_obj(ravel.data);

    validate_number(ravel.data.mintime);
    validate_number(ravel.data.maxtime);
    validate_number(ravel.data.minstep);
    validate_number(ravel.data.maxstep);
    validate_number(ravel.data.stoptime);
    validate_number(ravel.data.starttime);

    ravel.min_time = ravel.data.mintime;
    ravel.max_time = ravel.data.maxtime;
    ravel.min_step = ravel.data.minstep;
    ravel.max_step = ravel.data.maxstep;

    ravel.current_span = ravel.data.stoptime - ravel.data.starttime;
    ravel.current_step_span = 50; //ravel.data.stopstep - ravel.data.startstep;

    if (ravel.data.hasOwnProperty('max_depth')) {
      ravel.parentcolor.domain([0, ravel.data.max_depth]);
    }

    /*
     *  This is where the 3 X-Axis are setup.
     *  Domain sets the min and max time.
     */
    ravel.mini_x_scale[RV.parent_index].domain([ravel.min_time, ravel.max_time]);
    ravel.phys_x_scale[RV.parent_index].domain([ravel.min_time, ravel.max_time]);  //  ravel.data.starttime,  ravel.data.stoptime
    ravel.step_x_scale[RV.parent_index].domain([ravel.min_step, ravel.max_step]);
    ravel.step_mini_x_scale[RV.parent_index].domain([ravel.min_step, ravel.max_step]);    //  ravel.data.startstep, ravel.data.stopstep

    //  I'm not sure what overview it's expecting here, but it wants a length operator.
    ravel.data.overview = [0,1000,2000,3000];
    ravel.mini_y_scale.domain([0, d3.max(ravel.data.overview)]);

    ravel.phys_x_axis[RV.parent_index].scale(ravel.phys_x_scale[RV.parent_index]);
    ravel.step_x_axis[RV.parent_index].scale(ravel.step_x_scale[RV.parent_index]);
    ravel.mini_x_axis.scale(ravel.mini_x_scale[RV.parent_index]);
    ravel.step_mini_x_axis.scale(ravel.step_mini_x_scale[RV.parent_index]);


    // Skipping middle-click drag for now
    ravel.phys_axis = ravel.phys.append('g')
      .attr('transform', 'translate(0,' + ravel.physical_gantt_height + ')')
      .attr('class', 'phys_axis')
      .call(ravel.phys_x_axis[RV.parent_index]);

    ravel.step_axis = ravel.step.append('g')
      .attr('transform', 'translate(0,' + ravel.step_gantt_height + ')')
      .attr('class', 'step_axis')
      .call(ravel.step_x_axis[RV.parent_index]);

    ravel.mini_axis = ravel.mini.append('g')
      .attr('transform', 'translate(0, ' + ravel.miniHeight + ')')
      .attr('class', 'mini axis date')
      .call(ravel.mini_x_axis);

    // Draw a white background for the overview
    ravel.mini_background = ravel.mini.append('rect')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", ravel.gantt_width)
      .attr("height", ravel.miniHeight)
      .attr("stroke", 0)
      .attr("fill", "white")
      .attr('class', 'mini_background');

    ravel.mini_bars = ravel.mini.append('g')
      .attr('class', 'overviewBar overiewBar_phys');

    ravel.gantt_brush_group = ravel.gantt_brush_group || [];

    //  This is where the overview changes.
    ravel.gantt_brush_group[RV.parent_index] = ravel.mini.append('g')
      .attr("class", "ravel brush");

    ravel.gantt_brush_group[RV.parent_index].call(ravel.gantt_brush[RV.parent_index])
    ravel.gantt_brush_group[RV.parent_index].call(ravel.gantt_brush[RV.parent_index].move, ravel.mini_x_scale[RV.parent_index].range());



    ravel.step_mini_axis = ravel.step_mini.append('g')
      .attr('transform', 'translate(0, ' + ravel.miniHeight + ')')
      .attr('class', 'mini axis date')
      .call(ravel.step_mini_x_axis);

    // Draw a white background for the overview
    ravel.step_mini_background = ravel.step_mini.append('rect')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", ravel.gantt_width)
      .attr("height", ravel.miniHeight)
      .attr("stroke", 0)
      .attr("fill", "white")
      .attr('class', 'mini_background');

    ravel.step_mini_bars = ravel.step_mini.append('g')
      .attr('class', 'overviewBar overiewBar_step');

    ravel.gantt_brush_step_group = ravel.gantt_brush_step_group || [];
    ravel.gantt_brush_step_group[RV.parent_index] = ravel.step_mini.append('g')
      .attr("class", "ravel brush");

    ravel.gantt_brush_step_group[RV.parent_index].call(ravel.gantt_brush_step[RV.parent_index]);
    ravel.gantt_brush_step_group[RV.parent_index].call(ravel.gantt_brush_step[RV.parent_index].move,
      ravel.step_mini_x_scale[RV.parent_index].range());



    //  ravel.current_span is not correct
    ravel.zoom[RV.parent_index].scaleTo(ravel.physical[RV.parent_index], (ravel.max_time - ravel.min_time) / ravel.current_span);
    ravel.zoom[RV.parent_index].translateTo(ravel.physical[RV.parent_index], 0, 0);

    ravel.step_zoom[RV.parent_index].scaleTo(ravel.logical[RV.parent_index], (ravel.max_step - ravel.min_step) / ravel.current_step_span);
    ravel.step_zoom[RV.parent_index].translateTo(ravel.logical[RV.parent_index], 0, 0);

    ravel.ext = d3.extent(ravel.lanes);
    ravel.show_ext = [ravel.ext[0], d3.min([ravel.ext[1] + 1, 17])];
    ravel.phys_y_scale.domain([ravel.show_ext[0], ravel.show_ext[1]]);
    ravel.step_y_scale.domain([ravel.show_ext[0], ravel.show_ext[1]]);

    ravel.physLanes = ravel.physRects.append('g');

    for (var layer = 0; layer <= ravel.data.max_depth; layer++) {
      ravel.phys_layers[RV.parent_index][layer] = ravel.physRects.append('g');
    }
    ravel.phys_comm_event_layer[RV.parent_index] = ravel.physRects.append('g');
    ravel.phys_comm_message_layer[RV.parent_index] = ravel.physRects.append('g');

    ravel.stepLanes = ravel.stepRects.append('g');
    ravel.step_event_layer[RV.parent_index] = ravel.stepRects.append('g');

    ravel.step_message_layer = ravel.step_message_layer || [];
    ravel.step_message_layer[RV.parent_index] = ravel.stepRects.append('g');

    // Find out text sizes
    ravel.physical_font_metrics = ravel.get_text_size(ravel.physical[RV.parent_index], 'evtText');

    // Skip text for overview as well as rectangles

    ravel.update_cursor();

    var phys = ravel.phys_x_scale[RV.parent_index];

    ravel.draw_step( RV.parent_anchor, RV.parent_index);
    ravel.draw_physical( RV.parent_anchor, phys, RV.parent_index );
    ravel.draw_overview();
    ravel.draw_step_overview();
  };


  ravel.get_text_size = function (svg, font_class) {
    var test_font = svg.selectAll('.test-font')
      .data(['g'])
      .enter()
      .append('text');

    test_font
      .attr('class', font_class + ' ravel-test-font')
      .text(d => { return d; })
      .attr('x', -100)
      .attr('y', -100);

    var bbox = $('.ravel-test-font').get(0).getBoundingClientRect();

    test_font.remove();

    return {
      width: bbox.width,
      height: bbox.height
    };
  }

  //  this just happens when the graph opens.
  ravel.gantt_brush_function = function ( index ) {
    // ignore brush-by-zoom
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
    if (ravel.gantt_brush_group === undefined) return;

    var s = d3.event.selection || ravel.mini_x_scale[index].range();

    ravel.phys_x_scale[index].domain(s.map(ravel.mini_x_scale[index].invert, ravel.mini_x_scale[index]));

    var trans = d3.zoomIdentity
      .scale(ravel.gantt_width / (s[1] - s[0]))
      .translate(-s[0], 0);

    ravel.physical[index].call(ravel.zoom[index].transform, trans);

    var phys_x_domain = ravel.phys_x_scale[index].domain();
    var domain0 = Math.round(phys_x_domain[0]);
    var domain1 = Math.round(phys_x_domain[1]);

    ravel.get_data(d3.max([0, domain0]), domain1, index);
  };


  ravel.update_cursor = function() {
      // Nothing for now
  };

  ravel.handle_click = function (d, i) {
    return;
    /*
    var clicked = d3.mouse(this);
    ravel.cursor.x = clicked[0];
    ravel.cursor.y = clicked[1];

    var minExtent = ravel.phys_x_scale.domain()[0];
    var maxExtent = ravel.phys_x_scale.domain()[1];
    var current_range = maxExtent - minExtent; // current zoom
    ravel.phys_x_scale.domain([ravel.mini_x_scale.invert(ravel.cursor.x) - current_range/2.0,
      ravel.mini_x_scale.invert(ravel.cursor.x) + current_range/2.0]);

    // Zero out so these don't get re-applied
    ravel.zoom.translate([0, 0]);
    ravel.zoom.scale([1]);

    ravel.update_cursor();

    ravel.get_data(ravel.phys_x_scale.domain()[0], ravel.phys_x_scale.domain()[1]);
    */
  };


  ravel.get_data = function (start, stop, anchor_index, phys_x_scale) {

    if (ravel.get_data_state) {  // quickie perf hack
      return;
    }
    //console.log(start, stop);

    ravel.get_data_state = true;

/*    $.ajax({
      mimeType: 'text/json; charset=x-user-defined',
      url: '/ravel/data/navigate.js',
      method: 'GET',
      dataType: 'json',
      data: {
        "command" : 'step',
        "start" : start,
        "stop" : stop,
        "entity_start" : ravel.data.entity_start,
        "entities" : ravel.data.entities,
        "width" : ravel.gantt_width,
        "metric" : ravel.metric
      },
      success: function(json) {

        //navigate = json;*/
        RV.ColorLatenessModel.normalize( navigate.traceinfo.events );

        ravel.get_data_state = false;

        ravel.update(navigate.traceinfo, anchor_index, phys_x_scale );
        render_gradient_legend_( navigate.traceinfo.events );

        //  Need to resize so taht the X axis on the logical graph is correct.
        //  Ideally we have an event handler for the end of the draw event.
        //setTimeout( ravel.resize, 500 );
      //}
    //});
  };


  var render_gradient_legend_ = function( events ) {

    var model = RV.ColorLatenessModel.get_model();
    var leg_style = '-webkit-gradient(linear,left top,right top,from(' + model.from + '),to(' + model.to + '))';

    var min = RV.ColorLatenessModel.get_min(events);
    var max = RV.ColorLatenessModel.get_max(events);

    $('.switch_container .gradient_legend').css('background', leg_style);
    $('.switch_container .start_color').html( min );
    $('.switch_container .end_color').html( max );
  };


  ravel.object_filter = function (obj, func) {
    var retarray = [];
    for (key in obj) {
	if (obj.hasOwnProperty(key)) {
	    if (func(obj[key])) {
		retarray.push(obj[key]);
	    }
	}
    }
    return retarray;
  };

  ravel.object_min = function (obj, func) {
      var ret = null;
      for (key in obj) {
	  if (obj.hasOwnProperty(key)) {
	      if (ret) {
		  if (func(obj[key]) < ret) {
		      ret = func(obj[key]);
		  }
	      } else {
		  ret = func(obj[key])
	      }
	  }
      }
      return ret;
  };

  ravel.object_max = function (obj, func) {

    var ret = null;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (ret) {
          if (func(obj[key]) > ret) {
            ret = func(obj[key]);
          }
        } else {
          ret = func(obj[key])
        }
      }
    }
    return ret;
  };

  /*
   *  USAGE:
   *    Only happens on a drilldown event, when you click a date on X-axis.
   *    ravel_init.json is probably not really needed for our current use case.
   *    navigate.js has pretty much everything that ravel_init.json has.
   */
  ravel.init = function (json) {

    ravel.data = json;
    ravel.lanes = [];
    for (var i = 0; i < ravel.data.entities; i++) {
      ravel.lanes.push(i);
    }
    ravel.init_display();
  };


  /*
   *  USAGE:
   *    Happens when you zoom in or out or move the overview sliderbar or when you start a new chart.
   *    Both update and init both set the ravel.data which forms the basis of all the other data used
   *    in the plots.
   */
  ravel.update = function (json, anchor_index, phys_x_scale) {

    ravel.data = json;
    ravel.step_x_scale[anchor_index].domain([ravel.data.minstep, ravel.data.maxstep]);

    var anchor_tag = '.parent_anchor_' + anchor_index + ' ';
    RV.parent_anchor = anchor_tag;

    //  Update the postion of the X-axis as you slide the graph left or right.
    d3.select(anchor_tag + ' .phys_axis').call(ravel.phys_x_axis[anchor_index]);
    ravel.draw_physical( anchor_tag, phys_x_scale, anchor_index );
  };


  ravel.get_aggregated = d => {
        // "aggregated processing prior to " + ravel.data.functions[d.function];
        return ""; // "A" + abbreviations[d.function];
      };



  // We will draw the labels once off screen to find out their size
  // Then we will update them based on their size and put them into the
  // correct place

  ravel.filter_physical_labels = function (index, events) {

    var labels = [];
    var multiplier = ravel.physical_font_metrics.width;

    for (var i = 0; i < events.length; i++) {

      var evt = events[i];

      if(!ravel.data.functions[evt.function]) {
        alert('ravel.data.functions does not contain function: ' + evt.function);
      } else {

        var min = d3.min([ravel.phys_x_scale[index](evt.exit), ravel.gantt_width]);
        var max = d3.max([ravel.phys_x_scale[index](evt.enter), 0]);
        var visible_width = min - max;
        var fun_len = ravel.data.functions[evt.function].length;

        if (visible_width > (multiplier * fun_len)) {
          labels.push(evt);
        }
      }
    }

    return labels;
  };


  var abbreviations = {
    "132": "W",           //  MPI_Wait
    "133": "L",           //  MPI_Waitall
    //"41": "C",            //  MPI_Comm_rank
    //"44": "CS",           //  MPI_Comm_size
    "85": "S",             //  MPI_Isend
    "200" : "AW"
  };

  var abb_descriptions = {
    "132": "MPI_Wait",
    "133": "MPI_Waitall",
    "41": "MPI_Comm_rank",
    "44": "MPI_Comm_size",
    "85": "MPI_Isend",
    "200": "Aggregated Wait"
  };

  ravel.get_function_name = function(d ) {
    return abbreviations[d.function] || ravel.data.functions[d.function];
  };

  ravel.get_function_name_tooltip = function(d ) {

    var name = abb_descriptions[d.function] || ravel.data.functions[d.function];
    var lateness = d.lateness !== undefined ? '<br>Lateness: ' + d.lateness : "";
    var rank = d.entity !== undefined ? '<br>Rank: ' + d.entity : "";
    var step = d.step !== undefined ? '<br>Step: ' + d.step : "";

    return name + lateness + rank + step;
  };

  ravel.draw_legend = function() {

    if( $(".legend").html() == "" ) {

      var h = '<tr><td colspan="2">Legend</td></tr>';

      for (var x in abbreviations) {

        h += '<tr>' +
          '<td class="row">' + abbreviations[x] + '</td>' +
          '<td>' + abb_descriptions[x] + '</td>' +
          '</tr>';
      }

      $('.legend').html('<table>' + h + '</table>');
    }

  };


  $(document).ready(  function() {

      var render_ = function( data ) {

          if( data.error !== "" ) {
              ST.Utility.error( data.error );
          }

          var outer = JSON.parse(data.output.command_out);
          console.dir(outer);

          navigate = outer;


          var reduced = ST.ReductionSplicer.get( navigate.traceinfo.events, navigate.traceinfo.messages );

          navigate.traceinfo.events = reduced.events;
          navigate.traceinfo.messages = reduced.messages;

          //return false;
          console.log('entities=' + navigate.traceinfo.entities);
          //navigate.parent_events.splice(0,10);

          RV.ravelView.render( "" , 0);
      };

      var cali_key = " " + ST.Utility.get_param("cali_key");

      //  olddir = "/g/g0/pascal";
      var dir = "/usr/global/web-pages/lc/www/spot";
      cali_key = " " + dir + "/short_lulesh_x64_ravel.json";

      ST.CallSpot.ajax({
          file: 'mpitrace' + cali_key,
          type: "",
          success: render_
      });
  });