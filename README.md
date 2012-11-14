JS-GreenDefine
==============

An "Asynchronous Module Definition" (AMD) library for Javascript.

This library is supposed to be a replacement of [RequireJS][]
in pure browser environment. It even compiles codes in pure
browser enrirovment and generate faster codes. It has
a extremely small codebase that you can easierly read and
modify it if it doesn't fit your requirement.

BTW, my English skill is bad. It's welcome to point out
any errornous writing in this document and help me
to improve it.

Version
=======

0\.03

Features
========

+ Browser only (including compiling)

  This library will run on browser only. Including
  running in the dynamic loading mode,
  compiling the whole project,
  or running in the compiled mode.

  It will ease your work to design your project or plugin.
  You can assume a more consistent environment.
  There is always the window object,
  you can assume that the web only libraries (like jQuery)
  is always available, etc.
  And you can save your code such as providing
  AJAX or fs for different environment.

+ Generate fast code

  There is no complete benchmark yet.
  Just my experience on my project.
  The same project that compiled by [RequireJS][]' r.js
  will load in 7x secs in IE10, but 3x secs by this library
  (without the module deferring).

+ Asynchronous module definition

  Some tasks, such as loading image, in the browser are always asynchronous.
  That makes our module preparation asynchronous as well.
  The original [RequireJS][] lacks the mechanism, so that I used to
  wrote a plugin [RequireJS-defer][] for it.
  Though it's awkward and also ineffecient.

  Today this feature is made in a more natural and effecient way.
  Now we can load a module synchronously or asynchronously
  with identical coding style.

+ Controllable deferring module definition (compiled version)

  When I create a big project. Not every corner of the project
  should be ready in the beginning. And more, the time for
  initializing the whole project might be too long.
  That's the situation we need to defer the module initialization.

+ Small codebase

  Compare to the [RequireJS][]' r.js, about 15,000 lines of code.
  The codebase of this library is extremely small -- about 500 lines of code.

+ Simple mechanism

  The code is short; the mechanism is simple.

+ Easy to extend

  The mechanism is simple; the plugin is easy to implement.

+ Green

  This library doesn't define ANY global variables.

Quick Start
===========

For a complete example, please look up the **test** directory.

First setup
-----------

```javascript
(function(){
    // Do some AJAX stuff to load the define.js code
    // ...
    var code = xhr.responseText;
    (new Function('config', code))({ // You must name the argument 'config'
        // The configuration.

        // The base search directory
        base: 'src',

        // The plugin map, you can add your own plugins,
        // or remove plugins which listed here but you don't need them.
        // The path should be relative to the base.
        // Omit the trailing '.js'.
        plugins: {
            cs: 'plugins/cs',
            ls: 'plugins/ls',
            xml: 'plugins/xml',
            text: 'plugins/text',
            defer: 'plugins/defer',
            global: 'plugins/global'
        },

        // The entry module, omit the trailing '.js'.
        // The path should be relative to the base.
        // And the module should be a function.
        // The GreenDefine will invoke it when ready.
        main: 'test/main',

        // Whether to console.log() the debug message.
        verbose: true,

        // Whether to compile the project
        compile: {
            // The code generation template,
            //  the path is relative to the base
            template: 'template',

            // Output the compiled code by a download link
            //
            //  Note that if you are using Chrome or Chromium,
            //  there is a bug:
            //  when the download size that larger than 2MB (or less)
            //  will crash it when you click the download link.
            //  ref: http://code.google.com/p/chromium/issues/detail?id=103234
            //  The comment 3's gist link is mine.
            //
            //  If you are using Internet Explorer, don't use download link.
            //  Because I was lazy to implement UTF-8 and base64 encoding
            //  DataURI, the only format that IE support.
            output: 'download',
            filename: 'compiled.js',

            // Or, output the compiled code by a form submit
            //  You should implement something like a CGI to collect the result.
            output: 'submit',
            url: 'http://127.0.0.1:3000/',
            method: 'POST', // or GET
            field: 'file' // POST/GET's field name
        }
    });
})();
```

Define synchronous module
-------------------------

Define your module in a seperated javascript file.
You should call the 'define' function exactly once.
That's the way you communicate with the library.
Put your dependencies as the first argument of the define function.
The path of the dependency should be relative to this module file.

