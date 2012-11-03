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
