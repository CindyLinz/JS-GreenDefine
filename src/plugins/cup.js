/*!
 * Javascript GreenDefine library v0.05
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.12.8
 */
define(['!ajax', 'coffee-script', 'global!coffeecup'], function(ajax, cs){
    var cup = window.coffeecup;
    delete window.coffeecup;
    return function(url, define){
        ajax(url+'.coffee?now='+Date.now(), function(xhr){
            var code = cs.compile(xhr.responseText, { bare: true });
            code = cup.compile('function(){'+code+'}');
            if( define.compile ){
                define.prop.gen = code;
                define.prop.gen_type = 'rvalue';
            }
            define([], function(load){ load(new Function('return '+code)()) });
            define.init(undefined, define);
        });
    };
})
