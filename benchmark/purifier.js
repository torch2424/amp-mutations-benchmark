/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Return an empty JsonObject or makes the passed in object literal
 * an JsonObject.
 * The JsonObject type is just a simple object that is at-dict.
 * See
 * https://github.com/google/closure-compiler/wiki/@struct-and-@dict-Annotations
 * for what a dict is type-wise.
 * The linter enforces that the argument is, in fact, at-dict like.
 * @param {!Object=} opt_initial
 * @return {!JsonObject}
 */

function dict(opt_initial) {
  // We do not copy. The linter enforces that the passed in object is a literal
  // and thus the caller cannot have a reference to it.
  return (
    /** @type {!JsonObject} */
    opt_initial || {}
  );
}

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Tries to decode a URI component, falling back to opt_fallback (or an empty
 * string)
 *
 * DO NOT import the function from this file. Instead, import
 * tryDecodeUriComponent from `src/url.js`.
 *
 * @param {string} component
 * @param {string=} fallback
 * @return {string}
 */
function tryDecodeUriComponent_(component, fallback = "") {
  try {
    return decodeURIComponent(component);
  } catch (e) {
    return fallback;
  }
}

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const regex = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 *
 * DO NOT import the function from this file. Instead, import parseQueryString
 * from `src/url.js`.
 *
 * @param {string} queryString
 * @return {!JsonObject}
 */

function parseQueryString_(queryString) {
  const params =
    /** @type {!JsonObject} */
    Object.create(null);

  if (!queryString) {
    return params;
  }

  let match;

  while ((match = regex.exec(queryString))) {
    const name = tryDecodeUriComponent_(match[1], match[1]);
    const value = match[2] ? tryDecodeUriComponent_(match[2], match[2]) : "";
    params[name] = value;
  }

  return params;
}

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @type {string} */

const version = "$internalRuntimeVersion$";
/**
 * `rtvVersion` is the prefixed version we serve off of the cdn.
 * The prefix denotes canary(00) or prod(01) or an experiment version ( > 01).
 * @type {string}
 */

let rtvVersion = "";
/**
 * Provides info about the current app.
 * @param {?Window=} opt_win
 * @return {!ModeDef}
 */

function getMode(opt_win) {
  const win = opt_win || self;

  if (win.AMP_MODE) {
    return win.AMP_MODE;
  }

  return (win.AMP_MODE = getMode_(win));
}
/**
 * Provides info about the current app.
 * @param {!Window} win
 * @return {!ModeDef}
 */

function getMode_(win) {
  // TODO(erwinmombay): simplify the logic here
  const AMP_CONFIG = self.AMP_CONFIG || {}; // Magic constants that are replaced by closure compiler.
  // IS_MINIFIED is always replaced with true when closure compiler is used
  // while IS_DEV is only replaced when `gulp dist` is called without the
  // --fortesting flag.

  const IS_DEV = true;
  const IS_MINIFIED = false;
  const localDevEnabled = !!AMP_CONFIG.localDev;
  const runningTests =
    !!AMP_CONFIG.test || (IS_DEV && !!(win.AMP_TEST || win.__karma__));
  const isLocalDev = IS_DEV && (localDevEnabled || runningTests);
  const hashQuery = parseQueryString_(
    // location.originalHash is set by the viewer when it removes the fragment
    // from the URL.
    win.location.originalHash || win.location.hash
  );
  const singlePassType = AMP_CONFIG.spt;
  const searchQuery = parseQueryString_(win.location.search);

  if (!rtvVersion) {
    rtvVersion = getRtvVersion(win, isLocalDev);
  } // The `minified`, `test` and `localDev` properties are replaced
  // as boolean literals when we run `gulp dist` without the `--fortesting`
  // flags. This improved DCE on the production file we deploy as the code
  // paths for localhost/testing/development are eliminated.

  return {
    localDev: isLocalDev,
    // Triggers validation or enable pub level logging. Validation can be
    // bypassed via #validate=0.
    // Note that AMP_DEV_MODE flag is used for testing purposes.
    development: !!(hashQuery["development"] == "1" || win.AMP_DEV_MODE),
    examiner: hashQuery["development"] == "2",
    // Allows filtering validation errors by error category. For the
    // available categories, see ErrorCategory in validator/validator.proto.
    filter: hashQuery["filter"],
    // amp-geo override
    geoOverride: hashQuery["amp-geo"],
    minified: IS_MINIFIED,
    // Whether document is in an amp-lite viewer. It signal that the user
    // would prefer to use less bandwidth.
    lite: searchQuery["amp_lite"] != undefined,
    test: runningTests,
    log: hashQuery["log"],
    version,
    rtvVersion,
    singlePassType
  };
}
/**
 * Retrieve the `rtvVersion` which will have a numeric prefix
 * denoting canary/prod/experiment (unless `isLocalDev` is true).
 *
 * @param {!Window} win
 * @param {boolean} isLocalDev
 * @return {string}
 */

function getRtvVersion(win, isLocalDev) {
  // If it's local dev then we won't actually have a full version so
  // just use the version.
  if (isLocalDev) {
    return version;
  }

  if (win.AMP_CONFIG && win.AMP_CONFIG.v) {
    return win.AMP_CONFIG.v;
  } // Currently `$internalRuntimeVersion$` and thus `mode.version` contain only
  // major version. The full version however must also carry the minor version.
  // We will default to production default `01` minor version for now.
  // TODO(erwinmombay): decide whether $internalRuntimeVersion$ should contain
  // minor version.

  return `01${version}`;
}

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Triple zero width space.
 *
 * This is added to user error messages, so that we can later identify
 * them, when the only thing that we have is the message. This is the
 * case in many browsers when the global exception handler is invoked.
 *
 * @const {string}
 */

const USER_ERROR_SENTINEL = "\u200B\u200B\u200B";
/**
 * Four zero width space.
 *
 * @const {string}
 */

const USER_ERROR_EMBED_SENTINEL = "\u200B\u200B\u200B\u200B";
/**
 * @enum {number}
 * @private Visible for testing only.
 */

const LogLevel = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  FINE: 4
};
/**
 * Cache for logs. We do not use a Service since the service module depends
 * on Log and closure literally can't even.
 * @type {{user: ?Log, dev: ?Log, userForEmbed: ?Log}}
 */

self.log = self.log || {
  user: null,
  dev: null,
  userForEmbed: null
};
const logs = self.log;
/**
 * Eventually holds a constructor for Log objects. Lazily initialized, so we
 * can avoid ever referencing the real constructor except in JS binaries
 * that actually want to include the implementation.
 * @type {?Function}
 */

let logConstructor = null;
/**
 * Publisher level log.
 *
 * Enabled in the following conditions:
 *  1. Not disabled using `#log=0`.
 *  2. Development mode is enabled via `#development=1` or logging is explicitly
 *     enabled via `#log=D` where D >= 1.
 *  3. AMP.setLogLevel(D) is called, where D >= 1.
 *
 * @param {!Element=} opt_element
 * @return {!Log}
 */

function user$1(opt_element) {
  if (!logs.user) {
    logs.user = getUserLogger(USER_ERROR_SENTINEL);
  }

  if (!isFromEmbed(logs.user.win, opt_element)) {
    return logs.user;
  } else {
    if (logs.userForEmbed) {
      return logs.userForEmbed;
    }

    return (logs.userForEmbed = getUserLogger(USER_ERROR_EMBED_SENTINEL));
  }
}
/**
 * Getter for user logger
 * @param {string=} suffix
 * @return {!Log}
 */

function getUserLogger(suffix) {
  return {};
}
/**
 * AMP development log. Calls to `devLog().assert` and `dev.fine` are stripped
 * in the PROD binary. However, `devLog().assert` result is preserved in either
 * case.
 *
 * Enabled in the following conditions:
 *  1. Not disabled using `#log=0`.
 *  2. Logging is explicitly enabled via `#log=D`, where D >= 2.
 *  3. AMP.setLogLevel(D) is called, where D >= 2.
 *
 * @return {!Log}
 */

function dev() {
  return {};
}
/**
 * @param {!Window} win
 * @param {!Element=} opt_element
 * @return {boolean} isEmbed
 */

function isFromEmbed(win, opt_element) {
  if (!opt_element) {
    return false;
  }

  return opt_element.ownerDocument.defaultView != win;
}
/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {string=} opt_message The assertion message
 * @param {*=} opt_1 Optional argument (Var arg as individual params for better
 * @param {*=} opt_2 Optional argument inlining)
 * @param {*=} opt_3 Optional argument
 * @param {*=} opt_4 Optional argument
 * @param {*=} opt_5 Optional argument
 * @param {*=} opt_6 Optional argument
 * @param {*=} opt_7 Optional argument
 * @param {*=} opt_8 Optional argument
 * @param {*=} opt_9 Optional argument
 * @return {T} The value of shouldBeTrueish.
 * @template T
 * eslint "google-camelcase/google-camelcase": 0
 */

function devAssert(
  shouldBeTrueish,
  opt_message,
  opt_1,
  opt_2,
  opt_3,
  opt_4,
  opt_5,
  opt_6,
  opt_7,
  opt_8,
  opt_9
) {
  return dev();
  /*Orig call*/
  // assert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9);
}

/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {string=} opt_message The assertion message
 * @param {*=} opt_1 Optional argument (Var arg as individual params for better
 * @param {*=} opt_2 Optional argument inlining)
 * @param {*=} opt_3 Optional argument
 * @param {*=} opt_4 Optional argument
 * @param {*=} opt_5 Optional argument
 * @param {*=} opt_6 Optional argument
 * @param {*=} opt_7 Optional argument
 * @param {*=} opt_8 Optional argument
 * @param {*=} opt_9 Optional argument
 * @return {T} The value of shouldBeTrueish.
 * @template T
 * eslint "google-camelcase/google-camelcase": 0
 */

function userAssert(
  shouldBeTrueish,
  opt_message,
  opt_1,
  opt_2,
  opt_3,
  opt_4,
  opt_5,
  opt_6,
  opt_7,
  opt_8,
  opt_9
) {
  // return user$1().
  /*Orig call*/
  // assert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9);
}

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @const {string} */

const TAG = "lru-cache";
/**
 * @template T
 */

class LruCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    /** @private @const {number} */
    this.capacity_ = capacity;
    /** @private {number} */

    this.size_ = 0;
    /**
     * An incrementing counter to define the last access.
     * @private {number}
     */

    this.access_ = 0;
    /** @private {!Object<(number|string), {payload: T, access: number}>} */

    this.cache_ = Object.create(null);
  }
  /**
   * Returns whether key is cached.
   *
   * @param {number|string} key
   * @return {boolean}
   */

  has(key) {
    return !!this.cache_[key];
  }
  /**
   * @param {number|string} key
   * @return {T} The cached payload.
   */

  get(key) {
    const cacheable = this.cache_[key];

    if (cacheable) {
      cacheable.access = ++this.access_;
      return cacheable.payload;
    }

    return undefined;
  }
  /**
   * @param {number|string} key
   * @param {T} payload The payload to cache.
   */

  put(key, payload) {
    if (!this.has(key)) {
      this.size_++;
    }

    this.cache_[key] = {
      payload,
      access: this.access_
    };
    this.evict_();
  }
  /**
   * Evicts the oldest cache entry, if we've exceeded capacity.
   */

  evict_() {
    if (this.size_ <= this.capacity_) {
      return;
    }

    // dev().warn(TAG, 'Trimming LRU cache');
    const cache = this.cache_;
    let oldest = this.access_ + 1;
    let oldestKey;

    for (const key in cache) {
      const { access } = cache[key];

      if (access < oldest) {
        oldest = access;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      delete cache[oldestKey];
      this.size_--;
    }
  }
}

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Polyfill for String.prototype.startsWith.
 * @param {string} string
 * @param {string} prefix
 * @return {boolean}
 */

function startsWith(string, prefix) {
  if (prefix.length > string.length) {
    return false;
  }

  return string.lastIndexOf(prefix, 0) == 0;
}

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Allows for runtime configuration. Internally, the runtime should
 * use the src/config.js module for various constants. We can use the
 * AMP_CONFIG global to translate user-defined configurations to this
 * module.
 * @type {!Object<string, string>}
 */
const env = self.AMP_CONFIG || {};
const thirdPartyFrameRegex =
  typeof env["thirdPartyFrameRegex"] == "string"
    ? new RegExp(env["thirdPartyFrameRegex"])
    : env["thirdPartyFrameRegex"];
const cdnProxyRegex =
  typeof env["cdnProxyRegex"] == "string"
    ? new RegExp(env["cdnProxyRegex"])
    : env["cdnProxyRegex"];
/** @type {!Object<string, string|boolean|RegExp>} */

const urls = {
  thirdParty: env["thirdPartyUrl"] || "https://3p.ampproject.net",
  thirdPartyFrameHost: env["thirdPartyFrameHost"] || "ampproject.net",
  thirdPartyFrameRegex: thirdPartyFrameRegex || /^d-\d+\.ampproject\.net$/,
  cdn: env["cdnUrl"] || "https://cdn.ampproject.org",

  /* Note that cdnProxyRegex is only ever checked against origins
   * (proto://host[:port]) so does not need to consider path
   */
  cdnProxyRegex:
    cdnProxyRegex || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/,
  localhostRegex: /^https?:\/\/localhost(:\d+)?$/,
  errorReporting:
    env["errorReportingUrl"] || "https://amp-error-reporting.appspot.com/r",
  localDev: env["localDev"] || false
};

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @type {!JsonObject}
 */

const SERVING_TYPE_PREFIX = dict({
  // No viewer
  c: true,
  // In viewer
  v: true,
  // Ad landing page
  a: true,
  // Ad
  ad: true
});
/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */

let a;
/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {LruCache}
 */

let cache;
/** @private @const Matches amp_js_* parameters in query string. */

const AMP_JS_PARAMS_REGEX = /[?&]amp_js[^&]*/;
/** @private @const Matches amp_gsa parameters in query string. */

const AMP_GSA_PARAMS_REGEX = /[?&]amp_gsa[^&]*/;
/** @private @const Matches amp_r parameters in query string. */

const AMP_R_PARAMS_REGEX = /[?&]amp_r[^&]*/;
/** @private @const Matches amp_kit parameters in query string. */

const AMP_KIT_PARAMS_REGEX = /[?&]amp_kit[^&]*/;
/** @private @const Matches usqp parameters from goog experiment in query string. */

const GOOGLE_EXPERIMENT_PARAMS_REGEX = /[?&]usqp[^&]*/;
/** @const {string} */

const SOURCE_ORIGIN_PARAM = "__amp_source_origin";
/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {string} url
 * @param {boolean=} opt_nocache
 * @return {!Location}
 */

function parseUrlDeprecated(url, opt_nocache) {
  if (!a) {
    a =
      /** @type {!HTMLAnchorElement} */
      self.document.createElement("a");
    cache = self.UrlCache || (self.UrlCache = new LruCache(100));
  }

  return parseUrlWithA(a, url, opt_nocache ? null : cache);
}
/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {!HTMLAnchorElement} a
 * @param {string} url
 * @param {LruCache=} opt_cache
 * @return {!Location}
 * @restricted
 */

function parseUrlWithA(a, url, opt_cache) {
  if (opt_cache && opt_cache.has(url)) {
    return opt_cache.get(url);
  }

  a.href = url; // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick #3449.

  if (!a.protocol) {
    a.href = a.href;
  }

  const info =
    /** @type {!Location} */
    {
      href: a.href,
      protocol: a.protocol,
      host: a.host,
      hostname: a.hostname,
      port: a.port == "0" ? "" : a.port,
      pathname: a.pathname,
      search: a.search,
      hash: a.hash,
      origin: null // Set below.
    }; // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.

  if (info.pathname[0] !== "/") {
    info.pathname = "/" + info.pathname;
  } // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.

  if (
    (info.protocol == "http:" && info.port == 80) ||
    (info.protocol == "https:" && info.port == 443)
  ) {
    info.port = "";
    info.host = info.hostname;
  } // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.

  if (a.origin && a.origin != "null") {
    info.origin = a.origin;
  } else if (info.protocol == "data:" || !info.host) {
    info.origin = info.href;
  } else {
    info.origin = info.protocol + "//" + info.host;
  } // Freeze during testing to avoid accidental mutation.

  const frozen = getMode().test && Object.freeze ? Object.freeze(info) : info;

  if (opt_cache) {
    opt_cache.put(url, frozen);
  }

  return frozen;
}
/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 *
 * This function is implemented in a separate file to avoid a circular
 * dependency.
 *
 * @param {string} queryString
 * @return {!JsonObject}
 */

function parseQueryString(queryString) {
  return parseQueryString_(queryString);
}
/**
 * Returns whether the URL has the origin of a proxy.
 * @param {string|!Location} url URL of an AMP document.
 * @return {boolean}
 */

function isProxyOrigin(url) {
  if (typeof url == "string") {
    url = parseUrlDeprecated(url);
  }

  return urls.cdnProxyRegex.test(url.origin);
}
/**
 * Removes parameters that start with amp js parameter pattern and returns the
 * new search string.
 * @param {string} urlSearch
 * @return {string}
 */

function removeAmpJsParamsFromSearch(urlSearch) {
  if (!urlSearch || urlSearch == "?") {
    return "";
  }

  const search = urlSearch
    .replace(AMP_JS_PARAMS_REGEX, "")
    .replace(AMP_GSA_PARAMS_REGEX, "")
    .replace(AMP_R_PARAMS_REGEX, "")
    .replace(AMP_KIT_PARAMS_REGEX, "")
    .replace(GOOGLE_EXPERIMENT_PARAMS_REGEX, "")
    .replace(/^[?&]/, ""); // Removes first ? or &.

  return search ? "?" + search : "";
}
/**
 * Returns the source URL of an AMP document for documents served
 * on a proxy origin or directly.
 * @param {string|!Location} url URL of an AMP document.
 * @return {string}
 */

function getSourceUrl(url) {
  if (typeof url == "string") {
    url = parseUrlDeprecated(url);
  } // Not a proxy URL - return the URL itself.

  if (!isProxyOrigin(url)) {
    return url.href;
  } // A proxy URL.
  // Example path that is being matched here.
  // https://cdn.ampproject.org/c/s/www.origin.com/foo/
  // The /s/ is optional and signals a secure origin.

  const path = url.pathname.split("/");
  const prefix = path[1];
  // userAssert(SERVING_TYPE_PREFIX[prefix], 'Unknown path prefix in url %s', url.href);
  const domainOrHttpsSignal = path[2];
  const origin =
    domainOrHttpsSignal == "s"
      ? "https://" + decodeURIComponent(path[3])
      : "http://" + decodeURIComponent(domainOrHttpsSignal); // Sanity test that what we found looks like a domain.

  // userAssert(origin.indexOf('.') > 0, 'Expected a . in origin %s', origin);
  path.splice(1, domainOrHttpsSignal == "s" ? 3 : 2);
  return (
    origin +
    path.join("/") +
    removeAmpJsParamsFromSearch(url.search) +
    (url.hash || "")
  );
}
/**
 * Returns absolute URL resolved based on the relative URL and the base.
 * @param {string} relativeUrlString
 * @param {string|!Location} baseUrl
 * @return {string}
 */

function resolveRelativeUrl(relativeUrlString, baseUrl) {
  if (typeof baseUrl == "string") {
    baseUrl = parseUrlDeprecated(baseUrl);
  }

  if (typeof URL == "function") {
    return new URL(relativeUrlString, baseUrl.href).toString();
  }

  return resolveRelativeUrlFallback_(relativeUrlString, baseUrl);
}
/**
 * Fallback for URL resolver when URL class is not available.
 * @param {string} relativeUrlString
 * @param {string|!Location} baseUrl
 * @return {string}
 * @private Visible for testing.
 */

function resolveRelativeUrlFallback_(relativeUrlString, baseUrl) {
  if (typeof baseUrl == "string") {
    baseUrl = parseUrlDeprecated(baseUrl);
  }

  relativeUrlString = relativeUrlString.replace(/\\/g, "/");
  const relativeUrl = parseUrlDeprecated(relativeUrlString); // Absolute URL.

  if (startsWith(relativeUrlString.toLowerCase(), relativeUrl.protocol)) {
    return relativeUrl.href;
  } // Protocol-relative URL.

  if (startsWith(relativeUrlString, "//")) {
    return baseUrl.protocol + relativeUrlString;
  } // Absolute path.

  if (startsWith(relativeUrlString, "/")) {
    return baseUrl.origin + relativeUrlString;
  } // Relative path.

  return (
    baseUrl.origin +
    baseUrl.pathname.replace(/\/[^/]*$/, "/") +
    relativeUrlString
  );
}
/**
 * Checks if the url has __amp_source_origin and throws if it does.
 * @param {string} url
 */

