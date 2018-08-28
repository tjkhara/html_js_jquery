(function($) {
	$.fn.extend({
	    updateFooter : function(params) {	    		
		    $.each(this, function(indx, val) {
		        if ($(val).find('tbody') && $(val).find('tfoot')) {
		            var count = $(val).find('tbody tr').length;
		            if (params && params.message) {
		            	$(val).find('tfoot td').text(count + ' ' + params.message);
		            } else {
		                $(val).find('tfoot td').text(count + ' rows in the table');
		            }
		        }
		    });
			return this;
		},
	});
})(jQuery);