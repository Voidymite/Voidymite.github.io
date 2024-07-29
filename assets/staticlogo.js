var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

//** Site Logo/ Watermark Script- (c) Dynamic Drive DHTML code library: http://www.dynamicdrive.com.
//** Available/ usage terms at http://www.dynamicdrive.com
//** v2.0 (April 19th, 09')


var ddsitelogo={
	setting: {orientation:4, visibleduration:0, fadeduration:[1000, 500]}, //orientation=1|2|3|4, duration=millisec or 0, fadedurations=millisecs
	offsets: {x:10, y:10},//offset of logo relative to window corner
	logoHTML: '<a href="https://voidymite.fr.to" title="voidymite.fr.to"><img src="assets/logo.png" style="width:50px; height:50px; border:0" /></a>', //HTML for logo, which is auto wrapped in DIV w/ ID="mysitelogo"

	coord: {},

	keepfixed:function(){
		if (!this.cssfixedsupport){
			var $window=jQuery(window)
			var is1or3=/^[13]$/.test(this.setting.orientation)
			var is1or2=/^[12]$/.test(this.setting.orientation)
			var x=$window.scrollLeft() + (is1or3? this.offsets.x : $window.width()-this.$control.width()-this.offsets.x)
			var y=$window.scrollTop() + (is1or2? this.offsets.y : $window.height()-this.$control.height()-this.offsets.y)
			this.$control.css({left:x+'px', top:y+'px'})
		}
	},

	showlogo:function(){
		var mainobj=ddsitelogo
		this.$control.animate({opacity:1}, this.setting.fadeduration[0])
		if (this.setting.visibleduration>0){
			setTimeout(function(){
				mainobj.$control.stop().animate({opacity:0}, mainobj.setting.fadeduration[1], function(){
					jQuery(window).unbind('scroll.fixed resize.fixed')
				})
			}, this.setting.visibleduration+this.setting.fadeduration[0])
		}
	},
	
	init:function(){
		jQuery(document).ready(function($){
			var mainobj=ddsitelogo
			var iebrws=document.all
			mainobj.cssfixedsupport=!iebrws || iebrws && document.compatMode=="CSS1Compat" && window.XMLHttpRequest //not IE or IE7+ browsers in standards mode
			if (mainobj.cssfixedsupport){
				mainobj.coord[(/^[13]$/.test(mainobj.setting.orientation))? 'left' : 'right']=mainobj.offsets.x
				mainobj.coord[(/^[12]$/.test(mainobj.setting.orientation))? 'top' : 'bottom']=mainobj.offsets.y
			}
			mainobj.$control=$('<div id="mysitelogo">'+mainobj.logoHTML+'</div>')
				.css({position:mainobj.cssfixedsupport? 'fixed' : 'absolute', opacity:0})
				.css(mainobj.coord)
				.appendTo('body')
			if (document.all && !window.XMLHttpRequest && mainobj.$control.text()!='') //loose check for IE6 and below, plus whether control contains any text
				mainobj.$control.css({width:mainobj.$control.width()}) //IE6- seems to require an explicit width on a DIV containing text
			mainobj.keepfixed()
			mainobj.showlogo()
			$(window).bind('scroll.fixed resize.fixed', function(){mainobj.keepfixed()})
		})
	}
}

ddsitelogo.init()


}
/*
     FILE ARCHIVED ON 22:29:34 Sep 30, 2009 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 05:17:11 Jul 29, 2024.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  captures_list: 0.764
  exclusion.robots: 0.029
  exclusion.robots.policy: 0.013
  esindex: 0.016
  cdx.remote: 570.254
  LoadShardBlock: 682.41 (3)
  PetaboxLoader3.datanode: 49.429 (4)
  PetaboxLoader3.resolve: 110.607 (2)
  load_resource: 80.564
*/