"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _util = require("util");
var _got = _interopRequireDefault(require("got"));
var _toughCookie = require("tough-cookie");
var _serializeError = require("serialize-error");
var _httpProxyAgent = _interopRequireDefault(require("http-proxy-agent"));
var _httpsProxyAgent = _interopRequireDefault(require("https-proxy-agent"));
var _utilities = require("../utilities");
var _Logger = _interopRequireDefault(require("../Logger"));
var _getAllCookies = _interopRequireDefault(require("./getAllCookies"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = _Logger.default.child({
  namespace: 'proxyRequest'
});
const defaultChromeHeaders = {
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'en'
};

/**
 * @see https://github.com/puppeteer/puppeteer/issues/5364
 */
const appendDefaultChromeHeaders = request => {
  let nextHeaders = {
    ...defaultChromeHeaders,
    ...request.headers(),
    host: new URL(request.url()).hostname
  };
  if (request.isNavigationRequest()) {
    nextHeaders = {
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      ...nextHeaders
    };
  } else {
    nextHeaders = {
      'sec-fetch-mode': 'no-cors',
      'sec-fetch-site': 'same-origin',
      ...nextHeaders
    };
  }
  return nextHeaders;
};
const proxyRequest = async proxyRequestConfiguration => {
  const {
    page,
    proxyUrl,
    request
  } = proxyRequestConfiguration;

  // e.g. data URI scheme
  if (!request.url().startsWith('http://') && !request.url().startsWith('https://')) {
    request.continue();
    return;
  }
  const headers = appendDefaultChromeHeaders(request);
  log.debug({
    body: request.postData(),
    headers,
    method: request.method(),
    url: request.url()
  }, 'making a request using HTTP proxy');
  const puppeteerCookies = (await (0, _getAllCookies.default)(page)).cookies;
  const cookieJar = _toughCookie.CookieJar.deserializeSync({
    cookies: puppeteerCookies.map(puppeteerCookie => {
      return (0, _utilities.formatPuppeteerCookieAsToughCookie)(puppeteerCookie);
    }),
    rejectPublicSuffixes: true,
    storeType: 'MemoryCookieStore',
    version: 'tough-cookie@2.0.0'
  });
  const getCookieString = (0, _util.promisify)(cookieJar.getCookieString.bind(cookieJar));
  const setCookie = (0, _util.promisify)(cookieJar.setCookie.bind(cookieJar));
  const gotCookieJar = {
    getCookieString: url => {
      return getCookieString(url);
    },
    setCookie: (rawCookie, url) => {
      return setCookie(rawCookie, url, {
        ignoreError: true
      });
    }
  };
  let agent;
  if (proxyRequestConfiguration.agent) {
    agent = proxyRequestConfiguration.agent;
  } else if (proxyUrl) {
    agent = {
      http: new _httpProxyAgent.default(proxyUrl.http || proxyUrl),
      https: new _httpsProxyAgent.default(proxyUrl.https || proxyUrl)
    };
  }
  let response;
  try {
    response = await (0, _got.default)(request.url(), {
      agent,
      body: request.postData(),
      cookieJar: gotCookieJar,
      followRedirect: false,
      headers,
      method: request.method(),
      responseType: 'buffer',
      retry: 0,
      throwHttpErrors: false
    });
  } catch (error) {
    log.error({
      error: (0, _serializeError.serializeError)(error)
    }, 'could not complete HTTP request due to an error');
    request.abort();
    return;
  }
  if (!response) {
    throw new Error('response object is not present.');
  }
  await request.respond({
    body: response.body,
    headers: response.headers,
    status: response.statusCode
  });
};
const proxyRequest0 = async proxyRequestConfiguration => {
  try {
    await proxyRequest(proxyRequestConfiguration);
  } catch (error) {
    log.error({
      error: (0, _serializeError.serializeError)(error)
    }, 'could not proxy request due to an error');
    proxyRequestConfiguration.request.abort();
  }
};
var _default = proxyRequest0;
exports.default = _default;
//# sourceMappingURL=proxyRequest.js.map