function checkCorsUrl(url) {
  const parsedUrl = parseUrlDeprecated(url);
  const query = parseQueryString(parsedUrl.search);
  // userAssert(!(SOURCE_ORIGIN_PARAM in query), 'Source origin is not allowed in %s', url);
}

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * General grammar: (URL [NUM[w|x]],)*
 * Example 1: "image1.png 100w, image2.png 50w"
 * Example 2: "image1.png 2x, image2.png"
 * Example 3: "image1,100w.png 100w, image2.png 50w"
 */

const srcsetRegex = /(\S+)(?:\s+(?:(-?\d+(?:\.\d+)?)([a-zA-Z]*)))?\s*(?:,|$)/g;
/**
 * Parses the text representation of srcset into Srcset object.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes.
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
 * @param {string} s
 * @return {!Srcset}
 */

function parseSrcset(s) {
  const sources = [];
  let match;

  while ((match = srcsetRegex.exec(s))) {
    const url = match[1];
    let width, dpr;

    if (match[2]) {
      const type = match[3].toLowerCase();

      if (type == "w") {
        width = parseInt(match[2], 10);
      } else if (type == "x") {
        dpr = parseFloat(match[2]);
      } else {
        continue;
      }
    } else {
      // If no "w" or "x" specified, we assume it's "1x".
      dpr = 1;
    }

    sources.push({
      url,
      width,
      dpr
    });
  }

  return new Srcset(sources);
}
/**
 * A srcset object contains one or more sources.
 *
 * There are two types of sources: width-based and DPR-based. Only one type
 * of sources allowed to be specified within a single srcset. Depending on a
 * usecase, the components are free to choose any source that best corresponds
 * to the required rendering quality and network and CPU conditions. See
 * "select" method for details on how this selection is performed.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
 */

class Srcset {
  /**
   * @param {!Array<!SrcsetSourceDef>} sources
   */
  constructor(sources) {
    // userAssert(sources.length > 0, 'Srcset must have at least one source');
    /** @private @const {!Array<!SrcsetSourceDef>} */

    this.sources_ = sources; // Only one type of source specified can be used - width or DPR.

    let hasWidth = false;
    let hasDpr = false;

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      hasWidth = hasWidth || !!source.width;
      hasDpr = hasDpr || !!source.dpr;
    }

    // userAssert(!!(hasWidth ^ hasDpr), 'Srcset must have width or dpr sources, but not both'); // Source and assert duplicates.

    sources.sort(hasWidth ? sortByWidth : sortByDpr);
    /** @private @const {boolean} */

    this.widthBased_ = hasWidth;
  }
  /**
   * Performs selection for specified width and DPR. Here, width is the width
   * in screen pixels and DPR is the device-pixel-ratio or pixel density of
   * the device. Depending on the circumstances, such as low network conditions,
   * it's possible to manipulate the result of this method by passing a lower
   * DPR value.
   *
   * The source selection depends on whether this is width-based or DPR-based
   * srcset.
   *
   * In a width-based source, the source's width is the physical width of a
   * resource (e.g. an image). Depending on the provided DPR, this width is
   * converted to the screen pixels as following:
   *   pixelWidth = sourceWidth / DPR
   *
   * Then, the source closest to the requested "width" is selected using
   * the "pixelWidth". The slight preference is given to the bigger sources to
   * ensure the most optimal quality.
   *
   * In a DPR-based source, the source's DPR is used to return the source that
   * is closest to the requested DPR.
   *
   * Based on
   * http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
   * @param {number} width
   * @param {number} dpr
   * @return {string}
   */

  select(width, dpr) {
    devAssert(width, "width=%s", width);
    devAssert(dpr, "dpr=%s", dpr);
    let index = 0;

    if (this.widthBased_) {
      index = this.selectByWidth_(width * dpr);
    } else {
      index = this.selectByDpr_(dpr);
    }

    return this.sources_[index].url;
  }
  /**
   * @param {number} width
   * @return {number}
   * @private
   */

  selectByWidth_(width) {
    const sources = this.sources_;
    let minIndex = 0;
    let minScore = Infinity;
    let minWidth = Infinity;

    for (let i = 0; i < sources.length; i++) {
      const sWidth = sources[i].width;
      const score = Math.abs(sWidth - width); // Select the one that is closer with a slight preference toward larger
      // widths. If smaller size is closer, enforce minimum ratio to ensure
      // image isn't too distorted.

      if (score <= minScore * 1.1 || width / minWidth > 1.2) {
        minIndex = i;
        minScore = score;
        minWidth = sWidth;
      } else {
        break;
      }
    }

    return minIndex;
  }
  /**
   * @param {number} dpr
   * @return {number}
   * @private
   */

  selectByDpr_(dpr) {
    const sources = this.sources_;
    let minIndex = 0;
    let minScore = Infinity;

    for (let i = 0; i < sources.length; i++) {
      const score = Math.abs(sources[i].dpr - dpr);

      if (score <= minScore) {
        minIndex = i;
        minScore = score;
      } else {
        break;
      }
    }

    return minIndex;
  }
  /**
   * Returns all URLs in the srcset.
   * @return {!Array<string>}
   */

  getUrls() {
    return this.sources_.map(s => s.url);
  }
  /**
   * Reconstructs the string expression for this srcset.
   * @param {function(string):string=} opt_mapper
   * @return {string}
   */

  stringify(opt_mapper) {
    const res = [];
    const sources = this.sources_;

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      let src = source.url;

      if (opt_mapper) {
        src = opt_mapper(src);
      }

      if (this.widthBased_) {
        src += ` ${source.width}w`;
      } else {
        src += ` ${source.dpr}x`;
      }

      res.push(src);
    }

    return res.join(", ");
  }
}
/**
 * Sorts by width
 *
 * @param {number} s1
 * @param {number} s2
 * @return {number}
 */

function sortByWidth(s1, s2) {
  // userAssert(s1.width != s2.width, 'Duplicate width: %s', s1.width);
  return s1.width - s2.width;
}
/**
 * Sorts by dpr
 *
 * @param {!Object} s1
 * @param {!Object} s2
 * @return {number}
 */

