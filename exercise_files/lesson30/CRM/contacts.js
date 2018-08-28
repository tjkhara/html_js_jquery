function contactsScreen(mainID) {
    var screen = mainID;
    var initialized = false;
    
    function store(contact) {
         var contactsStored = localStorage.getItem('contacts');
         var contacts = [];
         if (contactsStored) {
             contacts = JSON.parse(contactsStored);
         }
         contacts.push(contact);
         localStorage.setItem('contacts', JSON.stringify(contacts));
    }
    
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
            this.loadContacts();
           initialized = true;
        },
        save: function(evt) {            
            if ($(evt.target).parents('form')[0].checkValidity()) {
                var fragment = $(screen).find('#contactRow')[0].content.cloneNode(true);
                
                var contact = this.serializeForm();
                contact.id = $.now();
                var row = $('<tr>');
                row.data().contactId = contact.id;
                row.append(fragment);
                store(contact);
                row = bind(row, contact);
                $(row).find('time').setTime();
                $(screen).find('table tbody').append(row);
				$(screen).find('form :input[name]').val('');
				$(screen).find('#contactDetails').toggle( "blind" );
	            this.updateTableCount();
            }
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
            $(val).text(obj[field]);
            if ($(val).is('time')) {
                $(val).attr('datetime', obj[field]);
            }
        }
    });
    return template;
}