/*!
 * Javascript GreenDefine library v0.06
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.12.21
 */
define(['!ajax', 'coffee-script'], function(ajax, cs, load){
    load(function(url, define){
        ajax(url+'.coffee?now='+Date.now(), function(xhr){
            var code = cs.compile(xhr.responseText);
            if( define.compile )
                define.prop.gen = code;
            define.init((new Function('define', code))(define), define);
        });
    });
})
