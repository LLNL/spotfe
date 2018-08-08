ravel.inc_every_so = 0;

ravel.get_index = function(that) {
  return that.attr('anchor_index');
};

ravel.calculate_width = function( d ) {

  var index = ravel.get_index( $(this));
  var min = d3.min([ravel.phys_x_scale[index](d.exit), ravel.gantt_width + 5]);
  var max = d3.max([ravel.phys_x_scale[index](d.enter), -1000]);

  var width = min - max;
  return width > 0 ? width : 0;
};


ravel.draw_physical = function ( anchor_tag, phys_x_scale, anchor_index ) {

    if( ravel.physLanes ) {
      ravel.draw_legend();
      //console.log('dpi='+anchor_index);

      var rects, msgs, labels,
        minExtent = ravel.phys_x_scale[anchor_index].domain()[0],
        maxExtent = ravel.phys_x_scale[anchor_index].domain()[1],
        minEntity = ravel.phys_y_scale.domain()[0] - 1,
        maxEntity = ravel.phys_y_scale.domain()[1];

      // Remove old lane numbers
      d3.select(anchor_tag + '.laneNum').remove();

      // Add new lanes numbers
      var physLanes = ravel.physical[ anchor_index ].append('g')
        .attr('class', 'laneNum');

      var physLanesText = physLanes.selectAll('.laneText')
        .data(ravel.lanes)
        .text(function(d) { return d; })
        .attr('y', d => { return ravel.margin.top + ravel.phys_y_scale(d + 0.5); });

      physLanesText.enter().append('text')
        .text(d => { return d;})
        .attr('x', ravel.margin.left - 15)
        .attr('y', d => { return ravel.margin.top + ravel.phys_y_scale(d + 0.5); })
        .attr('dy', '0.5ex')
        .attr('text-anchor', 'start')
        .attr('class', 'laneText'); // TODO: More CSS

      var laneLines = ravel.physLanes.selectAll('.laneLines')
        .data(ravel.lanes)
        .attr('x2', ravel.gantt_width)
        .attr('y1', d => { return Math.round(ravel.phys_y_scale(d)) + 0.5; })
        .attr('y2', d => { return Math.round(ravel.phys_y_scale(d)) + 0.5; });

      if( RV.ravelView.show_lines( anchor_index ) ) {
        laneLines.enter().append('line')
          .attr('x1', 0) // function(d) { return ravel.phys_x_scale[anchor_index](minExtent); })
          .attr('y1', function(d) { return Math.round(ravel.phys_y_scale(d)) + 0.5; })
          .attr('x2', ravel.gantt_width)
          .attr('y2', function(d) {
            return Math.round(ravel.phys_y_scale(d)) + 0.5;
          })
          .attr('class', 'laneLines');
      }

      laneLines.exit().remove();

      var barHeight = 0.8 * (ravel.phys_y_scale(2.0) - ravel.phys_y_scale(1.0));

      ravel.data.parent_events = ravel.data.parent_events || [];

      // Handle the nested parents
      for (var layer = 0; layer < ravel.data.parent_events.length; layer++) {
        // TODO: Base this on a max depth
        var current_depth = ravel.phys_layers[anchor_index][layer];

        rects = current_depth.selectAll('.parent')
          .data(ravel.data.parent_events[layer], function(d) { return d.id; })
          .attr('anchor_index', anchor_index)
          .attr('x', function(d) {

            var index = ravel.get_index( $(this) );
            return d3.max([ravel.phys_x_scale[index](d.enter), -1000]);
          })
          .attr('y', function(d) { return ravel.phys_y_scale(d.entity + 0.1); })
          .attr('height', barHeight)
          .attr('width', ravel.calculate_width)
          .style('stroke-width', function(d) {
            return (d3.min([ravel.phys_x_scale[ravel.get_index( $(this) )](d.exit), ravel.gantt_width + 5]) -
            d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), -10])) > 3 ? 1 : 0;
          });

        rects.enter().append('rect')
          .attr('anchor_index', anchor_index)
          .attr('x', function(d) {

            //  These x coordinate functions only get hit on initial render.
            var i = ravel.get_index( $(this) );
            return d3.max([ravel.phys_x_scale[i](d.enter), -1000]);
          })
          .attr('y', function(d) { return ravel.phys_y_scale(d.entity + 0.1); })
          .attr('height', barHeight)
          .attr('width', ravel.calculate_width)
          .style('fill', function(d) { return ravel.parentcolor(layer); })
          .style('stroke-width', function(d) {

            var index = ravel.get_index( $(this) );
            var xscale = ravel.phys_x_scale[index](d.exit);
            var min = d3.min([xscale, ravel.gantt_width + 5]);
            var max = d3.max([ravel.phys_x_scale[index](d.enter), -10]);

            return (min - max) > 3 ? 1 : 0;
          })
          .attr('class', 'parent')
          .attr('tool_title', ravel.get_function_name_tooltip)
          //.append('svg:title')
          .text(ravel.get_function_name_tooltip);   // In the physical charts, these events known as "parent_events" in the navigate.js file - the text() is gray bar browser tooltip.

        rects.exit().remove();

        if (ravel.physical_font_metrics.height + 4 < barHeight) {
          ravel.physical_label_events = ravel.filter_physical_labels( anchor_index,
            ravel.data.parent_events[layer]
          );
        } else {
          ravel.physical_label_events = [];
        }

        labels = current_depth.selectAll('.evtText')
          .data(ravel.physical_label_events, function(d) { return d.id; })
          .attr('anchor_index', anchor_index)
          .attr('x', function(d) { return d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), -1000]) + 5; })
          .attr('y', function(d) { return ravel.phys_y_scale(d.entity + 0.1) + 2 + ravel.physical_font_metrics.height; });

        //  Physical View - Parent Events - the Gray ones.
        labels.enter().append('text')
          .attr('anchor_index', anchor_index)
          .attr('x', function(d) { return d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), -1000]) + 5; })
          .attr('y', function(d) { return ravel.phys_y_scale(d.entity + 0.1) + 2 + ravel.physical_font_metrics.height; })
          .attr('class', 'ravel evtText')
          .text(ravel.get_function_name);

        labels.exit().remove();
      }

      // Handle the comm items
      var physical_comm_items = ravel.data.events.filter(function(d) { return !d.hasOwnProperty("coalesced"); });

      rects = ravel.phys_comm_event_layer[anchor_index].selectAll('.event')
        .data(physical_comm_items, function(d) { return d.id; })
          .attr('anchor_index', anchor_index)
        .attr('x', function(d) { return d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), -1000]); })
        .attr('y', function(d) { return ravel.phys_y_scale(d.entity + 0.1); })
        .attr('height', barHeight)
        .attr('width', ravel.calculate_width)
        .style('stroke-width', function(d) {
          return (d3.min([ravel.phys_x_scale[ravel.get_index( $(this) )](d.exit), ravel.gantt_width + 5]) -
          d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), -10])) > 3 ? 1 : 0;
        });

      rects.enter().append('rect')
          .attr('anchor_index', anchor_index)
        .attr('x', function(d) {
          return d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), -1000]);
        })
        .attr('y', function(d) { return ravel.phys_y_scale(d.entity + 0.1); })
        .attr('height', barHeight)
        .attr('width', ravel.calculate_width)
        .style('stroke-width', function(d) {
          return (d3.min([ravel.phys_x_scale[ravel.get_index( $(this) )](d.exit), ravel.gantt_width + 5]) -
          d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), -10])) > 3 ? 1 : 0;
        })
        .attr('class', 'ravel event surey')
        //.append('svg:title')
        .attr('tool_title', ravel.get_function_name_tooltip)
        .text(ravel.get_function_name_tooltip);  //  Physical View - blue bars - browser tooltips.

      rects.exit().remove();

      // Labels
      if (ravel.physical_font_metrics.height + 4 < barHeight) {
        ravel.physical_label_events = ravel.filter_physical_labels( anchor_index, physical_comm_items);
      } else {
        ravel.physical_label_events = [];
      }
      labels = ravel.phys_comm_event_layer[anchor_index].selectAll('.evtText')
        .data(ravel.physical_label_events, function(d) { return d.id; })
          .attr('anchor_index', anchor_index)
        .attr('x', function(d) { return d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), 0]) + 5; })
        .attr('y', function(d) { return ravel.phys_y_scale(d.entity + 0.1) + 2 + ravel.physical_font_metrics.height; });

      //  Physical View Blue boxes
      labels.enter().append('text')
          .attr('anchor_index', anchor_index)
        .attr('x', function(d) { return d3.max([ravel.phys_x_scale[ravel.get_index( $(this) )](d.enter), 0]) + 5; })
        .attr('y', function(d) { return ravel.phys_y_scale(d.entity + 0.1) + 2 + ravel.physical_font_metrics.height; })
        .attr('class', 'ravel evtText')
        .text(ravel.get_function_name);

      labels.exit().remove();

      // Comms
      msgs = ravel.phys_comm_message_layer[anchor_index].selectAll('.message')
        .data(ravel.data.messages, function(d) { return d.id; })
        .attr('anchor_index', anchor_index)
        .attr('x1', function(d) { return ravel.phys_x_scale[ravel.get_index( $(this) )](d.sendtime); })
        .attr('x2', function(d) { return ravel.phys_x_scale[ravel.get_index( $(this) )](d.recvtime); })
        .attr('y1', function(d) { return ravel.phys_y_scale(d.sender_entity + 0.5); })
        .attr('y2', function(d) { return ravel.phys_y_scale(d.receiver_entity + 0.5); });

      if( RV.ravelView.show_lines( anchor_index ) ) {
        msgs.enter().append('line')
          .attr('class', 'ravel message')
          .attr('anchor_index', anchor_index)
          .attr('x1', function(d) { return ravel.phys_x_scale[ravel.get_index( $(this) )](d.sendtime); })
          .attr('x2', function(d) { return ravel.phys_x_scale[ravel.get_index( $(this) )](d.recvtime); })
          .attr('y1', function(d) { return ravel.phys_y_scale(d.sender_entity + 0.5); })
          .attr('y2', function(d) { return ravel.phys_y_scale(d.receiver_entity + 0.5); });
      }

      msgs.exit().remove();
    }
  };

ravel.draw_overview = function () {
  var rects;

  rects = ravel.mini_bars.selectAll('.overviewBar_phys')
    .data(ravel.data.overview)
    .attr('x', (d, i) => { return i; })
    .attr('height', d => { return ravel.miniHeight - ravel.mini_y_scale(d); });

  rects.enter().append('rect')
    .attr('x', (d, i) => { return i; })
    .attr('width', 1)
    .attr('y', d => { return ravel.miniHeight - ravel.mini_y_scale(d); })
    .attr('height', d => { return ravel.mini_y_scale(d); })
    .attr('class', 'overviewBar overviewBar_phys');

  rects.exit().remove();
};
