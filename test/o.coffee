define [], (load) ->
    console.log 'start o' if console
    setTimeout ->
        console.log 'done o' if console
        load 'o'
    , 1000
    return
