/*!
 * Javascript GreenDefine library v0.01
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.11.3
 */
(function(module, thunk, wait){
    var load = function(label,deps,resolves,def){
            thunk[label] = function(){
                thunk[label] = undefined;
                def(function(_deps, def, i, load, res){
                    if( typeof _deps === 'function' )
                        def = _deps;
                    load = function(res, i){
                        module[label] = res;
                        for(i=resolves.length-1; i>=0; --i)
                            if( !--wait[resolves[i]] )
                                thunk[resolves[i]]();
                    };
                    for(i=deps.length-1; i>=0; --i)
                        deps[i] = module[deps[i]];
                    deps.push(load);
                    res = def.apply(this, deps);
                    if( res !== undefined )
                        load(res);
                })
            };
        },
        activate = function(defer_label, label, boundary_then_leaves){
            var loads = [];
            thunk[defer_label] = function(i, _loads, ins){
                thunk[defer_label] = undefined;
                ins = module[label];
                _loads = loads;
                loads = undefined;
                module[defer_label].state = 2; // done
                for(i=_loads.length-1; i>=0; --i)
                    _loads[i](ins);
            };
            module[defer_label] = function(load, i){
                if( loads ){
                    loads.push(load);
                    if( loads.length===1 ){
                        module[defer_label].state = 1; // loading
                        for(i=boundary_then_leaves.length-1; i>=0; --i)
                            if( thunk[boundary_then_leaves[i]] )
                                thunk[boundary_then_leaves[i]]();
                    }
                }
                else
                    load(module[label]);
            };
            module[defer_label].state = 0; // sleeping
        };
    <<<DYNAMIC>>>

    module[0](function(main){
        main()
    })
})([],[],[])