When all your dependencies are ready (either synchronous or asynchronous),
the second argument, the module initializer will be invoked
with the dependency instances as its arguments.

When the module is initialized, return the module instance.
Note that you should never return undefined here.
The library will use the undefined return to determine
the module is asynchronous.

```javascript
define(['aaa', 'bbb'], function(aaa, bbb){
    // Initializing ...
    // ...

    // Finally, you MUST return something different from undefined.
    return result;
});
```

Define asynchronous module
--------------------------

Almost the same as synchronous module.

The last argument of your initializer is the 'load' callback.
When your module is initialized, call the 'load' callback
and pass the module instance as the only argument.

Note that you should never return anything different from undefined,
or the library will think the module as synchronous.

```javascript
define(['aaa', 'bbb'], function(aaa, bbb, load){
    // Initializing ...
    // ...

    do_something_async(x, y, function(){
        // When you finished the initialization.
        // Invoke the load function and pass the result.
        load(result);
    });

    // You MUST return undefined, or return nothing, or not return at all.
});
```

Define the main module
----------------------

You should provide your main module as provided in the configuration.
The main module could be synchronous or asynchronous.
And the module instance should be a function,
that will be invoked when the program ready.

Compile your project
--------------------

If you've included the **compile** item in the configuration,
you should see a button on the left top corner.
Click it and get your compiled code.

Run the compiled version
------------------------

Just use the script tag to include your compiled code.
Everything is done.
```html
<script src="compiled.js"></script>
```

Using Plugins
=============

When specifying the dependencies with the form 'xxx!yyy!zzzzzz,wwwwww,uuuuuu',
the library will transform the zzzzzz, wwwwww, uuuuuu into absolute
path first, and pass 'yyy!zzzzzz,wwwwww,uuuuuu' to the plugin named 'xxx'
as the argument. (Then the plugin 'xxx' might choose to pass it
to the library again, and pass through plugin 'yyy', ...)

All the available plugins in the program should be listed in the
configuration.

The buildin plugins will be introduced below.
And you can design your own plugins, too. 

Buildin Plugins
===============

+ global

  Using this plugin to load old-fashion javascript modules.
  The name **global** means these modules will initialize themselves
  by modifing the global variables.

  When using this plugin, you can put several modules together
  (all with relative path),
  seperated by comma. Like this:

```javascript
    define(['global!a_module,b_module,other_place/c_module'], function(global_dummy){
        // ...
    });
```

  Then the modules will be initialized in this order. It's helpful
  when these modules have dependency among them.

  The module initializer will still get a module instance for the global dependency.
  It's not much useful. The value of it is always **true**.
  Because the **global** modules will modify the global variable directly,
  not use **define** to give the instance.

+ defer

  Use this plugin to defer some module initializing,
  if these module is not needed in the very beginning.

  If you prefix your dependency by a **defer!** (use it as plugin),
  then your initializer will get a "loading proxy function".
  When you really need to use the module, invoke the "loading proxy function"
  with a callback. The passed callback will be invoked when
  the module is ready.

  There's also a **preload** method for background preloading since version 0\.02\.
  If you invoke the proxy function directly, the plugin will
  perform an aggressive load that push every loading process to start early
  as long as possible. If you invoke the **proxy.preload** function instead,
  the plugin will perform a casual load that queue up all the implied loading
  process, runs one at a time, and makes a 50ms sleep between the processes.
  That is, the normal way will result in a shorter loading time, but might
  freeze the browser responding; the **preload** way will load much longer,
  and might provide a better browser responding while loading.

  Take a look at the example below:

```javascript
// original, not deferred dependency
define(['a'], function(a){
    a.go(); // use 'a'
});
```

```javascript
// deferred dependency
define(['defer!a'], function(a_proxy){
    a_proxy(function(a){
        a.go(); // use 'a'
    });
});
```

  The initialized module instance will be cached.
  All the "loading proxy function" invocation
  will get the same instance.

  When you need to perform a "background initialize",
  you can do it like this:

```javascript
define(['defer!a', 'defer!b', 'defer!c'], function(a_proxy, b_proxy, c_proxy){
    a_proxy.preload(function(){
        b_proxy.preload(function(){
            c_proxy.preload(function(){
            });
        });
    });
});
```

  With [CoffeeScript][], you'll get an funny code "shape" :p