function sortByDpr(s1, s2) {
  // userAssert(s1.dpr != s2.dpr, 'Duplicate dpr: %s', s1.dpr);
  return s1.dpr - s2.dpr;
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const TAG$1 = "URL-REWRITE";
/**
 * If (tagName, attrName) is a CDN-rewritable URL attribute, returns the
 * rewritten URL value. Otherwise, returns the unchanged `attrValue`.
 * See resolveUrlAttr() for rewriting rules.
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {string} attrValue
 * @return {string}
 * @private
 * @visibleForTesting
 */

function rewriteAttributeValue(tagName, attrName, attrValue) {
  if (isUrlAttribute(attrName)) {
    return resolveUrlAttr(tagName, attrName, attrValue, self.location);
  }

  return attrValue;
}
/**
 * @param {string} attrName Lowercase attribute name.
 * @return {boolean}
 */

function isUrlAttribute(attrName) {
  return attrName == "src" || attrName == "href" || attrName == "srcset";
}
/**
 * Rewrites the URL attribute values. URLs are rewritten as following:
 * - If URL is absolute, it is not rewritten
 * - If URL is relative, it's rewritten as absolute against the source origin
 * - If resulting URL is a `http:` URL and it's for image, the URL is rewritten
 *   again to be served with AMP Cache (cdn.ampproject.org).
 *
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {string} attrValue
 * @param {!Location} windowLocation
 * @return {string}
 * @private
 * @visibleForTesting
 */

function resolveUrlAttr(tagName, attrName, attrValue, windowLocation) {
  checkCorsUrl(attrValue);
  const isProxyHost = isProxyOrigin(windowLocation);
  const baseUrl = parseUrlDeprecated(getSourceUrl(windowLocation));

  if (attrName == "href" && !startsWith(attrValue, "#")) {
    return resolveRelativeUrl(attrValue, baseUrl);
  }

  if (attrName == "src") {
    if (tagName == "amp-img") {
      return resolveImageUrlAttr(attrValue, baseUrl, isProxyHost);
    }

    return resolveRelativeUrl(attrValue, baseUrl);
  }

  if (attrName == "srcset") {
    let srcset;

    try {
      srcset = parseSrcset(attrValue);
    } catch (e) {
      // Do not fail the whole template just because one srcset is broken.
      // An AMP element will pick it up and report properly.
      user$1().error(TAG$1, "Failed to parse srcset: ", e);
      return attrValue;
    }

    return srcset.stringify(url =>
      resolveImageUrlAttr(url, baseUrl, isProxyHost)
    );
  }

  return attrValue;
}
/**
 * Non-HTTPs image URLs are rewritten via proxy.
 * @param {string} attrValue
 * @param {!Location} baseUrl
 * @param {boolean} isProxyHost
 * @return {string}
 */

function resolveImageUrlAttr(attrValue, baseUrl, isProxyHost) {
  const src = parseUrlDeprecated(resolveRelativeUrl(attrValue, baseUrl)); // URLs such as `data:` or proxy URLs are returned as is. Unsafe protocols
  // do not arrive here - already stripped by the sanitizer.

  if (src.protocol == "data:" || isProxyOrigin(src) || !isProxyHost) {
    return src.href;
  } // Rewrite as a proxy URL.

  return (
    `${urls.cdn}/i/` +
    (src.protocol == "https:" ? "s/" : "") +
    encodeURIComponent(src.host) +
    src.pathname +
    (src.search || "") +
    (src.hash || "")
  );
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @private @const {string} */

const BIND_PREFIX = "data-amp-bind-";
/**
 * @const {!Object<string, boolean>}
 * See https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md
 */

const BLACKLISTED_TAGS = {
  applet: true,
  audio: true,
  base: true,
  embed: true,
  frame: true,
  frameset: true,
  iframe: true,
  img: true,
  link: true,
  meta: true,
  object: true,
  style: true,
  video: true
};
/**
 * Whitelist of tags allowed in triple mustache e.g. {{{name}}}.
 * Very restrictive by design since the triple mustache renders unescaped HTML
 * which, unlike double mustache, won't be processed by the AMP Validator.
 * @const {!Array<string>}
 */

const TRIPLE_MUSTACHE_WHITELISTED_TAGS = [
  "a",
  "b",
  "br",
  "caption",
  "colgroup",
  "code",
  "del",
  "div",
  "em",
  "i",
  "ins",
  "li",
  "mark",
  "ol",
  "p",
  "q",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "time",
  "td",
  "th",
  "thead",
  "tfoot",
  "tr",
  "u",
  "ul"
];
/**
 * Tag-agnostic attribute whitelisted used by both Caja and DOMPurify.
 * @const {!Array<string>}
 */

const WHITELISTED_ATTRS = [
  // AMP-only attributes that don't exist in HTML.
  "amp-fx",
  "fallback",
  "heights",
  "layout",
  "min-font-size",
  "max-font-size",
  "on",
  "option",
  "placeholder", // Attributes related to amp-form.
  "submitting",
  "submit-success",
  "submit-error",
  "validation-for",
  "verify-error",
  "visible-when-invalid", // HTML attributes that are scrubbed by Caja but we handle specially.
  "href",
  "style", // Attributes for amp-bind that exist in "[foo]" form.
  "text", // Attributes for amp-subscriptions.
  "subscriptions-action",
  "subscriptions-actions",
  "subscriptions-decorate",
  "subscriptions-dialog",
  "subscriptions-display",
  "subscriptions-section",
  "subscriptions-service"
];
/**
 * Attributes that are only whitelisted for specific, non-AMP elements.
 * @const {!Object<string, !Array<string>>}
 */

const WHITELISTED_ATTRS_BY_TAGS = {
  a: ["rel", "target"],
  div: ["template"],
  form: ["action-xhr", "verify-xhr", "custom-validation-reporting", "target"],
  input: ["mask-output"],
  template: ["type"],
  textarea: ["autoexpand"]
};
/** @const {!Array<string>} */

const WHITELISTED_TARGETS = ["_top", "_blank"];
/** @const {!Array<string>} */

const BLACKLISTED_ATTR_VALUES = [
  /*eslint no-script-url: 0*/
  "javascript:",
  /*eslint no-script-url: 0*/
  "vbscript:",
  /*eslint no-script-url: 0*/
  "data:",
  /*eslint no-script-url: 0*/
  "<script",
  /*eslint no-script-url: 0*/
  "</script"
];
/** @const {!Object<string, !Object<string, !RegExp>>} */

const BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES = dict({
  input: {
    type: /(?:image|button)/i
  }
});
/** @const {!Array<string>} */

const BLACKLISTED_FIELDS_ATTR = [
  "form",
  "formaction",
  "formmethod",
  "formtarget",
  "formnovalidate",
  "formenctype"
];
/** @const {!Object<string, !Array<string>>} */

const BLACKLISTED_TAG_SPECIFIC_ATTRS = dict({
  input: BLACKLISTED_FIELDS_ATTR,
  textarea: BLACKLISTED_FIELDS_ATTR,
  select: BLACKLISTED_FIELDS_ATTR
});
/**
 * Test for invalid `style` attribute values.
 *
 * !important avoids overriding AMP styles, while `position:fixed|sticky` is a
 * FixedLayer limitation (it only scans the style[amp-custom] stylesheet
 * for potential fixed/sticky elements). Note that the latter can be
 * circumvented with CSS comments -- not a big deal.
 *
 * @const {!RegExp}
 */

const INVALID_INLINE_STYLE_REGEX = /!important|position\s*:\s*fixed|position\s*:\s*sticky/i;
/**
 * Whether the attribute/value is valid.
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {string} attrValue
 * @param {boolean} opt_purify Is true, skips some attribute sanitizations
 *     that are already covered by DOMPurify.
 * @return {boolean}
 */

function isValidAttr(tagName, attrName, attrValue, opt_purify = false) {
  if (!opt_purify) {
    // "on*" attributes are not allowed.
    if (startsWith(attrName, "on") && attrName != "on") {
      return false;
    } // No attributes with "javascript" or other blacklisted substrings in them.

    if (attrValue) {
      const normalized = attrValue.toLowerCase().replace(/[\s,\u0000]+/g, "");

      for (let i = 0; i < BLACKLISTED_ATTR_VALUES.length; i++) {
        if (normalized.indexOf(BLACKLISTED_ATTR_VALUES[i]) >= 0) {
          return false;
        }
      }
    }
  } // Don't allow certain inline style values.

  if (attrName == "style") {
    return !INVALID_INLINE_STYLE_REGEX.test(attrValue);
  } // Don't allow CSS class names with internal AMP prefix.

  if (attrName == "class" && attrValue && /(^|\W)i-amphtml-/i.test(attrValue)) {
    return false;
  } // Don't allow '__amp_source_origin' in URLs.

  if (isUrlAttribute(attrName) && /__amp_source_origin/.test(attrValue)) {
    return false;
  } // Remove blacklisted attributes from specific tags e.g. input[formaction].

  const attrNameBlacklist = BLACKLISTED_TAG_SPECIFIC_ATTRS[tagName];

  if (attrNameBlacklist && attrNameBlacklist.indexOf(attrName) != -1) {
    return false;
  } // Remove blacklisted values for specific attributes for specific tags
  // e.g. input[type=image].

  const attrBlacklist = BLACKLISTED_TAG_SPECIFIC_ATTR_VALUES[tagName];

  if (attrBlacklist) {
    const blacklistedValuesRegex = attrBlacklist[attrName];

    if (
      blacklistedValuesRegex &&
      attrValue.search(blacklistedValuesRegex) != -1
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Removes elements that shouldRemove returns true for from the array.
 *
 * @param {!Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} shouldRemove
 * @template T
 */

function remove(array, shouldRemove) {
  let index = 0;

  for (let i = 0; i < array.length; i++) {
    const item = array[i];

    if (!shouldRemove(item, i, array)) {
      if (index < i) {
        array[index] = item;
      }

      index++;
    }
  }

  if (index < array.length) {
    array.length = index;
  }
}

var freeze$1 =
  Object.freeze ||
  function(x) {
    return x;
  };

var html = freeze$1([
  "a",
  "abbr",
  "acronym",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "big",
  "blink",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "content",
  "data",
  "datalist",
  "dd",
  "decorator",
  "del",
  "details",
  "dfn",
  "dir",
  "div",
  "dl",
  "dt",
  "element",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "nobr",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "section",
  "select",
  "shadow",
  "small",
  "source",
  "spacer",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
]); // SVG

var svg = freeze$1([
  "svg",
  "a",
  "altglyph",
  "altglyphdef",
  "altglyphitem",
  "animatecolor",
  "animatemotion",
  "animatetransform",
  "audio",
  "canvas",
  "circle",
  "clippath",
  "defs",
  "desc",
  "ellipse",
  "filter",
  "font",
  "g",
  "glyph",
  "glyphref",
  "hkern",
  "image",
  "line",
  "lineargradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialgradient",
  "rect",
  "stop",
  "style",
  "switch",
  "symbol",
  "text",
  "textpath",
  "title",
  "tref",
  "tspan",
  "video",
  "view",
  "vkern"
]);
var svgFilters = freeze$1([
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence"
]);
var mathMl = freeze$1([
  "math",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mglyph",
  "mi",
  "mlabeledtr",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover"
]);
var text = freeze$1(["#text"]);

var freeze$2 =
  Object.freeze ||
  function(x) {
    return x;
  };

var html$1 = freeze$2([
  "accept",
  "action",
  "align",
  "alt",
  "autocomplete",
  "background",
  "bgcolor",
  "border",
  "cellpadding",
  "cellspacing",
  "checked",
  "cite",
  "class",
  "clear",
  "color",
  "cols",
  "colspan",
  "coords",
  "crossorigin",
  "datetime",
  "default",
  "dir",
  "disabled",
  "download",
  "enctype",
  "face",
  "for",
  "headers",
  "height",
  "hidden",
  "high",
  "href",
  "hreflang",
  "id",
  "integrity",
  "ismap",
  "label",
  "lang",
  "list",
  "loop",
  "low",
  "max",
  "maxlength",
  "media",
  "method",
  "min",
  "multiple",
  "name",
  "noshade",
  "novalidate",
  "nowrap",
  "open",
  "optimum",
  "pattern",
  "placeholder",
  "poster",
  "preload",
  "pubdate",
  "radiogroup",
  "readonly",
  "rel",
  "required",
  "rev",
  "reversed",
  "role",
  "rows",
  "rowspan",
  "spellcheck",
  "scope",
  "selected",
  "shape",
  "size",
  "sizes",
  "span",
  "srclang",
  "start",
  "src",
  "srcset",
  "step",
  "style",
  "summary",
  "tabindex",
  "title",
  "type",
  "usemap",
  "valign",
  "value",
  "width",
  "xmlns"
]);
var svg$1 = freeze$2([
  "accent-height",
  "accumulate",
  "additive",
  "alignment-baseline",
  "ascent",
  "attributename",
  "attributetype",
  "azimuth",
  "basefrequency",
  "baseline-shift",
  "begin",
  "bias",
  "by",
  "class",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "cx",
  "cy",
  "d",
  "dx",
  "dy",
  "diffuseconstant",
  "direction",
  "display",
  "divisor",
  "dur",
  "edgemode",
  "elevation",
  "end",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flood-color",
  "flood-opacity",
  "font-family",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "fx",
  "fy",
  "g1",
  "g2",
  "glyph-name",
  "glyphref",
  "gradientunits",
  "gradienttransform",
  "height",
  "href",
  "id",
  "image-rendering",
  "in",
  "in2",
  "k",
  "k1",
  "k2",
  "k3",
  "k4",
  "kerning",
  "keypoints",
  "keysplines",
  "keytimes",
  "lang",
  "lengthadjust",
  "letter-spacing",
  "kernelmatrix",
  "kernelunitlength",
  "lighting-color",
  "local",
  "marker-end",
  "marker-mid",
  "marker-start",
  "markerheight",
  "markerunits",
  "markerwidth",
  "maskcontentunits",
  "maskunits",
  "max",
  "mask",
  "media",
  "method",
  "mode",
  "min",
  "name",
  "numoctaves",
  "offset",
  "operator",
  "opacity",
  "order",
  "orient",
  "orientation",
  "origin",
  "overflow",
  "paint-order",
  "path",
  "pathlength",
  "patterncontentunits",
  "patterntransform",
  "patternunits",
  "points",
  "preservealpha",
  "preserveaspectratio",
  "r",
  "rx",
  "ry",
  "radius",
  "refx",
  "refy",
  "repeatcount",
  "repeatdur",
  "restart",
  "result",
  "rotate",
  "scale",
  "seed",
  "shape-rendering",
  "specularconstant",
  "specularexponent",
  "spreadmethod",
  "stddeviation",
  "stitchtiles",
  "stop-color",
  "stop-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke",
  "stroke-width",
  "style",
  "surfacescale",
  "tabindex",
  "targetx",
  "targety",
  "transform",
  "text-anchor",
  "text-decoration",
  "text-rendering",
  "textlength",
  "type",
  "u1",
  "u2",
  "unicode",
  "values",
  "viewbox",
  "visibility",
  "version",
  "vert-adv-y",
  "vert-origin-x",
  "vert-origin-y",
  "width",
  "word-spacing",
  "wrap",
  "writing-mode",
  "xchannelselector",
  "ychannelselector",
  "x",
  "x1",
  "x2",
  "xmlns",
  "y",
  "y1",
  "y2",
  "z",
  "zoomandpan"
]);
var mathMl$1 = freeze$2([
  "accent",
  "accentunder",
  "align",
  "bevelled",
  "close",
  "columnsalign",
  "columnlines",
  "columnspan",
  "denomalign",
  "depth",
  "dir",
  "display",
  "displaystyle",
  "fence",
  "frame",
  "height",
  "href",
  "id",
  "largeop",
  "length",
  "linethickness",
  "lspace",
  "lquote",
  "mathbackground",
  "mathcolor",
  "mathsize",
  "mathvariant",
  "maxsize",
  "minsize",
  "movablelimits",
  "notation",
  "numalign",
  "open",
  "rowalign",
  "rowlines",
  "rowspacing",
  "rowspan",
  "rspace",
  "rquote",
  "scriptlevel",
  "scriptminsize",
  "scriptsizemultiplier",
  "selection",
  "separator",
  "separators",
  "stretchy",
  "subscriptshift",
  "supscriptshift",
  "symmetric",
  "voffset",
  "width",
  "xmlns"
]);
var xml = freeze$2([
  "xlink:href",
  "xml:id",
  "xlink:title",
  "xml:space",
  "xmlns:xlink"
]);
var hasOwnProperty = Object.hasOwnProperty;
var setPrototypeOf = Object.setPrototypeOf;

var _ref$1 = typeof Reflect !== "undefined" && Reflect;

var apply$1 = _ref$1.apply;

if (!apply$1) {
  apply$1 = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}
/* Add properties to a lookup table */

function addToSet(set, array) {
  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }

  var l = array.length;

  while (l--) {
    var element = array[l];

    if (typeof element === "string") {
      var lcElement = element.toLowerCase();

      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!Object.isFrozen(array)) {
          array[l] = lcElement;
        }

        element = lcElement;
      }
    }

    set[element] = true;
  }

  return set;
}
/* Shallow clone an object */

function clone(object) {
  var newObject = {};
  var property = void 0;

  for (property in object) {
    if (apply$1(hasOwnProperty, object, [property])) {
      newObject[property] = object[property];
    }
  }

  return newObject;
}

var seal =
  Object.seal ||
  function(x) {
    return x;
  };

var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode

var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape

var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape

var IS_ALLOWED_URI = seal(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
var ATTR_WHITESPACE = seal(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g // eslint-disable-line no-control-regex
);

var _typeof =
  typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? function(obj) {
        return typeof obj;
      }
    : function(obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return Array.from(arr);
  }
}

var _ref = typeof Reflect !== "undefined" && Reflect;

var apply = _ref.apply;
var arraySlice = Array.prototype.slice;
var freeze = Object.freeze;

var getGlobal = function getGlobal() {
  return typeof window === "undefined" ? null : window;
};

if (!apply) {
  apply = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
 * @param {Document} document The document object (to determine policy name suffix)
 * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
 * are not supported).
 */

var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(
  trustedTypes,
  document
) {
  if (
    (typeof trustedTypes === "undefined"
      ? "undefined"
      : _typeof(trustedTypes)) !== "object" ||
    typeof trustedTypes.createPolicy !== "function"
  ) {
    return null;
  } // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.

  var suffix = null;
  var ATTR_NAME = "data-tt-policy-suffix";

  if (
    document.currentScript &&
    document.currentScript.hasAttribute(ATTR_NAME)
  ) {
    suffix = document.currentScript.getAttribute(ATTR_NAME);
  }

  var policyName = "dompurify" + (suffix ? "#" + suffix : "");

  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML: function createHTML(html$$1) {
        return html$$1;
      }
    });
  } catch (error) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn(
      "TrustedTypes policy " + policyName + " could not be created."
    );
    return null;
  }
};

