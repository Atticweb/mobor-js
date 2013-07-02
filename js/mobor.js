$(function(){
	var BODY			=	$('body');
	var loader			=	$('<div class="loader">LOADING</div>');
	var overlay			=	$('<div class="overlay"></div>');
	var close_btn		=	$('<div class="close_btn">x</div>');
	
	var done_loading	=	true;
	
	init();
	
	function init(){
		add_classes('page');
		
		//set functions for execute the loading function from external file
		window.start_loading = function(){ 
			loading(true);
		}
		window.end_loading = function(){ 
			loading(true);
		}
	}

	function loading(load)
	{
		if(load){
			BODY.append(loader);
			$('.loader').fadeIn(300);
			done_loading	=	false;
		}else{
			$('.loader').fadeOut(300, function(){
				$(this).remove();
			});
			done_loading	=	true;
		}
	}
	
	function add_classes(role){
		var selector, add_class;
		switch(role){
			case 'page':
				selector	=	'div[data-role="page"]';
				add_class	=	'page current';
			break;
			case 'next_page':
				selector	=	'div[data-role="page"]:not(.current)';
				add_class	=	'page next';
			break;
			case 'dialog':
				selector	=	'div[data-role="dialog"]';
				add_class	=	'dialog';
			break;
			case 'lightbox':
				selector	=	'div[data-role="lightbox"]';
				add_class	=	'lightbox';
			break;
		}
		
		$(selector).each(function(){
			var elm		=	$(this);
			var theme	=	elm.data('theme');
			var title	=	elm.data('title');
			
			if(theme){
				elm.addClass('theme_'+theme);
			}
			if(title){
				elm.attr('id', title);
			}
			elm.addClass(add_class);
		});
	}
	
	function navigate(elm){
		var reverse		=	elm.data('direction');
		var transition	=	elm.data('transition');
		var URL = (elm.attr('href')) ? elm.attr('href') : elm.data('url');
		
		loading(true);
		
		$.event.trigger({
			type: 'page_load',
			page: URL,
		});
		
		$.get(URL, function(data) {
			var html 	=	$(data);
			var role	=	$(html.filter(".content")).data('role');
			
			switch(role){
				case 'page':
					$(BODY).append(html.filter(".content"));
					add_classes('next_page');
					switch (transition) { 
						case 'slide':
							trans_slide(reverse);
						break;
						case 'fade':
							trans_fade();
						break;
						default:
							trans_none();
						break;
					}
				break;
				case 'dialog':
					open_dialog(html, transition);
				break;
				case 'lightbox':
					open_lightbox(html, transition);
				break;
			}
			
			loading(false);
			
			$.event.trigger({
				type: "page_loaded",
				page: URL,
				role: role,
			});
		});
	}
	
	/*open the dialog*/
	function open_dialog(html, transition)
	{
		$(BODY).append(overlay);
		$('body > .overlay').fadeIn(300);
		
		$(BODY).append(html.filter(".content"));
		add_classes('dialog');
		
		var contents	=	$('.dialog .contents').html();
		$('.dialog').append(close_btn);
		$('.dialog .contents').html('<div class="scroll">'+contents+'</div>');
		switch (transition) { 
			case 'slide':
				$('.dialog').show().addClass('slide');
			break;
			case 'fade':
				$('.dialog').fadeIn(300);
			break;
		}
	}
	
	/*open the lightbox*/
	function open_lightbox(html, transition)
	{
		$(BODY).append(overlay);
		$('body > .overlay').fadeIn(300);
		
		$(BODY).append(html.filter(".content"));
		add_classes('lightbox');
		
		$('.lightbox').append(close_btn);
		switch (transition) { 
			case 'slide':
				$('.lightbox').show().addClass('slide');
			break;
			case 'fade':
				$('.lightbox').fadeIn(300);
			break;
		}
	}
	
	/*slide animation*/
	function trans_slide(reverse)
	{
		var slide;
		var slide	= (reverse) ? 'reverse_slide' : 'slide';
		$('.page.next').show().addClass(slide);
		$('.page.current').addClass(slide).addClass('remove');
		$('.page.next.'+slide).bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e){
			$('.page.next').removeClass('next reverse_slide slide').addClass('current');
			$('.page.remove').remove();
		});
	}
	
	/*fade animation*/
	function trans_fade()
	{
		$('.page.current').addClass('remove');
		$('.page.next').hide().fadeIn(500, function(){
			$('.page.next').removeClass('next').addClass('current');
			$('.page.remove').remove();
		});
	}
	
	/*no animation*/
	function trans_none()
	{
		$('.page.current').addClass('remove');
		$('.page.next').show();
		$('.page.next').removeClass('next').addClass('current');
		$('.page.remove').remove();
	}
	
	function reset(elm)
	{
		elm.html('');
	}
	
	
	/*navigation click*/
	$(BODY).delegate('[data-role="navigate"]', 'click', function(){
		if(done_loading){
			navigate($(this));
		}
		return false;
	});
	
	/*close dialog*/
	$(BODY).delegate('.close_btn', 'click', function(){
		if(done_loading){
			if(!$(this).parent().hasClass('slide')){
				$('.dialog,.lightbox').fadeOut(300, function(){
					$(this).remove();
				});
			}else{
				$('.dialog,.lightbox').removeClass('slide').addClass('slide_up');
				$('.dialog.slide_up,.lightbox.slide_up').bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e){
					$(this).remove();
				});
			}
			$('body > .overlay').fadeOut(300, function(){
				$(this).remove();
			})
		}
		return false;
	});

});