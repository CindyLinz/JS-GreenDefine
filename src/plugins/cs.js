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
