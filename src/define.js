/*!
 * Javascript GreenDefine library v0.03
 * https://github.com/CindyLinz/JS-GreenDefine
 *
 * Copyright 2012, Cindy Wang (CindyLinz)
 * Licensed under the MIT or GPL Version 2 or GPL Version 3 licenses.
 *
 * Date: 2012.11.15
 */
(function(){
    var start_time = Date.now(),
        module_seq = 1,
        module = {
            '!ajax': function(url, cb){
                var xhr = new XMLHttpRequest;
                xhr.onreadystatechange = function(){
                    if( xhr.readyState===4 ){
                        xhr.onreadystatechange = function(){};
                        cb(xhr);
                    }
                };
                xhr.open('GET', url);
                xhr.send(null);
            }
        },
        module_prop = {
            '!ajax': {
                gen: '',
                gen_type: 'sdefine',
                waits: [],
                deps: [],
                resolves: [],
                leaves: [],
                boundary: []
            }
        },
        loading = {
        },

        to_label = function(work_dir, name){
            if( name.charAt(0) === '!' )
                return name;
            return name.replace(/((?:.*!)?)(.*)/, function($0, $1, $2){
                var tails = $2.split(','),
                    head_seg = work_dir.split('/'),
                    out_seg,
                    i, j, k;
                for(i=tails.length-1; i>=0; --i){
                    out_seg = [];
                    for(j=0, k=head_seg.length; j<k; ++j)
                        switch( head_seg[j] ){
                            case '.':
                                break;

                            case '..':
                                if( out_seg.length > 0 ){
                                    out_seg.pop();
                                    break;
                                }
                            default:
                                out_seg.push(head_seg[j]);
                        }

                    tails[i] = tails[i].split('/');
                    for(j=0, k=tails[i].length; j<k; ++j)
                        switch( tails[i][j] ){
                            case '.':
                                break;

                            case '..':
                                if( out_seg.length > 0 ){
                                    out_seg.pop();
                                    break;
                                }
                            default:
                                out_seg.push(tails[i][j]);
                        }

                    tails[i] = out_seg.join('/');
                }
                return $1 + tails.join(',');
            });
        },

        load = function(label, parent_define, done){ // return false 表示之前已開始 loading, 不過尚未完成; return true 表示新的 load
            // 如果沒有 done, 表示此 loading 應該是一個傳統 module, 不會呼叫 define 等等, 所以 done 也不會呼叫到
            // 且, module[label] 會直接「先」放一個 true, 以避免重複載入
            if( done ){
                if( loading[label] ){ // 正在載入中 (應該已完成至 init, 但未 ready)
                    loading[label].push(done);
                    if( config.verbose )
                        console.log("(loading x"+loading[label].length+") "+label);
                    return false;
                }
                loading[label] = [done];
            }
            else{
                module[label] = true;
            }

            var match, plugin_label, i, init_then_ready,
                load_done = function(res){
                    var i, j, uniq_obj, dep_prop,
                        loadings = loading[label];
                    delete loading[label];

                    if( config.compile ){
                        if( prop.gen_type === null )
                            prop.gen_type = 'sdefine';

                        // construct waits & deps' resolve
                        prop.waits = [];
                        switch( prop.gen_type ){
                            case 'define':
                                for(i=prop.deps.length-1; i>=0; --i){
                                    dep_prop = module_prop[prop.deps[i]];
                                    switch( dep_prop.gen_type ){
                                        case 'define':
                                        case 'sdefine':
                                        case 'rdefine':
                                            prop.waits.push(prop.deps[i]);
                                            dep_prop.resolves.push(label);
                                    }
                                }
                                break;

                            case 'defer':
                                module_prop[prop.defer].resolves.push(label);
                        }
                        prop.resolves = [];

                        // construct leaves
                        prop.leaves = [];
                        switch( prop.gen_type ){
                            case 'define':
                            case 'sdefine':
                                uniq_obj = {};
                                for(i=prop.deps.length-1; i>=0; --i){
                                    dep_prop = module_prop[prop.deps[i]];
                                    for(j=dep_prop.leaves.length-1; j>=0; --j)
                                        if( !uniq_obj[dep_prop.leaves[j]] ){
                                            uniq_obj[dep_prop.leaves[j]] = true;
                                            prop.leaves.unshift(dep_prop.leaves[j]);
                                        }
                                }
                        }
                        switch( prop.gen_type ){
                            case 'sdefine':
                            case 'rdefine':
                                prop.leaves.unshift(label);
                        }

                        // construct boundary
                        prop.boundary = [];
                        if( prop.gen_type === 'define' ){
                            if( prop.waits.length ){
                                uniq_obj = {};
                                for(i=prop.waits.length-1; i>=0; --i){
                                    dep_prop = module_prop[prop.waits[i]];
                                    for(j=dep_prop.boundary.length-1; j>=0; --j)
                                        if( !uniq_obj[dep_prop.boundary[j]] ){
                                            uniq_obj[dep_prop.boundary[j]] = true;
                                            prop.boundary.push(dep_prop.boundary[j]);
                                        }
                                }
                            }
                            else
                                prop.boundary.push(label);
                        }
                    }

                    if( config.verbose )
                        console.log("load_done: "+label);

                    load_done = null;
                    module[label] = res;
                    define.ready(res);

                    if( loadings )
                        for(i=loadings.length-1; i>=0; --i)
                            loadings[i](res);
                },
                define = function(deps, def){ // deps 的內容會被更動
                    var i,
                        work_dir = label.indexOf('/')>=0 ? label.replace(/(?:.*!)?(.*)\/.*/, '$1') : '.',
                        waiting = 0,
                        load_body = function(deps){
                            var i, res;
                            for(i=deps.length-1; i>=0; --i){
                                if( module_prop[deps[i]].gen_type === 'define' )
                                    prop.gen_type = 'define';
                                deps[i] = module[deps[i]];
                            }
                            deps.push(load_done);
                            if( config.verbose )
                                console.log("define: "+label);

                            res = def.apply(this, deps);
                            if( typeof res !== 'undefined' )
                                load_done(res);
                            if( prop.gen_type === null )
                                prop.gen_type = 'define';
                        };

                    if( typeof deps === 'function' ){
                        def = deps;
                        deps = [];
                    }
                    if( config.verbose ){
                        console.log("pre-define: "+label);
                        console.log("  deps: "+deps.join(', '));
                    }

                    // construct prop.deps
                    prop.deps = [];
                    for(i=deps.length-1; i>=0; --i){
                        prop.deps[i] = deps[i] = to_label(work_dir, deps[i]);
                        if( !module[deps[i]] ){
                            ++waiting;
                            load(deps[i], define, function(){
                                --waiting;
                                if( waiting===0 )
                                    load_body(deps);
                            });
                        }
                    }
                    if( waiting===0 )
                        load_body(deps);
                },
                prop = module_prop[label] = { // initial guess
                    need: parent_define.need,
                    gen_type: null,
                    gen: '',
                    seq: module_seq++
                };

            for( i in parent_define )
                define[i] = parent_define[i];
            define.prop = prop;

            // plugin 應負責呼叫 init; ready 總是由 require.js 負責
            // init 的參數為該 module 被執行時 return 的值 (通常不 return, 也通常沒用到)
            // 依 module 的實作方式, 如果沒有 async code, ready 有可能先於 init 發生.
            //
            // 如果 init return true, 表示該 module 已經載入完成, 可以直接 load_done (載入傳統非 require.js compatible 的 module 用)

            if( config.verbose )
                console.log("load: " + label);

            // 由 plugin 處理
            if( match = label.match(/^(.*?)!(.*)/) ){
                if( config.plugins[match[1]] )
                    plugin_label = to_label(config.base, config.plugins[match[1]]);
                else
                    plugin_label = to_label(config.base, match[1]); // plugin 總是從 base 找, 而不是 work_dir
                if( module[plugin_label] )
                    module[plugin_label](match[2], define);
                else
                    load(plugin_label, base_define, function(){
                        module[plugin_label](match[2], define);
                    });
                return true;
            }

            module['!ajax'](label + '.js?now=' + Date.now(), function(xhr){
                var code = xhr.responseText;
                if( define.compile )
                    prop.gen = code;
                define.init((new Function('define', code))(define), define);
                if( define.compile && !done ) // initialized by side effect
                    prop.gen_type = 'global';
            });

            return true;
        },

        base_define = {
            amd: true,
            init: function(){},
            ready: function(){},
            load: load
        },
        
        main_define = {},
        main_label,
        i;

    if( typeof config === 'undefined' )
        throw "config not found";

    base_define.compile = config.compile;
    for( i in base_define )
        main_define[i] = base_define[i];
    main_define.need = true;

    if( config.verbose )
        setInterval(function(){
            var loading_name = [], i;
            for( i in loading )
                loading_name.push(i);
            if( loading_name.length )
                console.log("loading... "+loading_name.join(', '));
        }, 5000);

    main_label = to_label(config.base, config.main);
    load(main_label, main_define, function(){
        if( config.compile ){
            if( config.verbose )
                console.log("compiled:");
            module_prop[''] = {
                need: true,
                gen_type: 'defer',
                defer: main_label,
                seq: 0
            };
            module_prop[main_label].resolves.push('');
            if( config.verbose )
                console.log(module_prop);
            module['!ajax'](to_label(config.base, config.compile.template) + '.js?now=' + Date.now(), function(xhr){
                var gen = '', prop,
                    json_array = function(arr, i, out){
                        out = [];
                    },
                    i, j, label, label_str,
                    map_seq = function(arr, i, j){
                        out = [];
                        for(i=0, j=arr.length; i<j; ++i)
                            out.push(module_prop[arr[i]].seq);
                        return out;
                    };
                for( label in module_prop ){
                    prop = module_prop[label];
                    if( !prop.need )
                        continue;
                    label_str = JSON.stringify(label);
                    gen += '\n////// ' + label + ' (' + prop.gen_type + ')\n';
                    switch( prop.gen_type ){
                        case 'defer':
                            gen += 'activate('+prop.seq+','+module_prop[prop.defer].seq+','+JSON.stringify(
                                map_seq(module_prop[prop.defer].boundary.concat(module_prop[prop.defer].leaves))
                            )+');\n';
                            break;

                        case 'global':
                            gen += prop.gen + ';\n';
                            break;

                        case 'rvalue':
                            gen += 'module['+prop.seq+']=' + prop.gen + ';\n';
                            break;

                        case 'rdefine':
                            gen += 'rdefine('+prop.seq+','+JSON.stringify(map_seq(prop.resolves))+',function(){return '+prop.gen+'});\n';
                            break;

                        case 'define':
                            gen += 'wait['+prop.seq+']=' + prop.waits.length + '; // ' + prop.waits.join(' ') + '\n';

                        case 'sdefine':
                            gen += 'load('+prop.seq+','+JSON.stringify(map_seq(prop.deps))+','+JSON.stringify(map_seq(prop.resolves))+',function(define){' + prop.gen + '});\n';
                            break;

                        default:
                            console.log('Unknown gen_type '+prop.gen_type);
                    }
                }
                gen = xhr.responseText.replace('<<<DYNAMIC>>>', function(){ return gen });

                switch( config.compile.output ){
                    case 'download':
                        var out_link = document.createElement('a');
                        out_link.style.zIndex = 999;
                        out_link.style.position = 'absolute';
                        out_link.style.left = '0px';
                        out_link.style.top = '0px';
                        out_link.innerHTML = 'download (size='+gen.length+')';
                        out_link.href = 'data:application/octet-stream;charset=UTF-8,' + encodeURIComponent(gen);
                        out_link.download = config.compile.filename;
                        document.getElementsByTagName('body')[0].appendChild(out_link);
                        break;

                    case 'submit':
                        var out_form = document.createElement('form');
                        out_form.style.zIndex = 999;
                        out_form.style.position = 'absolute';
                        out_form.style.left = '0px';
                        out_form.style.top = '0px';
                        out_form.action = config.compile.url;
                        out_form.method = config.compile.method;
                        var out_input = document.createElement('input');
                        out_input.type = 'hidden';
                        out_input.value = gen;
                        out_input.name = config.compile.field;
                        out_form.appendChild(out_input);
                        var out_submit = document.createElement('input');
                        out_submit.type = 'submit';
                        out_submit.value = 'download (size='+gen.length+')';
                        out_form.appendChild(out_submit);
                        document.getElementsByTagName('body')[0].appendChild(out_form);
                        break;

                    default:
                        console.log("Not specify the compile output format");
                }
            });
        }
        if( config.verbose )
            console.log("Compiling time: " + (Date.now()-start_time)*.001 + 's');
        module[main_label]();
    });
})()
