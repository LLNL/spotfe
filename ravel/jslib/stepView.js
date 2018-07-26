  ravel.draw_step = function ( anchor_tag, anchor_index ) {

    ravel.get_loc = d => {

      var xc = ravel.step_x_scale[anchor_index](d.step);

      //  there's one X coordinate that gets stuck at 0.
      if( xc === 0 ) {
        xc = -50;
      }

      return xc + 5;
    };

    if( ravel.stepLanes ) {
      var rects, agg_rects, msgs, labels,
        minExtent = ravel.step_x_scale[anchor_index].domain()[0],
        maxExtent = ravel.step_x_scale[anchor_index].domain()[1],
        minEntity = ravel.step_y_scale.domain()[0] - 1,
        maxEntity = ravel.step_y_scale.domain()[1];

      // Remove old lane numbers
      d3.select(anchor_tag + '.stepLaneNum').remove();

      // Add new lanes numbers
      var stepLanes = ravel.logical[anchor_index].append('g')
        .attr('class', 'stepLaneNum');

      var stepLanesText = stepLanes.selectAll('.stepLaneText')
        .data(ravel.lanes)
        .text(d => { return d; })
        .attr('y', d => { return ravel.margin.top + ravel.step_y_scale(d + 0.5); });

      stepLanesText.enter().append('text')
        .text(d => { return d;})
        .attr('x', ravel.margin.left - 15)
        .attr('y', d => { return ravel.margin.top + ravel.step_y_scale(d + 0.5); })
        .attr('dy', '0.5ex')
        .attr('text-anchor', 'start')
        .attr('class', 'stepLaneText'); // TODO: More CSS

      var laneLines = ravel.stepLanes.selectAll('.stepLaneLines')
        .data(ravel.lanes)
        .attr('x2', ravel.gantt_width)
        .attr('y1', d => { return Math.round(ravel.step_y_scale(d)) + 0.5; })
        .attr('y2', d => { return Math.round(ravel.step_y_scale(d)) + 0.5; });

      if( RV.ravelView.show_lines( anchor_index ) ) {
        laneLines.enter().append('line')
        //.attr('phys_x_scale', 0)
          .attr('x1', 0) // d => { return ravel.phys_x_scale(minExtent); })
          .attr('y1', d => { return Math.round(ravel.step_y_scale(d)) + 0.5; })
          .attr('x2', ravel.gantt_width)
          .attr('y2', d => { return Math.round(ravel.step_y_scale(d)) + 0.5; })
          .attr('class', 'stepLaneLines');
      }

      laneLines.exit().remove();

      var barHeight = ravel.step_y_scale(2.0) - ravel.step_y_scale(1.0) - 4;
      var barWidth = ravel.step_x_scale[anchor_index](2.0) - ravel.step_x_scale[anchor_index](1.0) - 4;
      var barXoffset = 2;
      var barYoffset = 2;
      var strokeWidth = 1;

      if (barWidth <= 5) {
        barWidth += 4;
        strokeWidth = 0;
        barXoffset = 0;
      }
      if (barHeight <= 5) {
        barHeight += 4;
        barYoffset = 0;
      }

      // Handle the steps

      // Filter out non-step items (coalesced isends for example)
      var step_items = ravel.data.events.filter(d => { return d.step != -1; });

      rects = ravel.step_event_layer[anchor_index].selectAll('.event')
        .data(step_items, d => { return d.id; })
        .attr('x', d => {
          return ravel.step_x_scale[anchor_index](d.step) + barXoffset;
        })
        .attr('y', d => { return ravel.step_y_scale(d.entity) + barYoffset; })
        .attr('height', barHeight)
        .attr('width', barWidth)
        .style('stroke-width', strokeWidth);

      rects.enter().append('rect')
        .attr('x', d => {
            var xstep = ravel.step_x_scale[anchor_index](d.step);
          return xstep + barXoffset;
        })
        .attr('y', d => { return ravel.step_y_scale(d.entity) + barYoffset; })
        .attr('style', RV.ColorLatenessModel.get)
        .attr('height', barHeight)
        .attr('width', barWidth)
        .attr('tool_title', ravel.get_function_name_tooltip)
        .style('stroke-width', strokeWidth)
        .attr('class', 'ravel event')
        //.append('svg:title')
        .text(ravel.get_function_name_tooltip);

      rects.exit().remove();

      agg_rects = ravel.step_event_layer[anchor_index].selectAll('.agg_event')
        .data(step_items, d => { return d.id; })
        .attr('x', d => { return ravel.step_x_scale[anchor_index](d.step - 1) + barXoffset; })
        .attr('y', d => { return ravel.step_y_scale(d.entity) + barYoffset; })
        .attr('height', barHeight)
        .attr('width', barWidth)
        .style('stroke-width', strokeWidth);
      //.text(function() {return 't500'});

      //  Physical View -> the odd numbered Divs.
      agg_rects.enter().append('rect')
        .attr('x', d => { return ravel.step_x_scale[anchor_index](d.step - 1) + barXoffset; })
        .attr('y', d => { return ravel.step_y_scale(d.entity) + barYoffset; })
        .attr('style', RV.ColorLatenessModel.get)
        .attr('height', barHeight)
        .attr('width', barWidth)
        .attr('tool_title', ravel.get_function_name_tooltip)
        .style('stroke-width', strokeWidth)
        .attr('class', 'ravel agg_event')
        //.append('svg:title')
        .text(ravel.get_aggregated);

      agg_rects.exit().remove();

      // Labels
      if (ravel.physical_font_metrics.height + 4 < barHeight) {
        ravel.step_label_events = ravel.filter_step_labels(step_items, barWidth);
      } else {
        ravel.step_label_events = [];
      }

      labels = ravel.step_event_layer[anchor_index].selectAll('.evtText')
        .data(ravel.step_label_events, d => { return d.id; })
        .attr('x', ravel.get_loc )
        .attr('y', d => { return ravel.step_y_scale(d.entity + 0.1) + 2 + ravel.physical_font_metrics.height; });

      //  One label for every step.  in our case about 99 of them.
      //console.log(labels);

      //  Step Events - All the even numbered DIVs in the Logical View.
      //  Doesn't include aggregated events, the odd DIVs in between.
      labels.enter().append('text')
        .attr('x', ravel.get_loc )
        .attr('y', d => { return ravel.step_y_scale(d.entity + 0.1) + 2 + ravel.physical_font_metrics.height; })
        .attr('class', 'ravel evtText even_divs')
        .text(ravel.get_function_name);

      //  Just LABELS
      //  We're adding this to show the Aggregated waits, before each step. - this is just before the W.
      agg_rects.enter().append('text')
        .data(ravel.step_label_events, d => { return d.id; })
        .attr('x', d => { return d3.max([ravel.step_x_scale[anchor_index](d.step) - barWidth, -100]) + 5; })
        .attr('y', d => { return ravel.step_y_scale(d.entity + 0.1) + 2 + ravel.physical_font_metrics.height; })
        .attr('class', 'ravel odd_divs')
        .text(ravel.get_aggregated);

      labels.exit().remove();

      // Comms
      msgs = ravel.step_message_layer[anchor_index].selectAll('.message')
        .data(ravel.data.messages, d => { return d.id; })
        .attr('x1', d => {

          var xin = d.sendstep + 0.5;
          return ravel.step_x_scale[anchor_index](xin);
        })
        .attr('x2', d => {

          var x2in = d.recvstep + 0.5;
          return ravel.step_x_scale[anchor_index](x2in);
        })
        .attr('y1', d => { return ravel.step_y_scale(d.sender_entity + 0.5); })
        .attr('y2', d => { return ravel.step_y_scale(d.receiver_entity + 0.5); });

      if( RV.ravelView.show_lines( anchor_index ) ) {

        msgs.enter().append('line')
          .attr('class', 'ravel message')
          .attr('x1', d => { return ravel.step_x_scale[anchor_index](d.sendstep + 0.5); })
          .attr('x2', d => { return ravel.step_x_scale[anchor_index](d.recvstep + 0.5); })
          .attr('y1', d => { return ravel.step_y_scale(d.sender_entity + 0.5); })
          .attr('y2', d => { return ravel.step_y_scale(d.receiver_entity + 0.5); });
      }

      msgs.exit().remove();
    }

    $('.event.ravel, rect.parent').RavelTooltip();
  };



  ravel.draw_step_overview = function () {

    var rects;

    rects = ravel.mini_bars.selectAll('.overviewBar_step')
      .data(ravel.data.overview)
      .attr('x', (d, i) => { return i; })
      .attr('height', d => { return ravel.miniHeight - ravel.mini_y_scale(d); });

    rects.enter().append('rect')
      .attr('x', (d, i) => { return i; })
      .attr('width', 1)
      .attr('y', d => { return ravel.miniHeight - ravel.mini_y_scale(d); })
      .attr('height', d => { return ravel.mini_y_scale(d); })
      .attr('class', 'overviewBar overviewBar_step');

    rects.exit().remove();
  };

  //  This fires anytime the graph moves
  ravel.gantt_brush_step_function = function ( index ) {
    // ignore brush-by-zoom
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
    if (ravel.gantt_brush_step_group[index] === undefined) return;

    var s = d3.event.selection || ravel.step_mini_x_scale[index].range();

    ravel.step_x_scale[index].domain(s.map(ravel.step_mini_x_scale[index].invert, ravel.step_mini_x_scale[index]));

    var trans = d3.zoomIdentity
      .scale(ravel.gantt_width / (s[1] - s[0]))
      .translate(-s[0], 0);

    //  This updates the location of the mouse wheel,
    //  to prevent jitter after scrolling the overview.
    ravel.logical[index].call(ravel.step_zoom[index].transform, trans);

    var step_x_domain = ravel.step_x_scale[index].domain();
    var domain0 = Math.round(step_x_domain[0]);
    var domain1 = Math.round(step_x_domain[1]);

    ravel.get_step_data(d3.max([0, domain0]), domain1, index);
  };


  ravel.step_zoom_function = function (  gantt_brush_step, gantt_brush_step_group, step_x_scale, step_mini_x_scale, index ) {
    // ignore zoom-by-brush, and onload call.
    if ( (!d3.event || !d3.event.transform) || d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") {
      return;
    }  else {

      var e_transform = d3.event.transform;
      var xscale_domain = e_transform.rescaleX(step_mini_x_scale).domain();

      step_x_scale.domain(xscale_domain);

      var mapped = step_x_scale.range().map(e_transform.invertX, e_transform);

      //  This updates the overview bar at the bottom with the new position and length.
      gantt_brush_step_group.call(gantt_brush_step.move, mapped );

      var domain = step_x_scale.domain();
      var max = d3.max([0, Math.round(domain[0])]);

      ravel.get_step_data(max, Math.round(domain[1]), index);
    }
  }; // End step_zoom_function();


  //  This function decides which labels to show: s, w, etc
  //  S is MPI_Isend, W is MPI_WAit, etc.
  ravel.filter_step_labels = function (events, bar_width) {

    var labels = [];
    var multiplier = ravel.physical_font_metrics.width;

    for (var i = 0; i < events.length; i++) {

      var evt = events[i];

      //  We're no longer using word length because we only show 1 charachter (s) instead of MPI_send.
      var word_len = ravel.data.functions[evt.function].length;
      var fun_len = 1;

      if (bar_width > multiplier * fun_len) {
        labels.push(evt);
      }
    }

    return labels;
  };

  ravel.get_step_data = function (start, stop, index) {

    if (ravel.get_data_state) {  // quickie perf hack
      return;
    }

    var tag = 'parent_anchor_' + index + ' ';

    d3.select('.' + tag + '.step_axis').call(ravel.step_x_axis[index]);
    ravel.draw_step('.' + tag, index);
  };



$.fn.RavelTooltip = function() {

  var remove_ = function() {
    $('.RavelTooltip').remove();
  };

  var show_ = function() {

    $('.RavelTooltip').remove();

    var tool_title = $(this).attr('tool_title');

    $('body').append('<div class="RavelTooltip">' + tool_title + '</div>');

    var loc = $(this).offset();

    loc.top = +loc.top + 40;
    loc.left = +loc.left;

    $('.RavelTooltip').css({
      left: loc.left + "px",
      top: loc.top + "px"
    });

  };

  return this.each( function(el) {

    $(this).on('mouseover', show_ );
    $(this).on('mouseout', remove_ );
  });
};
