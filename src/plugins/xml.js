define(['!ajax'], function(ajax, load){
    load(function(url, define){
        ajax(url + '?now=' + Date.now(), function(xhr){
            if( define.compile ){
                define.prop.gen = '(new DOMParser).parseFromString('+
                    JSON.stringify(xhr.responseText)+
                ',\'text/xml\')';
                define.prop.gen_type = 'rdefine';
            }
            define([], function(load){ load(xhr.responseXML) });
            define.init(undefined, define);
        });
    });
})
