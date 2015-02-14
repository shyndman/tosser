# Tosser

Evaluate [CSS calc()](https://developer.mozilla.org/en-US/docs/Web/CSS/calc)
expressions in JavaScript, in less than 1k gzipped.

This motivation behind this project was to build a tool that simplifies the
animation of an element between multiple calc()'d positions. Pixels are easier
to work with.

## Examples

### Single expression
```javascript
// Find the element to evaluate against
var container = document.body;

// Returns the length in px units (as a string)
var px = tosser.evaluateCalc('calc((50% + 10px / 3) * 6)', {
  container: container
});

// Apply style
document.querySelector('#some-element').style.width = px;
```

### Style object
```javascript
var container = document.body;
var evaledStyle = tosser.evaluateCalc({
  width: 'calc((50% + 10px) * 3)',
  height: 'calc(10% - 1px)',
  padding: '1em' // will be left untouched
}, {
  container: container
});

// Apply style
$('#some-element').css(evaledStyle);
```

### Multiple style object, same container
```javascript
var container = document.body;
var styles = [{
  width: 'calc(80% / 4 + 2px)'
}, ...];

// Precalculate values to be used across all evaluations
var containerUnits = tosser.resolveContainerUnits(container);

// Evaluate each style
var evaledStyles = styles.map(function(s) {
  return tosser.evaluateStyles(s, {
    containerUnits: containerUnits
  });
});

// Use them how you wish...
```

## Supported Units
All CSS lengths are supported.

%, px, em, ex, ch, rem, vh, vw, vmin, vmax, mm, cm, in, pt

## Installation

```sh
bower install tosser
```

## License

MIT
