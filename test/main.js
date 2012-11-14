define(['I', 'cs!t', 'dir/sp', 'cs!dir/w', 'defer!cs!o', 'r', 'k', 'ls!s', 'jq'], function(I, t, sp, w, o, r, k, s, $){
    return function(){
        $(function(){
            $('<h2 align=center>'+I+t+'</h2>').appendTo('body')
            o(function(o){
                $('<h2 align=center>'+w+o+r+k+s+sp+'!</h2>').appendTo('body')
            })
        })
    }
})
