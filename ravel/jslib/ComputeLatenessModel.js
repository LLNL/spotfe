RV.ComputeLatenessModel = function() {

    var get_earliest_enter_for_a_step_ = function( events, step ) {

      var min_enter = 100000000;

      for( var x=0; x < events.length; x++ ) {

          var ev = events[x];

          if( +step === +ev.step && min_enter > +ev.enter ) {
              min_enter = ev.enter;
          }
      }

      return min_enter;
  };

  //  get earliest enter indexed by step.
  var get_earliest_enter_ = function( events ) {

      var steps = {};

      for( var x=0; x < events.length; x++ ) {

          var event = events[x];
          steps[event.step] = get_earliest_enter_for_a_step_( events, event.step );
      }

      return steps;
  };

  var compute_ = function( events ) {

      var MAX_LATENESS = 2000;
      var earliest_enters = get_earliest_enter_( events );

      for( var x=0; x < events.length; x++ ) {

          var ev = events[x];

          events[x].lateness = ev.exit - earliest_enters[ev.step];
          events[x].lateness = Math.min( events[x].lateness, MAX_LATENESS );
      }
  };

    return {
        compute: compute_
    }
}();