```coffeescript
define ['defer!a', 'defer!b', 'defer!c'], (a_proxy, b_proxy, c_proxy) ->
    a_proxy.preload -> b_proxy.preload -> c_proxy.preload ->
```

  Note that the 'defer' behavior will only occur in the compiled mode.
  In the dynamic loading mode, the deferred module will still
  be loaded in the very beginning.

+ cs

  This plugin allows you to define your modules in [CoffeeScript][].
  Before using this plugin, please download the [CoffeeScript/extras/coffee-script.js] file first,
  and modify the **cs** plugin's source file to specify the
  correct path.

  When loading a [CoffeeScript][] written module,
  omit the '.coffee' in the path trail.

```javascript
// Importing side
define(['cs!coffeescript_module'], function(coffeescript_module){
    // ...
});
```

```coffeescript
# Defining side
define ['cs!other_cs_module', 'js_module'], (other_cs_module, js_module, load) ->
    # ...
    return result # if this is a synchronous module

    load result # if this is an asynchronous module
```

+ ls

  This plugin is used to define your modules in [LiveScript][].
  Before using this plugin, please download the [LiveScript/extras/livescript.js][] file,
  and modify the **ls** plugin's source file to specify the
  correct path.

  When loading a [LiveScript][] written module,
  omit the '.ls' in the path trail.

```javascript
// Importing side
define(['cs!coffeescript_module'], function(coffeescript_module){
    // ...
});
```

```livescript
# Defining side
define ['ls!other_ls_module', 'js_module'], (other_ls_module, js_module, load) ->
    # ...
    return result # if this is a synchronous module

    load result # if this is an asynchronous module
```

+ text

  Use this plugin to load a text file.
  Please specify the full filename.

```javascript
define(['text!abc.txt', 'text!main.js'], function(abc_txt, main_js){
    // ...
});
```

+ xml

  Use this plugin to load a XML file.
  Please specify the full filename.

  I use this to load SVG file as well.

  You might want to modify this module
  to remove unnecessary spaces or comments.

```javascript
define(['text!abc.txt', 'text!main.js'], function(abc_txt, main_js){
    // ...
});
```

Plugin Development
==================

Would you please just read the code and
find out the mechanism? Writing English is killing me.. ><

Test (Example)
==============

The files in the test/ directory is a full running example,
except that you should download [CoffeeScript][], [LiveScript][], and [jQuery][] yourself.
Through out this test example, you can learn the
concrete usage.

If you've download the whole repository, put the [CoffeeScript/extras/coffee-script.js][] file
as src/plugins/coffee-script.js, and put the [LiveScript/extras/livescript.js][] file
as src/plugins/livescript.js, and put the [jQuery][] file
as test/jquery.js .

Open the browser on develop.html (you should have a web server).
After one second, you should find a download link on the left top corner,
and also some messages on the javascript console if you open it.
Click the download link, you can download the compiled code.
Save it to the test/ folder.
Open the browser on release.html.
It'll run in the compiled version.

Why Another AMD Module Loader
=============================

I used to use [RequireJS][] to organize my javascript Win8 APP.
I don't like Visual Studio, so I want to reduce the time
interacting with it. [RequireJS][] is great to help me merge
all my codes and libraries into only one javascript file.
Then I can just put this generated file into Visual Studio
and package it up. No more interaction!

But, the performance of the generated code initialization is not acceptable.
Then I read the code and tried to improve it.
Suddently I found the codebase of r.js is very huge and too complex for me to read.
I don't like to deal with huge and complex thing.

So I write a brand new version on my own.
I don't want to modify my project code too much, so the usage is almost the
same with [RequireJS][] in the browser environment.

For better user experience on program starting, the additional
defer plugin helps a lot.

Lincense
========

Copyright 2012, Cindy Wang (CindyLinz)  
Licensed under the MIT or GPL Version 2 licenses or GPL Version 3 licenses.

Date: 2012.11.15

[RequireJS]: http://requirejs.org/
[RequireJS-defer]: https://github.com/CindyLinz/RequireJS-defer
[CoffeeScript]: http://coffeescript.org/
[CoffeeScript/extras/coffee-script.js]: http://coffeescript.org/extras/coffee-script.js
[LiveScript]: http://livescript.net/
[LiveScript/extras/livescript.js]: https://raw.github.com/gkz/LiveScript/master/extras/livescript.js
[jQuery]: http://jquery.com/
