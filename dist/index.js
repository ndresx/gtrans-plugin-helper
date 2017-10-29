'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// eslint-disable-next-line
!function () {
  // eslint-disable-next-line
  if (window.__GTRANSPLUGINHELPER__) {
    return;
  }

  var pageLanguage = null;
  var currentLanguage = null;
  var targetLanguage = null;
  var loading = false;
  var observeInterval = null;
  var onChangeTimeout = null;

  var googtransRegEx = /googtrans=?[/(]([a-z-]+)[/|]([a-z-]+)/i;
  var gPluginOptions = null;
  var gPluginEl = null;

  var options = {
    cookieDomain: null,
    cookiePath: null,
    onChange: null,
    widgetId: 'google_translate_element'
  };

  function loadGoogleTranslate() {
    if (!loading) {
      loading = true;
      var el = document.createElement('script');
      el.src = '//translate.google.com/translate_a/element.js?cb=__GTRANSPLUGINHELPER__.initElement';
      document.body.appendChild(el);
    }
  }

  function matchCookie() {
    return document.cookie.match(googtransRegEx);
  }

  function updateTargetLanguage() {
    var match = matchCookie();

    if (match && match[1] !== match[2] && pageLanguage !== match[2]) {
      targetLanguage = match[2];
      return;
    }

    targetLanguage = null;
  }

  function cleanUp() {
    var withGadget = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    [].concat(_toConsumableArray(document.querySelectorAll('.skiptranslate' + (withGadget ? '' : ':not(.goog-te-gadget)')))).forEach(function (node) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  function getBannerFrame() {
    return document.querySelector('.goog-te-banner-frame');
  }

  function getLanguage() {
    updateTargetLanguage();
    return targetLanguage || pageLanguage;
  }

  function onChange() {
    clearTimeout(onChangeTimeout);
    onChangeTimeout = setTimeout(function () {
      if (options.onChange) {
        var language = getLanguage();

        if (language !== currentLanguage) {
          options.onChange(language);
          currentLanguage = language;
        }
      }
    }, 0);
  }

  function setLanguage(language) {
    if (loading || !language || targetLanguage === language) return;

    // Use existing banner for changing the language
    var banner = getBannerFrame();
    var iFrame = (!gPluginEl || banner && banner.offsetHeight) && document.querySelector('.goog-te-menu-frame');

    if (iFrame) {
      var links = iFrame.contentDocument.querySelectorAll('a');
      var found = links.length && [].concat(_toConsumableArray(iFrame.contentDocument.querySelectorAll('a'))).filter(function (node) {
        if (node.value === language) {
          node.click();
          onChange();
          return true;
        }

        return false;
      });

      if (found) return;
    }

    if (gPluginEl) {
      cleanUp();
    }

    // Set new language cookie to get picked up by the re-initialization process
    var cookieDomain = options.cookieDomain ? ';domain=' + options.cookieDomain : '';
    var cookiePath = options.cookiePath ? ';path=' + options.cookiePath : '';

    document.cookie = 'googtrans=/' + pageLanguage + '/' + language + cookieDomain + cookiePath;

    // Re-initialize Google Translate
    loadGoogleTranslate();
  }

  function onElementClick() {
    onChange();

    if (!targetLanguage) {
      var banner = getBannerFrame();

      if (!(banner && banner.offsetHeight)) {
        cleanUp(!gPluginEl);
      }
    }
  }

  function observe() {
    clearInterval(observeInterval);
    var checkStatus = function checkStatus() {
      var banner = getBannerFrame();

      if (banner) {
        onChange();
        if (matchCookie()) clearInterval(observeInterval);

        // Observe interactions with relevant items, no matter what kind of interaction it is
        var elements = [banner].concat(_toConsumableArray(document.querySelectorAll('.goog-te-menu-frame')));

        banner.removeEventListener('click', onElementClick);
        banner.addEventListener('click', onElementClick);

        elements.forEach(function (el) {
          var contents = el.contentDocument;
          contents.removeEventListener('click', onElementClick);
          contents.addEventListener('click', onElementClick);
        });

        if (gPluginEl) {
          gPluginEl.removeEventListener('click', onElementClick);
          gPluginEl.addEventListener('click', onElementClick);
          var select = gPluginEl.querySelector('select');

          if (select) {
            select.removeEventListener('change', onElementClick);
            select.addEventListener('change', onElementClick);
          }
        }
      }
    };

    observeInterval = setInterval(checkStatus, 200);
  }

  function init(plugin, opts) {
    _extends(options, opts);
    gPluginOptions = plugin;
    gPluginEl = document.querySelector('#' + options.widgetId);
    pageLanguage = gPluginOptions.pageLanguage || document.documentElement.getAttribute('lang').split('-')[0];

    updateTargetLanguage();

    if (targetLanguage || gPluginEl || window.location.hash.match(googtransRegEx)) {
      loadGoogleTranslate();
    }

    return this;
  }

  function initElement() {
    loading = false;
    if (gPluginEl && gPluginEl.childNodes.length) gPluginEl.removeChild(gPluginEl.childNodes[0]);

    var gOptions = _extends({}, gPluginOptions);
    var layout = window;

    // Restore original layout value from string
    gOptions.layout.split('.').forEach(function (el) {
      layout = layout[el];
    });

    gOptions.layout = layout;
    new google.translate.TranslateElement(gOptions, options.widgetId); // eslint-disable-line
    observe();
  }

  // eslint-disable-next-line
  window.__GTRANSPLUGINHELPER__ = {
    init: init,
    initElement: initElement,
    getLanguage: getLanguage,
    setLanguage: setLanguage
  };
}();