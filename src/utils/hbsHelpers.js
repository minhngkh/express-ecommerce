const util = require("util");

exports.comp = function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
};

exports.nullSafe = (val) => {
  return val !== null ? val : "null";
};

exports.ternary = (condition, correctVal, incorrectVal) => {
  return condition ? correctVal : incorrectVal;
};

exports.exists = (val) => {
  return val !== null && val !== undefined;
};

exports.parseJsonList = (data) => {
  const list = data.split("|");

  return list.map((e) => JSON.parse(e));
};

exports.toString = (obj) => {
  return util.inspect(obj);
};

exports.toStringList = (list) => {
  if (!Array.isArray(list)) return "[]";

  return `[${list.map((e) => `'${e}'`).join(",")}]`;
};

exports.in = (elem, list, options) => {
  if (list.indexOf(elem) > -1) {
    return options.fn(this);
  }
  return options.inverse(this);
};
