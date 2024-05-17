import{codePointSize as t,codePointAt as e,EditorSelection as o,CharCategory as n,Prec as i,Facet as s,combineConfig as l,StateField as r,StateEffect as a,MapMode as c,RangeValue as h,RangeSet as p,fromCodePoint as f,Annotation as d,Text as u,Transaction as m}from"./codemirror_state-BKbyfKsm.js";import{E as g,k as v,D as b,s as w,g as y,V as x,l as C,a as I,W as O}from"./codemirror_view-C0PMO2z_.js";import{s as k,i as D}from"./codemirror_language-_XiX6II0.js";class T{constructor(t,e,o){this.state=t,this.pos=e,this.explicit=o,this.abortListeners=[]}tokenBefore(t){let e=k(this.state).resolveInner(this.pos,-1);for(;e&&t.indexOf(e.name)<0;)e=e.parent;return e?{from:e.from,to:this.pos,text:this.state.sliceDoc(e.from,this.pos),type:e.type}:null}matchBefore(t){let e=this.state.doc.lineAt(this.pos),o=Math.max(e.from,this.pos-250),n=e.text.slice(o-e.from,this.pos-e.from),i=n.search(P(t,!1));return i<0?null:{from:o+i,to:this.pos,text:n.slice(i)}}get aborted(){return null==this.abortListeners}addEventListener(t,e){"abort"==t&&this.abortListeners&&this.abortListeners.push(e)}}function A(t){let e=Object.keys(t).join(""),o=/\w/.test(e);return o&&(e=e.replace(/\w/g,"")),`[${o?"\\w":""}${e.replace(/[^\w\s]/g,"\\$&")}]`}function R(t){let e=t.map((t=>"string"==typeof t?{label:t}:t)),[o,n]=e.every((t=>/^\w+$/.test(t.label)))?[/\w*$/,/\w+$/]:function(t){let e=Object.create(null),o=Object.create(null);for(let{label:n}of t){e[n[0]]=!0;for(let t=1;t<n.length;t++)o[n[t]]=!0}let n=A(e)+A(o)+"*$";return[new RegExp("^"+n),new RegExp(n)]}(e);return t=>{let i=t.matchBefore(n);return i||t.explicit?{from:i?i.from:t.pos,options:e,validFor:o}:null}}function S(t,e){return o=>{for(let e=k(o.state).resolveInner(o.pos,-1);e;e=e.parent){if(t.indexOf(e.name)>-1)return null;if(e.type.isTop)break}return e(o)}}class E{constructor(t,e,o,n){this.completion=t,this.source=e,this.match=o,this.score=n}}function L(t){return t.selection.main.from}function P(t,e){var o;let{source:n}=t,i=e&&"^"!=n[0],s="$"!=n[n.length-1];return i||s?new RegExp(`${i?"^":""}(?:${n})${s?"$":""}`,null!==(o=t.flags)&&void 0!==o?o:t.ignoreCase?"i":""):t}const M=d.define();const B=new WeakMap;function j(t){if(!Array.isArray(t))return t;let e=B.get(t);return e||B.set(t,e=R(t)),e}const $=a.define(),F=a.define();class N{constructor(o){this.pattern=o,this.chars=[],this.folded=[],this.any=[],this.precise=[],this.byWord=[],this.score=0,this.matched=[];for(let n=0;n<o.length;){let i=e(o,n),s=t(i);this.chars.push(i);let l=o.slice(n,n+s),r=l.toUpperCase();this.folded.push(e(r==l?l.toLowerCase():r,0)),n+=s}this.astral=o.length!=this.chars.length}ret(t,e){return this.score=t,this.matched=e,!0}match(o){if(0==this.pattern.length)return this.ret(-100,[]);if(o.length<this.pattern.length)return!1;let{chars:n,folded:i,any:s,precise:l,byWord:r}=this;if(1==n.length){let s=e(o,0),l=t(s),r=l==o.length?0:-100;if(s==n[0]);else{if(s!=i[0])return!1;r+=-200}return this.ret(r,[0,l])}let a=o.indexOf(this.pattern);if(0==a)return this.ret(o.length==this.pattern.length?0:-100,[0,this.pattern.length]);let c=n.length,h=0;if(a<0){for(let l=0,r=Math.min(o.length,200);l<r&&h<c;){let r=e(o,l);r!=n[h]&&r!=i[h]||(s[h++]=l),l+=t(r)}if(h<c)return!1}let p=0,d=0,u=!1,m=0,g=-1,v=-1,b=/[a-z]/.test(o),w=!0;for(let s=0,h=Math.min(o.length,200),y=0;s<h&&d<c;){let h=e(o,s);a<0&&(p<c&&h==n[p]&&(l[p++]=s),m<c&&(h==n[m]||h==i[m]?(0==m&&(g=s),v=s+1,m++):m=0));let x,C=h<255?h>=48&&h<=57||h>=97&&h<=122?2:h>=65&&h<=90?1:0:(x=f(h))!=x.toLowerCase()?1:x!=x.toUpperCase()?2:0;(!s||1==C&&b||0==y&&0!=C)&&(n[d]==h||i[d]==h&&(u=!0)?r[d++]=s:r.length&&(w=!1)),y=C,s+=t(h)}return d==c&&0==r[0]&&w?this.result((u?-200:0)-100,r,o):m==c&&0==g?this.ret(-200-o.length+(v==o.length?0:-100),[0,v]):a>-1?this.ret(-700-o.length,[a,a+this.pattern.length]):m==c?this.ret(-900-o.length,[g,v]):d==c?this.result((u?-200:0)-100-700+(w?0:-1100),r,o):2!=n.length&&this.result((s[0]?-700:0)-200-1100,s,o)}result(o,n,i){let s=[],l=0;for(let o of n){let n=o+(this.astral?t(e(i,o)):1);l&&s[l-1]==o?s[l-1]=n:(s[l++]=o,s[l++]=n)}return this.ret(o-i.length,s)}}const U=s.define({combine:t=>l(t,{activateOnTyping:!0,activateOnTypingDelay:100,selectOnOpen:!0,override:null,closeOnBlur:!0,maxRenderedOptions:100,defaultKeymap:!0,tooltipClass:()=>"",optionClass:()=>"",aboveCursor:!1,icons:!0,addToOptions:[],positionInfo:W,compareCompletions:(t,e)=>t.label.localeCompare(e.label),interactionDelay:75,updateSyncTime:100},{defaultKeymap:(t,e)=>t&&e,closeOnBlur:(t,e)=>t&&e,icons:(t,e)=>t&&e,tooltipClass:(t,e)=>o=>q(t(o),e(o)),optionClass:(t,e)=>o=>q(t(o),e(o)),addToOptions:(t,e)=>t.concat(e)})});function q(t,e){return t?e?t+" "+e:t:e}function W(t,e,o,n,i,s){let l,r,a=t.textDirection==b.RTL,c=a,h=!1,p="top",f=e.left-i.left,d=i.right-e.right,u=n.right-n.left,m=n.bottom-n.top;if(c&&f<Math.min(u,d)?c=!1:!c&&d<Math.min(u,f)&&(c=!0),u<=(c?f:d))l=Math.max(i.top,Math.min(o.top,i.bottom-m))-e.top,r=Math.min(400,c?f:d);else{h=!0,r=Math.min(400,(a?e.right:i.right-e.left)-30);let t=i.bottom-e.bottom;t>=m||t>e.top?l=o.bottom-e.top:(p="bottom",l=e.bottom-o.top)}return{style:`${p}: ${l/((e.bottom-e.top)/s.offsetHeight)}px; max-width: ${r/((e.right-e.left)/s.offsetWidth)}px`,class:"cm-completionInfo-"+(h?a?"left-narrow":"right-narrow":c?"left":"right")}}function H(t,e,o){if(t<=o)return{from:0,to:t};if(e<0&&(e=0),e<=t>>1){let t=Math.floor(e/o);return{from:t*o,to:(t+1)*o}}let n=Math.floor((t-e)/o);return{from:t-(n+1)*o,to:t-n*o}}class V{constructor(t,e,o){this.view=t,this.stateField=e,this.applyCompletion=o,this.info=null,this.infoDestroy=null,this.placeInfoReq={read:()=>this.measureInfo(),write:t=>this.placeInfo(t),key:this},this.space=null,this.currentClass="";let n=t.state.field(e),{options:i,selected:s}=n.open,l=t.state.facet(U);this.optionContent=function(t){let e=t.addToOptions.slice();return t.icons&&e.push({render(t){let e=document.createElement("div");return e.classList.add("cm-completionIcon"),t.type&&e.classList.add(...t.type.split(/\s+/g).map((t=>"cm-completionIcon-"+t))),e.setAttribute("aria-hidden","true"),e},position:20}),e.push({render(t,e,o,n){let i=document.createElement("span");i.className="cm-completionLabel";let s=t.displayLabel||t.label,l=0;for(let t=0;t<n.length;){let e=n[t++],o=n[t++];e>l&&i.appendChild(document.createTextNode(s.slice(l,e)));let r=i.appendChild(document.createElement("span"));r.appendChild(document.createTextNode(s.slice(e,o))),r.className="cm-completionMatchedText",l=o}return l<s.length&&i.appendChild(document.createTextNode(s.slice(l))),i},position:50},{render(t){if(!t.detail)return null;let e=document.createElement("span");return e.className="cm-completionDetail",e.textContent=t.detail,e},position:80}),e.sort(((t,e)=>t.position-e.position)).map((t=>t.render))}(l),this.optionClass=l.optionClass,this.tooltipClass=l.tooltipClass,this.range=H(i.length,s,l.maxRenderedOptions),this.dom=document.createElement("div"),this.dom.className="cm-tooltip-autocomplete",this.updateTooltipClass(t.state),this.dom.addEventListener("mousedown",(o=>{let{options:n}=t.state.field(e).open;for(let e,i=o.target;i&&i!=this.dom;i=i.parentNode)if("LI"==i.nodeName&&(e=/-(\d+)$/.exec(i.id))&&+e[1]<n.length)return this.applyCompletion(t,n[+e[1]]),void o.preventDefault()})),this.dom.addEventListener("focusout",(e=>{let o=t.state.field(this.stateField,!1);o&&o.tooltip&&t.state.facet(U).closeOnBlur&&e.relatedTarget!=t.contentDOM&&t.dispatch({effects:F.of(null)})})),this.showOptions(i,n.id)}mount(){this.updateSel()}showOptions(t,e){this.list&&this.list.remove(),this.list=this.dom.appendChild(this.createListBox(t,e,this.range)),this.list.addEventListener("scroll",(()=>{this.info&&this.view.requestMeasure(this.placeInfoReq)}))}update(t){var e;let o=t.state.field(this.stateField),n=t.startState.field(this.stateField);if(this.updateTooltipClass(t.state),o!=n){let{options:i,selected:s,disabled:l}=o.open;n.open&&n.open.options==i||(this.range=H(i.length,s,t.state.facet(U).maxRenderedOptions),this.showOptions(i,o.id)),this.updateSel(),l!=(null===(e=n.open)||void 0===e?void 0:e.disabled)&&this.dom.classList.toggle("cm-tooltip-autocomplete-disabled",!!l)}}updateTooltipClass(t){let e=this.tooltipClass(t);if(e!=this.currentClass){for(let t of this.currentClass.split(" "))t&&this.dom.classList.remove(t);for(let t of e.split(" "))t&&this.dom.classList.add(t);this.currentClass=e}}positioned(t){this.space=t,this.info&&this.view.requestMeasure(this.placeInfoReq)}updateSel(){let t=this.view.state.field(this.stateField),e=t.open;if((e.selected>-1&&e.selected<this.range.from||e.selected>=this.range.to)&&(this.range=H(e.options.length,e.selected,this.view.state.facet(U).maxRenderedOptions),this.showOptions(e.options,t.id)),this.updateSelectedOption(e.selected)){this.destroyInfo();let{completion:o}=e.options[e.selected],{info:n}=o;if(!n)return;let i="string"==typeof n?document.createTextNode(n):n(o);if(!i)return;"then"in i?i.then((e=>{e&&this.view.state.field(this.stateField,!1)==t&&this.addInfoPane(e,o)})).catch((t=>C(this.view.state,t,"completion info"))):this.addInfoPane(i,o)}}addInfoPane(t,e){this.destroyInfo();let o=this.info=document.createElement("div");if(o.className="cm-tooltip cm-completionInfo",null!=t.nodeType)o.appendChild(t),this.infoDestroy=null;else{let{dom:e,destroy:n}=t;o.appendChild(e),this.infoDestroy=n||null}this.dom.appendChild(o),this.view.requestMeasure(this.placeInfoReq)}updateSelectedOption(t){let e=null;for(let o=this.list.firstChild,n=this.range.from;o;o=o.nextSibling,n++)"LI"==o.nodeName&&o.id?n==t?o.hasAttribute("aria-selected")||(o.setAttribute("aria-selected","true"),e=o):o.hasAttribute("aria-selected")&&o.removeAttribute("aria-selected"):n--;return e&&function(t,e){let o=t.getBoundingClientRect(),n=e.getBoundingClientRect(),i=o.height/t.offsetHeight;n.top<o.top?t.scrollTop-=(o.top-n.top)/i:n.bottom>o.bottom&&(t.scrollTop+=(n.bottom-o.bottom)/i)}(this.list,e),e}measureInfo(){let t=this.dom.querySelector("[aria-selected]");if(!t||!this.info)return null;let e=this.dom.getBoundingClientRect(),o=this.info.getBoundingClientRect(),n=t.getBoundingClientRect(),i=this.space;if(!i){let t=this.dom.ownerDocument.defaultView||window;i={left:0,top:0,right:t.innerWidth,bottom:t.innerHeight}}return n.top>Math.min(i.bottom,e.bottom)-10||n.bottom<Math.max(i.top,e.top)+10?null:this.view.state.facet(U).positionInfo(this.view,e,n,o,i,this.dom)}placeInfo(t){this.info&&(t?(t.style&&(this.info.style.cssText=t.style),this.info.className="cm-tooltip cm-completionInfo "+(t.class||"")):this.info.style.cssText="top: -1e6px")}createListBox(t,e,o){const n=document.createElement("ul");n.id=e,n.setAttribute("role","listbox"),n.setAttribute("aria-expanded","true"),n.setAttribute("aria-label",this.view.state.phrase("Completions"));let i=null;for(let s=o.from;s<o.to;s++){let{completion:l,match:r}=t[s],{section:a}=l;if(a){let t="string"==typeof a?a:a.name;if(t!=i&&(s>o.from||0==o.from))if(i=t,"string"!=typeof a&&a.header)n.appendChild(a.header(a));else{n.appendChild(document.createElement("completion-section")).textContent=t}}const c=n.appendChild(document.createElement("li"));c.id=e+"-"+s,c.setAttribute("role","option");let h=this.optionClass(l);h&&(c.className=h);for(let t of this.optionContent){let e=t(l,this.view.state,this.view,r);e&&c.appendChild(e)}}return o.from&&n.classList.add("cm-completionListIncompleteTop"),o.to<t.length&&n.classList.add("cm-completionListIncompleteBottom"),n}destroyInfo(){this.info&&(this.infoDestroy&&this.infoDestroy(),this.info.remove(),this.info=null)}destroy(){this.destroyInfo()}}function z(t,e){return o=>new V(o,t,e)}function Q(t){return 100*(t.boost||0)+(t.apply?10:0)+(t.info?5:0)+(t.type?1:0)}class _{constructor(t,e,o,n,i,s){this.options=t,this.attrs=e,this.tooltip=o,this.timestamp=n,this.selected=i,this.disabled=s}setSelected(t,e){return t==this.selected||t>=this.options.length?this:new _(this.options,Y(e,t),this.tooltip,this.timestamp,t,this.disabled)}static build(t,e,o,n,i){let s=function(t,e){let o=[],n=null,i=t=>{o.push(t);let{section:e}=t.completion;if(e){n||(n=[]);let t="string"==typeof e?e:e.name;n.some((e=>e.name==t))||n.push("string"==typeof e?{name:t}:e)}};for(let n of t)if(n.hasResult()){let t=n.result.getMatch;if(!1===n.result.filter)for(let e of n.result.options)i(new E(e,n.source,t?t(e):[],1e9-o.length));else{let o=new N(e.sliceDoc(n.from,n.to));for(let e of n.result.options)if(o.match(e.label)){let s=e.displayLabel?t?t(e,o.matched):[]:o.matched;i(new E(e,n.source,s,o.score+(e.boost||0)))}}}if(n){let t=Object.create(null),e=0,i=(t,e)=>{var o,n;return(null!==(o=t.rank)&&void 0!==o?o:1e9)-(null!==(n=e.rank)&&void 0!==n?n:1e9)||(t.name<e.name?-1:1)};for(let o of n.sort(i))e-=1e5,t[o.name]=e;for(let e of o){let{section:o}=e.completion;o&&(e.score+=t["string"==typeof o?o:o.name])}}let s=[],l=null,r=e.facet(U).compareCompletions;for(let t of o.sort(((t,e)=>e.score-t.score||r(t.completion,e.completion)))){let e=t.completion;!l||l.label!=e.label||l.detail!=e.detail||null!=l.type&&null!=e.type&&l.type!=e.type||l.apply!=e.apply||l.boost!=e.boost?s.push(t):Q(t.completion)>Q(l)&&(s[s.length-1]=t),l=t.completion}return s}(t,e);if(!s.length)return n&&t.some((t=>1==t.state))?new _(n.options,n.attrs,n.tooltip,n.timestamp,n.selected,!0):null;let l=e.facet(U).selectOnOpen?0:-1;if(n&&n.selected!=l&&-1!=n.selected){let t=n.options[n.selected].completion;for(let e=0;e<s.length;e++)if(s[e].completion==t){l=e;break}}return new _(s,Y(o,l),{pos:t.reduce(((t,e)=>e.hasResult()?Math.min(t,e.from):t),1e8),create:st,above:i.aboveCursor},n?n.timestamp:Date.now(),l,!1)}map(t){return new _(this.options,this.attrs,Object.assign(Object.assign({},this.tooltip),{pos:t.mapPos(this.tooltip.pos)}),this.timestamp,this.selected,this.disabled)}}class K{constructor(t,e,o){this.active=t,this.id=e,this.open=o}static start(){return new K(G,"cm-ac-"+Math.floor(2e6*Math.random()).toString(36),null)}update(t){let{state:e}=t,o=e.facet(U),n=(o.override||e.languageDataAt("autocomplete",L(e)).map(j)).map((e=>(this.active.find((t=>t.source==e))||new Z(e,this.active.some((t=>0!=t.state))?1:0)).update(t,o)));n.length==this.active.length&&n.every(((t,e)=>t==this.active[e]))&&(n=this.active);let i=this.open;i&&t.docChanged&&(i=i.map(t.changes)),t.selection||n.some((e=>e.hasResult()&&t.changes.touchesRange(e.from,e.to)))||!function(t,e){if(t==e)return!0;for(let o=0,n=0;;){for(;o<t.length&&!t[o].hasResult;)o++;for(;n<e.length&&!e[n].hasResult;)n++;let i=o==t.length,s=n==e.length;if(i||s)return i==s;if(t[o++].result!=e[n++].result)return!1}}(n,this.active)?i=_.build(n,e,this.id,i,o):i&&i.disabled&&!n.some((t=>1==t.state))&&(i=null),!i&&n.every((t=>1!=t.state))&&n.some((t=>t.hasResult()))&&(n=n.map((t=>t.hasResult()?new Z(t.source,0):t)));for(let e of t.effects)e.is(ot)&&(i=i&&i.setSelected(e.value,this.id));return n==this.active&&i==this.open?this:new K(n,this.id,i)}get tooltip(){return this.open?this.open.tooltip:null}get attrs(){return this.open?this.open.attrs:X}}const X={"aria-autocomplete":"list"};function Y(t,e){let o={"aria-autocomplete":"list","aria-haspopup":"listbox","aria-controls":t};return e>-1&&(o["aria-activedescendant"]=t+"-"+e),o}const G=[];function J(t){return t.isUserEvent("input.type")?"input":t.isUserEvent("delete.backward")?"delete":null}class Z{constructor(t,e,o=-1){this.source=t,this.state=e,this.explicitPos=o}hasResult(){return!1}update(t,e){let o=J(t),n=this;o?n=n.handleUserEvent(t,o,e):t.docChanged?n=n.handleChange(t):t.selection&&0!=n.state&&(n=new Z(n.source,0));for(let e of t.effects)if(e.is($))n=new Z(n.source,1,e.value?L(t.state):-1);else if(e.is(F))n=new Z(n.source,0);else if(e.is(et))for(let t of e.value)t.source==n.source&&(n=t);return n}handleUserEvent(t,e,o){return"delete"!=e&&o.activateOnTyping?new Z(this.source,1):this.map(t.changes)}handleChange(t){return t.changes.touchesRange(L(t.startState))?new Z(this.source,0):this.map(t.changes)}map(t){return t.empty||this.explicitPos<0?this:new Z(this.source,this.state,t.mapPos(this.explicitPos))}}class tt extends Z{constructor(t,e,o,n,i){super(t,2,e),this.result=o,this.from=n,this.to=i}hasResult(){return!0}handleUserEvent(t,e,o){var n;let i=t.changes.mapPos(this.from),s=t.changes.mapPos(this.to,1),l=L(t.state);if((this.explicitPos<0?l<=i:l<this.from)||l>s||"delete"==e&&L(t.startState)==this.from)return new Z(this.source,"input"==e&&o.activateOnTyping?1:0);let r,a=this.explicitPos<0?-1:t.changes.mapPos(this.explicitPos);return function(t,e,o,n){if(!t)return!1;let i=e.sliceDoc(o,n);return"function"==typeof t?t(i,o,n,e):P(t,!0).test(i)}(this.result.validFor,t.state,i,s)?new tt(this.source,a,this.result,i,s):this.result.update&&(r=this.result.update(this.result,i,s,new T(t.state,l,a>=0)))?new tt(this.source,a,r,r.from,null!==(n=r.to)&&void 0!==n?n:L(t.state)):new Z(this.source,1,a)}handleChange(t){return t.changes.touchesRange(this.from,this.to)?new Z(this.source,0):this.map(t.changes)}map(t){return t.empty?this:new tt(this.source,this.explicitPos<0?-1:t.mapPos(this.explicitPos),this.result,t.mapPos(this.from),t.mapPos(this.to,1))}}const et=a.define({map:(t,e)=>t.map((t=>t.map(e)))}),ot=a.define(),nt=r.define({create:()=>K.start(),update:(t,e)=>t.update(e),provide:t=>[w.from(t,(t=>t.tooltip)),g.contentAttributes.from(t,(t=>t.attrs))]});function it(t,e){const n=e.completion.apply||e.completion.label;let i=t.state.field(nt).active.find((t=>t.source==e.source));return i instanceof tt&&("string"==typeof n?t.dispatch(Object.assign(Object.assign({},function(t,e,n,i){let{main:s}=t.selection,l=n-s.from,r=i-s.from;return Object.assign(Object.assign({},t.changeByRange((a=>a!=s&&n!=i&&t.sliceDoc(a.from+l,a.from+r)!=t.sliceDoc(n,i)?{range:a}:{changes:{from:a.from+l,to:i==s.from?a.to:a.from+r,insert:e},range:o.cursor(a.from+l+e.length)}))),{scrollIntoView:!0,userEvent:"input.complete"})}(t.state,n,i.from,i.to)),{annotations:M.of(e.completion)})):n(t,e.completion,i.from,i.to),!0)}const st=z(nt,it);function lt(t,e="option"){return o=>{let n=o.state.field(nt,!1);if(!n||!n.open||n.open.disabled||Date.now()-n.open.timestamp<o.state.facet(U).interactionDelay)return!1;let i,s=1;"page"==e&&(i=y(o,n.open.tooltip))&&(s=Math.max(2,Math.floor(i.dom.offsetHeight/i.dom.querySelector("li").offsetHeight)-1));let{length:l}=n.open.options,r=n.open.selected>-1?n.open.selected+s*(t?1:-1):t?0:l-1;return r<0?r="page"==e?0:l-1:r>=l&&(r="page"==e?l-1:0),o.dispatch({effects:ot.of(r)}),!0}}class rt{constructor(t,e){this.active=t,this.context=e,this.time=Date.now(),this.updates=[],this.done=void 0}}const at=x.fromClass(class{constructor(t){this.view=t,this.debounceUpdate=-1,this.running=[],this.debounceAccept=-1,this.pendingStart=!1,this.composing=0;for(let e of t.state.field(nt).active)1==e.state&&this.startQuery(e)}update(t){let e=t.state.field(nt);if(!t.selectionSet&&!t.docChanged&&t.startState.field(nt)==e)return;let o=t.transactions.some((t=>(t.selection||t.docChanged)&&!J(t)));for(let e=0;e<this.running.length;e++){let n=this.running[e];if(o||n.updates.length+t.transactions.length>50&&Date.now()-n.time>1e3){for(let t of n.context.abortListeners)try{t()}catch(t){C(this.view.state,t)}n.context.abortListeners=null,this.running.splice(e--,1)}else n.updates.push(...t.transactions)}this.debounceUpdate>-1&&clearTimeout(this.debounceUpdate),t.transactions.some((t=>t.effects.some((t=>t.is($)))))&&(this.pendingStart=!0);let n=this.pendingStart?50:t.state.facet(U).activateOnTypingDelay;if(this.debounceUpdate=e.active.some((t=>1==t.state&&!this.running.some((e=>e.active.source==t.source))))?setTimeout((()=>this.startUpdate()),n):-1,0!=this.composing)for(let e of t.transactions)"input"==J(e)?this.composing=2:2==this.composing&&e.selection&&(this.composing=3)}startUpdate(){this.debounceUpdate=-1,this.pendingStart=!1;let{state:t}=this.view,e=t.field(nt);for(let t of e.active)1!=t.state||this.running.some((e=>e.active.source==t.source))||this.startQuery(t)}startQuery(t){let{state:e}=this.view,o=L(e),n=new T(e,o,t.explicitPos==o),i=new rt(t,n);this.running.push(i),Promise.resolve(t.source(n)).then((t=>{i.context.aborted||(i.done=t||null,this.scheduleAccept())}),(t=>{this.view.dispatch({effects:F.of(null)}),C(this.view.state,t)}))}scheduleAccept(){this.running.every((t=>void 0!==t.done))?this.accept():this.debounceAccept<0&&(this.debounceAccept=setTimeout((()=>this.accept()),this.view.state.facet(U).updateSyncTime))}accept(){var t;this.debounceAccept>-1&&clearTimeout(this.debounceAccept),this.debounceAccept=-1;let e=[],o=this.view.state.facet(U);for(let n=0;n<this.running.length;n++){let i=this.running[n];if(void 0===i.done)continue;if(this.running.splice(n--,1),i.done){let n=new tt(i.active.source,i.active.explicitPos,i.done,i.done.from,null!==(t=i.done.to)&&void 0!==t?t:L(i.updates.length?i.updates[0].startState:this.view.state));for(let t of i.updates)n=n.update(t,o);if(n.hasResult()){e.push(n);continue}}let s=this.view.state.field(nt).active.find((t=>t.source==i.active.source));if(s&&1==s.state)if(null==i.done){let t=new Z(i.active.source,0);for(let e of i.updates)t=t.update(e,o);1!=t.state&&e.push(t)}else this.startQuery(s)}e.length&&this.view.dispatch({effects:et.of(e)})}},{eventHandlers:{blur(t){let e=this.view.state.field(nt,!1);if(e&&e.tooltip&&this.view.state.facet(U).closeOnBlur){let o=e.open&&y(this.view,e.open.tooltip);o&&o.dom.contains(t.relatedTarget)||setTimeout((()=>this.view.dispatch({effects:F.of(null)})),10)}},compositionstart(){this.composing=1},compositionend(){3==this.composing&&setTimeout((()=>this.view.dispatch({effects:$.of(!1)})),20),this.composing=0}}}),ct=g.baseTheme({".cm-tooltip.cm-tooltip-autocomplete":{"& > ul":{fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden auto",maxWidth_fallback:"700px",maxWidth:"min(700px, 95vw)",minWidth:"250px",maxHeight:"10em",height:"100%",listStyle:"none",margin:0,padding:0,"& > li, & > completion-section":{padding:"1px 3px",lineHeight:1.2},"& > li":{overflowX:"hidden",textOverflow:"ellipsis",cursor:"pointer"},"& > completion-section":{display:"list-item",borderBottom:"1px solid silver",paddingLeft:"0.5em",opacity:.7}}},"&light .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#17c",color:"white"},"&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#777"},"&dark .cm-tooltip-autocomplete ul li[aria-selected]":{background:"#347",color:"white"},"&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]":{background:"#444"},".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after":{content:'"···"',opacity:.5,display:"block",textAlign:"center"},".cm-tooltip.cm-completionInfo":{position:"absolute",padding:"3px 9px",width:"max-content",maxWidth:"400px",boxSizing:"border-box"},".cm-completionInfo.cm-completionInfo-left":{right:"100%"},".cm-completionInfo.cm-completionInfo-right":{left:"100%"},".cm-completionInfo.cm-completionInfo-left-narrow":{right:"30px"},".cm-completionInfo.cm-completionInfo-right-narrow":{left:"30px"},"&light .cm-snippetField":{backgroundColor:"#00000022"},"&dark .cm-snippetField":{backgroundColor:"#ffffff22"},".cm-snippetFieldPosition":{verticalAlign:"text-top",width:0,height:"1.15em",display:"inline-block",margin:"0 -0.7px -.7em",borderLeft:"1.4px dotted #888"},".cm-completionMatchedText":{textDecoration:"underline"},".cm-completionDetail":{marginLeft:"0.5em",fontStyle:"italic"},".cm-completionIcon":{fontSize:"90%",width:".8em",display:"inline-block",textAlign:"center",paddingRight:".6em",opacity:"0.6",boxSizing:"content-box"},".cm-completionIcon-function, .cm-completionIcon-method":{"&:after":{content:"'ƒ'"}},".cm-completionIcon-class":{"&:after":{content:"'○'"}},".cm-completionIcon-interface":{"&:after":{content:"'◌'"}},".cm-completionIcon-variable":{"&:after":{content:"'𝑥'"}},".cm-completionIcon-constant":{"&:after":{content:"'𝐶'"}},".cm-completionIcon-type":{"&:after":{content:"'𝑡'"}},".cm-completionIcon-enum":{"&:after":{content:"'∪'"}},".cm-completionIcon-property":{"&:after":{content:"'□'"}},".cm-completionIcon-keyword":{"&:after":{content:"'🔑︎'"}},".cm-completionIcon-namespace":{"&:after":{content:"'▢'"}},".cm-completionIcon-text":{"&:after":{content:"'abc'",fontSize:"50%",verticalAlign:"middle"}}});class ht{constructor(t,e,o,n){this.field=t,this.line=e,this.from=o,this.to=n}}class pt{constructor(t,e,o){this.field=t,this.from=e,this.to=o}map(t){let e=t.mapPos(this.from,-1,c.TrackDel),o=t.mapPos(this.to,1,c.TrackDel);return null==e||null==o?null:new pt(this.field,e,o)}}class ft{constructor(t,e){this.lines=t,this.fieldPositions=e}instantiate(t,e){let o=[],n=[e],i=t.doc.lineAt(e),s=/^\s*/.exec(i.text)[0];for(let i of this.lines){if(o.length){let o=s,l=/^\t*/.exec(i)[0].length;for(let e=0;e<l;e++)o+=t.facet(D);n.push(e+o.length-l),i=o+i.slice(l)}o.push(i),e+=i.length+1}let l=this.fieldPositions.map((t=>new pt(t.field,n[t.line]+t.from,n[t.line]+t.to)));return{text:o,ranges:l}}static parse(t){let e,o=[],n=[],i=[];for(let s of t.split(/\r\n?|\n/)){for(;e=/[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(s);){let t=e[1]?+e[1]:null,l=e[2]||e[3]||"",r=-1;for(let e=0;e<o.length;e++)(null!=t?o[e].seq==t:l&&o[e].name==l)&&(r=e);if(r<0){let e=0;for(;e<o.length&&(null==t||null!=o[e].seq&&o[e].seq<t);)e++;o.splice(e,0,{seq:t,name:l}),r=e;for(let t of i)t.field>=r&&t.field++}i.push(new ht(r,n.length,e.index,e.index+l.length)),s=s.slice(0,e.index)+l+s.slice(e.index+e[0].length)}for(let t;t=/\\([{}])/.exec(s);){s=s.slice(0,t.index)+t[1]+s.slice(t.index+t[0].length);for(let e of i)e.line==n.length&&e.from>t.index&&(e.from--,e.to--)}n.push(s)}return new ft(n,i)}}let dt=I.widget({widget:new class extends O{toDOM(){let t=document.createElement("span");return t.className="cm-snippetFieldPosition",t}ignoreEvent(){return!1}}}),ut=I.mark({class:"cm-snippetField"});class mt{constructor(t,e){this.ranges=t,this.active=e,this.deco=I.set(t.map((t=>(t.from==t.to?dt:ut).range(t.from,t.to))))}map(t){let e=[];for(let o of this.ranges){let n=o.map(t);if(!n)return null;e.push(n)}return new mt(e,this.active)}selectionInsideField(t){return t.ranges.every((t=>this.ranges.some((e=>e.field==this.active&&e.from<=t.from&&e.to>=t.to))))}}const gt=a.define({map:(t,e)=>t&&t.map(e)}),vt=a.define(),bt=r.define({create:()=>null,update(t,e){for(let o of e.effects){if(o.is(gt))return o.value;if(o.is(vt)&&t)return new mt(t.ranges,o.value)}return t&&e.docChanged&&(t=t.map(e.changes)),t&&e.selection&&!t.selectionInsideField(e.selection)&&(t=null),t},provide:t=>g.decorations.from(t,(t=>t?t.deco:I.none))});function wt(t,e){return o.create(t.filter((t=>t.field==e)).map((t=>o.range(t.from,t.to))))}function yt(t){let e=ft.parse(t);return(t,o,n,i)=>{let{text:s,ranges:l}=e.instantiate(t.state,n),r={changes:{from:n,to:i,insert:u.of(s)},scrollIntoView:!0,annotations:o?[M.of(o),m.userEvent.of("input.complete")]:void 0};if(l.length&&(r.selection=wt(l,0)),l.some((t=>t.field>0))){let e=new mt(l,0),o=r.effects=[gt.of(e)];void 0===t.state.field(bt,!1)&&o.push(a.appendConfig.of([bt,Ot,Dt,ct]))}t.dispatch(t.state.update(r))}}function xt(t){return({state:e,dispatch:o})=>{let n=e.field(bt,!1);if(!n||t<0&&0==n.active)return!1;let i=n.active+t,s=t>0&&!n.ranges.some((e=>e.field==i+t));return o(e.update({selection:wt(n.ranges,i),effects:gt.of(s?null:new mt(n.ranges,i)),scrollIntoView:!0})),!0}}const Ct=[{key:"Tab",run:xt(1),shift:xt(-1)},{key:"Escape",run:({state:t,dispatch:e})=>!!t.field(bt,!1)&&(e(t.update({effects:gt.of(null)})),!0)}],It=s.define({combine:t=>t.length?t[0]:Ct}),Ot=i.highest(v.compute([It],(t=>t.facet(It))));function kt(t,e){return Object.assign(Object.assign({},e),{apply:yt(t)})}const Dt=g.domEventHandlers({mousedown(t,e){let o,n=e.state.field(bt,!1);if(!n||null==(o=e.posAtCoords({x:t.clientX,y:t.clientY})))return!1;let i=n.ranges.find((t=>t.from<=o&&t.to>=o));return!(!i||i.field==n.active)&&(e.dispatch({selection:wt(n.ranges,i.field),effects:gt.of(n.ranges.some((t=>t.field>i.field))?new mt(n.ranges,i.field):null),scrollIntoView:!0}),!0)}}),Tt={brackets:["(","[","{","'",'"'],before:")]}:;>",stringPrefixes:[]},At=a.define({map(t,e){let o=e.mapPos(t,-1,c.TrackAfter);return null==o?void 0:o}}),Rt=new class extends h{};Rt.startSide=1,Rt.endSide=-1;const St=r.define({create:()=>p.empty,update(t,e){if(t=t.map(e.changes),e.selection){let o=e.state.doc.lineAt(e.selection.main.head);t=t.update({filter:t=>t>=o.from&&t<=o.to})}for(let o of e.effects)o.is(At)&&(t=t.update({add:[Rt.range(o.value,o.value+1)]}));return t}});function Et(){return[jt,St]}const Lt="()[]{}<>";function Pt(t){for(let e=0;e<Lt.length;e+=2)if(Lt.charCodeAt(e)==t)return Lt.charAt(e+1);return f(t<128?t:t+1)}function Mt(t,e){return t.languageDataAt("closeBrackets",e)[0]||Tt}const Bt="object"==typeof navigator&&/Android\b/.test(navigator.userAgent),jt=g.inputHandler.of(((o,n,i,s)=>{if((Bt?o.composing:o.compositionStarted)||o.state.readOnly)return!1;let l=o.state.selection.main;if(s.length>2||2==s.length&&1==t(e(s,0))||n!=l.from||i!=l.to)return!1;let r=function(t,o){let n=Mt(t,t.selection.main.head),i=n.brackets||Tt.brackets;for(let s of i){let l=Pt(e(s,0));if(o==s)return l==s?Wt(t,s,i.indexOf(s+s+s)>-1,n):Ut(t,s,l,n.before||Tt.before);if(o==l&&Ft(t,t.selection.main.from))return qt(t,s,l)}return null}(o.state,s);return!!r&&(o.dispatch(r),!0)})),$t=[{key:"Backspace",run:({state:n,dispatch:i})=>{if(n.readOnly)return!1;let s=Mt(n,n.selection.main.head).brackets||Tt.brackets,l=null,r=n.changeByRange((i=>{if(i.empty){let l=function(o,n){let i=o.sliceString(n-2,n);return t(e(i,0))==i.length?i:i.slice(1)}(n.doc,i.head);for(let t of s)if(t==l&&Nt(n.doc,i.head)==Pt(e(t,0)))return{changes:{from:i.head-t.length,to:i.head+t.length},range:o.cursor(i.head-t.length)}}return{range:l=i}}));return l||i(n.update(r,{scrollIntoView:!0,userEvent:"delete.backward"})),!l}}];function Ft(t,e){let o=!1;return t.field(St).between(0,t.doc.length,(t=>{t==e&&(o=!0)})),o}function Nt(o,n){let i=o.sliceString(n,n+2);return i.slice(0,t(e(i,0)))}function Ut(t,e,n,i){let s=null,l=t.changeByRange((l=>{if(!l.empty)return{changes:[{insert:e,from:l.from},{insert:n,from:l.to}],effects:At.of(l.to+e.length),range:o.range(l.anchor+e.length,l.head+e.length)};let r=Nt(t.doc,l.head);return!r||/\s/.test(r)||i.indexOf(r)>-1?{changes:{insert:e+n,from:l.head},effects:At.of(l.head+e.length),range:o.cursor(l.head+e.length)}:{range:s=l}}));return s?null:t.update(l,{scrollIntoView:!0,userEvent:"input.type"})}function qt(t,e,n){let i=null,s=t.changeByRange((e=>e.empty&&Nt(t.doc,e.head)==n?{changes:{from:e.head,to:e.head+n.length,insert:n},range:o.cursor(e.head+n.length)}:i={range:e}));return i?null:t.update(s,{scrollIntoView:!0,userEvent:"input.type"})}function Wt(t,e,i,s){let l=s.stringPrefixes||Tt.stringPrefixes,r=null,a=t.changeByRange((s=>{if(!s.empty)return{changes:[{insert:e,from:s.from},{insert:e,from:s.to}],effects:At.of(s.to+e.length),range:o.range(s.anchor+e.length,s.head+e.length)};let a,c=s.head,h=Nt(t.doc,c);if(h==e){if(Ht(t,c))return{changes:{insert:e+e,from:c},effects:At.of(c+e.length),range:o.cursor(c+e.length)};if(Ft(t,c)){let n=i&&t.sliceDoc(c,c+3*e.length)==e+e+e?e+e+e:e;return{changes:{from:c,to:c+n.length,insert:n},range:o.cursor(c+n.length)}}}else{if(i&&t.sliceDoc(c-2*e.length,c)==e+e&&(a=Vt(t,c-2*e.length,l))>-1&&Ht(t,a))return{changes:{insert:e+e+e+e,from:c},effects:At.of(c+e.length),range:o.cursor(c+e.length)};if(t.charCategorizer(c)(h)!=n.Word&&Vt(t,c,l)>-1&&!function(t,e,o,n){let i=k(t).resolveInner(e,-1),s=n.reduce(((t,e)=>Math.max(t,e.length)),0);for(let l=0;l<5;l++){let l=t.sliceDoc(i.from,Math.min(i.to,i.from+o.length+s)),r=l.indexOf(o);if(!r||r>-1&&n.indexOf(l.slice(0,r))>-1){let e=i.firstChild;for(;e&&e.from==i.from&&e.to-e.from>o.length+r;){if(t.sliceDoc(e.to-o.length,e.to)==o)return!1;e=e.firstChild}return!0}let a=i.to==e&&i.parent;if(!a)break;i=a}return!1}(t,c,e,l))return{changes:{insert:e+e,from:c},effects:At.of(c+e.length),range:o.cursor(c+e.length)}}return{range:r=s}}));return r?null:t.update(a,{scrollIntoView:!0,userEvent:"input.type"})}function Ht(t,e){let o=k(t).resolveInner(e+1);return o.parent&&o.from==e}function Vt(t,e,o){let i=t.charCategorizer(e);if(i(t.sliceDoc(e-1,e))!=n.Word)return e;for(let s of o){let o=e-s.length;if(t.sliceDoc(o,e)==s&&i(t.sliceDoc(o-1,o))!=n.Word)return o}return-1}function zt(t={}){return[nt,U.of(t),at,_t,ct]}const Qt=[{key:"Ctrl-Space",run:t=>!!t.state.field(nt,!1)&&(t.dispatch({effects:$.of(!0)}),!0)},{key:"Escape",run:t=>{let e=t.state.field(nt,!1);return!(!e||!e.active.some((t=>0!=t.state)))&&(t.dispatch({effects:F.of(null)}),!0)}},{key:"ArrowDown",run:lt(!0)},{key:"ArrowUp",run:lt(!1)},{key:"PageDown",run:lt(!0,"page")},{key:"PageUp",run:lt(!1,"page")},{key:"Enter",run:t=>{let e=t.state.field(nt,!1);return!(t.state.readOnly||!e||!e.open||e.open.selected<0||e.open.disabled||Date.now()-e.open.timestamp<t.state.facet(U).interactionDelay)&&it(t,e.open.options[e.open.selected])}}],_t=i.highest(v.computeN([U],(t=>t.facet(U).defaultKeymap?[Qt]:[])));export{Et as a,zt as b,R as c,$t as d,Qt as e,S as i,kt as s};
//# sourceMappingURL=index-CTWZX_TW.js.map
