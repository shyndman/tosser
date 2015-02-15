/*! Tosser - v1.0.0 - 2015-02-14
 * http://github.com/shyndman/tosser/
 * Copyright (c) 2015 Scott Hyndman; Licensed MIT */
(function() {
  var tosser = window.tosser = {},
      unknownUnits = [
        'em', 'ex', 'ch', 'rem',
        'vh', 'vw', 'vmin', 'vmax'
      ],
      knownUnits = {
        'mm': 96 / 25.4,
        'cm': 96 / 2.54,
        'in': 96,
        'pt': 4 / 3
      },
      verticalStyles = {
        'top': true,
        'height': true
      },
      isCalcPattern = /^calc\(/,
      measurementHtml = buildMeasurementHtml(),
      replacementPattern = buildReplacementPattern();

  /**
   * Evaluates an object of style properties (name to value), like what you would
   * supply to `jQuery.css()`. If calc values are found, they will be converted
   * to px.
   *
   * Using options.containerUnits will result in drastically improved
   * performance when evaluating multiple calcs against a single container. It
   * can be generated using `resolveContainerUnits`.
   *
   * @param {Object<string, string>} styles
   * @param {Object} options
   *     @param {Element} options.container
   *     @param {Object<string, number>=} options.containerUnits
   *     @param {boolean} options.mutate If the style object should be mutated
   *         (default false)
   * @return {Object<string, string>}
   */
  tosser.evaluateStyles = function(styles, options) {
    var units = options.containerUnits ||
                tosser.resolveContainerUnits(options.container);

    return Object.keys(styles).reduce(function(acc, name) {
      var val = styles[name];
      acc[name] = isCalcPattern.test(val) ?
          tosser.evaluateCalc(styles[name], {
            containerUnits: units,
            vertical: !!verticalStyles[name]
          }) : val;
      return acc;
    }, options.mutate ? styles : {});
  };

  /**
   * Evaluates a calc expression in the context of a container. Either
   * options.container or options.containerUnits must be supplied.
   *
   * Using options.containerUnits will result in drastically improved
   * performance when evaluating multiple calcs against a single container. It
   * can be generated using `resolveContainerUnits`.
   *
   * @param {string} expression A calc expression.
   * @param {Object} options
   *     @param {Element} options.container
   *     @param {Object<string, number>=} options.containerUnits
   *     @param {boolean} options.vertical If this is a vertical styling
   *         property, where % units are based on the container's height
   *         (default: false)
   * @return {string} The result of the expression, in px units.
   */
  tosser.evaluateCalc = function(expression, options) {
    var units = options.containerUnits ||
                tosser.resolveContainerUnits(options.container);

    return eval(
      expression
        .trim()
        .replace(/^calc/, '')
        .replace(replacementPattern, function(m, v, _, unit) {
          var value = parseFloat(v);
          switch (unit) {
            case 'px':
              return value;
            case '%':
              return value * units[options.vertical ? 'v%' : 'h%'];
            default:
              return value * (units[unit] || knownUnits[unit]);
          }
        })) + 'px';
  };

  /**
   * Resolves and returns units that are relative to the container, or that can
   * only be determined at a point in time.
   */
  tosser.resolveContainerUnits = function(container) {
    // Use a <tosser-div> so we don't unintentionally have selectors match,
    // potentially skewing the results.
    var el = document.createElement('tosser-div');
    el.style.position = 'absolute';
    el.style.display = 'block';
    el.style.visibility = 'hidden';
    el.style.height = '100%';
    el.innerHTML = measurementHtml;
    container.insertBefore(el, container.firstChild);

    var units = unknownUnits.reduce(function(acc, unit) {
      acc[unit] = container.querySelector('.tosser--' + unit).clientWidth / 100;
      return acc;
    }, {});

    var percentEl = container.querySelector('.tosser--percent');
    units['h%'] = percentEl.clientWidth / 100;
    units['v%'] = percentEl.clientHeight / 100;

    container.removeChild(el);

    return units;
  };

  /**
   * Builds the measurement divs used to determine unit lengths in pixels.
   *
   * NOTE: Ever div is 100 units wide, which is then divided by 100 in order to
   * approximate the subpixel width of some units, without having to resort to
   * Element.getBoundingClientRect() (which is slow).
   */
  function buildMeasurementHtml() {
    var measurers = unknownUnits.map(function(unit) {
      return '<div class="tosser--' + unit + '" style="width:100' + unit + '"></div>';
    });
    measurers.push('<div class="tosser--percent" style="width:100%;height:100%"></div>');
    return measurers.join('');
  }

  /**
   * Builds the pattern used to detect CSS lengths in a calc expression.
   */
  function buildReplacementPattern() {
    var units = unknownUnits.concat(Object.keys(knownUnits)).join('|');
    return new RegExp('(\\d+(\\.\\d+)?)(' + units + '|%|px)', 'g');
  }
})();