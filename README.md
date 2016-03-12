#Fork features:
* Set maxlength attributte on mask: example `$([selector]).mask("000",{placeholder: "___", maxlength: 10})`. It overrides maxlength on html tag.

* AutoTab: If maxlength attribute specified, when reach maxlength, focus automatically jumps to next input (see image below). To enable, in $.jMaskGlobals, set `autoTab: true` (default is true).

* Placeholder added features: the placeholder act as a mask and disappear as you type. It does not mess with validation as it is inside a < span > above the real input. Thanks diy for code to make this work: [https://github.com/diy/jquery-placeholder](http://) . To enable, in $.jMaskGlobals, set `forcePlaceholder: true` (default is true) to override native placeholder.

* Aliases: for example, in $.jMaskGlobals, after `translation: {...}`, add:<br>
```
      ,aliases: {<br>
          "numeric": {mask: "0#"},<br>
          "date": {mask: "00/00/0000", options: {placeholder: "dd/mm/yyyy", maxlength: 10}}<br>
        }<br>
```
    Now you can use `$([selector]).mask("numeric");` or `< input data-mask="numeric" ... >` for numeric mask, etc.

* Refresh method: call `$.jMaskRefresh($([selector]);` to reapply mask on input that was changed by another plugin (instead of a keyup/keydown event).

* You need to put `$.jMaskRun();` in your code to run the plugin. This was needed as otherwise it was not reading the $.jMaskGlobals options if it was set after loading the plugin. Example:<br>
```
$.jMaskGlobals = {
    ...
    translation: {
   		...
    },
    aliases: {
    	...
    }
};

**$.jMaskRun();**
```
<br><br>

Working of placeholder and autoTab:
![alt text](https://github.com/andreacc/jQuery-Mask-Plugin/blob/master/example.gif "example")



#jQuery Mask Plugin
A jQuery Plugin to make masks on form fields and HTML elements.

[![Build Status](https://travis-ci.org/igorescobar/jQuery-Mask-Plugin.png)](https://travis-ci.org/igorescobar/jQuery-Mask-Plugin)
[![Code Climate](https://codeclimate.com/github/igorescobar/jQuery-Mask-Plugin.png)](https://codeclimate.com/github/igorescobar/jQuery-Mask-Plugin)

#Documentation, Demos & Usage Examples
https://igorescobar.github.io/jQuery-Mask-Plugin/

##Features

  * Lightweight (~2kb minified, ~1kb gziped).
  * Built-in support for dynamically added elements.
  * Masks on any HTML element (no need to server-side mask anymore!)!
  * HTML notation support (data-mask, data-mask-recursive, data-mask-clearifnotmatch).
  * String/Numeric/Alpha/Mixed masks.
  * Reverse mask support for masks on numeric fields.
  * Sanitization.
  * Optional digits.
  * Recursive Digits.
  * Fallback Digits.
  * Advanced mask initialization.
  * Advanced Callbacks.
  * On-the-fly mask change.
  * Mask removal.
  * Full customization.
  * Compatibility with UMD/Zepto.js/Angular.JS.
  * HTML5 placeholder support.
  * Clear the field if it not matches support.

##Tutorials
### English
  * [Masks with jQuery Mask Plugin](http://bit.ly/masks-with-jquery-mask-plugin)
  * [Using jQuery Mask Plugin With Zepto.js](http://bit.ly/using-jquery-mask-plugin-with-zeptojs)

### Portuguese
  * [Mascaras com JQuery Mask Plugin](http://bit.ly/mascaras-com-jquery-mask-plugin)
  * [Mascara Javascript para os novos telefones de São Paulo](http://bit.ly/mascara-javascript-para-os-novos-telefones-de-sao-paulo)

### Russian
  * [jQuery Mask Plugin](http://zencoder.ru/javascript/jquery-mask-plugin/)

## Compatibility
jQuery Mask Plugin has been tested with jQuery 1.7+ on all major browsers:

 * Firefox 2+ (Win, Mac, Linux);
 * IE7+ (Win);
 * Chrome 6+ (Win, Mac, Linux, Android, iPhone);
 * Safari 3.2+ (Win, Mac, iPhone);
 * Opera 8+ (Win, Mac, Linux, Android, iPhone).

## Problems & Bugs?
Did you read our [docs](https://igorescobar.github.io/jQuery-Mask-Plugin/)? Yes? Cool! So now... make sure that you have a *functional* [jsfiddle](http://jsfiddle.net/) exemplifying your problem and open an [issue](https://github.com/igorescobar/jQuery-Mask-Plugin/issues) for us. Don't know how to do it? Use this [fiddle example](http://jsfiddle.net/igorescobar/6pco4om7/).

## Contributing
 * **Bug Reporting**: Yes! You can contribute opening [issues](https://github.com/igorescobar/jQuery-Mask-Plugin/issues)!
 * **Documenting**: Do you think that something in our [docs](https://github.com/igorescobar/jQuery-Mask-Plugin/tree/gh-pages) should be better? Do you have a cool idea to increase the awesomeness? Summit your pull request with your idea!
 * **Bug Fixing**: No time to lose? Fix it and help others! Write some [tests](https://github.com/igorescobar/jQuery-Mask-Plugin/tree/master/test) to make sure that everything are working propertly.
 * **Improving**: Open an [issue](https://github.com/igorescobar/jQuery-Mask-Plugin/issues) and lets discuss it. Just to make sure that you're on the right track.
 * **Sharing**: Yes! Have we saved some of your time? Are you enjoying our mask plugin? Sharing is caring! Tweet it! Facebook it! Linkedin It(?!) :D
 * **Donating**: Hey, now that you don't need to worry about masks again... buy me a coffee, beer or a PlayStation 4 (Xbox One also accepted!) :o)

### Unit Tests
We use [QUnit](http://qunitjs.com/) and [GruntJS](http://gruntjs.com/). To run our test suit is just run: ```grunt test``` in your console or you can open those ```test-for*.html``` files inside of our ```test/``` folder.

In case you're familiar with [Docker](https://www.docker.com/) here is how you can use it:
```bash
docker build -t jquery-mask .
CONTAINER_ID=$(docker run -d -v $PWD:/app/jquery-mask-plugin jquery-mask)
docker exec $CONTAINER_ID sh -c "npm install"
docker exec -it $CONTAINER_ID /bin/bash
grunt test
```

## Contributors
 * [Igor Lima](https://github.com/igorlima)
 * [Mark Simmons](https://github.com/Markipelago)
 * [Gabriel Schammah](https://github.com/gschammah)
 * [Marcelo Manzan](https://github.com/kawamanza)
 * [See the full list](https://github.com/igorescobar/jQuery-Mask-Plugin/graphs/contributors)

## Help us!
[![Click here to lend your support to: jQuery Mask Plugin and make a donation at pledgie.com !](https://pledgie.com/campaigns/22649.png?skin_name=chrome)](https://pledgie.com/campaigns/22649)

[![Flattr this](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=igorescobar&url=https%3A%2F%2Fflattr.com%2Fprofile%2Figorescobar)

## Donators (Thanks!)
 * Rinaldo Morato
 * [Marcelo Otowicz](http://www.ofen.com.br/)
 * Marcia Cristina Cava
 * [Igor Lima](https://github.com/igorlima)
 * Steve Binder
 * Douglas Patrocinio
 * Paulo Diogo Rodrigues Leão
 * Dorijan Covran
 * Amaro Mariño Malvido
 * Mark Guadagna
 * Serdar Selim Tulunoğlu
 * [Software Download](http://software-download.name)
 * [Full list](https://pledgie.com/campaigns/22649#donors)
