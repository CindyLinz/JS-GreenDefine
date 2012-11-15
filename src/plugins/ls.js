/*!
 * Javascript GreenDefine library v0.04
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.11.16
 */
define(['!ajax', 'global!livescript'], function(ajax){
    var ls = window.LiveScript;
    delete window.LiveScript;
    return function(url, define){
        ajax(url+'.ls?now='+Date.now(), function(xhr){
            var code = ls.compile(xhr.responseText);
            if( define.compile )
                define.prop.gen = code;
            define.init((new Function('define', code))(define), define);
        });
    };
})