function createDOMPurify() {
  var window =
    arguments.length > 0 && arguments[0] !== undefined
      ? arguments[0]
      : getGlobal();

  var DOMPurify = function DOMPurify(root) {
    return createDOMPurify(root);
  };
  /**
   * Version label, exposed for easier checks
   * if DOMPurify is up to date or not
   */

  DOMPurify.version = "1.0.10";
  /**
   * Array of elements that DOMPurify removed during sanitation.
   * Empty if nothing was removed.
   */

  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;
    return DOMPurify;
  }

  var originalDocument = window.document;
  var useDOMParser = false;
  var removeTitle = false;
  var document = window.document;
  var DocumentFragment = window.DocumentFragment,
    HTMLTemplateElement = window.HTMLTemplateElement,
    Node = window.Node,
    NodeFilter = window.NodeFilter,
    _window$NamedNodeMap = window.NamedNodeMap,
    NamedNodeMap =
      _window$NamedNodeMap === undefined
        ? window.NamedNodeMap || window.MozNamedAttrMap
        : _window$NamedNodeMap,
    Text = window.Text,
    Comment = window.Comment,
    DOMParser = window.DOMParser,
    TrustedTypes = window.TrustedTypes; // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.

  if (typeof HTMLTemplateElement === "function") {
    var template = document.createElement("template");

    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }

  var trustedTypesPolicy = _createTrustedTypesPolicy(
    TrustedTypes,
    originalDocument
  );

  var emptyHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML("") : "";
  var _document = document,
    implementation = _document.implementation,
    createNodeIterator = _document.createNodeIterator,
    getElementsByTagName = _document.getElementsByTagName,
    createDocumentFragment = _document.createDocumentFragment;
  var importNode = originalDocument.importNode;
  var hooks = {};
  /**
   * Expose whether this browser supports running the full DOMPurify.
   */

  DOMPurify.isSupported =
    implementation &&
    typeof implementation.createHTMLDocument !== "undefined" &&
    document.documentMode !== 9;
  var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
    ERB_EXPR$$1 = ERB_EXPR,
    DATA_ATTR$$1 = DATA_ATTR,
    ARIA_ATTR$$1 = ARIA_ATTR,
    IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
  var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;
  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */

  /* allowed element names */

  var ALLOWED_TAGS = null;
  var DEFAULT_ALLOWED_TAGS = addToSet(
    {},
    [].concat(
      _toConsumableArray(html),
      _toConsumableArray(svg),
      _toConsumableArray(svgFilters),
      _toConsumableArray(mathMl),
      _toConsumableArray(text)
    )
  );
  /* Allowed attribute names */

  var ALLOWED_ATTR = null;
  var DEFAULT_ALLOWED_ATTR = addToSet(
    {},
    [].concat(
      _toConsumableArray(html$1),
      _toConsumableArray(svg$1),
      _toConsumableArray(mathMl$1),
      _toConsumableArray(xml)
    )
  );
  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */

  var FORBID_TAGS = null;
  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */

  var FORBID_ATTR = null;
  /* Decide if ARIA attributes are okay */

  var ALLOW_ARIA_ATTR = true;
  /* Decide if custom data attributes are okay */

  var ALLOW_DATA_ATTR = true;
  /* Decide if unknown protocols are okay */

  var ALLOW_UNKNOWN_PROTOCOLS = false;
  /* Output should be safe for jQuery's $() factory? */

  var SAFE_FOR_JQUERY = false;
  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */

  var SAFE_FOR_TEMPLATES = false;
  /* Decide if document with <html>... should be returned */

  var WHOLE_DOCUMENT = false;
  /* Track whether config is already set on this instance of DOMPurify. */

  var SET_CONFIG = false;
  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */

  var FORCE_BODY = false;
  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */

  var RETURN_DOM = false;
  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */

  var RETURN_DOM_FRAGMENT = false;
  /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
   * `Node` is imported into the current `Document`. If this flag is not enabled the
   * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
   * DOMPurify. */

  var RETURN_DOM_IMPORT = false;
  /* Output should be free from DOM clobbering attacks? */

  var SANITIZE_DOM = true;
  /* Keep element content when removing element? */

  var KEEP_CONTENT = true;
  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */

  var IN_PLACE = false;
  /* Allow usage of profiles like html, svg and mathMl */

  var USE_PROFILES = {};
  /* Tags to ignore content of when KEEP_CONTENT is true */

  var FORBID_CONTENTS = addToSet({}, [
    "audio",
    "head",
    "math",
    "script",
    "style",
    "template",
    "svg",
    "video"
  ]);
  /* Tags that are safe for data: URIs */

  var DATA_URI_TAGS = addToSet({}, [
    "audio",
    "video",
    "img",
    "source",
    "image"
  ]);
  /* Attributes safe for values like "javascript:" */

  var URI_SAFE_ATTRIBUTES = addToSet({}, [
    "alt",
    "class",
    "for",
    "id",
    "label",
    "name",
    "pattern",
    "placeholder",
    "summary",
    "title",
    "value",
    "style",
    "xmlns"
  ]);
  /* Keep a reference to config to pass to hooks */

  var CONFIG = null;
  /* Ideally, do not touch anything below this line */

  /* ______________________________________________ */

  var formElement = document.createElement("form");
  /**
   * _parseConfig
   *
   * @param  {Object} cfg optional config literal
   */
  // eslint-disable-next-line complexity

  var _parseConfig = function _parseConfig(cfg) {
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    /* Shield configuration object from tampering */

    if (
      !cfg ||
      (typeof cfg === "undefined" ? "undefined" : _typeof(cfg)) !== "object"
    ) {
      cfg = {};
    }
    /* Set configuration parameters */

    ALLOWED_TAGS =
      "ALLOWED_TAGS" in cfg
        ? addToSet({}, cfg.ALLOWED_TAGS)
        : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR =
      "ALLOWED_ATTR" in cfg
        ? addToSet({}, cfg.ALLOWED_ATTR)
        : DEFAULT_ALLOWED_ATTR;
    FORBID_TAGS = "FORBID_TAGS" in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
    FORBID_ATTR = "FORBID_ATTR" in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
    USE_PROFILES = "USE_PROFILES" in cfg ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true

    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true

    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false

    SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY || false; // Default false

    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false

    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false

    RETURN_DOM = cfg.RETURN_DOM || false; // Default false

    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false

    RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT || false; // Default false

    FORCE_BODY = cfg.FORCE_BODY || false; // Default false

    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true

    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true

    IN_PLACE = cfg.IN_PLACE || false; // Default false

    IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;

    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    /* Parse profile info */

    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray(text)));
      ALLOWED_ATTR = [];

      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html);
        addToSet(ALLOWED_ATTR, html$1);
      }

      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl);
        addToSet(ALLOWED_ATTR, mathMl$1);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    /* Merge configuration parameters */

    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }

      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
    }

    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }

      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
    }

    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
    }
    /* Add #text in case KEEP_CONTENT is set to true */

    if (KEEP_CONTENT) {
      ALLOWED_TAGS["#text"] = true;
    }
    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */

    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ["html", "head", "body"]);
    }
    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286 */

    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ["tbody"]);
    } // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.

    if (freeze) {
      freeze(cfg);
    }

    CONFIG = cfg;
  };
  /**
   * _forceRemove
   *
   * @param  {Node} node a DOM node
   */

  var _forceRemove = function _forceRemove(node) {
    DOMPurify.removed.push({
      element: node
    });

    try {
      node.parentNode.removeChild(node);
    } catch (error) {
      node.outerHTML = emptyHTML;
    }
  };
  /**
   * _removeAttribute
   *
   * @param  {String} name an Attribute name
   * @param  {Node} node a DOM node
   */

  var _removeAttribute = function _removeAttribute(name, node) {
    try {
      DOMPurify.removed.push({
        attribute: node.getAttributeNode(name),
        from: node
      });
    } catch (error) {
      DOMPurify.removed.push({
        attribute: null,
        from: node
      });
    }

    node.removeAttribute(name);
  };
  /**
   * _initDocument
   *
   * @param  {String} dirty a string of dirty markup
   * @return {Document} a DOM, filled with the dirty markup
   */

  var _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    var doc = void 0;
    var leadingWhitespace = void 0;

    if (FORCE_BODY) {
      dirty = "<remove></remove>" + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      var matches = dirty.match(/^[\s]+/);
      leadingWhitespace = matches && matches[0];

      if (leadingWhitespace) {
        dirty = dirty.slice(leadingWhitespace.length);
      }
    }
    /* Use DOMParser to workaround Firefox bug (see comment below) */

    if (useDOMParser) {
      try {
        doc = new DOMParser().parseFromString(dirty, "text/html");
      } catch (error) {}
    }
    /* Remove title to fix a mXSS bug in older MS Edge */

    if (removeTitle) {
      addToSet(FORBID_TAGS, ["title"]);
    }
    /* Otherwise use createHTMLDocument, because DOMParser is unsafe in
    Safari (see comment below) */

    if (!doc || !doc.documentElement) {
      doc = implementation.createHTMLDocument("");
      var _doc = doc,
        body = _doc.body;
      body.parentNode.removeChild(body.parentNode.firstElementChild);
      body.outerHTML = trustedTypesPolicy
        ? trustedTypesPolicy.createHTML(dirty)
        : dirty;
    }

    if (leadingWhitespace) {
      doc.body.insertBefore(
        document.createTextNode(leadingWhitespace),
        doc.body.childNodes[0] || null
      );
    }
    /* Work on whole document or just its body */

    return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
  }; // Firefox uses a different parser for innerHTML rather than
  // DOMParser (see https://bugzilla.mozilla.org/show_bug.cgi?id=1205631)
  // which means that you *must* use DOMParser, otherwise the output may
  // not be safe if used in a document.write context later.
  //
  // So we feature detect the Firefox bug and use the DOMParser if necessary.
  //
  // MS Edge, in older versions, is affected by an mXSS behavior. The second
  // check tests for the behavior and fixes it if necessary.

  if (DOMPurify.isSupported) {
    (function() {
      try {
        var doc = _initDocument(
          '<svg><p><style><img src="</style><img src=x onerror=1//">'
        );

        if (doc.querySelector("svg img")) {
          useDOMParser = true;
        }
      } catch (error) {}
    })();

    (function() {
      try {
        var doc = _initDocument("<x/><title>&lt;/title&gt;&lt;img&gt;");

        if (doc.querySelector("title").innerHTML.match(/<\/title/)) {
          removeTitle = true;
        }
      } catch (error) {}
    })();
  }
  /**
   * _createIterator
   *
   * @param  {Document} root document/fragment to create iterator for
   * @return {Iterator} iterator instance
   */

  var _createIterator = function _createIterator(root) {
    return createNodeIterator.call(
      root.ownerDocument || root,
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT,
      function() {
        return NodeFilter.FILTER_ACCEPT;
      },
      false
    );
  };
  /**
   * _isClobbered
   *
   * @param  {Node} elm element to check for clobbering attacks
   * @return {Boolean} true if clobbered, false if safe
   */

  var _isClobbered = function _isClobbered(elm) {
    if (elm instanceof Text || elm instanceof Comment) {
      return false;
    }

    if (
      typeof elm.nodeName !== "string" ||
      typeof elm.textContent !== "string" ||
      typeof elm.removeChild !== "function" ||
      !(elm.attributes instanceof NamedNodeMap) ||
      typeof elm.removeAttribute !== "function" ||
      typeof elm.setAttribute !== "function"
    ) {
      return true;
    }

    return false;
  };
  /**
   * _isNode
   *
   * @param  {Node} obj object to check whether it's a DOM node
   * @return {Boolean} true is object is a DOM node
   */

  var _isNode = function _isNode(obj) {
    return (typeof Node === "undefined" ? "undefined" : _typeof(Node)) ===
      "object"
      ? obj instanceof Node
      : obj &&
          (typeof obj === "undefined" ? "undefined" : _typeof(obj)) ===
            "object" &&
          typeof obj.nodeType === "number" &&
          typeof obj.nodeName === "string";
  };
  /**
   * _executeHook
   * Execute user configurable hooks
   *
   * @param  {String} entryPoint  Name of the hook's entry point
   * @param  {Node} currentNode node to work on with the hook
   * @param  {Object} data additional hook parameters
   */

  var _executeHook = function _executeHook(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) {
      return;
    }

    hooks[entryPoint].forEach(function(hook) {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  };
  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   *
   * @param   {Node} currentNode to check for permission to exist
   * @return  {Boolean} true if node was killed, false if left alive
   */
  // eslint-disable-next-line complexity

  var _sanitizeElements = function _sanitizeElements(currentNode) {
    var content = void 0;
    /* Execute a hook if present */

    _executeHook("beforeSanitizeElements", currentNode, null);
    /* Check if element is clobbered or can clobber */

    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Now let's check the element's type and name */

    var tagName = currentNode.nodeName.toLowerCase();
    /* Execute a hook if present */

    _executeHook("uponSanitizeElement", currentNode, {
      tagName: tagName,
      allowedTags: ALLOWED_TAGS
    });
    /* Remove element if anything forbids its presence */

    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Keep content except for black-listed elements */
      if (
        KEEP_CONTENT &&
        !FORBID_CONTENTS[tagName] &&
        typeof currentNode.insertAdjacentHTML === "function"
      ) {
        try {
          var htmlToInsert = currentNode.innerHTML;
          currentNode.insertAdjacentHTML(
            "AfterEnd",
            trustedTypesPolicy
              ? trustedTypesPolicy.createHTML(htmlToInsert)
              : htmlToInsert
          );
        } catch (error) {}
      }

      _forceRemove(currentNode);

      return true;
    }
    /* Remove in case a noscript/noembed XSS is suspected */

    if (tagName === "noscript" && currentNode.innerHTML.match(/<\/noscript/i)) {
      _forceRemove(currentNode);

      return true;
    }

    if (tagName === "noembed" && currentNode.innerHTML.match(/<\/noembed/i)) {
      _forceRemove(currentNode);

      return true;
    }
    /* Convert markup to cover jQuery behavior */

    if (
      SAFE_FOR_JQUERY &&
      !currentNode.firstElementChild &&
      (!currentNode.content || !currentNode.content.firstElementChild) &&
      /</g.test(currentNode.textContent)
    ) {
      DOMPurify.removed.push({
        element: currentNode.cloneNode()
      });

      if (currentNode.innerHTML) {
        currentNode.innerHTML = currentNode.innerHTML.replace(/</g, "&lt;");
      } else {
        currentNode.innerHTML = currentNode.textContent.replace(/</g, "&lt;");
      }
    }
    /* Sanitize element content to be template-safe */

    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      /* Get the element's text content */
      content = currentNode.textContent;
      content = content.replace(MUSTACHE_EXPR$$1, " ");
      content = content.replace(ERB_EXPR$$1, " ");

      if (currentNode.textContent !== content) {
        DOMPurify.removed.push({
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    /* Execute a hook if present */

    _executeHook("afterSanitizeElements", currentNode, null);

    return false;
  };
  /**
   * _isValidAttribute
   *
   * @param  {string} lcTag Lowercase tag name of containing element.
   * @param  {string} lcName Lowercase attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity

  var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (
      SANITIZE_DOM &&
      (lcName === "id" || lcName === "name") &&
      (value in document || value in formElement)
    ) {
      return false;
    }
    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */

    if (ALLOW_DATA_ATTR && DATA_ATTR$$1.test(lcName));
    else if (ALLOW_ARIA_ATTR && ARIA_ATTR$$1.test(lcName));
    else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      return false;
      /* Check value is safe. First, is attr inert? If so, is safe */
    } else if (URI_SAFE_ATTRIBUTES[lcName]);
    else if (IS_ALLOWED_URI$$1.test(value.replace(ATTR_WHITESPACE$$1, "")));
    else if (
      (lcName === "src" || lcName === "xlink:href") &&
      lcTag !== "script" &&
      value.indexOf("data:") === 0 &&
      DATA_URI_TAGS[lcTag]
    );
    else if (
      ALLOW_UNKNOWN_PROTOCOLS &&
      !IS_SCRIPT_OR_DATA$$1.test(value.replace(ATTR_WHITESPACE$$1, ""))
    );
    else if (!value);
    else {
      return false;
    }

    return true;
  };
  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param  {Node} currentNode to sanitize
   */

  var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    var attr = void 0;
    var value = void 0;
    var lcName = void 0;
    var idAttr = void 0;
    var l = void 0;
    /* Execute a hook if present */

    _executeHook("beforeSanitizeAttributes", currentNode, null);

    var attributes = currentNode.attributes;
    /* Check if we have attributes; if not we might have a text node */

    if (!attributes) {
      return;
    }

    var hookEvent = {
      attrName: "",
      attrValue: "",
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR
    };
    l = attributes.length;
    /* Go backwards over all attributes; safely remove bad ones */

    while (l--) {
      attr = attributes[l];
      var _attr = attr,
        name = _attr.name,
        namespaceURI = _attr.namespaceURI;
      value = attr.value.trim();
      lcName = name.toLowerCase();
      /* Execute a hook if present */

      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;

      _executeHook("uponSanitizeAttribute", currentNode, hookEvent);

      value = hookEvent.attrValue;
      /* Remove attribute */
      // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
      // remove a "name" attribute from an <img> tag that has an "id"
      // attribute at the time.

      if (
        lcName === "name" &&
        currentNode.nodeName === "IMG" &&
        attributes.id
      ) {
        idAttr = attributes.id;
        attributes = apply(arraySlice, attributes, []);

        _removeAttribute("id", currentNode);

        _removeAttribute(name, currentNode);

        if (attributes.indexOf(idAttr) > l) {
          currentNode.setAttribute("id", idAttr.value);
        }
      } else if (
        // This works around a bug in Safari, where input[type=file]
        // cannot be dynamically set after type has been removed
        currentNode.nodeName === "INPUT" &&
        lcName === "type" &&
        value === "file" &&
        (ALLOWED_ATTR[lcName] || !FORBID_ATTR[lcName])
      ) {
        continue;
      } else {
        // This avoids a crash in Safari v9.0 with double-ids.
        // The trick is to first set the id to be empty and then to
        // remove the attribute
        if (name === "id") {
          currentNode.setAttribute(name, "");
        }

        _removeAttribute(name, currentNode);
      }
      /* Did the hooks approve of the attribute? */

      if (!hookEvent.keepAttr) {
        continue;
      }
      /* Sanitize attribute content to be template-safe */

      if (SAFE_FOR_TEMPLATES) {
        value = value.replace(MUSTACHE_EXPR$$1, " ");
        value = value.replace(ERB_EXPR$$1, " ");
      }
      /* Is `value` valid for this attribute? */

      var lcTag = currentNode.nodeName.toLowerCase();

      if (!_isValidAttribute(lcTag, lcName, value)) {
        continue;
      }
      /* Handle invalid data-* attribute set by try-catching it */

      try {
        if (namespaceURI) {
          currentNode.setAttributeNS(namespaceURI, name, value);
        } else {
          /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
          currentNode.setAttribute(name, value);
        }

        DOMPurify.removed.pop();
      } catch (error) {}
    }
    /* Execute a hook if present */

    _executeHook("afterSanitizeAttributes", currentNode, null);
  };
  /**
   * _sanitizeShadowDOM
   *
   * @param  {DocumentFragment} fragment to iterate over recursively
   */

  var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    var shadowNode = void 0;

    var shadowIterator = _createIterator(fragment);
    /* Execute a hook if present */

    _executeHook("beforeSanitizeShadowDOM", fragment, null);

    while ((shadowNode = shadowIterator.nextNode())) {
      /* Execute a hook if present */
      _executeHook("uponSanitizeShadowNode", shadowNode, null);
      /* Sanitize tags and elements */

      if (_sanitizeElements(shadowNode)) {
        continue;
      }
      /* Deep shadow DOM detected */

      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }
      /* Check attributes, sanitize if necessary */

      _sanitizeAttributes(shadowNode);
    }
    /* Execute a hook if present */

    _executeHook("afterSanitizeShadowDOM", fragment, null);
  };
  /**
   * Sanitize
   * Public method providing core sanitation functionality
   *
   * @param {String|Node} dirty string or DOM node
   * @param {Object} configuration object
   */
  // eslint-disable-next-line complexity

  DOMPurify.sanitize = function(dirty, cfg) {
    var body = void 0;
    var importedNode = void 0;
    var currentNode = void 0;
    var oldNode = void 0;
    var returnNode = void 0;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */

    if (!dirty) {
      dirty = "<!-->";
    }
    /* Stringify, in case dirty is an object */

    if (typeof dirty !== "string" && !_isNode(dirty)) {
      // eslint-disable-next-line no-negated-condition
      if (typeof dirty.toString !== "function") {
        throw new TypeError("toString is not a function");
      } else {
        dirty = dirty.toString();

        if (typeof dirty !== "string") {
          throw new TypeError("dirty is not a string, aborting");
        }
      }
    }
    /* Check we can run. Otherwise fall back or ignore */

    if (!DOMPurify.isSupported) {
      if (
        _typeof(window.toStaticHTML) === "object" ||
        typeof window.toStaticHTML === "function"
      ) {
        if (typeof dirty === "string") {
          return window.toStaticHTML(dirty);
        }

        if (_isNode(dirty)) {
          return window.toStaticHTML(dirty.outerHTML);
        }
      }

      return dirty;
    }
    /* Assign config vars */

    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    /* Clean up removed elements */

    DOMPurify.removed = [];

    if (IN_PLACE);
    else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument("<!-->");
      importedNode = body.ownerDocument.importNode(dirty, true);

      if (importedNode.nodeType === 1 && importedNode.nodeName === "BODY") {
        /* Node is already a body, use as is */
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (
        !RETURN_DOM &&
        !SAFE_FOR_TEMPLATES &&
        !WHOLE_DOCUMENT &&
        dirty.indexOf("<") === -1
      ) {
        return trustedTypesPolicy
          ? trustedTypesPolicy.createHTML(dirty)
          : dirty;
      }
      /* Initialize the document to work on */

      body = _initDocument(dirty);
      /* Check we have a DOM node from the data */

      if (!body) {
        return RETURN_DOM ? null : emptyHTML;
      }
    }
    /* Remove first element node (ours) if FORCE_BODY is set */

    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    /* Get node iterator */

    var nodeIterator = _createIterator(IN_PLACE ? dirty : body);
    /* Now start iterating over the created document */

    while ((currentNode = nodeIterator.nextNode())) {
      /* Fix IE's strange behavior with manipulated textNodes #89 */
      if (currentNode.nodeType === 3 && currentNode === oldNode) {
        continue;
      }
      /* Sanitize tags and elements */

      if (_sanitizeElements(currentNode)) {
        continue;
      }
      /* Shadow DOM detected, sanitize it */

      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
      /* Check attributes, sanitize if necessary */

      _sanitizeAttributes(currentNode);

      oldNode = currentNode;
    }

    oldNode = null;
    /* If we sanitized `dirty` in-place, return it. */

    if (IN_PLACE) {
      return dirty;
    }
    /* Return sanitized string or DOM */

    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);

        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (RETURN_DOM_IMPORT) {
        /* AdoptNode() is not used because internal state is not reset
               (e.g. the past names map of a HTMLFormElement), this is safe
               in theory but we would rather not risk another attack vector.
               The state that is cloned by importNode() is explicitly defined
               by the specs. */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    /* Sanitize final string template-safe */

    if (SAFE_FOR_TEMPLATES) {
      serializedHTML = serializedHTML.replace(MUSTACHE_EXPR$$1, " ");
      serializedHTML = serializedHTML.replace(ERB_EXPR$$1, " ");
    }

    return trustedTypesPolicy
      ? trustedTypesPolicy.createHTML(serializedHTML)
      : serializedHTML;
  };
  /**
   * Public method to set the configuration once
   * setConfig
   *
   * @param {Object} cfg configuration object
   */

  DOMPurify.setConfig = function(cfg) {
    _parseConfig(cfg);

    SET_CONFIG = true;
  };
  /**
   * Public method to remove the configuration
   * clearConfig
   *
   */

  DOMPurify.clearConfig = function() {
    CONFIG = null;
    SET_CONFIG = false;
  };
  /**
   * Public method to check if an attribute value is valid.
   * Uses last set config, if any. Otherwise, uses config defaults.
   * isValidAttribute
   *
   * @param  {string} tag Tag name of containing element.
   * @param  {string} attr Attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
   */

  DOMPurify.isValidAttribute = function(tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }

    var lcTag = tag.toLowerCase();
    var lcName = attr.toLowerCase();
    return _isValidAttribute(lcTag, lcName, value);
  };
  /**
   * AddHook
   * Public method to add DOMPurify hooks
   *
   * @param {String} entryPoint entry point for the hook to add
   * @param {Function} hookFunction function to execute
   */

  DOMPurify.addHook = function(entryPoint, hookFunction) {
    if (typeof hookFunction !== "function") {
      return;
    }

    hooks[entryPoint] = hooks[entryPoint] || [];
    hooks[entryPoint].push(hookFunction);
  };
  /**
   * RemoveHook
   * Public method to remove a DOMPurify hook at a given entryPoint
   * (pops it from the stack of hooks if more are present)
   *
   * @param {String} entryPoint entry point for the hook to remove
   */

  DOMPurify.removeHook = function(entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint].pop();
    }
  };
  /**
   * RemoveHooks
   * Public method to remove all DOMPurify hooks at a given entryPoint
   *
   * @param  {String} entryPoint entry point for the hooks to remove
   */

  DOMPurify.removeHooks = function(entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint] = [];
    }
  };
  /**
   * RemoveAllHooks
   * Public method to remove all DOMPurify hooks
   *
   */

  DOMPurify.removeAllHooks = function() {
    hooks = {};
  };

  return DOMPurify;
}

