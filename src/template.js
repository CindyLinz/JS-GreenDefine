/*!
 * Javascript GreenDefine library v0.06
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.12.21
 */
(function(win, module, thunk, wait, slow, slowing, undef){
    var idle = function(cb){ win.setTimeout(cb, 50) },
        next_slow = function(cont, label){
            if( !slowing || cont ){
                slowing = 1;
                idle(function(){
                    label = slow.pop();
                    while( label && !thunk[label] )
                        label = slow.pop();
                    if( label )
                        thunk[label](1);
                    else
                        slowing = 0;
                });
            }
        },
        hurry = function(label, resolves){
            thunk[label] = function(slowly, i){
                if( slowly )
                    next_slow(1);
                else{
                    thunk[label] = undef;
                    for(i=resolves.length-1; i>=0; --i)
                        if( !wait[resolves[i]] && thunk[resolves[i]] )
                            thunk[resolves[i]]();
                }
            };
        },
        load = function(label,deps,resolves,def){
            thunk[label] = function(slowly){
                thunk[label] = slowly ? function(slowly){ if( slowly ) next_slow(1); else thunk[label] = undef; } : undef;
                def(function(_deps, def, i, load, res){
                    if( typeof _deps === 'function' )
                        def = _deps;
                    load = function(res, i){
                        module[label] = res;
                        if( thunk[label] ){ // slow loading
                            for(i=resolves.length-1; i>=0; --i)
                                if( !--wait[resolves[i]] )
                                    slow.push(resolves[i]);
                            hurry(label, resolves);
                        }
                        else // fast loading
                            for(i=resolves.length-1; i>=0; --i)
                                if( !--wait[resolves[i]] )
                                    thunk[resolves[i]]();
                        if( slowly )
                            next_slow(1);
                    };
                    for(i=deps.length-1; i>=0; --i)
                        deps[i] = module[deps[i]];
                    deps.push(load);
                    res = def.apply(this, deps);
                    if( res !== undef )
                        load(res);
                })
            };
        },
        rdefine = function(label,resolves,def){
            thunk[label] = function(slowly, i, d, undef){
                module[label] = def();
                if( slowly ){
                    for(i=resolves.length-1; i>=0; --i)
                        if( !--wait[resolves[i]] )
                            slow.push(resolves[i]);
                    hurry(label, resolves);
                    next_slow(1);
                }
                else{
                    thunk[label] = undef;
                    for(i=resolves.length-1; i>=0; --i)
                        if( !--wait[resolves[i]] )
                            thunk[resolves[i]]();
                }
            };
        },
        activate = function(defer_label, label, boundary_then_leaves){
            var loads = [], loading = 0;
            thunk[defer_label] = function(slowly, i, _loads, ins){
                thunk[defer_label] = undef;
                ins = module[label];
                module[defer_label].state = 2; // done
                _loads = loads;
                loads = loading = undef;
                for(i=_loads.length-1; i>=0; --i)
                    _loads[i](ins);
                if( slowly )
                    next_slow(1);
            };
            module[defer_label] = function(load, i){
                if( loads ){
                    loads.push(load);
                    module[defer_label].state = 1; // loading
                    if( loading<=1 ){
                        loading = 2;
                        for(i=boundary_then_leaves.length-1; i>=0; --i)
                            if( thunk[boundary_then_leaves[i]] )
                                thunk[boundary_then_leaves[i]]();
                    }
                }
                else
                    load(module[label]);
            };
            module[defer_label].state = 0; // sleeping
            module[defer_label].preload = function(load, i, j){
                if( loads ){
                    loads.push(load);
                    module[defer_label].state = 1; // loading
                    if( !loading ){
                        loading = 1;
                        for(i=0, j=boundary_then_leaves.length; i<j; ++i)
                            if( thunk[boundary_then_leaves[i]] )
                                slow.push(boundary_then_leaves[i]);
                        next_slow();
                    }
                }
                else
                    load(module[label]);
            };
        };
    <<<DYNAMIC>>>

    module[0](function(main){
        main()
    })
})(window, [],[],[],[], 0)
