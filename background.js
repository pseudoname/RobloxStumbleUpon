// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({gamesPool:[]});
  chrome.storage.local.set({criteria:"default"});
  var metricsObj = {
    totalStumbleCount: 0,
    defaultCounter: 0,
    genreCounters:[],
    playCount: 0,
    currentStumbleCount: 0,
    stumbleCountPerPlay: []
  }
  chrome.storage.local.set({metrics: metricsObj});
  
});


