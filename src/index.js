// eslint-disable-next-line
!(function() {
  const googtransRegex = /googtrans=\/([a-z-]+)\/([a-z-]+)/i;
  let pageLanguage = null;
  let currentLanguage = null;
  let targetLanguage = null;

  let loading = false;
  let updateInterval = null;
  let gPluginOptions = null;
  let gPluginEl = null;
  const options = {
    cookieDays: 7,
    cookieDomain: null,
    cookiePath: null,
    onChange: null,
    pluginId: 'google_translate_element',
  };

  function loadGoogleTranslate() {
    if (!loading) {
      loading = true;
      const el = document.createElement('script');
      el.src =
        '//translate.google.com/translate_a/element.js?cb=__GTRANSPLUGINHELPER__.initElement';
      document.body.appendChild(el);
    }
  }

  function updateTargetLanguage() {
    const match = document.cookie.match(googtransRegex);

    if (match && match[1] !== match[2] && pageLanguage !== match[2]) {
      targetLanguage = match[2];
      return;
    }

    targetLanguage = null;
  }

  function cleanUp(withGadget = true) {
    document
      .querySelectorAll(`.skiptranslate${withGadget ? '' : ':not(.goog-te-gadget)'}`)
      .forEach(node => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
  }

  function getBanner() {
    return document.querySelector('.goog-te-banner-frame');
  }

  function getLanguage() {
    updateTargetLanguage();
    return targetLanguage || pageLanguage;
  }

  function setLanguage(language) {
    if (loading || !language || targetLanguage === language) return;

    // Use existing banner for changing the language
    const banner = getBanner();
    const iFrame =
      (!gPluginEl || (banner && banner.offsetHeight)) &&
      document.querySelector('.goog-te-menu-frame');

    if (iFrame) {
      const contents = iFrame.contentDocument || iFrame.contentWindow.document;
      const found = [...contents.querySelectorAll('a')].filter(node => {
        if (node.value === language) {
          node.click();
          return true;
        }

        return false;
      });

      if (found) return;
    }

    if (gPluginEl) {
      cleanUp();
    }

    // Set new language cookie to be picked up by the re-initialization process
    const today = new Date();
    const expire = new Date();
    const cookieDomain = options.cookieDomain ? `;domain=${options.cookieDomain}` : '';
    const cookiePath = options.cookiePath ? `;domain=${options.cookiePath}` : '';

    expire.setTime(today.getTime() + 86400000 * options.cookieDays);
    document.cookie = `googtrans=/${pageLanguage}/${language};expires=${expire.toUTCString()}${cookieDomain}${cookiePath}`;

    // Re-initialize Google Translate
    loadGoogleTranslate();
  }

  function onChange() {
    if (options.onChange) {
      const language = getLanguage();

      if (language !== currentLanguage) {
        options.onChange(language);
        currentLanguage = language;
      }
    }
  }

  function observe() {
    if (updateInterval) {
      clearInterval(updateInterval);
    }

    const checkStatus = () => {
      onChange();

      if (!targetLanguage) {
        const banner = getBanner();

        if (!banner || !banner.offsetHeight) {
          cleanUp(!gPluginEl);
          clearInterval(updateInterval);
        }
      }
    };

    updateInterval = setInterval(checkStatus, 300);
  }

  function init(plugin, opts) {
    Object.assign(options, opts);
    gPluginOptions = plugin;

    if (typeof gPluginOptions !== 'function') {
      throw new Error(
        'The "plugin" argument must be a function which returns the Google Translate plugin configuration.'
      );
    }

    gPluginEl = document.querySelector(`#${options.pluginId}`);
    pageLanguage =
      options.pageLanguage || document.documentElement.getAttribute('lang').split('-')[0];

    updateTargetLanguage();

    if (targetLanguage || gPluginEl || window.location.hash.match(googtransRegex)) {
      loadGoogleTranslate();
    }

    return this;
  }

  function initElement() {
    loading = false;
    if (gPluginEl && gPluginEl.childNodes.length) gPluginEl.removeChild(gPluginEl.childNodes[0]);

    // eslint-disable-next-line
    new google.translate.TranslateElement(gPluginOptions(), options.pluginId);
    observe();
  }

  // eslint-disable-next-line
  window.__GTRANSPLUGINHELPER__ = {
    init,
    initElement,
    getLanguage,
    setLanguage,
  };
})();
