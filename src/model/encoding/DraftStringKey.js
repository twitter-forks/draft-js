/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @flow strict
 * @emails oncall+draft_js
 */

'use strict';

const DraftStringKey = {
  stringify: function(key: mixed): string {
    return '_' + String(key);
  },

  unstringify: function(key: string): string {
    return key.slice(1);
  },
};

module.exports = DraftStringKey;
