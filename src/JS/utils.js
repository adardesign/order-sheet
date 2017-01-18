var utils = window.utils || {}

utils.format = {
  currency: function(number, options) {
    var self = this,
      defaults = {
        decorator: "$",
        free: false,
        fractionDigits: 2
      }
    options = $.extend(defaults, options);
    // first replace all ","'s
    var origValue = number;
    if (typeof number === "string") {
      number = number.replace(",", "");
    }
    //TODO impliment decorator..
    number = new Number(number);
    number = self.decimalAdjust('round', number, -2);
    number = number.toFixed(options.fractionDigits);
    if (isNaN(number)) {
      return origValue; // return original value
    }
    if (parseFloat(number) === 0 && options.free) {
      return "FREE";
    }
    number = number.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
    return options.decorator + "" + number;
  },
  capitalize: function(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },
  uppercase: function(str) {
    return str.toUpperCase();
  },
  lowercase: function(str) {
    return str.toLowerCase();
  },
  decimalAdjust: function(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  },
  pluralize: function pluralize(count, word) {
    return count === 1 ? word : word + 's';
  }
};