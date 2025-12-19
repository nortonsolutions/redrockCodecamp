/*
*
* Norton - 2021
*       Complete the handler logic below
*       
*       
*/

function ConvertHandler() {
  
  var onewayTable = {
    gal: "l",
    lbs: "kg",
    mi: "km"
  }

  var lookupTable = {};
  Object.keys(onewayTable).forEach((key, index) => {
    lookupTable[key] = onewayTable[key];
    lookupTable[onewayTable[key]] = key;
  })

  this.getNum = function(input) {

    var value;
    var index = input.split(/[A-Za-z]/)[0].length;
    value = input.substring(0,index);

    if (value.length == 0) value = "1";

    if (! value.match(/^[0-9.\/]+$/)) {
      value="invalid";
      return value;
    }

    // Only one slash for a fraction
    if (value.includes('/') && value.match(/\/.*\//)) {
      value="invalid";
      return value;
    }

    // Only one decimal point
    if (value.includes('.') && ! value.match(/\d\.(?!.*\.)/)) {
      value="invalid";
      return value;
    }

    // Complex (e.g. 2.4/3 = two and four thirds)
    if (value.includes('.') && value.includes('/')) {

      var decimalIndex = value.split(/\./)[0].length;
      var baseNumber = value.substring(0,decimalIndex);
      var fractional = value.substring(decimalIndex + 1, value.length);

      if (baseNumber.length = 0) baseNumber = 0;

      var divideIndex = fractional.split(/\//)[0].length;
      var numerator = fractional.substring(0,divideIndex);
      var denominator = fractional.substring(divideIndex + 1, fractional.length);

      var fraction = numerator / denominator;

      value = Number(baseNumber) + Number(fraction);

    // Fractions
    } else if (value.includes('/')) {

      var divideIndex = value.split(/\//)[0].length;
      var numerator = value.substring(0,divideIndex);
      var denominator = value.substring(divideIndex + 1, value.length);

      value = Number(numerator) / Number(denominator);

    }

    return Number(value);

  };
  
  this.getUnit = function(input) {

    input = String(input).toLowerCase();

    var index = input.split(/[A-Za-z]/)[0].length;
    var unit = input.substring(index,input.length);

    if (! Object.keys(lookupTable).includes(unit)) {
      unit = "invalid";
    }

    return unit;

  };
  
  this.getReturnUnit = function(initUnit) {
    return lookupTable[initUnit];
  };

  this.spellOutUnit = function(unit) {

    var lookupTable = {
      gal: "gallons",
      km: "kilometers",
      lbs: "pounds",
      l: "liters",
      kg: "kilograms",
      mi: "miles"
    };

    return lookupTable[unit];

  };
  
  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    var result;
    switch (initUnit) {
      case "gal": result = galToL * initNum; break;
      case "l": result = (1/galToL) * initNum; break;
      case "lbs": result = lbsToKg * initNum; break;
      case "kg": result = (1/lbsToKg) * initNum; break;
      case "mi": result = miToKm * initNum; break;
      case "km": result = (1/miToKm) * initNum; break;
    }
    
    return result;
  };
  
  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    var result;
    
    var returnNumString = String(returnNum);
    if (returnNumString.includes('.') && returnNumString.split('.')[1].length > 5) {
      returnNum = Number(returnNum).toFixed(5);
    }
    result = initNum + " " + this.spellOutUnit(initUnit) + " converts to " + returnNum + " " + this.spellOutUnit(returnUnit)
    return result;
  };
  
}

module.exports = ConvertHandler;