var purify = createDOMPurify();

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @private @const {!DomPurifyDef} */

const DomPurify = purify(self);
/** @private @const {string} */

const TAG$2 = "purifier";
/**
 * Tags that are only whitelisted for specific values of given attributes.
 * @private @const {!Object<string, {attribute: string, values: !Array<string>}>}
 */

const WHITELISTED_TAGS_BY_ATTRS = {
  script: {
    attribute: "type",
    values: ["application/json", "application/ld+json"]
  }
};
const PURIFY_CONFIG =
  /** @type {!DomPurifyConfig} */
  {
    USE_PROFILES: {
      html: true,
      svg: true,
      svgFilters: true
    }
  };
/**
 * Monotonically increasing counter used for keying nodes.
 * @private {number}
 */

let KEY_COUNTER = 0;
/**
 * Returns a <body> element containing the sanitized, serialized `dirty`.
 * @param {string} dirty
 * @param {boolean=} diffing
 * @return {!Node}
 */

function purifyHtml(dirty, diffing = false) {
  const config = purifyConfig();
  addPurifyHooks(DomPurify, diffing);
  const body = DomPurify.sanitize(dirty, config);
  DomPurify.removeAllHooks();
  return body;
}
/**
 * Returns DOMPurify config for normal, escaped templates.
 * Do not use for unescaped templates.
 *
 * NOTE: See that we use DomPurifyConfig found in
 * build-system/dompurify.extern.js as the exact type. This is to prevent
 * closure compiler from optimizing these fields here in this file and in the
 * 3rd party library file. See #19624 for further information.
 *
 * @return {!DomPurifyConfig}
 */

