// X Focus Filter - Video URL Interceptor (runs in MAIN world)
// Intercepts fetch responses to capture mp4 video URLs from Twitter API

(function () {
  'use strict';

  var origFetch = window.fetch;
  window.fetch = function () {
    var args = arguments;
    var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url);
    var result = origFetch.apply(this, args);
    try {
      if (url && (url.includes('/TweetDetail') || url.includes('Timeline') || url.includes('/TweetResultByRestId') || url.includes('/UserTweets'))) {
        result.then(function (resp) {
          var clone = resp.clone();
          clone.json().then(function (data) {
            var videos = [];
            dig(data, videos, 0);
            if (videos.length > 0) {
              window.postMessage({ type: '__xfilter_videos__', videos: videos }, '*');
            }
          }).catch(function () {});
        }).catch(function () {});
      }
    } catch (e) {}
    return result;
  };

  // Also intercept XMLHttpRequest in case X uses it
  var origXHROpen = XMLHttpRequest.prototype.open;
  var origXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function () {
    this.__xfilter_url = arguments[1];
    return origXHROpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    var xhr = this;
    var url = xhr.__xfilter_url;
    if (url && (url.includes('/TweetDetail') || url.includes('Timeline') || url.includes('/TweetResultByRestId') || url.includes('/UserTweets'))) {
      xhr.addEventListener('load', function () {
        try {
          var data = JSON.parse(xhr.responseText);
          var videos = [];
          dig(data, videos, 0);
          if (videos.length > 0) {
            window.postMessage({ type: '__xfilter_videos__', videos: videos }, '*');
          }
        } catch (e) {}
      });
    }
    return origXHRSend.apply(this, arguments);
  };

  function dig(obj, videos, depth) {
    if (depth > 25 || !obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        dig(obj[i], videos, depth + 1);
      }
      return;
    }
    if (obj.rest_id && obj.legacy && obj.legacy.extended_entities && obj.legacy.extended_entities.media) {
      var media = obj.legacy.extended_entities.media;
      for (var j = 0; j < media.length; j++) {
        var vi = media[j].video_info;
        if (vi && vi.variants) {
          var mp4s = vi.variants.filter(function (v) { return v.content_type === 'video/mp4'; });
          mp4s.sort(function (a, b) { return (b.bitrate || 0) - (a.bitrate || 0); });
          if (mp4s.length > 0) {
            videos.push({ tweetId: obj.rest_id, url: mp4s[0].url });
          }
        }
      }
    }
    var keys = Object.keys(obj);
    for (var k = 0; k < keys.length; k++) {
      if (typeof obj[keys[k]] === 'object') {
        dig(obj[keys[k]], videos, depth + 1);
      }
    }
  }
})();
