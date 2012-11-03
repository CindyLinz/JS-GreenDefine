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
