/*!
 * Javascript GreenDefine library v0.06
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.12.21
 */
define(['!ajax'], function(ajax, load){
    load(function(url, define){
        ajax(url + '?now=' + Date.now(), function(xhr){
            var text = xhr.responseText;
            if( define.compile ){
                define.prop.gen = JSON.stringify(text);
                define.prop.gen_type = 'rvalue';
            }
            define([], function(load){ load(text) });
            define.init(undefined, define);
        });
    });
})
