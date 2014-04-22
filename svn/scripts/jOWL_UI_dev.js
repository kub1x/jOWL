/*
 * jOWL_UI, User Interface Elements for jOWL, semantic javascript library
 * Creator - David Decraene
 * http://Ontologyonline.org
 */
(function($){

jOWL.UI = {
	broadcaster : function(){
		var listeners = new Array();
		this.addListener = function(obj){
			if(obj.constructor == Array){for(var i=0;i<obj.length;i++){add(obj[i]);}}
			else add(obj);
			function add(obj){if(obj.propertyChange != undefined) listeners.push(obj)}
			return this; };
		this.broadcast = function(item){ for(var i=0;i<listeners.length;i++){listeners[i].propertyChange(item);};}
		this.propertyChange = function(item){};
	},
	asBroadcaster : function(ui_elem){ ui_elem.broadcaster = jOWL.UI.broadcaster; ui_elem.broadcaster(); },
	/**Internal function, make it easier to create elements */
	getDiv : function(className, context, keep){
				var node = $("."+className, context)
					if(!keep) node.empty();
				if(!node.length) node = $("<div/>").addClass(className).appendTo(context);
				return node;
				},
	/** generate some pretty html for valuerestrictions on individuals, used by formresults, and individuals widget*/
	valueRestrictions : function(thing){
		var html = [];
		var rr = thing.valueRestrictions(true).JSON();
		for(x in rr){
			//add spaces when array
			var syntax = (x == "img") ? '<img src="'+rr[x]+'"/>' : "<span class='alt'>"+x+"</span>: "+rr[x];
			html.push($('<div/>').html(syntax).get(0));
		}
		return html;			
	}
}

/** 
WIDGETS 
all widgets implement propertyChange and addListener,
fire up a widget with jOWL content: widget.propertyChange(jOWLObject);
pattern for widgets: 
			add class owl_UI
			set object asBroadcaster
			overwrite the propertyChange function
*/
$.fn.extend({
		/* 
		owl_navbar
		options:
		*/
		owl_navbar: function(options){
			options = $.extend({}, options);
			var self = this;
			this.addClass("owl_navbar owl_UI");
			var content = $(".owl_UI_content", this).empty();
				if(!content.length) content = $("<div/>").addClass("owl_UI_content").appendTo(this);
				var parents =  $('<div class="owl_navbar_parents"/>').appendTo(content);
				var focus = $('<div/>').appendTo(content);
				var children = $('<div class="owl_navbar_children"/>').appendTo(content);
				var listnode = $('<span/>').css('cursor', 'pointer').click(function(){					
					var res = jOWL(this.title);
					if(res && res.type == 'owl:Class') { self.propertyChange(res); self.broadcast(res); }
					});

			jOWL.UI.asBroadcaster(this);

			this.propertyChange = function(item){
				if(item.type && item.type == 'owl:Class'){
					item.bind(focus); focus.addClass("owl_UI_focus"); 
					parents.empty().append(item.parents().bind(listnode));
					children.empty().append(item.children().bind(listnode));
				} 
			};

			return this;
		},
		/** 
		options: 
			time: responsetime to check for new keystrokes, default 500
			chars: number of characters needed before autocomplete starts searching, default 3
			focus: put cursor on the input field when loading, default false
			limit: limit size of result list to given amount, default 10
		*/
		owl_autocomplete : function(options){
				options = $.extend({time:500, chars:3, focus:false, limit:10, html : function(listitem, type, identifier, termarray){
					listitem.append($('<div class="type"/>').text(type));
					listitem.append($('<div class="name"/>').text(identifier));
					if(termarray.length) listitem.append($('<div class="terms"/>').text(termarray.join(', '))
								.prepend($('<span/>').addClass('termlabel').text("Terms: "))
								);
				}}, options);
				jOWL.UI.asBroadcaster(this);
				var self = this; var old = ''; var open = false; self.val('');
				var results = $('<ul class="owl_autocomplete_results"/>'); this.after(results);
				results.cache = {};
				results.isEmpty = function(){ for(x in results.cache) { return false; } return true; }
				results.close = function(){this.hide();}
				results.open = function(q, cache){
					this.show(); 
					if(q){
						if(!cache || results.isEmpty()) { 
							var opts = {};
							if(options.filter) $.extend(opts, { filter : options.filter}); 
							if(options.exclude) $.extend(opts, { exclude : options.exclude});
							results.cache = jOWL.query(q, opts); 
							}
						else { 
							var newcache = {};
							for(x in results.cache){
								var entry = results.cache[x]; 
								var found = false;
								var newentries = [];								
								if(x.searchMatch(q) > -1) found = true;
								for(var i = 0;i<entry.length;i++){
									if(entry[i].term.searchMatch(q) > -1) { found = true; newentries.push(entry[i]); }
								}
								if(found) newcache[x] = newentries;
								}
							results.cache = newcache;
							}
						this.populate(results.cache);
						}
				}
				results.populate = function(data){
					var res = this; this.empty(); var count =0; 
					for(x in data){
						if(count < options.limit){
							var item = data[x];
							var v = jOWL.isExternal(x);
							v = v ? v[1] : x;
							var list = $('<li/>').data("jowltype", x)
							.click(function(){self.broadcast(jOWL($(this).data("jowltype")));})
							.hover(function(){$(this).addClass('hover');}, function(){$(this).removeClass('hover');})
							.appendTo(res);
							var terms = [];
							for(var l = 0;l<item.length;l++){ 
								var found = false; var newterm = item[l].term;
								for(var y=0; y < terms.length;y++){ if(terms[y].toLowerCase() == newterm.toLowerCase()) found = true;}
								if(!found) terms.push(newterm);	
								}
							options.html(list, item[0].type, v, terms);

						}
						count++;
					}
				}

				setInterval(function(){
					var newvalue = self.val();
					var cache = true;
					if(old != newvalue){
						var longervalue = newvalue.length > old.length && newvalue.indexOf(old) == 0;
						if(!old) cache = false; //if previous entry was null input -> never cache
						old = newvalue; 
						if(newvalue.length < options.chars && open){results.close();open = false;}
						else if(newvalue.length >=options.chars && newvalue.length > 0){
							if(cache) cache = longervalue && newvalue.length > options.chars;
							results.open(newvalue, cache);
							open = true;
							}
						
					}
				}, options.time);

				self.bind('keyup', function(){ if(this.value.length == 0){ results.close();open = false;}})
				if(options.focus)self.bind('blur', function(){if(open){setTimeout(function(){results.close();}, 200);open = false;}});
				//timeout for registering clicks on results.
				self.bind('focus', function(){if(self.val().length != 0 && !open){results.open('', open);open = true;}});
				//reopen, but do not get results
				return this;
		},
		/*
		simple widget, use owl_propertyLens for more flexibility
		options: 
			title: display the owl:Class name on top, default true
		*/
		owl_individuals : function(options){
			options = $.extend({title: true, tooltip : false, html : jOWL.UI.valueRestrictions}, options);
			this.addClass('owl_indiv owl_UI');

			var content = $(".owl_UI_content", this).empty();
				if(!content.length) content = $("<div/>").addClass("owl_UI_content").appendTo(this);
			var title =  $('<div class="owl_UI_focus"/>').appendTo(content);
			var list = $('<div class="owl_indiv_list"/>').appendTo(content);

			jOWL.UI.asBroadcaster(this);

			this.propertyChange = function(item){
				if(item.type == 'owl:Class') { 
						if(options.title) title.html(item.label());
						var results = new jOWL.Ontology.Array();
						new jOWL.SPARQL_DL("Type(?x, concept)", {"concept": item})
							.execute({childDepth : 1, async: false, onComplete : function(r){
								$.each(r.results, function(i, n){results.push(n["?x"]);}); 
						}}); 
						var th = results.bind($('<div/>'), function(node, thing){
							if(options.tooltip && node.tooltip) 
								node.tooltip({ title: thing.label(), html : function(){ return options.html(thing);	} }); 
						});
						list.empty().append(th);						 
								
					}				
				};

			return this;
		},
		/** 
		options:
		rootThing: true/false - default false; if true then topnode is (owl) 'Thing'
		isStatic: true/false - default false; if static then selections will refresh the entire tree
		addChildren : true/false - default false; add a given objects children to the treeview as well
		onSelect: function that can be overwritten to specfy specific behavior when something is selected
		*/
		owl_treeview : function(options){	
			options = $.extend({isStatic: false, addChildren : false, rootThing : false, onSelect: function(item){}}, options);
			this.addClass("owl_tree owl_UI");	
			var content = jOWL.UI.getDiv("owl_UI_content", this);
			var tree = new Tree(content, null, options);
				jOWL.UI.asBroadcaster(tree);
				tree.propertyChange = function(item){if(item.type == 'owl:Class') TreeModel(item); };
			if(options.object) tree.propertyChange(options.object);

			function onSelect(item){
				var entry = $.data(item, "jOWL"); tree.broadcast(entry); if(options.isStatic) tree.propertyChange(entry);	
			}

			/** construct the hierarchy & make a tree of it */
			function TreeModel(owlobject){
				var h = owlobject.hierarchy();
				var root = options.rootThing ? tree.root(jOWL("Thing")) : tree.root(h);
				if(root.length) { 
					for(var i=0;i<root.length;i++){ traverse(root[i].invParents, root[i]);} 
					}
				else traverse(h, root);

				function traverse(itemarray, appendto){
					if(!itemarray) { 
						var leaf = $.data(appendto.name, "jOWL");
						if(options.addChildren && leaf) {
							appendto.jnode.addClass('focus');
							leaf.children().each(function(child){
								appendto.add(child);
							});
						}					
					}
					if(itemarray) itemarray.each(function(item){					
						var node = appendto.add(item);	traverse(item.invParents, node);
						item.invParents = null; //reset for later use
					});
				}			

			}

			/**
			var tree = $(selector).owl_treeview();
			var root = tree.root("node");
			root.add("node2").add("child");
			*/
			function Tree(node, treemodel, options){
				options = $.extend({isStatic:false, onSelect : function(item){}}, options);				
				var rack = $('<ul/>').addClass("owl_treeview").appendTo(node);
				/**item can be text, a jOWL object, or a jOWL array */
				this.root = function(item){
					var rt = null; //root
					rack.empty();  
					if(item && item.each) {
						rt = [];
						item.each(function(it){
							var x =  new fn.node(it, true); 
							x.wrapper.addClass("tv");
							x.jnode.appendTo(rack);
							x.invParents = it.invParents; it.invParents = null;	//reset for later use
							rt.push(x);
						}) 
						return rt;	
					}
					rt = new fn.node(text, true);						
					rt.wrapper.addClass("tv"); 
					rt.jnode.appendTo(rack);
					return rt;
				}

				var fn = {};
				fn.node = function(text, isRoot){ //creates a new node
					this.jnode = isRoot ? $('<li class="root"/>') :  $('<li class="tvi"/>');
					this.name = null;
					if(text){						
						this.name = $('<span class="name"/>');						
						if(typeof text == "string") this.name.html(text);
						else if(text.bind) { text.bind(this.name); $.data(this.name, "jOWL", text); }
						var n = this.name; 
						this.name.appendTo(this.jnode).click(function(){onSelect(n); options.onSelect(n); return false;});
					}
					
					this.wrapper = $('<ul/>').appendTo(this.jnode);
					var self = this;
						self.jnode.click(function(){toggle(); return false;});

					this.add = function(text){
						var nn = new fn.node(text);
						if(self.wrapper.children().length == 0) { toNode();	}//no children
						else { var lastchild = self.wrapper.children(':last'); 
							lastchild.swapClass("tvilc", "tvic"); 
							lastchild.swapClass("tvile", "tvie"); 
							lastchild.swapClass("tvil", "tvi");  
							
							}//children - change end of list
						self.wrapper.append(nn.jnode.swapClass('tvi', 'tvil'));
						return nn;
						}

					function toggle(){ 
						var t = self.jnode.hasClass("tvic") || self.jnode.hasClass("tvie") || self.jnode.hasClass("tvilc") || self.jnode.hasClass("tvile");
						if(!t) return;
						self.jnode.swapClass('tvic', 'tvie'); self.jnode.swapClass('tvilc', 'tvile');
						self.wrapper.slideToggle();
						}
					function toNode(){ self.jnode.swapClass('tvil', 'tvilc');self.jnode.swapClass('tvi', 'tvic');}
					}							
					return this;
			}// end Tree
			return tree;
		},
/** Uses templating 	
options: 
onChange: owl:Class, owl:Thing, etc...
"data-jowl" : {split: ",  "} ( example: "rdfs:label" : {split: ",  "} )
onUpdate: called when propertyChange
*/
		owl_propertyLens : function(options){
			var self = this;
			this.options = $.extend({split: {}, disable : {}, click : {}}, options);
			this.resourcetype = this.attr('data-jowl') || "owl:Class";
			var pboxes = $('.propertybox', this).hide();
			var backlink = $('.backlink', this).hide();
			if(!backlink.length) backlink = $('<div class="backlink jowl_link"/>').text("Back").hide().appendTo(this);
			jOWL.UI.asBroadcaster(this);

			this.link = function(source, target, htmlel){
				htmlel.addClass("jowl_link").click(function(){
				self.broadcast(target); self.propertyChange(target);
				backlink.source = source.name;
				backlink.show().unbind('click').click(function(){					
					self.broadcast(source); self.propertyChange(source); backlink.hide();
				});

				});

			}

			var action = {
				"rdfs:label": function(item){ return [{"rdfs:label": item.label() }]; },
				"rdf:ID" : function(item){ return [{"rdf:ID": [item.name, item] }]; },
				"rdfs:comment" : function(item){
					return $.map(item.description(), function(n){return {"rdfs:comment":n }});
					},
				"rdf:type" : function(item){
					if(item.owlClass) return [{"rdf:type": item.owlClass() }];
					return [{"rdf:type": item.type }];
				},
				"term" : function(item){
					return $.map(item.terms(), function(n, i){ return { "term" : [n[0], item] }; });
				},
				"rdfs:range": function(item){if(item.range) return [{"rdfs:range": item.range }]},
				"rdfs:domain": function(item){if(item.domain) return [{"rdfs:domain": item.domain }]},
				"permalink": function(item){
					var href = jOWL.permalink(item);
					return [{"permalink": "<a href='"+href+"'>Permalink</a>" }];
				},
				"owl:disjointWith": function(item){
					if(item.type != "owl:Class") return; 
					return $.map(
							jOWL.XPath('*', item.jnode)
								.filter(function(){return this.nodeName == "owl:disjointWith"}), 
							function(n, i){ return {"owl:disjointWith": jOWL($(n).RDF_Resource())};
							});	
				},
				"default" : function(item){
					var type = this.attr("data-jowl");
					return $.map(
								jOWL.XPath('*', item.jnode).filter(function(){return this.nodeName == type}),
								function(n, i){ var x = {}; x[type] = $(n).text(); return x; }
								);	
				}
			}

			this.propertyChange = function(item){
				if(backlink.source != item.name) { backlink.hide(); } else backlink.source = false; 
				if(item.type != self.resourcetype){
					if(item.type == 'owl:DatatypeProperty' && self.options.type == "rdf:Property") {}
					else if(item.type == 'owl:ObjectProperty' && self.options.type == "rdf:Property"){}
					else return;
					}
				
				
				function complete(nodes){
					if(!nodes.length) return;  
					for(x in self.options.onChange){						
						var data = $('[typeof='+x+']', nodes).add(nodes.filter('[typeof='+x+']'));
						data.each(function(){
							var node = $(this);
							self.options.onChange[node.attr('typeof')].call(node, item, jOWL(node.attr('title')), self);
						})
						
					}
				}


				pboxes.hide().each(function(){
					var pbox = $(this), count = 0;
					var actiontype = false, datajowl, descendant = false, results;
					var valueb = $('[data-jowl]', pbox);
					if(!valueb.length){	datajowl = pbox;}
					else if(valueb.length == 1){ datajowl = valueb;	descendant = true; }
					else return;
					actiontype = datajowl.attr('data-jowl'); if(!actiontype) return;
					if(self.options.disable[actiontype]) return;
					if(!self.options[actiontype]) self.options[actiontype] = {};
					if(actiontype.indexOf("sparql-dl:") === 0){
						var query = actiontype.split("sparql-dl:", 2)[1];
						var fill = {}; fill[self.resourcetype] = item;
						new jOWL.SPARQL_DL(query, fill).execute({onComplete : function(r){
							if(self.options[actiontype].sort) r.sort(self.options[actiontype].sort);
							var nodes = jOWL.UI.Template(r.results, datajowl, self.options[actiontype].split);							
							complete(nodes);
							if(nodes.length && descendant) { pbox.show();valueb.hide(); }							
							}});
					}
					else {
						var choice = (action[actiontype]) ? actiontype : "default";
						results = action[choice].call(datajowl, item);
						var nodes = jOWL.UI.Template(results, datajowl, self.options[actiontype].split);
						complete(nodes);
						if(nodes.length && descendant) {pbox.show();valueb.hide();}
					}
					});
					
					if(self.options.onUpdate) self.options.onUpdate(item);
				}
		
		if(self.options.tooltip){
			var lens = this.remove();
			this.display = function(element, htmlel){
				htmlel.tooltip({
					title: element.label(), 
					html: function(){	lens.propertyChange(element); return lens.get(0); }
				}); 
			}
		}			

		return this;
		}	

		});

/**arr: associative array of variablrd, jqel: node for which variables need to be substituted,  */
jOWL.UI.Template = function(arr, jqel, splitter){
	if(!arr) return;
	function removePrev(jqel){
		var prev = jqel.prev('.owl_UI_template_result');
		if(!prev.length){prev = jqel.prev('.owl_UI_template_splitter');}
		if(prev.length) { prev.remove(); removePrev(jqel); }		
	}
	removePrev(jqel);

	function bindObject(value, jnode){
		var bound = false; 
		if(!value) return false;
		if(typeof value == 'string') { jnode.html(value); bound = true;}
		else if(value.constructor == Array){ 
			if(value.length == 2) { value[1].bind(jnode).text(value[0]); bound = true;	} 
			}
		else if(value.bind){ value.bind(jnode); bound = true; }
		return bound;
	}
	var count = 0, a = [];
	for(var i=0;i<arr.length;i++){
		var x = jqel.clone(true).wrapInner("<"+jqel.get(0).nodeName+" class='owl_UI_template_result'/>").children();
		/** copy style settings */
			x.addClass(jqel.attr('class')).removeClass('propertybox');
		/** accepted obj types= string, array["string", "jowlobject"], jowlobject*/
		for(obj in arr[i]){
			var occurrences = $(':contains(${'+obj+'})', x);
			if(!occurrences.length){
				if(x.text() == "${"+obj+"}") { if(bindObject(arr[i][obj], x)) count++;}
			}
			else occurrences.each(function(){	
				if(this.innerHTML == "${"+obj+"}") {	if(bindObject(arr[i][obj], $(this))) count++;	}
			});			
		}
		if(count) {
			x.insertBefore(jqel); a.push(x.get(0));
			if(count > 1 && splitter) { 
				if(splitter.indexOf('<') == 0) $(splitter).addClass('owl_UI_template_splitter').insertBefore(x);
				else $("<span class='owl_UI_template_splitter'/>").text(splitter).insertBefore(x);
				}
		}
	}
	return $(a);
}
/** 
Supporting functionality
*/

$.fn.swapClass = function(c1,c2) {
    return this.each(function() {if ($(this).hasClass(c1)) { $(this).removeClass(c1); $(this).addClass(c2);} else if ($(this).hasClass(c2)) {$(this).removeClass(c2);$(this).addClass(c1);}});
};
/**Modified tree creation
var tree = $(selector).createTree();
tree.add("node");
tree.add("node2").add("child");
*/
$.fn.createTree = function(text, options){
    options = $.extend({collapse:false}, options);

    function node(text, isRoot){ //creates a new node
        this.jnode; if(isRoot) this.jnode= $('<li class="root"/>'); else this.jnode= $('<li class="tvi"/>');
        this.name = null; if(text) this.name = $('<span class="name"/>').html(text).appendTo(this.jnode);
        this.wrapper = $('<ul/>').appendTo(this.jnode);
        var that = this;

        this.add = function(text){
            var nn = new node(text);
            if(this.wrapper.children().length == 0) { this.toNode(); 
			if(that.name) that.name.click(function(){that.toggle();}); 
			if(options.collapse && !isRoot) that.toggle();    }//no children
            else { var lastchild = that.wrapper.children(':last'); lastchild.swapClass("tvilc", "tvic"); lastchild.swapClass("tvile", "tvie"); lastchild.swapClass("tvil", "tvi");    }//children - change end of list
            this.wrapper.append(nn.jnode.swapClass('tvi', 'tvil'));
            return nn;
            }

        this.toggle = function(){ that.jnode.swapClass('tvic', 'tvie'); that.jnode.swapClass('tvilc', 'tvile'); 
		
		that.wrapper.slideToggle();}
        this.toNode = function(){ that.jnode.swapClass('tvil', 'tvilc');that.jnode.swapClass('tvi', 'tvic');}
        }
    //dynamic tree
    if(this.get(0).localName != 'UL'){ 
		if(!text) text = ''; var root = new node(text, true);
		root.wrapper.addClass("tv");
		root.jnode.appendTo($('<ul/>').addClass("owl_treeview").appendTo(this)); return root;}
    //static convert into tree, atm not changeable, and requires span wrappings around nodeitems
    else {
        this.addClass('tv'); this.find("li:last-child").addClass("tvil").end().find("li:has(ul)").addClass("tvic").swapClass("tvil", "tvilc");
        this.find('li>span').addClass('name').click(function(){ $(this).parent("li").swapClass("tvic", "tvie").swapClass("tvilc", "tvile").find(">ul").slideToggle("normal"); });}
};

})(jQuery);