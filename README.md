# gtrans-plugin-helper
A simple helper for building your own custom-styled translation widget based on Google Translate.

* [Getting Started](#getting-started)
* [Motivation](#motivation)
* [Examples](#examples)
* [API](#api)
* [Options](#options)
* [License](#license)

## Getting Started

Go to the official website https://translate.google.com/manager/website/ and create your widget as you would normally do. Once created, save the generated JavaScript code for now and start building your HTML component based on the settings you have used before _(mainly referring to the languages you want to use on your website)_.

In our example we are using a normal form select with 3 languages: English, German and French.

### HTML

```html
<select id="language-select" onchange="onSelectChange(this.options)">
  <option class="notranslate" value="en">English</option>
  <option class="notranslate" value="de">Deutsch</option>
  <option class="notranslate" value="fr">Français</option>
</select>
```

_If you however decide to use one of the original components for displaying the language picker, you can also do this._

Next comes the part where you have to connect the pugin helper with the select. The helper is built on top of Google Translate's widget _(that's why you had to create a new widget before)_, which requires a globally defined callback to initialize itself. For this reason, the plugin's main functionality is exposed to the global scope in form of a mini-API - accessible under `window.__GTRANSPLUGINHELPER__` - as soon as the code of the helper is loaded.

### JavaScript

This code snippet is part of the configuration you have received from the official website. The only thing you need to do is to wrap the `layout` value into '' so that it becomes a string.
```js
var gtwSnippet = {
  pageLanguage: 'en',
  includedLanguages: 'en,de,fr',
  layout: 'google.translate.TranslateElement.InlineLayout.HORIZONTAL',
  multilanguagePage: true
};
```
By calling `init()`, the plugin helper will be initialized with the original snippet data as first argument and/or an optional second argument (object) for an [`onChange`](#onchange) handler and other [`options`](#options) you can find down below.
```js
var api = __GTRANSPLUGINHELPER__.init(
  gtwSnippet, {
    onChange: function (language) {
      document.getElementById('language-select').value = language;
    }
  });
```
Last but not least the onchange handler of your `<select>` element.
```js
function onSelectChange(options) {
  // Changes the language once the selection of the select element changes
  api.setLanguage(options[options.selectedIndex].value);
}
```

## Motivation

The website widget provided by Google Translate is nice and easy to use. However, if you have plans to use your own styles or components to change the language with help of Google Translate, you will quickly notice that there are some limitations.

Because it was interesting to see how Google Translate works in the first place, the here presented `gtrans-plugin-helper` allows you to create your own custom-styled component, no matter if it's consisting of simple links,  a form select, or language flag icons. It's completely up to you in which way you want to allow users changing the language on your page.

## Examples

### Links
In the [Getting Started](#getting-started) section we have used our own select to change the language, but how would it work with links? Very similar if you look at the following example.

#### HTML
```html
<ul>
  <li><a class="notranslate" data-lang="en" href="#">English</a></li>
  <li><a class="notranslate" data-lang="de" href="#">Deutsch</a></li>
  <li><a class="notranslate" data-lang="fr" href="#">Français</a></li>
</ul>
```

#### JavaScript
Look at the [Getting Started](#getting-started) section to see how to set up the `gtwSnippet`.
```js
var api = __GTRANSPLUGINHELPER__.init(gtwSnippet);
```
Select all relevant `<a>` tags and add click-event listeners to them.
```js
Array.prototype.forEach.call(document.querySelectorAll('a[data-lang]'), function (el) {
  el.addEventListener('click', function (e) {
    e.preventDefault();
    api.setLanguage(el.dataset.lang);
  });
})
```
Or here with jQuery:
```js
$('a[data-lang]').click(function (e) {
  e.preventDefault();
  api.setLanguage(e.target.dataset.lang);
});
```

## API

### `init(googleTranslateWidgetSnippet, [{ options }])`
The `init` function needs to be called at some point to initialize the plugin helper as well as the Google Translate widget. The first argument is the snippet you will receive from the official website (see [Getting Started](#getting-started)) and the second argument is an optional [configuration object](#options) for the helper itself.

### `setLanguage(language)`
The `setLanguage` function allows you to set the `language` of Google Translate, by passing in an `ISO 639-1` compatible language value like `en`. If you need to pass the locale for certain languages as well, please look at the official Google Translate website to find out which particular values are supported (see [Getting Started](#getting-started)).

### `getLanguage()`
The `getLanguage` function returns the current `language` of Google Translate.

## Options

|Name|Type|Default|Description|
|:--|:--:|:-----:|:----------|
|[**onChange**](#onchange) |`function`|`null`|Handler that's called when the language is changed|
|[**idSelector**](#idselector)|`string`|`google_translate_element`|id selector of the original widget|

### `onChange`
The `onChange` callback is recommended to use in order to update your UI accordingly. It will be called every time the `language` of Google Translate changes and receives it as first argument.

### `idSelector`
Although this helper's purpose is it to allow you to create your own frontend component, you can still use the original widget and/or in combination with a custom language picker. You could either specify your own id selector for the element wrapper, or leave the default value of `google_translate_element`.

```html
<div id="google_translate_element"></div>
```

### Advanced
If your domain or path configuration requires a change in how the language cookie should be saved, the following 3 options may help you in doing that. _Please note though that the original widget's behavior cannot be changed and that's why these options should match the ones the original widget is using to write cookies._

|Name|Type|Default|Description|
|:--|:--:|:-----:|:----------|
|**cookieDomain**|`string`|`null`|The `domain` which is used for the cookie creation|
|**cookiePath**|`string`|`null`|The `path` which is used for the cookie creation|

## License

MIT

[npm]: https://img.shields.io/npm/v/react-countdown-now.svg
[npm-url]: https://npmjs.com/package/react-countdown-now
