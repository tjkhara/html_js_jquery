function contactsScreen(mainID, mobileApp) {
    var screen = mainID;
    var initialized = false;
    var database = null;
	var mobile = mobileApp;
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
            
            $(screen).on("click", "[data-notes-button]",
                function(evt) {
                    evt.preventDefault();
                    this.showNotes(evt);
                }.bind(this)
            );
            
            $(screen).find('textarea').keyup(function(evt) {
                if ($(evt.target).siblings('.textCount')) {
                    var characters = $(evt.target).val().length;
                    $(evt.target).siblings('.textCount').text(characters + ' characters');
                    
                }
            });
            
            $(screen).find('.theme').click(function(evt) {
                var url = $(evt.target).data().themeFile;
                $.getScript(url, function() {
                    localStorage.setItem('theme', url);
                });
            });
            
            $(screen).find('#importFromServer').click(function(evt) {
                var promise = findContacts();
                promise.done(function(data) {
                    for (var i = 0; i < data.length; i++) {
                        this.store(data[i]);
                    }
                    location.reload();
                }.bind(this));
            }.bind(this));  
            $(screen).find('#importJSONFile').change(function(evt) {
                var promise = readFileWithPromise(event.target.files[0]);
                promise.done(function(data) {
                    var contacts = JSON.parse(data);
                    for (var i = 0; i < contacts.length; i++) {
                        this.store(contacts[i]);
                    }
                    location.reload();
                }.bind(this));
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
			if (!mobile) {
            document.getElementById('addContact')
              .addEventListener("click", function(event) {
	             event.preventDefault();
				 $(screen).find('#contactDetails').toggle( "blind" );				 
              });
		   }
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
          this.loadContacts();
          initialized = true;
           
        },
        save: function(evt) {            
            if ($(evt.target).parents('form')[0].checkValidity()) {
                var fragment = $(screen).find('#contactRow')[0].content.cloneNode(true);             
                var contact = this.serializeForm();
                
                var row = $('<tr>');
                row.data().contactId = contact.id;
                row.append(fragment);
                this.store(contact);
                row = bind(row, contact);
                $(row).find('time').setTime();
                $(screen).find('table tbody').append(row);
				$(screen).find('form :input[name]').val('');
				if (mobile) {
				    $(":mobile-pagecontainer").pagecontainer("change", "#contactListPage", { transition: 'slide' });
				} else {
				    $(screen).find('#contactDetails').toggle( "blind" );
				}
				$(screen).find('table').table("refresh");
				$(screen).find('[data-role="controlgroup"]').controlgroup();
	            this.updateTableCount();
            }
        },
        store: function(contact) {
           contact.id = $.now();
           var contactsStored = localStorage.getItem('contacts');
           var contacts = [];
           if (contactsStored) {
               contacts = JSON.parse(contactsStored);
           }
           contacts.push(contact);
           localStorage.setItem('contacts', JSON.stringify(contacts));
        },
        loadContacts: function() {
            var contactsStored = localStorage.getItem('contacts');
            if (contactsStored) {
               contacts = JSON.parse(contactsStored);
               $.each(contacts, function(i, v) {
                   var fragment = $(screen).find('#contactRow')[0].content.cloneNode(true);
                   var row = $('<tr>');
                   row.data().contactId = v.id;
                   row.append(fragment);
                   row = bind(row, v);
                   $(row).find('time').setTime();
                   $(screen).find('table tbody').append(row);
               });
			   $(screen).find('table').table("refresh");
			   $(screen).find('[data-role="controlgroup"]').controlgroup();
			   this.updateTableCount();
            }
        },
        updateTableCount: function(evt) {
            var rows = $(screen).find('table tbody tr')
	        $(screen).find('table').updateFooter({'message':' contacts displayed'});
        },
        delete: function(evt) { 
            var contactId = $(evt.target).parents('tr').data().contactId;
			var contacts = JSON.parse(localStorage.getItem('contacts'));
            var newContacts = contacts.filter(function(c) {
                 return c.id != contactId;
            });
            localStorage.setItem('contacts', JSON.stringify(newContacts));
            $(evt.target).parents('tr').remove();
            this.updateTableCount();
        },
        showNotes: function(evt) { 
            var contactId = $(evt.target).parents('tr').data().contactId;
			var contacts = JSON.parse(localStorage.getItem('contacts'));
            var contact = contacts.filter(function(c) {
                 return c.id == contactId;
            })[0];
            bind($('#contactNotePage'), contact);
            $(":mobile-pagecontainer").pagecontainer("change", "#contactNotePage", { transition: 'slide' });
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

function readFileWithPromise(file) {
    var deferred = $.Deferred();
    var reader = new FileReader();
    reader.onload = function(evt) {
        deferred.resolve(evt.target.result);
    }
    reader.readAsText(file);
    return deferred.promise();
}
     