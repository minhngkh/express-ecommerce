exports.pick = (obj, keys) =>
  Object.fromEntries(
    keys.filter((key) => key in obj).map((key) => [key, obj[key]]),
  );

exports.inclusivePick = (obj, keys) =>
  Object.fromEntries(keys.map((key) => [key, obj[key]]));

/** Replace keys in an object with values from a dictionary
 *
 * Example:
 * const obj = { one: '1', two : '2'};
 * const dict = { one: {vnName: 'mot'}, two: {vnName: 'hai'} };
 *
 * replaceKeys(obj, dict, 'vnName');
 *
 * // obj = { mot: '1', hai: '2' }
 *
 *
 * @param {Object} obj An object to replace keys in
 * @param {Object} dict [key: {values}] dictionary
 * @param {string} replaceWith value to replace
 * @returns {Object}
 */
exports.replaceKeys = (obj, dict, replaceWith) =>
  Object.fromEntries(obj.map((key) => [dict[key][replaceWith], obj[key]]));

/** Replace values in an object with values from a dictionary
 *
 * Example:
 * const obj = { one: '1', two : '2'};
 * const dict = { one: {roman: 'I'}, two: {roman: 'II'} };
 *
 * replaceKeys(obj, dict, 'roman');
 *
 * // obj = { one: 'I', two: 'II' }
 *
 *
 * @param {Object} obj An object to replace values in
 * @param {Object} dict [key: {values}] dictionary
 * @param {string} replaceWith value to replace
 * @returns {Object}
 */
exports.replaceValues = (obj, dict, replaceWith) =>
  Object.fromEntries(obj.map((key) => [key, dict[key][replaceWith]]));

exports.omit = (obj, keys) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key)),
  );
