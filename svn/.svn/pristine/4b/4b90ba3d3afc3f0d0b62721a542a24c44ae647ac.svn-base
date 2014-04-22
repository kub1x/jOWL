/*
 * jOWL - a Jquery plugin for traversing OWL-RDFS documents.
 * Creator - David Decraene
 * Version ...
 * http://Ontologyonline.org
 * Licensed under the MIT license
 */
(function($) {

$.fn.extend({
RDF_ID : function(match){
	var res = this.attr('rdf:ID');	if(!res) return false; 
	res = jOWL.resolveURI(res);
	if(match) return res.toLowerCase() == (jOWL.resolveURI(match.toString())).toLowerCase();
	return res;
	},
RDF_Resource : function(match){
	if(this.length === 0) return false;
	var rsrc = this.attr('rdf:resource');	
	if(!rsrc){
		var dom = this.get(0); 
		switch(dom.nodeName){
			case "rdfs:subClassOf": rsrc = $(dom.selectSingleNode("owl:Class")).attr('rdf:about'); break;
			case "owl:disjointWith": rsrc = $(dom.selectSingleNode("owl:Class")).attr('rdf:about'); break;
			case "owl:onProperty": 
				var t = $(dom.selectSingleNode("owl:ObjectProperty"));
				if(t.length === 0) t = $(dom.selectSingleNode("owl:DatatypeProperty"));
				rsrc = t.attr('rdf:about'); break;
			default: return false;
		}
	}
	if(!rsrc) return false;
	rsrc = jOWL.resolveURI(rsrc);
	if(match) return rsrc.toLowerCase() == (jOWL.resolveURI(match.toString())).toLowerCase();
	return rsrc;
	},
RDF_About : function(match){
	var res = this.attr('rdf:about'); if(!res) return false;
	res = jOWL.resolveURI(res);
	if(match) return res.toLowerCase() == (jOWL.resolveURI(match.toString())).toLowerCase();
	return res;
	}
});

// check for XPath implementation 
if( document.implementation.hasFeature("XPath", "3.0") ){
// prototying the XMLDocument 
XMLDocument.prototype.selectNodes = function(cXPathString, xNode) { 
	if( !xNode ) { xNode = this; } 
	var oNSResolver = this.createNSResolver(this.documentElement); 
	var aItems = this.evaluate(cXPathString, xNode, oNSResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); var aResult = []; for( var i = 0; i < aItems.snapshotLength; i++) { aResult[i] = aItems.snapshotItem(i); }  
	return aResult; }
// prototying the Element 
Element.prototype.selectNodes = function(cXPathString){  
	if(this.ownerDocument.selectNodes)  {  return this.ownerDocument.selectNodes(cXPathString, this); } 
	else{throw "For XML Elements Only";} } }
// check for XPath implementation 
if( document.implementation.hasFeature("XPath", "3.0") ){
// prototying the XMLDocument 
XMLDocument.prototype.selectSingleNode = function(cXPathString, xNode) { if( !xNode ) { xNode = this; } var xItems = this.selectNodes(cXPathString, xNode); if( xItems.length > 0 ) {  return xItems[0]; } else {  return null; }} 
// prototying the Element 
Element.prototype.selectSingleNode = function(cXPathString) { 
	if(this.ownerDocument.selectSingleNode)  {  return this.ownerDocument.selectSingleNode(cXPathString, this); } 
	else{throw "For XML Elements Only";} }  }

jOWL = window.jOWL = function( resource, options ) { return jOWL.getResource( resource, options );  };
/** Internal function */
jOWL.XPath = function(selector, elem){
	var node = null; 
	if(elem) { if(elem.each) node = elem.get(0); else node = elem;} 
	var arr = node ? node.selectNodes(selector) : jOWL.document.selectNodes(selector);
	if($.browser.msie) return $($.makeArray(arr)); return $(arr); //this is needed for IE, it returns a length of 1 on empty node array
}

/** access to the owl:Ontology element */
jOWL.Ontology = function(){
	var ontology = function(){};
	ontology.inherit = jOWL.Ontology.internal; ontology.inherit(jOWL.XPath("/rdf:RDF/owl:Ontology"));
	return ontology;
}
	
jOWL.Ontology.internal = function(jnode){			
	/** Resolving the identity */
	var identifier;
	if(typeof jnode == 'string') { identifier = jnode; jnode = $();  }
	else { identifier = jnode.RDF_ID() || jnode.RDF_About() || "anonymousOntologyObject"; 	}
	identifier = jOWL.resolveURI(identifier);
	this.isExternal = jOWL.isExternal(identifier);				
	if(this.isExternal) {this.baseURI = this.isExternal[0]; this.name = this.isExternal[1]; this.URI = this.baseURI+this.name; }
	else {	this.baseURI = jOWL.namespace; this.name = identifier; this.URI = this.name; }
	/** resolved */
	this.jnode = jnode;
	this.type = jnode.get(0).nodeName;
	/** description returns an array */
	this.description = function(){
		var comment = jOWL.XPath('rdfs:comment', this.jnode);
		return $.map(comment, function(n, i){ return $(n).text();});
		}
	/**
	new since jOWL 0.6
	returns Array of Arrays, where secondary array is of form: [0] = term, [1] = identifier, [2] = language; [3] = type of object
	example:
	[
	   ["bleu", "blue", "fr", "owl:Class"] //bleu is french for the color 'blue',
	   ["Blue color", "blue", "fr", "owl:Class"]
	]
	*/
	this.terms = function(){
		var terms = [], self = this;
		var type;
		switch(this.nodeName){
				case "owl:Class" : type = 'Class'; break;
				case "owl:ObjectProperty" : type = 'ObjectProperty'; break;
				case "owl:DatatypeProperty" : type = 'DatatypeProperty'; break;
				default : type = 'Thing'; break;
			}
		if(jOWL.options.dictionary.addID && this.name != "anonymousOntologyObject") terms.push([this.name.beautify(), this.URI, jOWL.options.defaultlocale, this.type]);
		jOWL.XPath('rdfs:label', this.jnode).each(function(){
			var lbl = $(this);
			var locale = lbl.attr("xml:lang") || jOWL.options.defaultlocale;
			var txt = lbl.text();
			var match = false;
			for(var i =0;i<terms.length;i++){
				if(terms[i][0].toUpperCase() == txt.toUpperCase()) 
					if(terms[i][2] == locale) match = true;
			} 
			if(!match) terms.push([lbl.text(), self.URI, locale, self.type]);
		});
		return terms;
	}
	this.label = function(){
		var label = false; var match = false;
		jOWL.XPath('rdfs:label', this.jnode).each(function(){
			if(match) return; var lnode = $(this);
			if(jOWL.options.locale) { 
				var loc = lnode.attr('xml:lang');
				if(!loc && !label) { label = lnode.text();}
				if(loc == jOWL.options.locale) { label = lnode.text(); match = true; }
				}
		});
		if(this.type == "owl:Class" || this.type == "owl:Thing") { 
			if(!label && jOWL.options.niceClassLabels) return this.name.beautify();
		}
		if(!label) return this.name;
		return label;}
	this.bind = function(jqelem){
		return jqelem.text(this.label()).attr('typeof', this.type).attr('title', identifier);}
	}

/** access to Individuals of the ontology*/
jOWL.Ontology.Individual = function(jnode, owlclass){
	this.inherit = jOWL.Ontology.internal; this.inherit(jnode);
	this.Class = this.type;
	if(this.type == "owl:Thing"){
		var t = jOWL.XPath('rdf:type', this.jnode); if(!t.length) throw "unable to find a Class for the Individual "+this.name;
		this.Class = $(t[0]).RDF_Resource();
	}
	this.type = "owl:Thing";		
	this.owlClass = function(owlclass){ 
		if(owlclass) jOWL.data(this.name, "class", owlclass); 
		else { 
			var owlclass = jOWL.data(this.name, "class");
			if(!owlclass) { owlclass = jOWL(this.Class); this.owlClass(owlclass);} 
			return owlclass;
			}
		};
	if(owlclass) this.owlClass(owlclass);
	//see if criterium matches restriction - in development, if no restriction specified then all restrictions are returned, as jQuery node array.
	this.localRestrictions = function(property, target){
		if(property) {
			var pnodes = this.jnode.children(property.name);
			if(!pnodes.length) return false;
			if(target){
				var found = false;
				if(property.type != 'owl:ObjectProperty') { pnodes.each(function(){if($(this).text() == target) found = true; }); }
				else { 
					pnodes.each(function(){if($(this).RDF_Resource() == target.name) found = true; });}
				return found;
				}
			return true;
			}
		return this.jnode.children().filter(function(){	return (this.prefix != "rdfs" && this.prefix != "rdf");});
	};
	//Returns jOWl array
	this.classRestrictions = function(includeAll){
		var c = this.owlClass();
		if(c.valueRestrictions) { var arr = c.valueRestrictions(includeAll); return arr; }
		return jOWL.Ontology.Array();
	};

	this.valueRestrictions = function(includeClass, includeValueless){
		var r = new jOWL.Ontology.Array();

		this.localRestrictions().each(function(){ 
			var crit = new jOWL.Ontology.Criterium($(this));	if(!r.contains(crit)) r.push(crit);	
			});

		if(includeClass) this.classRestrictions(includeValueless).each(function(){				
			if(!r.contains(this)) r.push(this);		});
		
		/** convert to JSON format */
		r.JSON = function(){
			var entry = {};

			function save(property, target, maxCard){
				if(!entry[property]) entry[property] = target;
				else if(maxCard === 1) entry[property] = target;
				else if(entry[property].constructor == "Array"){
				var a = entry[property], dupe = false;
				for(var i =0;i<a.length;a++){
					if(a[i] == target) { dupe = true; break; }
				}
				if(!dupe) entry[property].push(target);
				}
				else{
					if(entry[property] != target) { entry[property] = [entry[property], target]; entry[property].constructor = "Array"; }
				}
			}

			r.each(function(){
				var t = this.target || "Thing";
				save(this.property.name, t, this.maxCard);
			});
			return entry;
		
		}
		return r;
	}
}

/** jNode is of type owl:Restriction */
jOWL.Ontology.Criterium = function(jnode){
	//private members
	var jprop, prop, op, restrtype;

	if(jnode.get(0).nodeName != "owl:Restriction"){
		this.property = jOWL(jnode.get(0).nodeName, {type: "property"});
		this.target = jnode.RDF_Resource() || jnode.text();
		restrtype = "Individual";
	}
	else
	{
		var jprop = jOWL.XPath("owl:onProperty", jnode);
		var prop = jprop.RDF_Resource(); if(!prop) { throw "no property found for the given owl:restriction"; return null; }
		var op = jprop.siblings(); var cachedTarget = null;
		var restrtype = op.get(0).nodeName;
		this.property = jOWL(prop, {type: "property"});
		this.target = null; //string only
	}		

	this.restriction = { minCard: false, maxCard : false, some: [], all : [], value : false };		
	this.type = jnode.get(0).nodeName;
	this.bind = function(jqelem){return null;}
	
	this.isValueRestriction = (restrtype == 'owl:someValuesFrom' || restrtype == 'owl:allValuesFrom' || restrtype == 'owl:hasValue');
	this.isCardinalityRestriction = (restrtype == 'owl:cardinality' || restrtype =='owl:maxCardinality' || restrtype =='owl:minCardinality');

	if(!this.property || !restrtype) { throw "badly formed owl:restriction"; return null; }
	switch(restrtype){
		case "owl:cardinality": this.restriction.minCard = this.restriction.maxCard = parseInt(op.text()); break;
		case 'owl:maxCardinality': this.restriction.maxCard = parseInt(op.text()); break;
		case 'owl:minCardinality': this.restriction.minCard = parseInt(op.text()); break;
		case 'owl:hasValue': var res = op.RDF_Resource(); if(res) this.target = res; break;
	}
	if(this.property.type == "owl:ObjectProperty"){
			if(this.isCardinalityRestriction && this.property.range) this.target = this.property.range;
			else if(this.isValueRestriction) this.target = op.RDF_Resource();
		}
	
	
	this.getTarget = function(){
		if(restrtype == "Individual") return this.target;
		if(this.target == null) return jOWL('Thing');
		if(!cachedTarget) cachedTarget = jOWL(this.target); return cachedTarget;}

	this.getTargets = function(){
		var q = this.getTarget(); 
		if(q.type == "owl:Class") { 
		return q.individuals().concat(q.children()); 
		}}		
	
	this.merge = function(crit){
		if(this.isCardinalityRestriction && crit.isValueRestriction ) { this.target = crit.target; return true;}
		else if(this.isValueRestriction && crit.isCardinalityRestriction) 
			switch(crit.restrtype){
			case 'owl:cardinality': this.restriction.minCard = this.restriction.maxCard = crit.restriction.minCard; return true;
			case 'owl:minCardinality': this.restriction.minCard = crit.restriction.minCard; return true;
			case 'owl:maxCardinality': this.restriction.maxCard = crit.restriction.maxCard; return true;
		} return false;
	}
	var suffix = this.target || this.restrtype;
	this.name = this.property.name+'#'+suffix;
	return this;
}

/** access to Datatype properties */
jOWL.Ontology.DatatypeProperty = function(jnode){
	var addCache = false; if(jOWL.options.cacheProperties){
		var res = jnode.RDF_ID() || jnode.RDF_About(); 
		var c = jOWL.cache.get(res); if(c) return c; }
	this.inherit = jOWL.Ontology.internal; this.inherit(jnode);
	this.domain= $(this.jnode.get(0).selectSingleNode('rdfs:domain')).RDF_Resource();
	this.range = $(this.jnode.get(0).selectSingleNode('rdfs:range')).RDF_Resource();
	if(addCache) jOWL.cache.push(this);
}

/** access to Object properties */
jOWL.Ontology.ObjectProperty = function(jnode){
	var addCache = false; if(jOWL.options.cacheProperties){
		var res = jnode.RDF_ID() || jnode.RDF_About();
		var c = jOWL.cache.get(res); if(c) return c; addCache = true;}
	this.inherit = jOWL.Ontology.internal; this.inherit(jnode);
	this.domain= $(this.jnode.get(0).selectSingleNode('rdfs:domain')).RDF_Resource();
	this.range = $(this.jnode.get(0).selectSingleNode('rdfs:range')).RDF_Resource();
	if(addCache) jOWL.cache.push(this);
}

/** consider a better implementation ? */
jOWL.Ontology.Thing = function(xmlNode){
	this.inherit = jOWL.Ontology.internal; this.inherit(jOWL.Ontology.Thing.jnode); this.type = false;
}

/** access to an owl:Class */
jOWL.Ontology.Class = function(jnode){
	this.inherit = jOWL.Ontology.internal; this.inherit(jnode);	
	if(this.type !='owl:Class') throw ("node with nodename "+this.type+" is not an owl:Class");
	var that = this; 

	/** Get a jOWL.Ontology.Array of parents */
	this.parents = function(){
		var oParents = jOWL.data(this.name, "parents");
		if(oParents) return oParents;

		var temp = [];
		jOWL.XPath("rdfs:subClassOf", this.jnode).filter(function(){return $(this).RDF_Resource();})
			.each(function(){temp.push($(this).RDF_Resource()); });

		if(jOWL.options.reason) 
		{	
			var arr = jOWL.XPath("rdfs:subClassOf/owl:Restriction/owl:onProperty", this.jnode);
			var arr2 = jOWL.XPath("owl:intersectionOf/owl:Restriction/owl:onProperty", this.jnode);
			var arr3 = jOWL.XPath("owl:intersectionOf/owl:Class", this.jnode);
			var proprefs = arr.add($(arr2));
				proprefs.each(function(){ 
					var p = $(this).RDF_Resource();
					if(p) { var o = jOWL(p, {type: "property"});
						if(o.domain && o.domain != that.name) temp.push(o.domain);  }}); 
				$(arr3).each(function(){var p = $(this).RDF_About(); if(p) temp.push(p);  });
		} 

		var references = jOWL.getXML(temp.unique()); 
		oParents = new jOWL.Ontology.Array(references, true);
		if(!oParents.length){ oParents.push(jOWL('Thing')); }
		else if(oParents.length > 1) oParents.filter(function(){return this.name != ('Thing');}); //Remove Thing reference if other parents exist
		jOWL.data(this.name, "parents", oParents);			
		return oParents;
		};
	this.individuals = function(){
		var arr = new jOWL.Ontology.Array();
		new jOWL.SPARQL_DL("Type(?x, "+this.name+")").execute({async: false, 
			onComplete: function(r){ arr = r.jOWLArray("?x"); }  });
		return arr; 
		}
	this.children = function(){
		var oChildren = jOWL.data(this.name, "children");			
		if(oChildren) return oChildren;
		var c = new jOWL.Ontology.Array();
		if(jnode.children().filter(function(){return this.tagName == "owl:oneOf";}).size())return c; 
		//If OneOfList then only individuals may exist
		var URI = this.URI;
		jOWL.index("subClass").filter(function(){return $(this).RDF_Resource(URI);})
			.each(function(){ c.push(new jOWL.Ontology.Class( $(this.parentNode)) );});
		if(jOWL.options.reason){
			//an intersection mentions this as class reference
			jOWL.index("intersection").each(function(i, item){ 
				jOWL.XPath('owl:Class', this).each(function(){ 						
					if($(this).RDF_About(URI)) c.push(new jOWL.Ontology.Class( $(this.parentNode.parentNode)) );
				}); });
			//an ObjectProperty mentions this as domain
			jOWL.index("property").each(function(){
			if(this.domain == that.name) {
				var nodes = jOWL.XPath('//owl:onProperty[@rdf:resource="#'+this.name+'"]/parent::owl:Restriction/..');
				nodes.filter(function(){ return (this.nodeName == 'owl:intersectionOf' || this.nodeName == 'rdfs:subClassOf');
				}).each(function(){
					var cl = jOWL($(this.selectSingleNode('parent::owl:Class')));
					if(!c.contains(cl) && cl.name != that.name && cl.name != undefined) { c.push(cl);}
					});
				}
				});
		}
		jOWL.data(this.name, "children", c);
		return c;
		};
	/**Similar to children but get's children of children as well and pumps it into one array. 
	level: depth to fetch children, Default 5 */
	this.descendants = function(level){
		var level = level? level : 5;
		var oDescendants = jOWL.data(this.name, "descendants");
		if(oDescendants && oDescendants.level >= level) return oDescendants;
		oDescendants = new jOWL.Ontology.Array(); oDescendants.level = level; 
		descend(this, 1);
		function descend(concept, i){				
			if(i < level){ 
			var count = i+1; var ch = concept.children(); oDescendants.concat(ch);
			ch.each(function(item){ descend(item, count);});
			}
		}			
		jOWL.data(this.name, "descendants", oDescendants);
		return oDescendants;
	}
	/**Instead of just getting parents, constructs the entire hierarchy for a class
	Returns a jOWL.Ontology.Array containing top nodes (classes directly subsumed by 'owl:Thing')
	each node with exception of the leaves (original concept) has a variable invParents (jOWL.Ontology.Array) with child references
	if options.prune: cuts down additional redundant information.
	*/
	this.hierarchy = function(options){
		var settings = $.extend({prune: true}, options);
		var concept = this;
		var endNodes = new jOWL.Ontology.Array();
		var index  = new jOWL.Ontology.Array();
		var pruneIndex = new jOWL.Ontology.Array();
		traverse(concept);
		if(settings.prune) endNodes.each(function(item){prune(item);});

		function traverse(concept){ 
			var parents = concept.parents();
			if(parents.size() == 1 && parents.contains('Thing')) { endNodes.pushUnique(concept);}
			else parents.each(function(){ 		
					var item = index.pushUnique(this); 
					if(!item.invParents) item.invParents = new jOWL.Ontology.Array();
					item.invParents.pushUnique(concept);
					traverse(item);
					});					
		}

		function prune(concept){ //will cut down 1 level sibling-child relationships...
			var temparr = new jOWL.Ontology.Array();
			var tt = concept.invParents;
			if(concept.invParents) concept.invParents.filter(function(sibling, i){
					var rightChild = true;
					tt.each(function(child){
						if(child.name != sibling.name){//sibling	
							if(child.invParents && child.invParents.contains(sibling)) rightChild = false;
						}
					}); 
					if(rightChild) temparr.push(sibling);
					return rightChild;
			});		
			temparr.each(function(item){prune(item);});
			}

		return endNodes;

	};
	/**Get a jowl array of criteria - restriction: property + target object, will return true/false if present*/
	this.sourceof = function(restriction){
		var self = this, crit = jOWL.data(this.name, "sourceof");				
		if(!crit) populate();
		if(restriction){ //check if restriction is present
			var bool = false; 
			crit.each(function(item, i){
				if(item.target == restriction.target.name && item.property.name == restriction.property.name) bool = true;	});
			if(bool) return true;
			this.parents().each(function(p){
					if(!bool && p.sourceof) if(p.sourceof(restriction)) bool = true;
				});				
			return bool;
		}

		function populate(){
			crit = new jOWL.Ontology.Array();
			var arr = jOWL.XPath("rdfs:subClassOf/owl:Restriction", jnode)
				.add(jOWL.XPath("owl:intersectionOf/owl:Restriction", jnode));
			arr.each(function(index, entry){					
				var cr = new jOWL.Ontology.Criterium($(entry));  var excrit = false;
				crit.each(function(item, i){if(item.property.name == cr.property.name) excrit = item;});
				if(excrit) { if(!excrit.merge(cr)) crit.push(cr); } else crit.push(cr);
					}); 
			jOWL.data(self.name, "sourceof", crit);
			}
		return crit;

	};
	/** Get a jOWL array of criteria where the target is an individual, not a class or undefined*/
	this.valueRestrictions = function(includeAll){	
		var r = new jOWL.Ontology.Array();
		this.sourceof().each(function(item){ 				
			var targ = item.getTarget();
			if(targ && item.isValueRestriction) r.push(item);
			else if(includeAll) r.push(item);
			});

		this.parents().each(function(p){
			if(p.valueRestrictions) {
				p.valueRestrictions(includeAll).each(function(i){ if(!r.contains(i)) r.push(i);	}); //don't add duplicates
			}
			});
		return r;
	}
}
/** Utility object */
jOWL.Ontology.Array = function(arr, isXML){
	var self = this;
	var items = [];
	if(arr){
		if(isXML) $.each(arr, function(){items.push(jOWL($(this)));}); 
		else items = arr;
	}
	this.length = items.length;
	this.bind = function(listitem, processf){
		var tt = [];
		this.each(function(item, i){ 
			var syntax = listitem ? listitem.clone(true) : $('<span/>');
			var html  = item.bind(syntax).append(document.createTextNode(' '));
			if(processf) processf(html, item);
			tt.push(html.get(0));
		}); return tt;
	};
	this.each = function(func, reverse){
		if(reverse) for(var i=items.length - 1; i>=0;i--){ (function(){var item = items[i]; func.call(item, item, i);})();} 
		else for(var i=0;i<items.length;i++){ (function(){var item = items[i]; func.call(item, item, i);})();}
		return this;
	};
	this.concat = function(arr){items = items.concat(arr.getItems()); this.length = items.length; return this;}
	this.filter = function(f){
		this.each(function(item, i){var q = f.call(item, item, i); if(!q) items.splice(i, 1);}, true);
		this.length = items.length;
		return this;
		}
	this.get = function(object){
		if(typeof object == 'number') return items[object];
		var URI = object.URI || false;
		var name = typeof object == "string" ? object : object.name;
		var found  = false; 
		this.each(function(){
			if(URI){ if(this.URI == URI) found = this; }
			else if(this.name == name) found = this;
			}); 
		return found;
		}
	this.contains = function(object){ 	if(this.get(object)) return true; return false; }
	this.push = function(obj) {items.push(obj); self.length = items.length; return self;}
	this.pushUnique = function(obj){
		var entry = this.get(obj);
		if(!entry){ this.push(obj); entry = this.get(obj);}
		return entry;
	}
	this.size = function(){return this.length;}
	this.getItems = function(){return items;}	
}
	

jOWL.options = {reason: true, locale:false, defaultlocale: 'en', 
	dictionary : { create: true, addID : true },
	onParseError : function(msg){alert(msg);}, cacheProperties : true, niceClassLabels : true};
jOWL.cache = new jOWL.Ontology.Array();
jOWL.document = null;
jOWL.namespace = null;
jOWL.NS = {
    owl : "http://www.w3.org/2002/07/owl#",
	rdf : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs : "http://www.w3.org/2000/01/rdf-schema#",
	xsd : "http://www.w3.org/2001/XMLSchema#"
};
jOWL.NS.all = "xmlns:owl='"+jOWL.NS.owl+"' xmlns:rdf='"+jOWL.NS.rdf+"' xmlns:rdfs='"+jOWL.NS.rdfs+"' xmlns:xsd ='"+jOWL.NS.xsd+"'";
jOWL.indices = { //internal indices
			P : null, //jOWL array
			data : {},
			//jq arrays
			IDs : null, I : null, S : null,	T : null, D : null,
			reset : function(){var i = jOWL.indices; i.data = {}; i.P = null; i.T = null; i.S = null; i.IDs = null; i.I = null;i.D = null;}
		};	
jOWL.index = function(type, wipe){
			var i = jOWL.indices;
			switch (type)
			{
			/**jOWL indexes all elements with rdf:ID, and first order ontology elements specified with rdf:about */
			case "ID": 
				if(i.IDs == null || wipe){
					if(wipe) i.reset();
					var tempindex = {}; //var aboutarr = [];
					i.IDs = $('*', this.document).filter(function(){
						var res = $(this).RDF_ID(); 
							if(res) tempindex[jOWL.resolveURI(res)] = this;
						return res;
						}); 
					
					var t = jOWL.XPath("/rdf:RDF/*[@rdf:about]").filter(function(){ //checks for dupes....
						var res = $(this).RDF_About();
						if(res) res = jOWL.resolveURI(res); else return false;
						var match = (this.nodeName == "owl:Class" || this.nodeName == "owl:ObjectProperty" || this.nodeName == "owl:DatatypeProperty");
						if(match){
							if(tempindex[res]) { $(this).children().appendTo(tempindex[res]); return false;}
							tempindex[res] = this; return true; 
							} 
						return false;						
					});
					tempindex = {};
					i.IDs = i.IDs.add(t);
					}
				return i.IDs;
			case "Thing":
				if(i.T == null || wipe){
					i.T = $.grep(i.IDs, function(item, i){return jOWL($(item)).type == 'owl:Thing'; });
					}
				return i.T;
			case "intersection":
				if(i.I == null || wipe){
					i.I = jOWL.XPath("//owl:intersectionOf");
					}
				return i.I;
			case "subClass":
				if(i.S == null || wipe) {				
					i.S = jOWL.XPath("//rdfs:subClassOf").filter(function(){ return $(this).RDF_Resource();	}); 
					} 
				return i.S;
			case "property":
				if(i.P == null || wipe) 
				{ 
				i.P = new jOWL.Ontology.Array();
				jOWL.index("ID").each(function(){ if(this.nodeName == "owl:ObjectProperty" || this.nodeName == "owl:DatatypeProperty") i.P.push(jOWL($(this))); });
				}
				return i.P;
			case "dictionary":
				/**Dictionary: Array of Arrays, where secondary array is of form: [0] = term, [1] = rdfID, [2] = locale */
				if(i.D == null || wipe)
				{					
					i.D = [];
						function add(term, id, locale, nodename){ //decided not to check for duplicates, too expensive
							var mapping = [term, id, locale, nodename]; i.D.push(mapping);
						}
				
					jOWL.index("ID").each(function(){
						i.D = i.D.concat(jOWL($(this)).terms());
					});
				}
				return i.D;
			}
		};
/** Internal Function, storing data in associative array (JSON), 
jquery data function cannot be used as expando data does not work in IE for ActiveX XMLhttprequest*/
jOWL.data = function(rdfID, dtype, data){
			var d = jOWL.indices.data; 
			if(!d[rdfID]) d[rdfID] = {};
			if(!data) { return d[rdfID][dtype]; } //return data
			d[rdfID][dtype] = data; //store data
		};
/** 
Internal function.
rdfID: <String> or Array<String>
return: Array of DOM (xml) Nodes
*/
jOWL.getXML = function(rdfID){ 
			var node = []; var notfound = [];
			if(typeof rdfID == 'string') { 
				var q = fetchFromIndex(rdfID); if(q) node[0] = q;
				}
			else if(rdfID.length){ //assume an array of string rdfIDs
				$.each(rdfID, function(){  var el = fetchFromIndex(this); 
					if(el) node.push(el); else notfound.push(this);
					});
			} 
			
			if(jOWL.Server.url && notfound.length > 0){
				node = node.concat(jOWL.Server.get(notfound)); notfound = [];
			}

			function fetchFromIndex(rdfID){
				//compensate for owl:Thing reference
				for(var i=0;i<jOWL.index("ID").length;i++){ var el = $(jOWL.index("ID").get(i)); 
					if(el.RDF_ID(rdfID)) return el.get(0);	
					else if(el.RDF_About(rdfID)) return el.get(0);	

					}
				notfound.push(rdfID.toString()); return null;
			}
			node.notfound = notfound;
			return node;
		};
/**
* Initialize jOWL with an OWL-RDFS document.
* @param path relative path to xml document
* @param callback callback function to be called when loaded.
* @options : optional settings:
*    onParseError : function(msg){} function to ba called when parsing fails
*    reason : true/false, turns on additional reasoning at the expense of performance
*    locale: set preferred language (if available), examples en, fr...
*/
jOWL.load = function(path, callback, options){
			if($.browser.msie && location.toString().indexOf('file') == 0) { //stupid IE won't load local xml files
				var that = this;
				var xml = document.createElement("xml");
				xml.validateOnParse = false; //IE throws stupid DTD errors (for 'rdf:') on perfectly defined OWL files otherwise
				xml.src = path;
				xml.onreadystatechange = function()
					{ 
					if(xml.readyState == "interactive")  { var xmldoc = xml.XMLDocument; document.body.removeChild(xml);callback(that.parse(xmldoc, options)); } 
					}
				document.body.appendChild(xml);
				}
			else { var that = this; 
			$.get(path, function(xml){callback(that.parse(xml, options));});
			}
		};
/**
* initialize jOWL with some OWL-RDFS syntax
* @param doc Either an xmlString or an xmlDocument
* @param options optional, onParseError(msg) : function to execute when parse fails
* @returns false on failure, or the jOWL object
*/
jOWL.parse = function(doc, options){
			if(jOWL.document) jOWL.document == null;
			this.options = $.extend(jOWL.options, options);
			if(typeof doc == 'string') {
				if (document.implementation.createDocument) { doc = new DOMParser().parseFromString(doc, "text/xml"); } // Mozilla and Netscape browsers
				else if (window.ActiveXObject) {
					var xmldoc = new ActiveXObject("Microsoft.XMLDOM");xmldoc.async="false"; xmldoc.validateOnParse = false;
					xmldoc.loadXML(doc); doc = xmldoc; 
					} // MSIE
			}
			jOWL.document = doc;
			if($.browser.msie){ 	
				jOWL.document.setProperty("SelectionLanguage", "XPath");
				jOWL.document.setProperty("SelectionNamespaces", jOWL.NS.all);
				if (doc.parseError.errorCode != 0) { jOWL.options.onParseError(doc.parseError.reason); return false; } }
			else if(doc.documentElement.nodeName == 'parsererror'){jOWL.options.onParseError(doc.documentElement.firstChild.nodeValue); return false;}
			var root = $(doc.documentElement); 
			if(root.attr('xml:base')) { jOWL.namespace = root.attr('xml:base');} else jOWL.namespace = root.attr('xmlns');
			this.index('ID', true); 
			if(jOWL.options.dictionary.create) jOWL.index("dictionary");
			jOWL.Ontology.Thing.jnode = $(jOWL.create(jOWL.NS.owl, "owl.Class")).attr('rdf:about', jOWL.NS.owl+'Thing');
			return this;
			};

/**
* A String representation of the OWL-RDFS document
* @param xmlNode optional, node to generate a string from, when unspecified the entire document
*/
jOWL.toString = function(xmlNode){
		if(!xmlNode) return jOWL.toString(jOWL.document);
		if($.browser.msie) return xmlNode.xml;
		var serializer = new XMLSerializer(); return serializer.serializeToString(xmlNode);// Gecko-based browsers, Safari, Opera.
		};

jOWL.getURIArray = function(resource){
	if(resource.indexOf('http') == 0){
		var tr = resource.indexOf('#'); if(tr <= 0) tr = resource.lastIndexOf('/');
		if(tr > 0)
			{ 
				if(jOWL.namespace && resource.substring(0, tr+1) == jOWL.namespace) return [null, resource.substring(tr+1)];//if this namespace
				return [resource.substring(0, tr+1), resource.substring(tr+1)]; 
			}
	} else if(resource.charAt(0) == '#'){ return [null, resource.substring(1)]; } 
	return [null, resource];
};

/** returns false if belongs to this namespace, or an array with length two, arr[0] == url, arr[1] == id */
jOWL.isExternal = function(resource){
	var r = jOWL.resolveURI(resource);
	if(r.indexOf('http') == 0) 
				{	var tr = r.lastIndexOf('#'); if(tr <= 0) tr = r.lastIndexOf('/');
					if(tr > 0) return [resource.slice(0, tr+1), resource.substr(tr+1)]; 
				}
	return false;
};
/** if a URI belongs to the loaded namespace, then strips the prefix url of, else preserves URI*/
jOWL.resolveURI = function(resource){
	if(resource.indexOf('http') == 0){
		var tr = resource.indexOf('#'); if(tr <= 0) tr = resource.lastIndexOf('/');
		if(tr > 0)
			{ 
				if(jOWL.namespace && resource.substring(0, tr+1) == jOWL.namespace) return resource.substring(tr+1);//if this namespace
				return resource; 
			}
	} else if(resource.charAt(0) == '#'){ return resource.substring(1); } 
	return resource;
}
/** 
Main method to get an Ontology Object, access via jOWL(>String>, options);
resource: rdfID/rdfResource<String> or jQuery node.
*/
jOWL.getResource = function(resource, options){ //remark: expand to also take xml as input
			if(jOWL.document == null) throw "You must successfully load an ontology before you can find anything";
			var node;
			if(resource == undefined || resource === false) return null;
			var opts = $.extend({}, options);
			if(typeof resource == 'string'){
				resource = jOWL.resolveURI(resource);
				if(resource == 'Thing' || resource == jOWL.NS.owl+'Thing') return new jOWL.Ontology.Thing();
				if(opts.type == 'property' && jOWL.options.cacheProperties){var c = jOWL.cache.get(resource); if(c) return c;} //quicker access to properties								
				var match = jOWL.getXML(resource); if(match.length === 0) console.log(resource, "not found");
				node = $(jOWL.getXML(resource)[0]);
			} else node=resource;
			if(opts.type == "class") {if(node.get(0).nodeName != "owl:Class") throw "resource is not an owl:Class";}
			switch(node.get(0).nodeName){
				case "owl:Class" : return new jOWL.Ontology.Class(node);
				case "owl:ObjectProperty" : return new jOWL.Ontology.ObjectProperty(node);
				case "owl:DatatypeProperty" : return new jOWL.Ontology.DatatypeProperty(node);
				default : return new jOWL.Ontology.Individual(node);
			}
		};
/** Create new ontology elements */
jOWL.create = function(namespace, qualifiedName){
        if($.browser.msie){ return jOWL.document.createElement(qualifiedName); }
        return jOWL.document.createElementNS(namespace, qualifiedName);
    };

jOWL.create.header = function(href){
	var owl = [];
	var base = href || window.location.href+"#";
	owl.push('<?xml version="1.0"?>');
	owl.push('<rdf:RDF xml:base="'+base+'" xmlns="'+base+'" '+jOWL.NS.all+'>');
	owl.push('   <owl:Ontology rdf:about="'+base+'"/>');
	return owl.join('\n');
}
/** Extracts RDFa syntax from current page and feeds it to jOWL*/
jOWL.parseRDFa = function(fn, options){
      var entries = options.node ? $("[typeof]", htmlnode) : $("[typeof]"); 
	  var owl = [];       
	  owl.push(jOWL.create.header());      
      entries.each(function(){
            var node = $(this);
            var type = node.attr("typeof"); 
			var id = node.attr("about"); 
			/** parents */
			var p = [];
            $("[property=rdfs:subClassOf]", node).each(function(){p.push($(this).attr('content')); });
            if(node.attr("property") == "rdfs:subClassOf") p.push(node.attr('content'));

            var syntax = [];
            syntax.push('   <owl:Class rdf:about="'+id+'">');
            $("[property=rdfs:comment]", node).each(function(){syntax.push('      <rdfs:comment><![CDATA['+$(this).html()+']]></rdfs:comment>');  });
            $("[property=rdfs:label]", node).each(function(){ 
				var term = $(this).attr('content') || $(this).text();
				syntax.push('      <rdfs:label>'+term+'</rdfs:label>');});
            for(var i=0;i<p.length;i++){ syntax.push('      <rdfs:subClassOf><owl:Class rdf:about="'+p[i]+'"/></rdfs:subClassOf>');    }
            syntax.push('   </owl:Class>');
            owl.push(syntax.join('\n'));
        });
        owl.push('</rdf:RDF>');
        jOWL.parse(owl.join('\n'), options); 
		fn();
 }
/** 
Match part or whole of the rdfResource<String>
Used for term searches
options:
	filter: filter on a specific type, possible values: Class, Thing, ObjectProperty, DatatypeProperty
	exclude: exclude specific types, not fully implemented
*/
jOWL.query = function(match, options){
			options = $.extend({exclude : false}, options);
			if(options.filter == 'Class') options.filter = "owl:Class";
			var that = this;
			//filter : [], exclude : false
			var items = new jOWL.Ontology.Array();
			var jsonobj = {};
			var test = jOWL.index("dictionary");
			for(var y = 0;y<test.length;y++){
				var item = test[y];
				var bool = options.exclude;

				function store(item){
					var include = false;
					if(options.filter){ 
						if(typeof options.filter == 'string') include = (options.filter == item[3]); 
						else for(var i = 0;i<options.filter.length;i++){ if(options.filter[i] == item[3]) include = true; }
						}
					else if(options.exclude){
						include = true;
						if(typeof options.exclude == 'string' && options.exclude == item[3]) include = false;
						else for(var i = 0;i<options.exclude.length;i++){ if(options.exclude[i] == item[3]) include = false; }
					}
					else include = true;
					if(!include) return;
					if(!jsonobj[item[1]]) jsonobj[item[1]] = [];
					jsonobj[item[1]].push( { term : item[0], locale: item[2], type: item[3] });
				}

				if(item[0].searchMatch(match) > -1) {
					if(options.locale) {
						if(options.locale == item[2]) store(item);
					} else store(item);
				}
			} 
			return jsonobj;
		};
/**
allows asynchronous looping over arrays (prevent bowser freezing). 
arr the array to loop asynchonrously over.
options.modify(item) things to do with each item of the array
options.onUpdate(array of results)
options.onComplete(array of results) function triggered when looping has completed
*/
jOWL.throttle = function(arr, options){
	var options = $.extend({
		modify : function(result){},
		onUpdate : function(arr){},
		onComplete : function(arr){},
		async : true
		}, options);
	var self = this; this.pos = 0, this.split = 5;
	this.start = function(pos, split){ if(pos) self.pos = pos; if(split) self.split = split; loop(); }
	this.stop = function(){self.pos = arr.length;}

	function loop(resultarr){ 
		if(!resultarr) resultarr = [];
		var stop = false; var pos = resultarr.length;
		for(var i = self.pos;i<self.pos+self.split;i++){
			if(stop) break;
			if(i < arr.length){
				var result = options.modify.call(arr[i], arr[i]); //dostuff with arr[i]
				if(result) { resultarr.push(result); };
			} 
			else stop = true;
		}
		options.onUpdate(resultarr.slice(pos));
		self.pos += self.split;
		if(!stop) { if(options.async) setTimeout(function(){loop(resultarr);}, 5); else loop(resultarr);}
		else{ options.onComplete(resultarr); }
	}
	return self;
};
/** Creates a new resultobj for the SPARQL-DL functionality */
jOWL.SPARQL_DL_Result = function(){
	var obj = {assert: undefined, partial : [], param : {}};
	obj.sort = function(param){
		if(!param) throw "parameter must be defined for sort function";
		function sortResults(a, b){
			var o = a[param].name || a[param];
			var p = b[param].name || b[param];
			return (o < p) ? -1 : 1;
		}
		this.results.sort(sortResults);		
	}
	obj.jOWLArray = function(param){
		if(!param) throw "parameter must be defined for jOWLArray function";
		var arr = new jOWL.Ontology.Array();
		for(var i=0;i<this.results.length;i++){
		arr.push(this.results[i][param]);
		}
		return arr;
	}
	obj.extend = function(results){
		if(!results.length) return this;
		var v = [];	for(x in results[0]){v.push(x);} var variable = v[0];
		if(this.param[variable] != undefined){
				var matcharr = this.partial[this.param[variable]];
				for(var i=matcharr.length-1;i>=0;i--){
					var found = false;
					for(var j=0;j<results.length;j++){
						if(matcharr[i][variable].URI == results[j][variable].URI) found = true;
					}
					if(!found) matcharr.splice(i, 1);
				}
				this.partial[this.param[variable]] = matcharr;
			}
			else {
				this.partial.push(results);
				this.param[variable] = this.partial.length - 1;
			}		
			return this;		
		}
	
	return obj;
}
/** Creates a new query for the SPARQL-DL functionality */
jOWL.SPARQL_DL_Query = function(syntax, parameters){

		var query = parse(syntax);
		fill(query, parameters);
		query = query.sort(sort);
		

	//replace prefilled parameters or subsitute jOWl objects
		function fill(query, parameters){
			for(var i = 0;i<query.length;i++){
				for(var j =0; j<query[i][1].length; j++){
					query[i][1][j] = parameters[query[i][1][j]] || query[i][1][j];
					if(typeof query[i][1][j] == "string" && query[i][1][j].charAt(0) != '?')
					{
						query[i][1][j] = jOWL(query[i][1][j]);
					}
				}				
			}
		}

		function sort(a, b){ 
			var avar = 0;	for(var i = 0;i<a[1].length;i++){ if(typeof a[1][i] == 'string') avar++;}
			var bvar = 0;	for(var i = 0;i<a[1].length;i++){ if(typeof b[1][i] == 'string') bvar++;}
			if(avar != bvar) return avar - bvar;
			if(a[0] == 'Type' && b[0] != 'Type') return -1;
			if(a[0] != 'Type' && b[0] == 'Type') return 1;
			return 0;		
		}
		function parse(syntax){
             var r2 = /(\w+)[(]([^)]+)[)]/
             var entries = syntax.match(/(\w+[(][^)]+[)])/g);
			 if(!entries) return this.error =  "invalid abstract sparql-dl syntax";
			 entries = entries.unique();
             for(var i = 0;i<entries.length;i++){
                var y = entries[i].match(r2); if(y.length != 3) return this.error = "invalid abstract sparql-dl syntax";
                entries[i] = [y[1], y[2].replace(/ /g, "").split(',')];
             }
             return entries;
			 //sort query for ...
        }
		//takes into account intersectionOf information when querying for type, more advanced reasoning
		query.expand = function(){
			var newquery = [], dupecheck = []; var expansion = [], count = 0;
			for(var i = 0;i<query.length;i++){ 
				if(query[i][0] == 'Type'){
					var remove = false;
					var cl = query[i][1][1];
					if(typeof cl != 'string'){
						var inters = jOWL.XPath("owl:intersectionOf", cl.jnode);
						if(inters.length){	
							remove = true;
							$(inters).children().each(function(){
								if(this.nodeName == 'owl:Class'){ 
									var syntax = "Type("+query[i][1][0]+", "+$(this).RDF_About()+")";
									if($.inArray(syntax, expansion) == -1) expansion.push(syntax);
									}
								else if(this.nodeName == 'owl:Restriction'){
									var restr = new jOWL.Ontology.Criterium($(this));
									if(restr.target){ 
										var syntax = "PropertyValue("+query[i][1][0]+", "+restr.property.name+", "+restr.target+")";
										if($.inArray(syntax, expansion) == -1) expansion.push(syntax);}
								}
							});							
							}
						}
					if(remove){
							var t = count;
							for(var k = 0+t;k<expansion.length;k++){
								count++;
								var n = parse(expansion[k]); fill(n, parameters);
								newquery.push(n[0]);
							}		
						}
					else newquery.push(query[i]);
				}
				else newquery.push(query[i]);
			}
			return newquery;
		}

		return query;

}
/** 
Support for abstract SPARQl-DL syntax 
options.onComplete: function triggered when all individuals have been looped over
options.onUpdate: partial results
options.childDepth: depth to fetch children, default 4, impacts performance
options.chewsize: arrays will be processed in smaller chunks (asynchronous), with size indicated by chewsize, default 10
options.async: default true, query asynchronously
options.expandQuery: default true
parameters: prefill some sparql-dl parameters with jOWL objects
execute: start query, results are passed through options.onComplete
*/
jOWL.SPARQL_DL = function(syntax, parameters, options){
		var self = this;
		this.parameters = $.extend({}, parameters);
        this.query = new jOWL.SPARQL_DL_Query(syntax, this.parameters); //[];
		this.result = new jOWL.SPARQL_DL_Result(); 		
		this.options = $.extend({expandQuery: true, onComplete: function(results){}, onUpdate: function(){}}, options);

		function error(msg){ self.result.error = msg; return self.options.onComplete(self.result);}

		        	
		/** 
		if(options.async == false) then this method returns the result of options.onComplete, 
		no matter what, result is always passed in options.onComplete
		*/
        this.execute = function(options){
			this.options = $.extend(this.options, options);

			if(self.options.expandQuery) this.query = this.query.expand();
			var i = 0; var resultobj = this.result;
			var loopoptions = $.extend({}, this.options);
			loopoptions.onComplete =  function(results){	i++; resultobj = results; loop(i);}

            if(!this.query.length) {
				resultobj.error = this.error || "no query found or query did not parse properly"; 
				return self.options.onComplete(resultobj);
				}			

			function loop(i){
				if(i < self.query.length) { process(self.query[i], resultobj, loopoptions ); }
				else { //finalize
					var res = [];
					for(var i = 0;i<resultobj.partial.length;i++){
						if(resultobj.partial[i]) {
							res = res.concat(resultobj.partial[i]);							
						}
						
					}
					resultobj.results = res;
					return self.options.onComplete(resultobj);
				}
			}
			loop(i);

        }

	
		function map(variable, result, obj){var r = obj || {}; r[variable] = result; return r;} //utility method, avoid repetition of code
		

		this.fn = {
			"Type" : function(resultobj, options){
				
				if(typeof this[0] == 'string' && typeof this[1] == 'string'){//both undefined, work with previous queries, implementation not yet optimal
					var ivar = this[0], cvar = this[1]; 
					if(resultobj.param[cvar] != undefined){
						var classlist = new jOWL.Ontology.Array();
						var cl = resultobj.partial[resultobj.param[cvar]];
						for(var i=0;i<cl.length;i++){ classlist.push(cl[i][cvar]);}
						resultobj.partial[resultobj.param[cvar]] = false;
						var settings = $.extend({}, options);
						settings.modify = function(result){
							var ind = jOWL($(this));
							var concept = classlist.get(ind.Class); 
							if(concept) { ind.owlClass(concept); return map(cvar, concept, map(ivar,ind));	}
						}
						settings.onComplete = function(results){options.onComplete(resultobj.extend(results));}					
						//asynchronously loop over Individuals
						new jOWL.throttle(jOWL.index("Thing"), settings).start(0, options.chewsize);
						return;					
					}
					
					return error("not implemented yet");
				}
				
				if(typeof this[1] == 'string'){//get class
					if(this[0].type != 'owl:Thing') return error("First parameter in SPARQL-DL Query for Type must be an owl:Thing");
					return options.onComplete(resultobj.extend([map(this[1], this[0].owlClass())]));
				}
				
				if(typeof this[0] == 'string'){//get instances
					var variable = this[0];
					if(this[1].type !='owl:Class') return error("Second parameter in SPARQL-DL Query for Type must be an owl:Class");
					
					//if OneOf List then individuals are defined already
					var oneOf = this[1].jnode.children().filter(function(){return this.tagName == "owl:oneOf";});
					if(oneOf.size()) {
						var thinglist = [];
						oneOf.children().each(function(){ thinglist.push(map(variable, jOWL($(this).RDF_About())));    });
						return options.onComplete(resultobj.extend(thinglist));
						}
					//regular looping
					var classlist = new jOWL.Ontology.Array(); classlist.push(this[1]);
					this[1].descendants(options.childDepth).each(function(){classlist.push(this);});

					var settings = $.extend({}, options);
					settings.modify = function(result){
						var ind = jOWL($(this));
						var concept = classlist.get(ind.Class); 
						if(concept) { ind.owlClass(concept); return map(variable,ind);}
					}
					settings.onComplete = function(results){options.onComplete(resultobj.extend(results));}
				
					//asynchronously loop over Individuals
					new jOWL.throttle(jOWL.index("Thing"), settings).start(0, options.chewsize);
				}
				else {//both defined //assert
					if(this[0].type != 'owl:Thing') return error("First parameter in SPARQL-DL Query for Type must be an owl:Thing");
					if(this[1].type !='owl:Class') return error("Second parameter in SPARQL-DL Query for Type must be an owl:Class");
					var cl = this[0].owlClass();
					if(cl.URI == this[1].URI && resultobj.assert !== false) resultobj.assert = true;
					else {
						function traverse(node, match){
							var a = node.parents(); 
							var found = false;
							if(a.contains(match)) found = true;
							else a.each(function(){ if(!found && traverse(this, match)) found = true; });
							return found;
						}
						resultobj.assert = traverse(cl, this[1]);
					}
					options.onComplete(resultobj);
					//if(parents.size() == 1 && parents.contains('Thing'))
				}
			
			},
			"Class" : function(resultobj, options){
				var variable = this[0];
				var settings = $.extend({}, options);
				settings.modify = function(result){
						if(result.nodeName != "owl:Class") return; 
						return map(variable, jOWL($(result)));
					}
				settings.onComplete = function(results){options.onComplete(resultobj.extend(results));}
				new jOWL.throttle(jOWL.index("ID"), settings).start(0, options.chewsize);
			},
			"ObjectProperty" : function(resultobj, options){
				var variable = this[0];
				var settings = $.extend({}, options);
				settings.modify = function(result){
						if(result.type != "owl:ObjectProperty") return; 
						return map(variable, result);
					}
				settings.onComplete = function(results){options.onComplete(resultobj.extend(results));}
				new jOWL.throttle(jOWL.index("property").getItems(), settings).start(0, options.chewsize);
			},
			"DatatypeProperty" : function(resultobj, options){
				var variable = this[0];
				var settings = $.extend({}, options);
				settings.modify = function(result){
						if(result.type != "owl:DatatypeProperty") return; 
						return map(variable, result);
					}
				settings.onComplete = function(results){options.onComplete(resultobj.extend(results));}
				new jOWL.throttle(jOWL.index("property").getItems(), settings).start(0, options.chewsize);
			},
			"PropertyValue" : function(resultobj, options){				
				var source = this[0], S = (typeof source != 'string'), pS = (resultobj.param[source] != undefined);
				var property = this[1], P = (typeof property != 'string'), pP = (resultobj.param[property] != undefined);
				var target = this[2], T = (typeof target != 'string'), pT = (resultobj.param[target] != undefined);

				if(P){ //property defined
					if(S){ //query for target, property and source defined
					
					}
					else if(T){ //query for source, property and target defined
						
						if(pS){ //fill in
							var err = false;
							resultobj.partial[resultobj.param[source]] = $.map(resultobj.partial[resultobj.param[source]], function(n){
								if(n[source].type !='owl:Thing') err = "Source in SPARQL-DL Query for PropertyValue must be an owl:Thing";
								if(n[source].localRestrictions(property, target) 
									|| n[source].owlClass().sourceof({property: property, target: target})) 
									return n;
							});
							return err ? error(err) : options.onComplete(resultobj);
						}
					
					}
					else {
					
					}				
				}
				if(S){
					var sourceof = source.valueRestrictions(true); var arr = [];
					if(P){
						if(T){
							if(resultobj.assert !== false) {
								resultobj.assert = false;
								sourceof.each(function(){								
									if(this.property.URI == property.URI)
										if(this.target == target.name || this.target == target.URI)
											resultobj.assert = true;
								});
							}
							return options.onComplete(resultobj);
						}
						else sourceof.each(function(){
							if(this.property.URI == property.URI) arr.push(map(target, this.getTarget()));
						});
						
					}
					else if(T){
						sourceof.each(function(){
							if(this.target == target.name || this.target == target.URI) arr.push(map(property, this.property));
						});
					}
					else {						
						sourceof.each(function(){
							var n = map(property, this.property); map(target, this.getTarget(), n);
							arr.push(n);
						});
					}
					resultobj.partial.push(arr);
					return options.onComplete(resultobj);
				}
				return error('Unsupported PropertyValue query');			
			}
		}

				
		/** results are passed in the options.onComplete function */
		function process(entry, resultobj, options){
			var options = $.extend({chewsize: 10, async : true, onUpdate : function(result){}, onComplete : function(results){}}, options);
			var sizes = {"Type": 2, "DirectType": 2, "PropertyValue" : 3, "Class": 1, "ObjectProperty": 1, "DatatypeProperty": 1};				

			if(!sizes[entry[0]]) return error("'"+entry[0]+"' queries are not implemented");
			if(sizes[entry[0]] != entry[1].length) return error("invalid SPARQL-DL "+entry[0]+" specifications, "+sizes[entry[0]]+" parameters required");
			if(entry[0] == "DirectType") {
				options.childDepth = 1;
				return self.fn['Type'].call(entry[1], resultobj, options);
				}
			return self.fn[entry[0]].call(entry[1], resultobj, options);
		}

        return this;
    }

