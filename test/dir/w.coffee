define ['defer!cs!../o'], (o, load) ->
    setTimeout o.preload, 500, ->
    console.log 'start w' if console
    setTimeout ->
        console.log 'done w' if console
        load 'w'
    , 1000
    return
