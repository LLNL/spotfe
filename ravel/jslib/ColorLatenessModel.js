var RV = RV || {};

RV.ColorLatenessModel = function() {

  var model = [
    {
      from: "#32cc2a",
      to: "#d7010d"
    },
    {
      from: "#ff0000",
      to: "#00ff00"
    },
    {
      from: "#0000ff",
      to: "#00ff01"
    },
    {
      from: "#dc00ff",
      to: "#fffb00"
    },
      {
        to: "#ff2e1f",
          from: "#9ac2ff"
      }
  ];

  const USE_MODEL = 4;

  var color_function_;



  var get_model_ = function() {
    return model[USE_MODEL];
  };


  var get_ = d => {

    d.lateness = d.lateness || 0;

    if( !color_function_ ) {
      alert('Color function has not been defined.  Run RV.ColorLatenessModel.normalize( events ), so I know how to scale the colors.  Thanks.');
    }
    var rgb = color_function_(+d.lateness);

    rgb = rgb.substr(4);
    rgb = rgb.split(',');

    var ired = parseInt(rgb[0]);
    var igreen = parseInt(rgb[1]);
    var iblue = parseInt(rgb[2]);

    var green = igreen.toString(16);
    var red = ired.toString(16);
    var blue = iblue.toString(16);

    green = two_char_(green);
    red = two_char_(red);
    blue = two_char_(blue);

    return "fill: #" + red + green + blue + ';';
  };


  var two_char_ = function( x ) {
    return x.length === 1 ? "0" + x : x;
  };

  //  Scale maximum and minimum to 0.
  var normalize_ = function( events ) {

    var max = get_max_(events);
    var mod = model[USE_MODEL];

    color_function_ = d3.scaleLinear()
    .domain([0, max])
    .range([mod.from, mod.to]);
  };

    var get_max_ = function(events) {

        var max = 0;
        for( var x in events ) {

            //var color_default = (+events[x].step) + (+events[x].entity);
            events[x].lateness = events[x].lateness; // || color_default;

            if( events[x].lateness > max) {
                max = events[x].lateness;
            }
        }

        return max;
    };

  var get_min_ = function(events) {

    var min = 100000000000;
    for( var x in events ) {

      events[x].lateness = events[x].lateness || 0;

      if( events[x].lateness < min) {
        min = events[x].lateness;
      }
    }

    return min;
  };

  return {
    get_max: get_max_,
    get_min: get_min_,
    get_model: get_model_,
    normalize: normalize_,
    get: get_
  }
}();