/** 
Without arguments this function will parse the current url and see if any parameters are defined, returns a JOWL object
With argument it will return a string that identifies the potential permalink fr the given entry
*/
jOWL.permalink = function(jowl_entry){
	var href = window.location.href.split("?", 2); 
	if (!arguments.length){
		 if(!href[1]) return false;
		 var qstr = href[1].split('&');
		 for ( var param = 0; param < qstr.length; param++ ){
			var arr = qstr[param].split("=");
			if(arr.length == 2){
				if(arr[0] == "owlClass") return jOWL(unescape(arr[1]));
			}
		 }
	}
	else {
		if(!jowl_entry.URI) return false;
		if(window.location.search) href = href[0];
		if(jowl_entry.type == "owl:Class") return href+'?owlClass='+escape(jowl_entry.URI);
	}
	return false;
}


jOWL.Server = {
	url : false,
	ontology : null,
	/**returns array of DOM nodes sent by server */
	get : function(list){
		var doc;
		var request = {};
		var list = list.unique();
		request["select"] = '{ontology:"'+jOWL.Server.ontology+'", resources : ["'+list.join('", "')+'"]}';
		$.ajax({ type: "POST",  url: jOWL.Server.url, data: request,  async: false, success : function(msg){doc = msg;}}).responseText;	
		if(doc.documentElement.nodeName == "error"){console.log("Server returned error:", jOWL.toString(doc.documentElement)); return;}
                var nodeArray = new Array();
		var filter = $('*', doc).each(function(){
                     var node = $(this);
                     if(node.RDF_ID()) { 
                         node.remove().appendTo(jOWL.document.documentElement); 
                         nodeArray.push(node.get(0));}                 
                });
                jOWL.index("ID") = jOWL.index("ID").add(nodeArray);
		return nodeArray;
	},
	load : function(ontology, callback, options){
		if(!jOWL.Server.url) return null;
		jOWL.Server.ontology = ontology;
		var path = jOWL.Server.url+"?select="+encodeURIComponent('{ontology: "'+ontology+'"} ');
		jOWL.load(path, callback);
	},
	ajax : function(data, callback){
		
	}
}

})(jQuery);

String.prototype.searchMatch = function(matchstring){
		if(this.search(new RegExp(matchstring, "i")) > -1) return 1; //exact match
		var c = 0; var arr = matchstring.match(new RegExp("\\w+", "ig"));
		for(var i = 0;i<arr.length;i++){ if(this.search(arr[i]) > -1) c++; }
		if(c == arr.length) return 0; //word shift
		return -1; //nomatch
	}

String.prototype.beautify = function(){
	var e1 = new RegExp("([a-z0-9])([A-Z])", "g");
	var e2 = new RegExp("([A-Z])([A-Z0-9])([a-z])", "g");
	var e3 = new RegExp("_", "g");
	return this.replace(e1, "$1 $2").replace(e2, "$1 $2$3").replace(e3, " ");
}
/** jQueries $.unique function doesn't seem to work with strings*/
Array.prototype.unique = function()
   {
    //get sorted array as input and returns the same array without duplicates.
    var result=new Array(); var lastValue="";
    for (var i=0; i<this.length; i++)
    {		var curValue=this[i];  
			if (curValue != lastValue)  { result[result.length] = curValue;  }
			lastValue=curValue;
    }
    return result;
   }