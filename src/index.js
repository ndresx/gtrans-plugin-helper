// eslint-disable-next-line
!(function() {
  // eslint-disable-next-line
  if (window.__GTRANSPLUGINHELPER__) {
    return;
  }

  let pageLanguage = null;
  let currentLanguage = null;
  let targetLanguage = null;
  let loading = false;
  let observeInterval = null;
  let onChangeTimeout = null;

  const googtransRegEx = /googtrans=?[/(]([a-z-]+)[/|]([a-z-]+)/i;
  let gPluginOptions = null;
  let gPluginEl = null;

  const options = {
    cookieDomain: null,
    cookiePath: null,
    onChange: null,
    widgetId: 'google_translate_element',
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
    const match = document.cookie.match(googtransRegEx);

    if (match && match[1] !== match[2] && pageLanguage !== match[2]) {
      targetLanguage = match[2];
      return;
    }

    targetLanguage = null;
  }

  function cleanUp(withGadget = true) {
    [
      ...document.querySelectorAll(`.skiptranslate${withGadget ? '' : ':not(.goog-te-gadget)'}`),
    ].forEach(node => {
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
    onChangeTimeout = setTimeout(() => {
      if (options.onChange) {
        const language = getLanguage();

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
    const banner = getBannerFrame();
    const iFrame =
      (!gPluginEl || (banner && banner.offsetHeight)) &&
      document.querySelector('.goog-te-menu-frame');

    if (iFrame) {
      const links = iFrame.contentDocument.querySelectorAll('a');
      const found =
        links.length &&
        [...iFrame.contentDocument.querySelectorAll('a')].filter(node => {
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
    const cookieDomain = options.cookieDomain ? `;domain=${options.cookieDomain}` : '';
    const cookiePath = options.cookiePath ? `;path=${options.cookiePath}` : '';

    document.cookie = `googtrans=/${pageLanguage}/${language}${cookieDomain}${cookiePath}`;

    // Re-initialize Google Translate
    loadGoogleTranslate();
  }

  function onElementClick() {
    onChange();

    if (!targetLanguage) {
      const banner = getBannerFrame();

      if (!(banner && banner.offsetHeight)) {
        cleanUp(!gPluginEl);
      }
    }
  }

  function observe() {
    clearInterval(observeInterval);
    const checkStatus = () => {
      const banner = getBannerFrame();

      if (banner) {
        onChange();
        clearInterval(observeInterval);

        // Observe interactions with relevant items, no matter what kind of interaction it is
        const elements = [banner, ...document.querySelectorAll('.goog-te-menu-frame')];

        banner.removeEventListener('click', onElementClick);
        banner.addEventListener('click', onElementClick);

        elements.forEach(el => {
          const contents = el.contentDocument;
          contents.removeEventListener('click', onElementClick);
          contents.addEventListener('click', onElementClick);
        });

        if (gPluginEl) {
          gPluginEl.removeEventListener('click', onElementClick);
          gPluginEl.addEventListener('click', onElementClick);
          const select = gPluginEl.querySelector('select');

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
    Object.assign(options, opts);
    gPluginOptions = plugin;
    gPluginEl = document.querySelector(`#${options.widgetId}`);
    pageLanguage =
      gPluginOptions.pageLanguage || document.documentElement.getAttribute('lang').split('-')[0];

    updateTargetLanguage();

    if (targetLanguage || gPluginEl || window.location.hash.match(googtransRegEx)) {
      loadGoogleTranslate();
    }

    return this;
  }

  function initElement() {
    loading = false;
    if (gPluginEl && gPluginEl.childNodes.length) gPluginEl.removeChild(gPluginEl.childNodes[0]);

    const gOptions = { ...gPluginOptions };
    let layout = window;

    // Restore original layout value from string
    gOptions.layout.split('.').forEach(el => {
      layout = layout[el];
    });

    gOptions.layout = layout;
    new google.translate.TranslateElement(gOptions, options.widgetId); // eslint-disable-line
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
