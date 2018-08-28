function contactsScreen(mainID) {
    var screen = mainID;
    var initialized = false;
    var database = null;
    return {
         init: function() {
            if (initialized) {
                return;
            }
            $(screen).find('form input[type="submit"]').click(
                function(evt) {
                    evt.preventDefault();
                    this.save(evt);
                }.bind(this)
            );
            $(screen).on("click", "[data-delete-button]",
                function(evt) {
                    evt.preventDefault();
                    this.delete(evt);
                }.bind(this)
            );
            
            $(screen).find('textarea').keyup(function(evt) {
                if ($(evt.target).siblings('.textCount')) {
                    var characters = $(evt.target).val().length;
                    $(evt.target).siblings('.textCount').text(characters + ' characters');
                    
                }
            });
           
            $(screen).find('#importFromServer').click(function(evt) {
                $.get("contacts.json", function( data ) {
	                console.log(data)
	            });
	            $.ajax({
                   url: "contacts.json",
                   dataType: "json",
                   cache : false,
                   type : "GET",
                   success : function(data) {  
                       console.log(data);     
                   },
                   error: function(jqXHR, textStatus, errorThrown ) {
                   }
                });
            });
            $(screen).find('#importJSONFile').change(function(evt) {
                var reader = new FileReader();
                reader.onload = function(evt) {
                    var contacts = JSON.parse(evt.target.result);
                    for (var i = 0; i < contacts.length; i++) {
                        this.store(contacts[i]);
                    }
					setTimeout(function() {
						location.reload();
					}, 500);
                }.bind(this);
                reader.readAsText(evt.target.files[0]);
            }.bind(this));
            
            $(':input[required]').siblings('label').append($('<span>').text('*').addClass('requiredMarker'));
            var contactName = document.getElementById('contactName')
            contactName.oninvalid = function(e) {
	            e.target.setCustomValidity("");
	           if (e.target.validity.valid == false) {
	               if (e.target.value.length == 0) {
	               	   e.target.setCustomValidity("Contact name is required.");
		           } else if (e.target.value.length < 5) {
			           e.target.setCustomValidity("Contact name must be at least 5 characters."); 
		           }
	           }
            };
 
            var email = document.getElementById('emailAddress')
            email.oninvalid = function(e) {
	            e.target.setCustomValidity("");
	            if (e.target.validity.valid == false) {
		            if (e.target.value.length == 0) {
			            e.target.setCustomValidity("Email is required.");
		             } else {
			              e.target.setCustomValidity("Please enter a valid email address."); 
		             }
	            }
            };

            document.getElementById('addContact')
              .addEventListener("click", function(event) {
	             event.preventDefault();
	             $(screen).find('#contactDetails').toggle( "blind" );
           });
           $(screen).find('tbody').on("mouseenter mouseleave", "td > time", function(evt) {
               if (evt.type === "mouseenter") {
                    $(evt.target).siblings('.overlay').slideDown();
               } else {
               		$(evt.target).siblings('.overlay').slideUp()
               }
                
           });
           
           $(screen).find('tbody').on("mouseenter mouseleave", "tr", function(evt) {
               if (evt.type === "mouseenter") {
                    $(evt.target).closest('tr').css('color', 'white');
                    $(evt.target).closest('tr').css('background', '#3056A0');
               } else {
               		$(evt.target).closest('tr').removeAttr('style');
               }
                
           });
           
           $(screen).find('.theme').click(function(evt) {
               var url = $(evt.target).data().themeFile;
               $.getScript(url, function() {
                   localStorage.setItem('theme', url);
               });
           });
                     
           var request = indexedDB.open('contactsDB');
           request.onsuccess = function(event) {
               database = request.result;
               this.configureData();
               this.loadContacts();
           }.bind(this);
           request.onupgradeneeded = function(event) {
                database = event.target.result;
                var objectStoreContacts = database.createObjectStore("contacts", 
                    {keyPath: "id", autoIncrement: true });
                var objectStoreCompanies = database.createObjectStore("companies", 
                    {keyPath: "id", autoIncrement: true });             
           };
           

           initialized = true;
           
        },
        configureData: function() {
            var tx = database.transaction("companies");
            var objectStore = tx.objectStore("companies");
            var isData = false;
            objectStore.openCursor().onsuccess = function(event) {
                if (!event.target.result) {
                    var tx = database.transaction(["companies"], "readwrite");
                    var objectStore = tx.objectStore("companies");
                    var request = objectStore.put({name:"ABC Incorporated"});
                    var request = objectStore.put({name:"XZY Ltd"});
                    var request = objectStore.put({name:"ACME International"});
                }
            }
            
        },
        save: function(evt) {            
            if ($(evt.target).parents('form')[0].checkValidity()) {
                var fragment = $(screen).find('#contactRow')[0].content.cloneNode(true);
                var row = $('<tr>').append(fragment);
                var contact = this.serializeForm();
                var tx = database.transaction(["companies"]);
                var objectStoreCompanies = tx.objectStore("companies");
                var requestCompanies = objectStoreCompanies.get(parseInt(contact.companyName));
                requestCompanies.onsuccess = function(event) {
                    var company = event.target.result;
                    contact.companyName = company;
                    row = bind(row, contact);
                    this.store(contact);
                    $(row).find('time').setTime();
                    $(screen).find('table tbody').append(row);
				    $(screen).find('form :input[name]').val('');
				    $(screen).find('#contactDetails').toggle( "blind" );
	                this.updateTableCount();
	            }.bind(this);
            }
        },
        store: function(contact) {
            var tx = database.transaction(["contacts"], "readwrite");
            var objectStore = tx.objectStore("contacts");
            var request = objectStore.put(contact);
            request.onsuccess = function(event) {
               console.log("Added a new contact with the ID = " + event.target.result);    
            }
        },
        loadContacts: function() {
            var tx = database.transaction("contacts");
            var objectStore = tx.objectStore("contacts");
            objectStore.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var contact = cursor.value;
                    var fragment = $(screen).find('#contactRow')[0].content.cloneNode(true);
                    var row = $('<tr>');
                    row.data().id = contact.id;
                    row.append(fragment);
                    row = bind(row, contact);
                    $(row).find('time').setTime();
                    $(screen).find('table tbody').append(row);
                    cursor.continue();
               }
			this.updateTableCount();
            }.bind(this);
        },
        updateTableCount: function(evt) {
            var rows = $(screen).find('table tbody tr')
	        $(screen).find('table').updateFooter({'message':' contacts displayed'});
        },
        delete: function(evt) { 
            var contactId = $(evt.target).parents('tr').data().id;
            $(evt.target).parents('tr').remove();
            this.updateTableCount();
            var tx = database.transaction("contacts", "readwrite");
            var objectStore = tx.objectStore("contacts");        
            var request = objectStore.delete(contactId);
        },
        serializeForm: function() {
            var inputFields = $(screen).find('form :input');
            var result = {};
            $.each(inputFields, function(index, value) {
                 if ($(value).attr('name')) {
                     result[$(value).attr('name')] = $(value).val();
                 }
            });
            return result;
        }
    };
    
}

function bind(template, obj) {
    $.each(template.find('[data-property-name]'), function(indx, val) {
        var field = $(val).data().propertyName;
        if (obj[field]) {
            if (typeof obj[field] == "object") {
                $(val).text(obj[field].name);
            } else {
                $(val).text(obj[field]);
            }
            
            if ($(val).is('time')) {
                $(val).attr('datetime', obj[field]);
            }
        }
    });
    return template;
}


            