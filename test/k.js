define(['xml!k.xml'], function(k_xml){
    return k_xml.getElementsByTagName('data')[0].getAttribute('value')
})
