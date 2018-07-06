/*
   TODO:
   - wire up actual file location to the thing being used.
   - be able to handle resize width?
   - Show tooltip with word representation for each div element?
   - BUG: (small) Extent is slightly not aligned with initial graph output, resulting in a drag jitter when it starts.
   - setTimeout: BUG: still need to fix initial render -> step doesn't appear until you move the brush.

   DONE:
   - Toggle between the 2 graphs
   - Toggle Messaging Lines on and off.
   - Remove CS, C
   - RGB Green to Red. 0 - 255.
   - Do Scaling to map maximum value to max of 255, maybe use D3
   - close the Ravel diagram button - get it working.
   - make w and s show up, even if the box width reduces.  Line 790 (renders the DIV)
   - Show S,W, etc legend on both graphs.
   - Genereate some fake data to 0-30 (mostly),  some between 31 - 255 -> fake data skewed to one side.
   - Add Toolbar and description to the 2 toggle switches at the top.
   - Lateness -> Legend. -> specify the time period for each one.
   - don't show switches twice when re-rendering.
   - Fixed chart disconnection when switching between logical and physical
   - Fixed: scrolling redraws the lines.
   - Fixed: Initial event.transform error onload.
   - Fixed: Extra characters at the beginning of the Chart, at the top left.
   - rebase with master to get the latest.
   - Work around for 4x Event handler on drill down.
   - Fixed: Sliding the extant doesn't update the mouse location, so if you use the scrollwheel after that there's a bug.
   - only show close ravel diagram button if there.
   - Be able to reopen ravel diagram after closing.
   - Added some error checking, function numbers.
   - MULTI INSTANCE: Split and Ravel were only designed for 1 instance, may need some work to enable more than 1 instance.
      * chart type toggle: physical and logical needs to be able to switch independently
      * overview bar needs to not be fully widened when you add a new chart.


   *********************************************************************************************************************************
   - Integration: switch between logical view and physical view and sankey (perhaps slider at the top)
   - get X index of the thing clicked
   - use X index to send this.ChartSections[x] on HcChart.vue 289, send the actual file path to render.  instead of hard codedpath.
   - At some point try out prod environment.  Setup production environment on CZ.
   - Make several data files, similar to navigate.json for each of the Tick marks and be able to show each one.
   - Be able to adjust height at the bottom of the bar adjuster.
   - refactor Ravel d3.
   - Place ravel into a Vue if needed.
 */
var RV = {};

