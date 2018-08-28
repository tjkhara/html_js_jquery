findContacts = function() {
    var contacts = null;
       return function() {
             var deferred = $.Deferred();
             if (contacts) {
                 console.log('Returning data from the cache');
                 deferred.resolve(contacts);
                 return deferred.promise();
             } else {
                 var promise = $.get('contacts.json');
                 console.log('Returning data from the server');
                 promise.done(function(data) {
                    setTimeout(function() {
                        contacts = data;
                        deferred.resolve(contacts);
                    }, 5000);
                 });                 
                return deferred.promise();
             }
	    }
}();


            