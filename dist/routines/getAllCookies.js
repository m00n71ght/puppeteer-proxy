"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * @see https://stackoverflow.com/a/59604510/368691
 */
const getAllCookies = page => {
  return page._client.send('Network.getAllCookies');
};
var _default = getAllCookies;
exports.default = _default;
//# sourceMappingURL=getAllCookies.js.map