function purifyConfig() {
  const config = Object.assign(
    {},
    PURIFY_CONFIG,
    /** @type {!DomPurifyConfig} */
    {
      ADD_ATTR: WHITELISTED_ATTRS,
      FORBID_TAGS: Object.keys(BLACKLISTED_TAGS),
      // Avoid reparenting of some elements to document head e.g. <script>.
      FORCE_BODY: true,
      // Avoid need for serializing to/from string by returning Node directly.
      RETURN_DOM: true,
      // BLACKLISTED_ATTR_VALUES are enough. Other unknown protocols are safe.
      // This allows native app deeplinks.
      ALLOW_UNKNOWN_PROTOCOLS: true
    }
  );
  return (
    /** @type {!DomPurifyConfig} */
    config
  );
}
/**
 * Adds AMP hooks to given DOMPurify object.
 * @param {!DomPurifyDef} purifier
 * @param {boolean} diffing
 */

function addPurifyHooks(purifier, diffing) {
  // Reference to DOMPurify's `allowedTags` whitelist.
  let allowedTags;
  const allowedTagsChanges = []; // Reference to DOMPurify's `allowedAttributes` whitelist.

  let allowedAttributes;
  const allowedAttributesChanges = []; // Disables DOM diffing for a given node and allows it to be replaced.

  const disableDiffingFor = node => {
    const key = "i-amphtml-key";

    if (diffing && !node.hasAttribute(key)) {
      // set-dom uses node attribute keys for opting out of diffing.
      node.setAttribute(key, KEY_COUNTER++);
    }
  };
  /**
   * @param {!Node} node
   * @param {{tagName: string, allowedTags: !Object<string, boolean>}} data
   */

  const uponSanitizeElement = function(node, data) {
    const { tagName } = data;
    allowedTags = data.allowedTags; // Allow all AMP elements (constrained by AMP Validator since tag
    // calculation is not possible).

    if (startsWith(tagName, "amp-")) {
      allowedTags[tagName] = true; // AMP elements don't support arbitrary mutation, so don't DOM diff them.

      disableDiffingFor(node);
    } // Set `target` attribute for <a> tags if necessary.

    if (tagName === "a") {
      if (node.hasAttribute("href") && !node.hasAttribute("target")) {
        node.setAttribute("target", "_top");
      }
    } // Allow certain tags if they have an attribute with a whitelisted value.

    const whitelist = WHITELISTED_TAGS_BY_ATTRS[tagName];

    if (whitelist) {
      const { attribute, values } = whitelist;

      if (
        node.hasAttribute(attribute) &&
        values.includes(node.getAttribute(attribute))
      ) {
        allowedTags[tagName] = true;
        allowedTagsChanges.push(tagName);
      }
    }
  };
  /**
   * @param {!Node} unusedNode
   */

  const afterSanitizeElements = function(unusedNode) {
    // DOMPurify doesn't have a attribute-specific tag whitelist API and
    // `allowedTags` has a per-invocation scope, so we need to undo
    // changes after sanitizing elements.
    allowedTagsChanges.forEach(tag => {
      delete allowedTags[tag];
    });
    allowedTagsChanges.length = 0;
  };
  /**
   * @param {!Node} node
   * @param {{attrName: string, attrValue: string, allowedAttributes: !Object<string, boolean>}} data
   */

  const uponSanitizeAttribute = function(node, data) {
    // Beware of DOM Clobbering when using properties or functions on `node`.
    // DOMPurify checks a few of these for its internal usage (e.g. `nodeName`),
    // but not others that may be used in custom hooks.
    // See https://github.com/cure53/DOMPurify/wiki/Security-Goals-&-Threat-Model#security-goals
    // and https://github.com/cure53/DOMPurify/blob/master/src/purify.js#L527.
    const tagName = node.nodeName.toLowerCase();
    const { attrName } = data;
    let { attrValue } = data;
    allowedAttributes = data.allowedAttributes;

    const allowAttribute = () => {
      // Only add new attributes to `allowedAttributesChanges` to avoid removing
      // default-supported attributes later erroneously.
      if (!allowedAttributes[attrName]) {
        allowedAttributes[attrName] = true;
        allowedAttributesChanges.push(attrName);
      }
    }; // Allow all attributes for AMP elements. This avoids the need to whitelist
    // nonstandard attributes for every component e.g. amp-lightbox[scrollable].

    const isAmpElement = startsWith(tagName, "amp-");

    if (isAmpElement) {
      allowAttribute();
    } else {
      // `<A>` has special target rules:
      // - Default target is "_top";
      // - Allowed targets are "_blank", "_top";
      // - All other targets are rewritted to "_top".
      if (tagName == "a" && attrName == "target") {
        const lowercaseValue = attrValue.toLowerCase();

        if (!WHITELISTED_TARGETS.includes(lowercaseValue)) {
          attrValue = "_top";
        } else {
          // Always use lowercase values for `target` attr.
          attrValue = lowercaseValue;
        }
      } // For non-AMP elements, allow attributes in tag-specific whitelist.

      const attrsByTags = WHITELISTED_ATTRS_BY_TAGS[tagName];

      if (attrsByTags && attrsByTags.includes(attrName)) {
        allowAttribute();
      }
    }

    const classicBinding =
      attrName[0] == "[" && attrName[attrName.length - 1] == "]";
    const alternativeBinding = startsWith(attrName, BIND_PREFIX); // Rewrite classic bindings e.g. [foo]="bar" -> data-amp-bind-foo="bar".
    // This is because DOMPurify eagerly removes attributes and re-adds them
    // after sanitization, which fails because `[]` are not valid attr chars.

    if (classicBinding) {
      const property = attrName.substring(1, attrName.length - 1);
      node.setAttribute(`${BIND_PREFIX}${property}`, attrValue);
    }

    if (classicBinding || alternativeBinding) {
      // Set a custom attribute to mark this element as containing a binding.
      // This is an optimization that obviates the need for DOM scan later.
      node.setAttribute("i-amphtml-binding", ""); // Don't DOM diff nodes with bindings because amp-bind scans newly
      // rendered elements and discards _all_ old elements _before_ diffing, so
      // preserving some old elements would cause loss of functionality.

      disableDiffingFor(node);
    }

    if (
      isValidAttr(
        tagName,
        attrName,
        attrValue,
        /* opt_purify */
        true
      )
    ) {
      if (attrValue && !startsWith(attrName, "data-amp-bind-")) {
        attrValue = rewriteAttributeValue(tagName, attrName, attrValue);
      }
    } else {
      // user().error(TAG$2, `Removing "${attrName}" attribute with invalid ` + `value in <${tagName} ${attrName}="${attrValue}">.`);
      data.keepAttr = false;
    } // Update attribute value.

    data.attrValue = attrValue;
  };
  /**
   * @param {!Node} node
   * @this {{removed: !Array}} Contains list of removed elements/attrs so far.
   */

  const afterSanitizeAttributes = function(node) {
    // DOMPurify doesn't have a tag-specific attribute whitelist API and
    // `allowedAttributes` has a per-invocation scope, so we need to undo
    // changes after sanitizing attributes.
    allowedAttributesChanges.forEach(attr => {
      delete allowedAttributes[attr];
    });
    allowedAttributesChanges.length = 0; // Restore the `on` attribute which DOMPurify incorrectly flags as an
    // unknown protocol due to presence of the `:` character.

    remove(this.removed, r => {
      if (r.from === node && r.attribute) {
        const { name, value } = r.attribute;

        if (name.toLowerCase() === "on") {
          node.setAttribute("on", value);
          return true; // Delete from `removed` array once processed.
        }
      }

      return false;
    });
  };

  purifier.addHook("uponSanitizeElement", uponSanitizeElement);
  purifier.addHook("afterSanitizeElements", afterSanitizeElements);
  purifier.addHook("uponSanitizeAttribute", uponSanitizeAttribute);
  purifier.addHook("afterSanitizeAttributes", afterSanitizeAttributes);
}
/**
 * Uses DOMPurify to sanitize HTML with stricter policy for unescaped templates
 * e.g. triple mustache.
 *
 * @param {string} html
 * @param {!Document=} doc
 * @return {string}
 */

