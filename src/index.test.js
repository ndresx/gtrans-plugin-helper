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

function mockGoogleTranslateCall() {
  const google = {
    translate: {
      TranslateElement() {},
    },
  };

  google.translate.TranslateElement.InlineLayout = {
    HORIZONTAL: true,
  };

  global.google = google;
}

function injectOriginalWidget(id = widgetId) {
  const gtw = document.querySelector(`#${id}`);

  if (gtw) {
    const select = document.createElement('select');
    select.className = 'skiptranslate';
    gtw.appendChild(select);
  }
}

function injectWidgetBannerFrame() {
  const el = document.createElement('frame');
  el.className = 'goog-te-banner-frame skiptranslate';
  document.body.appendChild(el);
}

function getBannerFrame() {
  return document.querySelector('.goog-te-banner-frame');
}

function getGlobalHelper() {
  // eslint-disable-next-line
  return global.__GTRANSPLUGINHELPER__;
}

describe('gtrans-plugin-helper', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    document.documentElement.setAttribute('lang', 'en');
    document.body.innerHTML = `
      <div id="${widgetId}"></div>
    `;
  });

  it('should correctly initialize itself', () => {
    init();
    injectOriginalWidget();
    const widget = document.querySelector(`#${widgetId}`);
    expect(widget.childNodes.length).toBeTruthy();
    getGlobalHelper().init(gtwSnippetDefaults);
    mockGoogleTranslateCall();
    getGlobalHelper().initElement();
    expect(widget).toBeTruthy();
    expect(widget.childNodes.length).toBeFalsy();

    injectWidgetBannerFrame();
    injectOriginalWidget();
    expect(getBannerFrame()).toBeTruthy();
    jest.runTimersToTime(250);

    expect(getGlobalHelper().getLanguage()).toBe('en');
    getGlobalHelper().setLanguage('fr');
    expect(getGlobalHelper().getLanguage()).toBe('fr');

    getGlobalHelper().setLanguage('en');
    expect(getBannerFrame()).toBeFalsy();

    injectWidgetBannerFrame();
    injectOriginalWidget();

    const banner = getBannerFrame();
    banner.click();
    jest.runTimersToTime(0);
  });

  it.skip('should pick pageLanguage from <html> tag and load Google Translate', () => {
    init();
    document.body.appendChild = jest.fn();
    global.location.hash = `googtrans=/en/fr`;

    const gtwSnippet = { ...gtwSnippetDefaults };
    delete gtwSnippet.pageLanguage;
    expect(document.body.appendChild.mock.calls.length).toBe(0);

    getGlobalHelper().init(gtwSnippet);

    expect(document.body.appendChild.mock.calls.length).toBe(1);
    document.body.appendChild.mockReset();
  });

  it.skip('should auto init if #googtrans url hash is present and load Google Translate', () => {
    init();
    global.location.hash = `googtrans=/en/fr`;
    document.body.appendChild = jest.fn();
    expect(document.body.appendChild.mock.calls.length).toBe(0);

    getGlobalHelper().init({ ...gtwSnippetDefaults }, { widgetId: 'dummy' });

    expect(document.body.appendChild.mock.calls.length).toBe(1);
    document.body.appendChild.mockReset();
  });

  it('should exit early if global already exists', () => {
    // eslint-disable-next-line
    global.__GTRANSPLUGINHELPER__ = 123;
    init();
    expect(getGlobalHelper()).toBe(123);
  });

  afterEach(() => {
    delete getGlobalHelper();
  });
});
