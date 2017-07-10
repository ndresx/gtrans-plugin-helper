const gtwSnippetDefaults = {
  pageLanguage: 'en',
  includedLanguages: 'en,de,fr,it,es',
  layout: 'google.translate.TranslateElement.InlineLayout.HORIZONTAL',
  multilanguagePage: true,
};

const widgetId = 'google_translate_element';

function init() {
  // eslint-disable-next-line
  require('./index.js');
}

function getGlobalHelper() {
  // eslint-disable-next-line
  return global.__GTRANSPLUGINHELPER__;
}

function simulateGoogleTranslateCall() {
  const google = {
    translate: {
      TranslateElement() {},
    },
  };

  google.translate.TranslateElement.InlineLayout = {
    HORIZONTAL: true,
  };

  global.google = google;

  getGlobalHelper().initElement();
}

function injectOriginalWidget(id = widgetId) {
  const gtw = document.querySelector(`#${id}`);

  if (gtw) {
    const select = document.createElement('select');
    select.className = 'skiptranslate';
    gtw.appendChild(select);
  }
}

function injectWidgetElements(bannerFrame = true, menuFrame = true) {
  if (bannerFrame) {
    const banner = document.createElement('frame');
    banner.className = 'goog-te-banner-frame skiptranslate';
    Object.defineProperty(banner, 'offsetHeight', { value: 50 });
    document.body.appendChild(banner);
  }

  if (menuFrame) {
    const menu = document.createElement('frame');
    menu.className = 'goog-te-menu-frame skiptranslate';

    document.body.appendChild(menu);
    const contentDocument = document.createElement('div');
    Object.defineProperty(menu, 'contentDocument', {
      value: contentDocument,
    });

    ['en', 'es', 'fr'].forEach(lang => {
      const el = document.createElement('a');
      el.value = lang;
      el.addEventListener('click', () => {
        document.cookie = `googtrans=/en/${lang}`;
      });
      contentDocument.appendChild(el);
    });
  }
}

function getBannerFrame() {
  return document.querySelector('.goog-te-banner-frame');
}

describe('gtrans-plugin-helper', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    document.cookie = 'googtrans=0;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.documentElement.setAttribute('lang', 'en');
    document.body.innerHTML = `
      <div id="${widgetId}"></div>
    `;
  });

  it('should correctly initialize itself with the original widget', () => {
    init();
    injectOriginalWidget();
    const widget = document.querySelector(`#${widgetId}`);
    expect(widget.childNodes.length).toBeTruthy();

    const onChange = jest.fn();
    getGlobalHelper().init(gtwSnippetDefaults, { onChange });

    simulateGoogleTranslateCall();

    expect(widget).toBeTruthy();
    expect(widget.childNodes.length).toBeFalsy();

    injectWidgetElements();
    injectOriginalWidget();
    const bannerFrame = getBannerFrame();
    expect(bannerFrame).toBeTruthy();
    jest.runTimersToTime(250);
    expect(onChange).toBeCalledWith('en');
    expect(onChange.mock.calls.length).toBe(1);

    // Should not call onChange if the language stays the same
    bannerFrame.click();
    jest.runTimersToTime(0);
    expect(onChange.mock.calls.length).toBe(1);

    expect(getGlobalHelper().getLanguage()).toBe('en');
    getGlobalHelper().setLanguage('fr');
    expect(getGlobalHelper().getLanguage()).toBe('fr');

    jest.runTimersToTime(0);
    expect(onChange).toBeCalledWith('fr');
    expect(onChange.mock.calls.length).toBe(2);
    getGlobalHelper().setLanguage('fr');
  });

  it('should load Google Translate if widget elements are not present when setting the language', () => {
    init();
    getGlobalHelper().init(gtwSnippetDefaults);

    // Skip setLanguage call if not fully loaded
    expect(getGlobalHelper().setLanguage('es')).toBeUndefined();
    expect(getGlobalHelper().getLanguage()).toBe('en');

    simulateGoogleTranslateCall();

    injectWidgetElements(true, false);
    expect(getBannerFrame()).toBeTruthy();
    jest.runTimersToTime(250);

    document.body.appendChild = jest.fn();
    expect(getGlobalHelper().getLanguage()).toBe('en');

    getGlobalHelper().setLanguage('fr');
    expect(document.body.appendChild.mock.calls.length).toBe(1);
    expect(getGlobalHelper().getLanguage()).toBe('fr');
  });

  it('should pick pageLanguage from <html> tag and load Google Translate', () => {
    init();
    global.location.hash = `googtrans=/en/fr`;

    const gtwSnippet = { ...gtwSnippetDefaults };
    delete gtwSnippet.pageLanguage;

    getGlobalHelper().init(gtwSnippet, {
      cookieDomain: '.',
      cookiePath: '/',
    });

    simulateGoogleTranslateCall();

    injectWidgetElements();
    injectOriginalWidget();

    getGlobalHelper().setLanguage('es');
    expect(getGlobalHelper().getLanguage()).toBe('es');
  });

  it('should auto init if #googtrans url hash is present and load Google Translate', () => {
    init();
    global.location.hash = `googtrans(en|fr)`;

    document.body.appendChild = jest.fn();
    expect(document.body.appendChild.mock.calls.length).toBe(0);

    getGlobalHelper().init({ ...gtwSnippetDefaults }, { widgetId: 'dummy' });

    expect(document.body.appendChild.mock.calls.length).toBe(1);
  });

  it('should exit early if global already exists', () => {
    // eslint-disable-next-line
    global.__GTRANSPLUGINHELPER__ = true;
    init();
    expect(getGlobalHelper()).toBe(true);
  });

  afterEach(() => {
    jest.resetModules();

    // eslint-disable-next-line
    delete global.__GTRANSPLUGINHELPER__;

    if (document.body.appendChild.mockReset) {
      document.body.appendChild.mockReset();
      document.body.appendChild.mockRestore();
    }
  });
});
