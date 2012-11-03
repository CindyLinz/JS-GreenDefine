/*!
 * Javascript GreenDefine library v0.01
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.11.3
 */
define(function(){
    return function(url, define){
        if( define.compile ){
            define.prop.gen_type = 'defer';
            define.prop.defer = url;
            define.prop.code = '';
        }
        define.load(url, define, function(mod){
            define([], function(load, defer){
                defered = function(load){ load(mod) };
                defered.state = 2;
                load(defered);
            });
        });
        define.init(undefined);
    }
})