function purifyTagsForTripleMustache(html, doc = self.document) {
  // Reference to DOMPurify's `allowedTags` whitelist.
  let allowedTags;
  DomPurify.addHook("uponSanitizeElement", (node, data) => {
    const { tagName } = data;
    allowedTags = data.allowedTags;

    if (tagName === "template") {
      const type = node.getAttribute("type");

      if (type && type.toLowerCase() === "amp-mustache") {
        allowedTags["template"] = true;
      }
    }
  });
  DomPurify.addHook("afterSanitizeElements", unusedNode => {
    // DOMPurify doesn't have an required-attribute tag whitelist API and
    // `allowedTags` has a per-invocation scope, so we need to remove
    // required-attribute tags after sanitizing each element.
    allowedTags["template"] = false;
  }); // <template> elements are parsed by the browser as document fragments and
  // reparented to the head. So to support nested templates, we need
  // RETURN_DOM_FRAGMENT to keep the <template> and FORCE_BODY to prevent
  // reparenting. See https://github.com/cure53/DOMPurify/issues/285#issuecomment-397810671

  const fragment = DomPurify.sanitize(html, {
    ALLOWED_TAGS: TRIPLE_MUSTACHE_WHITELISTED_TAGS,
    FORCE_BODY: true,
    RETURN_DOM_FRAGMENT: true
  });
  DomPurify.removeAllHooks(); // Serialize DocumentFragment to HTML. XMLSerializer would also work, but adds
  // namespaces for all elements and attributes.

  const div = doc.createElement("div");
  div.appendChild(fragment);
  return (
    /*OK*/
    div.innerHTML
  );
}

export {
  purifyHtml,
  purifyConfig,
  addPurifyHooks,
  purifyTagsForTripleMustache
};
