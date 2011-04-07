// Knockout JavaScript library v1.2.0rc
// (c) Steven Sanderson - http://knockoutjs.com/
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

(function(window,undefined){ 
function b(c){throw c;}var n=void 0,o=null,p=window.ko={};p.b=function(c,e){for(var a=c.split("."),d=window,f=0;f<a.length-1;f++)d=d[a[f]];d[a[a.length-1]]=e};p.i=function(c,e,a){c[e]=a};
p.a=new function(){function c(a,d){if(a.tagName!="INPUT"||!a.type)return!1;if(d.toLowerCase()!="click")return!1;var f=a.type.toLowerCase();return f=="checkbox"||f=="radio"}var e=/^(\s|\u00A0)+|(\s|\u00A0)+$/g;return{ba:["authenticity_token",/^__RequestVerificationToken(_.*)?$/],h:function(a,d){for(var f=0,h=a.length;f<h;f++)d(a[f])},g:function(a,d){if(typeof a.indexOf=="function")return a.indexOf(d);for(var f=0,h=a.length;f<h;f++)if(a[f]==d)return f;return-1},xa:function(a,d,f){for(var h=0,c=a.length;h<
c;h++)if(d.call(f,a[h]))return a[h];return o},M:function(a,d){var f=p.a.g(a,d);f>=0&&a.splice(f,1)},$:function(a){a=a||[];for(var d=[],f=0,h=a.length;f<h;f++)p.a.g(d,a[f])<0&&d.push(a[f]);return d},K:function(a,d){a=a||[];for(var f=[],h=0,c=a.length;h<c;h++)f.push(d(a[h]));return f},J:function(a,d){a=a||[];for(var f=[],h=0,c=a.length;h<c;h++)d(a[h])&&f.push(a[h]);return f},L:function(a,d){for(var f=0,h=d.length;f<h;f++)a.push(d[f])},aa:function(a){for(;a.firstChild;)p.removeNode(a.firstChild)},Wa:function(a,
d){p.a.aa(a);d&&p.a.h(d,function(d){a.appendChild(d)})},ka:function(a,d){var f=a.nodeType?[a]:a;if(f.length>0){for(var h=f[0],c=h.parentNode,e=0,j=d.length;e<j;e++)c.insertBefore(d[e],h);e=0;for(j=f.length;e<j;e++)p.removeNode(f[e])}},ma:function(a,d){navigator.userAgent.indexOf("MSIE 6")>=0?a.setAttribute("selected",d):a.selected=d},ca:function(a,d){if(!a||a.nodeType!=1)return[];var f=[];a.getAttribute(d)!==o&&f.push(a);for(var h=a.getElementsByTagName("*"),c=0,e=h.length;c<e;c++)h[c].getAttribute(d)!==
o&&f.push(h[c]);return f},m:function(a){return(a||"").replace(e,"")},Za:function(a,d){for(var f=[],c=(a||"").split(d),e=0,i=c.length;e<i;e++){var j=p.a.m(c[e]);j!==""&&f.push(j)}return f},Xa:function(a,d){a=a||"";if(d.length>a.length)return!1;return a.substring(0,d.length)===d},Ha:function(a,d){if(d===n)return(new Function("return "+a))();with(d)return eval("("+a+")")},Fa:function(a,d){if(d.compareDocumentPosition)return(d.compareDocumentPosition(a)&16)==16;for(;a!=o;){if(a==d)return!0;a=a.parentNode}return!1},
O:function(a){return p.a.Fa(a,document)},t:function(a,d,f){if(typeof jQuery!="undefined"){if(c(a,d)){var h=f;f=function(a,d){var f=this.checked;if(d)this.checked=d.Aa!==!0;h.call(this,a);this.checked=f}}jQuery(a).bind(d,f)}else typeof a.addEventListener=="function"?a.addEventListener(d,f,!1):typeof a.attachEvent!="undefined"?a.attachEvent("on"+d,function(d){f.call(a,d)}):b(Error("Browser doesn't support addEventListener or attachEvent"))},qa:function(a,d){(!a||!a.nodeType)&&b(Error("element must be a DOM node when calling triggerEvent"));
if(typeof jQuery!="undefined"){var f=[];c(a,d)&&f.push({Aa:a.checked});jQuery(a).trigger(d,f)}else if(typeof document.createEvent=="function")typeof a.dispatchEvent=="function"?(f=document.createEvent(d=="click"?"MouseEvents":"HTMLEvents"),f.initEvent(d,!0,!0,window,0,0,0,0,0,!1,!1,!1,!1,0,a),a.dispatchEvent(f)):b(Error("The supplied element doesn't support dispatchEvent"));else if(typeof a.fireEvent!="undefined"){if(d=="click"&&a.tagName=="INPUT"&&(a.type.toLowerCase()=="checkbox"||a.type.toLowerCase()==
"radio"))a.checked=a.checked!==!0;a.fireEvent("on"+d)}else b(Error("Browser doesn't support triggering events"))},d:function(a){return p.B(a)?a():a},Ea:function(a,d){return p.a.g((a.className||"").split(/\s+/),d)>=0},pa:function(a,d,f){var c=p.a.Ea(a,d);if(f&&!c)a.className=(a.className||"")+" "+d;else if(c&&!f){f=(a.className||"").split(/\s+/);c="";for(var e=0;e<f.length;e++)f[e]!=d&&(c+=f[e]+" ");a.className=p.a.m(c)}},Ta:function(a,d){a=p.a.d(a);d=p.a.d(d);for(var f=[],c=a;c<=d;c++)f.push(c);return f},
ga:function(a){for(var d=[],f=a.length-1;f>=0;f--)d.push(a[f]);return d},Q:/MSIE 6/i.test(navigator.userAgent),Ma:/MSIE 7/i.test(navigator.userAgent),da:function(a,d){for(var f=p.a.ga(a.getElementsByTagName("INPUT")).concat(p.a.ga(a.getElementsByTagName("TEXTAREA"))),c=typeof d=="string"?function(a){return a.name===d}:function(a){return d.test(a.name)},e=[],i=f.length-1;i>=0;i--)c(f[i])&&e.push(f[i]);return e},D:function(a){if(typeof a=="string"&&(a=p.a.m(a))){if(window.JSON&&window.JSON.parse)return window.JSON.parse(a);
return(new Function("return "+a))()}return o},V:function(a){(typeof JSON=="undefined"||typeof JSON.stringify=="undefined")&&b(Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js"));return JSON.stringify(p.a.d(a))},Sa:function(a,d,f){f=f||{};var c=f.params||{},e=f.includeFields||this.ba,i=a;if(typeof a=="object"&&a.tagName=="FORM"){i=a.action;for(var j=
e.length-1;j>=0;j--)for(var k=p.a.da(a,e[j]),l=k.length-1;l>=0;l--)c[k[l].name]=k[l].value}d=p.a.d(d);var q=document.createElement("FORM");q.style.display="none";q.action=i;q.method="post";for(var m in d)a=document.createElement("INPUT"),a.name=m,a.value=p.a.V(p.a.d(d[m])),q.appendChild(a);for(m in c)a=document.createElement("INPUT"),a.name=m,a.value=c[m],q.appendChild(a);document.body.appendChild(q);f.submitter?f.submitter(q):q.submit();setTimeout(function(){q.parentNode.removeChild(q)},0)}}};
p.b("ko.utils",p.a);p.b("ko.utils.arrayForEach",p.a.h);p.b("ko.utils.arrayFirst",p.a.xa);p.b("ko.utils.arrayFilter",p.a.J);p.b("ko.utils.arrayGetDistinctValues",p.a.$);p.b("ko.utils.arrayIndexOf",p.a.g);p.b("ko.utils.arrayMap",p.a.K);p.b("ko.utils.arrayPushAll",p.a.L);p.b("ko.utils.arrayRemoveItem",p.a.M);p.b("ko.utils.fieldsIncludedWithJsonPost",p.a.ba);p.b("ko.utils.getElementsHavingAttribute",p.a.ca);p.b("ko.utils.getFormFields",p.a.da);p.b("ko.utils.postJson",p.a.Sa);
p.b("ko.utils.parseJson",p.a.D);p.b("ko.utils.registerEventHandler",p.a.t);p.b("ko.utils.stringifyJson",p.a.V);p.b("ko.utils.range",p.a.Ta);p.b("ko.utils.toggleDomNodeCssClass",p.a.pa);p.b("ko.utils.triggerEvent",p.a.qa);p.b("ko.utils.unwrapObservable",p.a.d);Function.prototype.bind||(Function.prototype.bind=function(c){var e=this,a=Array.prototype.slice.call(arguments);c=a.shift();return function(){return e.apply(c,a.concat(Array.prototype.slice.call(arguments)))}});
p.a.e=new function(){var c=0,e="__ko__"+(new Date).getTime(),a={};return{get:function(a,f){var c=p.a.e.getAll(a,!1);return c===n?n:c[f]},set:function(a,f,c){c===n&&p.a.e.getAll(a,!1)===n||(p.a.e.getAll(a,!0)[f]=c)},getAll:function(d,f){var h=d[e];if(!h){if(!f)return;h=d[e]="ko"+c++;a[h]={}}return a[h]},clear:function(d){var f=d[e];f&&(delete a[f],d[e]=o)}}};
p.a.p=new function(){function c(d,f){var c=p.a.e.get(d,a);c===n&&f&&(c=[],p.a.e.set(d,a,c));return c}function e(a){var f=c(a,!1);if(f){f=f.slice(0);for(var e=0;e<f.length;e++)f[e](a)}p.a.e.clear(a);typeof jQuery=="function"&&typeof jQuery.cleanData=="function"&&jQuery.cleanData([a])}var a="__ko_domNodeDisposal__"+(new Date).getTime();return{Z:function(a,f){typeof f!="function"&&b(Error("Callback must be a function"));c(a,!0).push(f)},ja:function(d,f){var e=c(d,!1);e&&(p.a.M(e,f),e.length==0&&p.a.e.set(d,
a,n))},u:function(a){if(!(a.nodeType!=1&&a.nodeType!=9)){e(a);a=a.getElementsByTagName("*");for(var f=0,c=a.length;f<c;f++)e(a[f])}},removeNode:function(a){p.u(a);a.parentNode&&a.parentNode.removeChild(a)}}};p.u=p.a.p.u;p.removeNode=p.a.p.removeNode;p.b("ko.cleanNode",p.u);p.b("ko.removeNode",p.removeNode);p.b("ko.utils.domNodeDisposal",p.a.p);p.b("ko.utils.domNodeDisposal.addDisposeCallback",p.a.p.Z);p.b("ko.utils.domNodeDisposal.removeDisposeCallback",p.a.p.ja);
p.k=function(){function c(){return((1+Math.random())*4294967296|0).toString(16).substring(1)}function e(a,f){if(a)if(a.nodeType==8){var c=p.k.ha(a.nodeValue);c!=o&&f.push({Da:a,Pa:c})}else if(a.nodeType==1){c=0;for(var g=a.childNodes,i=g.length;c<i;c++)e(g[c],f)}}var a={};return{S:function(d){typeof d!="function"&&b(Error("You can only pass a function to ko.memoization.memoize()"));var f=c()+c();a[f]=d;return"<\!--[ko_memo:"+f+"]--\>"},ra:function(d,f){var c=a[d];c===n&&b(Error("Couldn't find any memo with ID "+
d+". Perhaps it's already been unmemoized."));try{return c.apply(o,f||[]),!0}finally{delete a[d]}},sa:function(a,f){var c=[];e(a,c);for(var g=0,i=c.length;g<i;g++){var j=c[g].Da,k=[j];f&&p.a.L(k,f);p.k.ra(c[g].Pa,k);j.nodeValue="";j.parentNode&&j.parentNode.removeChild(j)}},ha:function(a){return(a=a.match(/^\[ko_memo\:(.*?)\]$/))?a[1]:o}}}();p.b("ko.memoization",p.k);p.b("ko.memoization.memoize",p.k.S);p.b("ko.memoization.unmemoize",p.k.ra);p.b("ko.memoization.parseMemoText",p.k.ha);
p.b("ko.memoization.unmemoizeDomNodeAndDescendants",p.k.sa);p.Ya=function(c,e){this.za=c;this.n=function(){this.La=!0;e()}.bind(this);p.i(this,"dispose",this.n)};p.W=function(){var c=[];this.X=function(e,a){var d=a?e.bind(a):e,f=new p.Ya(d,function(){p.a.M(c,f)});c.push(f);return f};this.w=function(e){p.a.h(c.slice(0),function(a){a&&a.La!==!0&&a.za(e)})};this.Ja=function(){return c.length};p.i(this,"subscribe",this.X);p.i(this,"notifySubscribers",this.w);p.i(this,"getSubscriptionsCount",this.Ja)};
p.fa=function(c){return typeof c.X=="function"&&typeof c.w=="function"};p.b("ko.subscribable",p.W);p.b("ko.isSubscribable",p.fa);p.z=function(){var c=[];return{ya:function(){c.push([])},end:function(){return c.pop()},ia:function(e){p.fa(e)||b("Only subscribable things can act as dependencies");c.length>0&&c[c.length-1].push(e)}}}();
p.s=function(c){function e(){return arguments.length>0?(a=arguments[0],e.w(a),this):(p.z.ia(e),a)}var a=c;e.o=p.s;e.G=function(){e.w(a)};p.W.call(e);p.i(e,"valueHasMutated",e.G);return e};p.B=function(c){if(c===o||c===n||c.o===n)return!1;if(c.o===p.s)return!0;return p.B(c.o)};p.C=function(c){if(typeof c=="function"&&c.o===p.s)return!0;if(typeof c=="function"&&c.o===p.j&&c.Ka)return!0;return!1};p.b("ko.observable",p.s);p.b("ko.isObservable",p.B);p.b("ko.isWriteableObservable",p.C);
p.Ra=function(c){arguments.length==0&&(c=[]);c!==o&&c!==n&&!("length"in c)&&b(new "The argument passed when initializing an observable array must be an array, or null, or undefined.");var e=new p.s(c);p.a.h(["pop","push","reverse","shift","sort","splice","unshift"],function(a){e[a]=function(){var d=e();d=d[a].apply(d,arguments);e.G();return d}});p.a.h(["slice"],function(a){e[a]=function(){var d=e();return d[a].apply(d,arguments)}});e.remove=function(a){for(var d=e(),f=[],c=[],g=typeof a=="function"?
a:function(d){return d===a},i=0,j=d.length;i<j;i++){var k=d[i];g(k)?c.push(k):f.push(k)}e(f);return c};e.Ua=function(a){if(a===n){var d=e();e([]);return d}if(!a)return[];return e.remove(function(d){return p.a.g(a,d)>=0})};e.N=function(a){for(var d=e(),f=typeof a=="function"?a:function(d){return d===a},c=d.length-1;c>=0;c--)f(d[c])&&(d[c]._destroy=!0);e.G()};e.Ca=function(a){if(a===n)return e.N(function(){return!0});if(!a)return[];return e.N(function(d){return p.a.g(a,d)>=0})};e.indexOf=function(a){var d=
e();return p.a.g(d,a)};e.replace=function(a,d){var f=e.indexOf(a);f>=0&&(e()[f]=d,e.G())};p.i(e,"remove",e.remove);p.i(e,"removeAll",e.Ua);p.i(e,"destroy",e.N);p.i(e,"destroyAll",e.Ca);p.i(e,"indexOf",e.indexOf);return e};p.b("ko.observableArray",p.Ra);
p.j=function(c,e,a){function d(){p.a.h(m,function(a){a.n()});m=[]}function f(a){d();p.a.h(a,function(a){m.push(a.X(h))})}function h(){if(j&&typeof a.disposeWhen=="function"&&a.disposeWhen())g.n();else{try{p.z.ya(),i=a.owner?a.read.call(a.owner):a.read()}finally{var d=p.a.$(p.z.end());f(d)}g.w(i);j=!0}}function g(){if(arguments.length>0)if(typeof a.write==="function"){var d=arguments[0];a.owner?a.write.call(a.owner,d):a.write(d)}else b("Cannot write a value to a dependentObservable unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
else return j||h(),p.z.ia(g),i}var i,j=!1;c&&typeof c=="object"?a=c:(a=a||{},a.read=c||a.read,a.owner=e||a.owner);typeof a.read!="function"&&b("Pass a function that returns the value of the dependentObservable");var k=typeof a.disposeWhenNodeIsRemoved=="object"?a.disposeWhenNodeIsRemoved:o,l=o;if(k){l=function(){g.n()};p.a.p.Z(k,l);var q=a.disposeWhen;a.disposeWhen=function(){return!p.a.O(k)||typeof q=="function"&&q()}}var m=[];g.o=p.j;g.Ia=function(){return m.length};g.Ka=typeof a.write==="function";
g.n=function(){k&&p.a.p.ja(k,l);d()};p.W.call(g);a.deferEvaluation!==!0&&h();p.i(g,"dispose",g.n);p.i(g,"getDependenciesCount",g.Ia);return g};p.j.o=p.s;p.b("ko.dependentObservable",p.j);
(function(){function c(d,f,h){h=h||new a;d=f(d);if(!(typeof d=="object"&&d!==o&&d!==n))return d;var g=d instanceof Array?[]:{};h.save(d,g);e(d,function(a){var e=f(d[a]);switch(typeof e){case "boolean":case "number":case "string":case "function":g[a]=e;break;case "object":case "undefined":var k=h.get(e);g[a]=k!==n?k:c(e,f,h)}});return g}function e(a,f){if(a instanceof Array)for(var c=0;c<a.length;c++)f(c);else for(c in a)f(c)}function a(){var a=[],f=[];this.save=function(c,e){var i=p.a.g(a,c);i>=0?
f[i]=e:(a.push(c),f.push(e))};this.get=function(c){c=p.a.g(a,c);return c>=0?f[c]:n}}p.oa=function(a){arguments.length==0&&b(Error("When calling ko.toJS, pass the object you want to convert."));return c(a,function(a){for(var d=0;p.B(a)&&d<10;d++)a=a();return a})};p.toJSON=function(a){a=p.oa(a);return p.a.V(a)}})();p.b("ko.toJS",p.oa);p.b("ko.toJSON",p.toJSON);
p.f={l:function(c){if(c.tagName=="OPTION"){if(c.__ko__hasDomDataOptionValue__===!0)return p.a.e.get(c,p.c.options.T);return c.getAttribute("value")}else return c.tagName=="SELECT"?c.selectedIndex>=0?p.f.l(c.options[c.selectedIndex]):n:c.value},H:function(c,e){if(c.tagName=="OPTION")switch(typeof e){case "string":case "number":p.a.e.set(c,p.c.options.T,n);"__ko__hasDomDataOptionValue__"in c&&delete c.__ko__hasDomDataOptionValue__;c.value=e;break;default:p.a.e.set(c,p.c.options.T,e),c.__ko__hasDomDataOptionValue__=
!0,c.value=""}else if(c.tagName=="SELECT")for(var a=c.options.length-1;a>=0;a--){if(p.f.l(c.options[a])==e){c.selectedIndex=a;break}}else{if(e===o||e===n)e="";c.value=e}}};p.b("ko.selectExtensions",p.f);p.b("ko.selectExtensions.readValue",p.f.l);p.b("ko.selectExtensions.writeValue",p.f.H);
p.r=function(){function c(a,d){return a.replace(e,function(a,c){return d[c]})}var e=/\[ko_token_(\d+)\]/g,a=/^[\_$a-z][\_$a-z0-9]*(\[.*?\])*(\.[\_$a-z][\_$a-z0-9]*(\[.*?\])*)*$/i,d=["true","false"];return{D:function(a){a=p.a.m(a);if(a.length<3)return{};for(var d=[],e=o,i,j=a.charAt(0)=="{"?1:0;j<a.length;j++){var k=a.charAt(j);if(e===o)switch(k){case '"':case "'":case "/":e=j;i=k;break;case "{":e=j;i="}";break;case "[":e=j,i="]"}else if(k==i){k=a.substring(e,j+1);d.push(k);var l="[ko_token_"+(d.length-
1)+"]";a=a.substring(0,e)+l+a.substring(j+1);j-=k.length-l.length;e=o}}e={};a=a.split(",");i=0;for(j=a.length;i<j;i++){l=a[i];var q=l.indexOf(":");q>0&&q<l.length-1&&(k=p.a.m(l.substring(0,q)),l=p.a.m(l.substring(q+1)),k.charAt(0)=="{"&&(k=k.substring(1)),l.charAt(l.length-1)=="}"&&(l=l.substring(0,l.length-1)),k=p.a.m(c(k,d)),l=p.a.m(c(l,d)),e[k]=l)}return e},P:function(c){var e=p.r.D(c),g=[],i;for(i in e){var j=e[i],k;k=j;k=p.a.g(d,p.a.m(k).toLowerCase())>=0?!1:k.match(a)!==o;k&&(g.length>0&&g.push(", "),
g.push(i+" : function(__ko_value) { "+j+" = __ko_value; }"))}g.length>0&&(c=c+", '_ko_property_writers' : { "+g.join("")+" } ");return c}}}();p.b("ko.jsonExpressionRewriting",p.r);p.b("ko.jsonExpressionRewriting.parseJson",p.r.D);p.b("ko.jsonExpressionRewriting.insertPropertyAccessorsIntoJson",p.r.P);p.c={};
p.I=function(c,e,a,d){function f(a){return function(){return i[a]}}function h(){return i}var g=!0;d=d||"data-bind";var i;new p.j(function(){var j;if(!(j=typeof e=="function"?e():e)){var k=c.getAttribute(d);try{var l=" { "+p.r.P(k)+" } ";j=p.a.Ha(l,a===o?window:a)}catch(q){b(Error("Unable to parse binding attribute.\nMessage: "+q+";\nAttribute value: "+k))}}i=j;if(g)for(var m in i)p.c[m]&&typeof p.c[m].init=="function"&&(0,p.c[m].init)(c,f(m),h,a);for(m in i)p.c[m]&&typeof p.c[m].update=="function"&&
(0,p.c[m].update)(c,f(m),h,a)},o,{disposeWhenNodeIsRemoved:c});g=!1};p.ua=function(c,e){e&&e.nodeType==n&&b(Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node (note: this is a breaking change since KO version 1.05)"));e=e||window.document.body;var a=p.a.ca(e,"data-bind");p.a.h(a,function(a){p.I(a,o,c)})};p.b("ko.bindingHandlers",p.c);p.b("ko.applyBindings",p.ua);p.b("ko.applyBindingsToNode",p.I);
p.a.h(["click"],function(c){p.c[c]={init:function(e,a,d,f){return p.c.event.init.call(this,e,function(){var d={};d[c]=a();return d},d,f)}}});p.c.event={init:function(c,e,a,d){var f=e()||{},h;for(h in f)(function(){var f=h;typeof f=="string"&&p.a.t(c,f,function(c){var h,k=e()[f],l=a();try{h=k.apply(d,arguments)}finally{if(h!==!0)c.preventDefault?c.preventDefault():c.returnValue=!1}if(l[f+"Bubble"]===!1)c.cancelBubble=!0,c.stopPropagation&&c.stopPropagation()})})()}};
p.c.submit={init:function(c,e,a,d){typeof e()!="function"&&b(Error("The value for a submit binding must be a function to invoke on submit"));p.a.t(c,"submit",function(a){var h,g=e();try{h=g.call(d,c)}finally{if(h!==!0)a.preventDefault?a.preventDefault():a.returnValue=!1}})}};p.c.visible={update:function(c,e){var a=p.a.d(e()),d=c.style.display!="none";if(a&&!d)c.style.display="";else if(!a&&d)c.style.display="none"}};
p.c.enable={update:function(c,e){var a=p.a.d(e());if(a&&c.disabled)c.removeAttribute("disabled");else if(!a&&!c.disabled)c.disabled=!0}};p.c.disable={update:function(c,e){p.c.enable.update(c,function(){return!p.a.d(e())})}};
p.c.value={init:function(c,e,a){var d=a().valueUpdate||"change",f=!1;p.a.Xa(d,"after")&&(f=!0,d=d.substring(5));var h=f?function(a){setTimeout(a,0)}:function(a){a()};p.a.t(c,d,function(){h(function(){var d=e(),f=p.f.l(c);p.C(d)?d(f):(d=a(),d._ko_property_writers&&d._ko_property_writers.value&&d._ko_property_writers.value(f))})})},update:function(c,e){var a=p.a.d(e()),d=p.f.l(c),f=a!=d;a===0&&d!==0&&d!=="0"&&(f=!0);f&&(d=function(){p.f.H(c,a)},d(),c.tagName=="SELECT"&&setTimeout(d,0));c.tagName=="SELECT"&&
(d=p.f.l(c),d!==a&&p.a.qa(c,"change"))}};
p.c.options={update:function(c,e,a){c.tagName!="SELECT"&&b(Error("options binding applies only to SELECT elements"));var d=p.a.K(p.a.J(c.childNodes,function(a){return a.tagName&&a.tagName=="OPTION"&&a.selected}),function(a){return p.f.l(a)||a.innerText||a.textContent}),f=c.scrollTop,h=p.a.d(e());p.a.aa(c);if(h){var g=a();typeof h.length!="number"&&(h=[h]);if(g.optionsCaption){var i=document.createElement("OPTION");i.innerHTML=g.optionsCaption;p.f.H(i,n);c.appendChild(i)}a=0;for(e=h.length;a<e;a++){i=
document.createElement("OPTION");var j=typeof g.optionsValue=="string"?h[a][g.optionsValue]:h[a],k=g.optionsText;optionText=typeof k=="function"?k(h[a]):typeof k=="string"?h[a][k]:j;j=p.a.d(j);optionText=p.a.d(optionText);p.f.H(i,j);i.innerHTML=optionText.toString();c.appendChild(i)}h=c.getElementsByTagName("OPTION");a=g=0;for(e=h.length;a<e;a++)p.a.g(d,p.f.l(h[a]))>=0&&(p.a.ma(h[a],!0),g++);if(f)c.scrollTop=f}}};p.c.options.T="__ko.bindingHandlers.options.optionValueDomData__";
p.c.selectedOptions={ea:function(c){var e=[];c=c.childNodes;for(var a=0,d=c.length;a<d;a++){var f=c[a];f.tagName=="OPTION"&&f.selected&&e.push(p.f.l(f))}return e},init:function(c,e,a){p.a.t(c,"change",function(){var d=e();p.C(d)?d(p.c.selectedOptions.ea(this)):(d=a(),d._ko_property_writers&&d._ko_property_writers.value&&d._ko_property_writers.value(p.c.selectedOptions.ea(this)))})},update:function(c,e){c.tagName!="SELECT"&&b(Error("values binding applies only to SELECT elements"));var a=p.a.d(e());
if(a&&typeof a.length=="number")for(var d=c.childNodes,f=0,h=d.length;f<h;f++){var g=d[f];g.tagName=="OPTION"&&p.a.ma(g,p.a.g(a,p.f.l(g))>=0)}}};p.c.text={update:function(c,e){var a=p.a.d(e());if(a===o||a===n)a="";typeof c.innerText=="string"?c.innerText=a:c.textContent=a}};p.c.html={update:function(c,e){var a=p.a.d(e());if(a===o||a===n)a="";c.innerHTML=a}};p.c.css={update:function(c,e){var a=p.a.d(e()||{}),d;for(d in a)if(typeof d=="string"){var f=p.a.d(a[d]);p.a.pa(c,d,f)}}};
p.c.style={update:function(c,e){var a=p.a.d(e()||{}),d;for(d in a)if(typeof d=="string"){var f=p.a.d(a[d]);c.style[d]=f||""}}};p.c.uniqueName={init:function(c,e){if(e())c.name="ko_unique_"+ ++p.c.uniqueName.Ba,p.a.Q&&c.mergeAttributes(document.createElement("<input name='"+c.name+"'/>"),!1)}};p.c.uniqueName.Ba=0;
p.c.checked={init:function(c,e,a){p.a.t(c,"click",function(){var d;if(c.type=="checkbox")d=c.checked;else if(c.type=="radio"&&c.checked)d=c.value;else return;var f=e();c.type=="checkbox"&&p.a.d(f)instanceof Array?(d=p.a.g(p.a.d(f),c.value),c.checked&&d<0?f.push(c.value):!c.checked&&d>=0&&f.splice(d,1)):p.C(f)?f()!==d&&f(d):(f=a(),f._ko_property_writers&&f._ko_property_writers.checked&&f._ko_property_writers.checked(d))});c.type=="radio"&&!c.name&&p.c.uniqueName.init(c,function(){return!0})},update:function(c,
e){var a=p.a.d(e());if(c.type=="checkbox")c.checked=a instanceof Array?p.a.g(a,c.value)>=0:a,a&&p.a.Q&&c.mergeAttributes(document.createElement("<input type='checkbox' checked='checked' />"),!1);else if(c.type=="radio")c.checked=c.value==a,c.value==a&&(p.a.Q||p.a.Ma)&&c.mergeAttributes(document.createElement("<input type='radio' checked='checked' />"),!1)}};
p.c.attr={update:function(c,e){var a=p.a.d(e())||{},d;for(d in a)if(typeof d=="string"){var f=p.a.d(a[d]);f===!1||f===o||f===n?c.removeAttribute(d):c.setAttribute(d,f.toString())}}};
p.Y=function(){this.renderTemplate=function(){b("Override renderTemplate in your ko.templateEngine subclass")};this.isTemplateRewritten=function(){b("Override isTemplateRewritten in your ko.templateEngine subclass")};this.rewriteTemplate=function(){b("Override rewriteTemplate in your ko.templateEngine subclass")};this.createJavaScriptEvaluatorBlock=function(){b("Override createJavaScriptEvaluatorBlock in your ko.templateEngine subclass")}};p.b("ko.templateEngine",p.Y);
p.F=function(){var c=/(<[a-z]+\d*(\s+(?!data-bind=)[a-z0-9]+(=(\"[^\"]*\"|\'[^\']*\'))?)*\s+)data-bind=(["'])([\s\S]*?)\5/gi;return{Ga:function(c,a){a.isTemplateRewritten(c)||a.rewriteTemplate(c,function(d){return p.F.Qa(d,a)})},Qa:function(e,a){return e.replace(c,function(d,c,e,g,i,j,k){d=p.r.P(k);return a.createJavaScriptEvaluatorBlock("ko.templateRewriting.applyMemoizedBindingsToNextSibling(function() {                     return (function() { return { "+d+" } })()                 })")+c})},va:function(c){return p.k.S(function(a,
d){a.nextSibling&&p.I(a.nextSibling,c,d)})}}}();p.b("ko.templateRewriting",p.F);p.b("ko.templateRewriting.applyMemoizedBindingsToNextSibling",p.F.va);
(function(){function c(a,d,c,h,g){var i=p.a.d(h);g=g||{};var j=g.templateEngine||e;p.F.Ga(c,j);c=j.renderTemplate(c,i,g);(typeof c.length!="number"||c.length>0&&typeof c[0].nodeType!="number")&&b("Template engine must return an array of DOM nodes");c&&p.a.h(c,function(a){p.k.sa(a,[h])});switch(d){case "replaceChildren":p.a.Wa(a,c);break;case "replaceNode":p.a.ka(a,c);break;case "ignoreTargetNode":break;default:b(Error("Unknown renderMode: "+d))}g.afterRender&&g.afterRender(c,h);return c}var e;p.na=
function(a){a!=n&&!(a instanceof p.Y)&&b("templateEngine must inherit from ko.templateEngine");e=a};p.U=function(a,d,f,h,g){f=f||{};(f.templateEngine||e)==n&&b("Set a template engine before calling renderTemplate");g=g||"replaceChildren";if(h){var i=h.nodeType?h:h.length>0?h[0]:o;return new p.j(function(){var e=typeof a=="function"?a(d):a;e=c(h,g,e,d,f);g=="replaceNode"&&(h=e,i=h.nodeType?h:h.length>0?h[0]:o)},o,{disposeWhen:function(){return!i||!p.a.O(i)},disposeWhenNodeIsRemoved:i&&g=="replaceNode"?
i.parentNode:i})}else return p.k.S(function(c){p.U(a,d,f,c,"replaceNode")})};p.Va=function(a,d,f,e){return new p.j(function(){var g=p.a.d(d)||[];typeof g.length=="undefined"&&(g=[g]);g=p.a.J(g,function(a){return f.includeDestroyed||!a._destroy});p.a.la(e,g,function(d){var e=typeof a=="function"?a(d):a;return c(o,"ignoreTargetNode",e,d,f)},f)},o,{disposeWhenNodeIsRemoved:e})};p.c.template={update:function(a,c,f,e){c=p.a.d(c());f=typeof c=="string"?c:c.name;if(typeof c.foreach!="undefined")e=p.Va(f,
c.foreach||[],{templateOptions:c.templateOptions,afterAdd:c.afterAdd,beforeRemove:c.beforeRemove,includeDestroyed:c.includeDestroyed,afterRender:c.afterRender},a);else{var g=c.data;e=p.U(f,typeof g=="undefined"?e:g,{templateOptions:c.templateOptions,afterRender:c.afterRender},a)}(c=p.a.e.get(a,"__ko__templateSubscriptionDomDataKey__"))&&typeof c.n=="function"&&c.n();p.a.e.set(a,"__ko__templateSubscriptionDomDataKey__",e)}}})();p.b("ko.setTemplateEngine",p.na);p.b("ko.renderTemplate",p.U);
p.a.v=function(c,e,a){if(a===n)return p.a.v(c,e,1)||p.a.v(c,e,10)||p.a.v(c,e,Number.MAX_VALUE);else{c=c||[];e=e||[];for(var d=c,f=e,h=[],g=0;g<=f.length;g++)h[g]=[];g=0;for(var i=Math.min(d.length,a);g<=i;g++)h[0][g]=g;g=1;for(i=Math.min(f.length,a);g<=i;g++)h[g][0]=g;i=d.length;var j,k=f.length;for(g=1;g<=i;g++){var l=Math.min(k,g+a);for(j=Math.max(1,g-a);j<=l;j++)h[j][g]=d[g-1]===f[j-1]?h[j-1][g-1]:Math.min(h[j-1][g]===n?Number.MAX_VALUE:h[j-1][g]+1,h[j][g-1]===n?Number.MAX_VALUE:h[j][g-1]+1)}a=
c.length;d=e.length;f=[];g=h[d][a];if(g===n)h=o;else{for(;a>0||d>0;){i=h[d][a];j=d>0?h[d-1][a]:g+1;k=a>0?h[d][a-1]:g+1;l=d>0&&a>0?h[d-1][a-1]:g+1;if(j===n||j<i-1)j=g+1;if(k===n||k<i-1)k=g+1;l<i-1&&(l=g+1);j<=k&&j<l?(f.push({status:"added",value:e[d-1]}),d--):(k<j&&k<l?f.push({status:"deleted",value:c[a-1]}):(f.push({status:"retained",value:c[a-1]}),d--),a--)}h=f.reverse()}return h}};p.b("ko.utils.compareArrays",p.a.v);
(function(){function c(c,a,d){var f=[];c=p.j(function(){var c=a(d)||[];f.length>0&&p.a.ka(f,c);f.splice(0,f.length);p.a.L(f,c)},o,{disposeWhenNodeIsRemoved:c,disposeWhen:function(){return f.length==0||!p.a.O(f[0])}});return{Oa:f,j:c}}p.a.la=function(e,a,d,f){a=a||[];f=f||{};var h=p.a.e.get(e,"setDomNodeChildrenFromArrayMapping_lastMappingResult")===n,g=p.a.e.get(e,"setDomNodeChildrenFromArrayMapping_lastMappingResult")||[],i=p.a.K(g,function(a){return a.wa}),j=p.a.v(i,a);a=[];var k=0,l=[];i=[];for(var q=
o,m=0,u=j.length;m<u;m++)switch(j[m].status){case "retained":var r=g[k];a.push(r);r.A.length>0&&(q=r.A[r.A.length-1]);k++;break;case "deleted":g[k].j.n();p.a.h(g[k].A,function(a){l.push({element:a,index:m,value:j[m].value});q=a});k++;break;case "added":var s=c(e,d,j[m].value);r=s.Oa;a.push({wa:j[m].value,A:r,j:s.j});s=0;for(var v=r.length;s<v;s++){var t=r[s];i.push({element:t,index:m,value:j[m].value});q==o?e.firstChild?e.insertBefore(t,e.firstChild):e.appendChild(t):q.nextSibling?e.insertBefore(t,
q.nextSibling):e.appendChild(t);q=t}}p.a.h(l,function(a){p.u(a.element)});d=!1;if(!h){if(f.afterAdd)for(m=0;m<i.length;m++)f.afterAdd(i[m].element,i[m].index,i[m].value);if(f.beforeRemove){for(m=0;m<l.length;m++)f.beforeRemove(l[m].element,l[m].index,l[m].value);d=!0}}d||p.a.h(l,function(a){a.element.parentNode&&a.element.parentNode.removeChild(a.element)});p.a.e.set(e,"setDomNodeChildrenFromArrayMapping_lastMappingResult",a)}})();p.b("ko.utils.setDomNodeChildrenFromArrayMapping",p.a.la);
p.R=function(){function c(a){var c=document.getElementById(a);c==o&&b(Error("Cannot find template with ID="+a));return c}this.q=function(){if(typeof jQuery=="undefined"||!jQuery.tmpl)return 0;if(jQuery.tmpl.tag){if(jQuery.tmpl.tag.tmpl&&jQuery.tmpl.tag.tmpl.open&&jQuery.tmpl.tag.tmpl.open.toString().indexOf("__")>=0)return 3;return 2}return 1}();var e=RegExp("__ko_apos__","g");this.renderTemplate=function(a,d,f){f=f||{};this.q==0&&b(Error("jquery.tmpl not detected.\nTo use KO's default template engine, reference jQuery and jquery.tmpl. See Knockout installation documentation for more details."));
if(this.q==1)return a='<script type="text/html">'+c(a).text+"<\/script>",d=jQuery.tmpl(a,d)[0].text.replace(e,"'"),jQuery.clean([d],document);if(!(a in jQuery.template)){var h=c(a).text;jQuery.template(a,h)}d=[d];d=jQuery.tmpl(a,d,f.templateOptions);d.appendTo(document.createElement("div"));jQuery.fragments={};return d};this.isTemplateRewritten=function(a){if(a in jQuery.template)return!0;return c(a).Na===!0};this.rewriteTemplate=function(a,d){var f=c(a),e=d(f.text);this.q==1&&(e=p.a.m(e),e=e.replace(/([\s\S]*?)(\${[\s\S]*?}|{{[\=a-z][\s\S]*?}}|$)/g,
function(a,c,d){return c.replace(/\'/g,"__ko_apos__")+d}));f.text=e;f.Na=!0};this.createJavaScriptEvaluatorBlock=function(a){if(this.q==1)return"{{= "+a+"}}";return"{{ko_code ((function() { return "+a+" })()) }}"};this.ta=function(a,c){document.write("<script type='text/html' id='"+a+"'>"+c+"<\/script>")};p.i(this,"addTemplate",this.ta);this.q>1&&(jQuery.tmpl.tag.ko_code={open:(this.q<3?"_":"__")+".push($1 || '');"})};p.R.prototype=new p.Y;p.na(new p.R);p.b("ko.jqueryTmplTemplateEngine",p.R);
})(window);                  
