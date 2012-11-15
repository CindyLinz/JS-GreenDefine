define(['I', 'cs!t', 'dir/sp', 'cs!dir/w', 'defer!cs!o', 'r', 'k', 'ls!s', 'jq', 'cup!page'], function(I, t, sp, w, o, r, k, s, $, page){
    return function(){
        $(function(){
            $('body').append(page({it: I+t, works: ''}));
            o(function(o){
                $('body').empty().append(page({it: I+t, works: w+o+r+k+s+sp+'!'}))
            })
        })
    }
})
