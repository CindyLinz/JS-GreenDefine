/*!
 * Javascript GreenDefine library v0.05
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.12.8
 */
define(function(load){
    return function(url, define){
        var code = '',
            my_define_config = {
                init: function(inited, child_define){
                    if( child_define.compile && child_define.prop.gen ){
                        code += child_define.prop.gen;
                        delete define.prop.gen;
                    }
                    url.shift();
                    if( url.length )
                        go();
                    else{
                        if( define.compile ){
                            define.prop.gen = code;
                            define.prop.gen_type = 'global';
                        }
                        define([], function(load){ load(true) });
                        define.init(null, define);
                    }
                    return true;
                }
            },
            go = function(){
                define.load(url[0], my_define_config, undefined);
            },
            i;

        for( i in define )
            if( !my_define_config[i] )
                my_define_config[i] = define[i];
        my_define_config.need = false;

        url = url.split(',');
        go();
    };
})
