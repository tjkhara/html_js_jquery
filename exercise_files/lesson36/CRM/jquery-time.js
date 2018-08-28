(function($) {
	$.fn.extend({	    
		setTime: function(params) {
		    months = {
		        0: 'January',
		        1: 'February',
		        2: 'March',
		        3: 'April',
		        4: 'May',
		        5: 'June',
		        6: 'July',
		        7: 'August',
		        8: 'September',
		        9: 'October',
		        10: 'November',
		        11: 'December',
		    }
		    $.each(this, function(indx, val) {
		        if ($(val).attr('datetime')) {
		            var date = new Date($(val).attr('datetime'));
		            var m = months[date.getMonth()];
		            if (params && params.style === 'short') {
		                m = m.substr(0, 2);
		                var display = m + ' ';
		                display += date.getDate() + ', ';
		                display += (date.getFullYear() % 100);
		            } else {
		                var display = m + ' ';
		                display += date.getDate() + ', ';
		                display += date.getFullYear();
		            }
		            $(val).text(display);
		        }
		    });
			return this;
		},
	});
})(jQuery);