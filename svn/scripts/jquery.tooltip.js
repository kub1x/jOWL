/*
 * Heavily Modified JTip, originally by By Cody Lindley (http://www.codylindley.com)
 */
$.fn.extend({
  tooltip: function(options) {
	var options = $.extend({html : "undefined", width : 250, title : "Description"}, options);
	var node = $(this).css({'cursor':'pointer'});
	node.hover(function(){ show()}, function(){$('#JT').remove()});
	var css = { 
			JT : {"font-size" : "12px", "position": "absolute", "z-index": "5", "border" : "2px solid #CCCCCC", "background-color" : "#fff" },
			arrow : {"position": "absolute", "z-index":"101", "height":"23px", "background-repeat": "no-repeat", "background-position": "left top", "left": "-12px"},
			arrow_left : {
				"background-image": "url(http://ontologyonline.org/img/tooltip/arrow_left.gif)",  "width":"10px", "top":"-3px" },
			arrow_right : {
				"background-image": "url(http://ontologyonline.org/img/tooltip/arrow_right.gif)", "width":"11px", "top":"-2px" },
			title : {"background-color": "#CCCCCC", "text-align": "left", "padding-left": "8px", "padding-bottom": "5px", "padding-top": "2px", "font-weight":"bold"},
			content : {"padding":"10px", "color":"#333333"},
			loader : { "background-image": "url(http://ontologyonline.org/img/tooltip/loader.gif)", "background-repeat": "no-repeat", "background-position": "center center", "width":"100%", "height":"12px" }
			};
	function getElementWidth() { return node.get(0).offsetWidth; }
	function getAbsoluteLeft() { o = node.get(0); oLeft = o.offsetLeft; while(o.offsetParent!=null) {  oParent = o.offsetParent;  oLeft += oParent.offsetLeft; o = oParent; } return oLeft;}
	function getAbsoluteTop() {o = node.get(0); oTop = o.offsetTop; while(o.offsetParent!=null) { oParent = o.offsetParent; oTop += oParent.offsetTop; o = oParent; } return oTop;}

	function show(){
		if(node.title) options.title = node.title; else if(node.nodeName == 'A') options.title = node.innerHTML;
		var de = document.documentElement; var w = self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth;
		var hasArea = w - getAbsoluteLeft(node); var clickElementy = getAbsoluteTop(node) - 3; var clickElementx = 0;
		var JTContent = $("<div/>").css(css.content).append($("<div id='JTLoader'/>").css(css.loader));
		var JT = $("<div id='JT'/>").appendTo("body").css(css.JT).width(options.width);
		var JTArrow = $("<div/>").css(css.arrow); 
		if(hasArea> options.width+75){
			JTArrow.css(css.arrow_left); clickElementx = getAbsoluteLeft(node) + getElementWidth(node) + 11; //set x position
		}else{
			JTArrow.css(css.arrow_right); clickElementx = getAbsoluteLeft(node) - (options.width + 15); //set x position
		}
		JT.append(JTArrow)
			.append($("<div/>").text(options.title).css(css.title))
			.append(JTContent).css({left: clickElementx+"px",  top: clickElementy+"px"}).show();
		if(typeof options.html == 'string') JTContent.html(options.html);
		else if(typeof options.html == 'function') JTContent.html(options.html());
	}
  }
});