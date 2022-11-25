"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const formatPuppeteerCookieAsToughCookie = cookie => {
  return {
    creation: new Date().toISOString(),
    domain: cookie.domain.replace(/^\./, ''),
    expires: cookie.expires === -1 ? Infinity : new Date(cookie.expires * 1000).toISOString(),
    hostOnly: !cookie.domain.startsWith('.'),
    httpOnly: cookie.httpOnly,
    key: cookie.name,
    lastAccessed: new Date().toISOString(),
    path: cookie.path,
    secure: cookie.secure,
    value: cookie.value
  };
};
var _default = formatPuppeteerCookieAsToughCookie;
exports.default = _default;
//# sourceMappingURL=formatPuppeteerCookieAsToughCookie.js.map