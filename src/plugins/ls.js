/*!
 * Javascript GreenDefine library v0.06
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.12.21
 */
define(['!ajax', 'global!livescript'], function(ajax){
    var ls = window.require('LiveScript');
    delete window.require;
    return function(url, define){
        ajax(url+'.ls?now='+Date.now(), function(xhr){
            var code;
            try{
              code = ls.compile(xhr.responseText);
            }catch( e ){
              console.log(xhr.responseText);
              console.error(e);
              throw e;
            }
            if( define.compile )
                define.prop.gen = code;
            define.init((new Function('define', code))(define), define);
        });
    };
})