RV.ravelView = function() {

  var toggle_view_ = function( right_toggle, that ) {

    var cr = $(that).closest('.card--raised');

    var phy_over = cr.find('.physical-div').add( cr.find('.overview-div'));
    var step_divs = cr.find('.step-div').add( cr.find('.step-overview-div'));

    var type = "Physical";

    if( right_toggle ) {

      $(step_divs).show();
      $(phy_over).hide();
      type = "Logical";

      ravel.step_zoom_function();

    } else {
      $(step_divs).hide();
      $(phy_over).show();

      //ravel.zoom_function();
    }

    $('.switch_container .chart_type').html(type);
  };

  var show_lines_ = function( anchor_index ) {
      return $(".parent_anchor_" + anchor_index).find(".ios-ui-select:eq(1)").hasClass('checked');
  };

  var toggle_lines_ = function( right_toggle, that ) {

    var cr = $(that).closest('.card--raised');
    var line = cr.find('line');

    line[right_toggle ? 'show' : 'hide']();
  };

  var reinit_ = function() {
    $('.on_top_of').html('<div class="step split split-vertical step-div"></div>' +
      '<div class="physical split split-vertical physical-div"></div>' +
      '<div class="overview.split split-vertical overview-div"></div>' +
      '<div class="overview split split-vertical step-overview-div"></div>' +
      '<div class="legend"></div>' +
      '<div class="switch_container">' +
        '<div class="switch_desc">' +
          'Chart type: <br>' +
          '<div class="chart_type">' +
          'Physical' +
          '</div>' +
        '</div>' +
        '<input class="cbox switch_view" type="checkbox"/>' +
        '<div class="switch_desc">' +
          'Show<br>' +
          'Lines:' +
        '</div>' +
        '<input class="cbox switch_lines" type="checkbox"/>' +
        '<div class="start_color"></div>' +
        '<div class="gradient_legend"></div>' +
        '<div class="end_color"></div>' +
      '</div>');
  };


  var render_ = function( parent_anchor, index ) {

    var tag = 'parent_anchor_' + index + ' ';
    RV.parent_anchor = "." + tag + " ";
    RV.parent_index = index;

    console.dir(RV.parent_anchor);

    $('.card--raised:eq(' + index + ')').addClass(tag);

    //$('.highcharts-xaxis-labels text').prepend('<div class="open_ravel_button"></div>');

    //  This code was for when we used jquery to insert it into the DOM.
    //  Now we're using the HcChart PUG template to insert it.

    $.ajax({
      mimeType: 'text/json; charset=x-user-defined',
      url: '/static/ravel/data/ravel_init.json',
      method: 'GET',
      dataType: 'json',
      data: {
        "command": 'step',/*
         "start": start,
         "stop": stop,
         "entity_start": ravel.data.entity_start,
         "entities": ravel.data.entities,
         "width": ravel.gantt_width,
         "metric": ravel.metric*/
      },
      success: function (ravel_init) {

        //reinit_();
        init_ravel();
        ravel.init(ravel_init.traceinfo);

        //  cleanup:
        $(RV.parent_anchor + '.switch_container .ios-ui-select').remove();

        var switch_view = $(RV.parent_anchor + '.switch_container .switch_view');

        switch_view.iosCheckbox({
          callback: toggle_view_
        });

        $(RV.parent_anchor + '.switch_container .switch_lines').iosCheckbox({
          callback: toggle_lines_,
          checked: true
        });

        //  Start with left toggle
        toggle_view_( false, switch_view );

        //  eventually remove this setTimeout
        setTimeout( function() {

          d3.select(RV.parent_anchor + '.step_axis').call(ravel.step_x_axis[index]);
          ravel.draw_step( RV.parent_anchor, RV.parent_index);
        }, 500);
      }
    });
  };


  return {
    show_lines: show_lines_,
    render: render_
  }
}();


 /* The Switch */
(function( $ ){
  $.fn.extend({
    iosCheckbox: function ( options ) {

      options.callback = options.callback || function() {};

      $(this).each(function (){

        /**
         * Original checkbox element
         */
        var org_checkbox = $(this);
        /**
         * iOS checkbox div
         */
        var ios_checkbox = jQuery("<div>",{class: 'ios-ui-select'}).append(jQuery("<div>",{class: 'inner'}));

        // If the original checkbox is checked, add checked class to the ios checkbox.
        if (org_checkbox.is(":checked")){
          ios_checkbox.addClass("checked");
        }

        //  Default to checked.
        if( options.checked ) {
          ios_checkbox.addClass('checked');
        }

        // Hide the original checkbox and print the new one.
        org_checkbox.hide().after(ios_checkbox);
        // Add click event listener to the ios checkbox
        ios_checkbox.click(function (){
          // Toggel the check state
          ios_checkbox.toggleClass("checked");
          // Check if the ios checkbox is checked
          if (ios_checkbox.hasClass("checked")){
            // Update state
            org_checkbox.prop('checked', true);
            options.callback( true, this );
          }else{
            // Update state
            org_checkbox.prop('checked', false);
            options.callback( false, this );
          }
        });
      });
    }
  });
})(jQuery);


//  Testing
$(document).ready( function() {

  return false;

  setTimeout( function() {
    $('text:eq(14)').trigger('click');

    setTimeout( function() {
    $('.ios-ui-select').trigger('click');
    }, 1000);
  }, 2000);
});
