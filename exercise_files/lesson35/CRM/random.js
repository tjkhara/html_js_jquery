self.addEventListener('message', function(msg) {
	var data = msg.data;	
	var result = [];
    for (var i = 0; i < data; i++) {
        result.push(Math.random());
    }
    result.sort();
    self.postMessage(result[0]);
}, false);
