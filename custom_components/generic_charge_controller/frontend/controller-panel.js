(function(){"use strict";const Z=globalThis,st=Z.ShadowRoot&&(Z.ShadyCSS===void 0||Z.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,rt=Symbol(),ut=new WeakMap;let gt=class{constructor(t,s,r){if(this._$cssResult$=!0,r!==rt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o;const s=this.t;if(st&&t===void 0){const r=s!==void 0&&s.length===1;r&&(t=ut.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&ut.set(s,t))}return t}toString(){return this.cssText}};const Ut=e=>new gt(typeof e=="string"?e:e+"",void 0,rt),U=(e,...t)=>{const s=e.length===1?e[0]:t.reduce((r,i,o)=>r+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[o+1],e[0]);return new gt(s,e,rt)},Mt=(e,t)=>{if(st)e.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of t){const r=document.createElement("style"),i=Z.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=s.cssText,e.appendChild(r)}},_t=st?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let s="";for(const r of t.cssRules)s+=r.cssText;return Ut(s)})(e):e;const{is:Lt,defineProperty:Dt,getOwnPropertyDescriptor:Nt,getOwnPropertyNames:It,getOwnPropertySymbols:Rt,getPrototypeOf:jt}=Object,J=globalThis,mt=J.trustedTypes,zt=mt?mt.emptyScript:"",Vt=J.reactiveElementPolyfillSupport,z=(e,t)=>e,Y={toAttribute(e,t){switch(t){case Boolean:e=e?zt:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=e!==null;break;case Number:s=e===null?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch{s=null}}return s}},it=(e,t)=>!Lt(e,t),ft={attribute:!0,type:String,converter:Y,reflect:!1,useDefault:!1,hasChanged:it};Symbol.metadata??=Symbol("metadata"),J.litPropertyMetadata??=new WeakMap;let M=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=ft){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(t,s),!s.noAccessor){const r=Symbol(),i=this.getPropertyDescriptor(t,r,s);i!==void 0&&Dt(this.prototype,t,i)}}static getPropertyDescriptor(t,s,r){const{get:i,set:o}=Nt(this.prototype,t)??{get(){return this[s]},set(a){this[s]=a}};return{get:i,set(a){const h=i?.call(this);o?.call(this,a),this.requestUpdate(t,h,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ft}static _$Ei(){if(this.hasOwnProperty(z("elementProperties")))return;const t=jt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(z("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(z("properties"))){const s=this.properties,r=[...It(s),...Rt(s)];for(const i of r)this.createProperty(i,s[i])}const t=this[Symbol.metadata];if(t!==null){const s=litPropertyMetadata.get(t);if(s!==void 0)for(const[r,i]of s)this.elementProperties.set(r,i)}this._$Eh=new Map;for(const[s,r]of this.elementProperties){const i=this._$Eu(s,r);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const s=[];if(Array.isArray(t)){const r=new Set(t.flat(1/0).reverse());for(const i of r)s.unshift(_t(i))}else t!==void 0&&s.push(_t(t));return s}static _$Eu(t,s){const r=s.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const r of s.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Mt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,r){this._$AK(t,r)}_$ET(t,s){const r=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,r);if(i!==void 0&&r.reflect===!0){const o=(r.converter?.toAttribute!==void 0?r.converter:Y).toAttribute(s,r.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,s){const r=this.constructor,i=r._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const o=r.getPropertyOptions(i),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:Y;this._$Em=i;const h=a.fromAttribute(s,o.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(t,s,r,i=!1,o){if(t!==void 0){const a=this.constructor;if(i===!1&&(o=this[t]),r??=a.getPropertyOptions(t),!((r.hasChanged??it)(o,s)||r.useDefault&&r.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,r))))return;this.C(t,s,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,s,{useDefault:r,reflect:i,wrapped:o},a){r&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??s??this[t]),o!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||r||(s=void 0),this._$AL.set(t,s)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[i,o]of r){const{wrapped:a}=o,h=this[i];a!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,o,h)}}let t=!1;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(s)):this._$EM()}catch(r){throw t=!1,this._$EM(),r}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(t){}firstUpdated(t){}};M.elementStyles=[],M.shadowRootOptions={mode:"open"},M[z("elementProperties")]=new Map,M[z("finalized")]=new Map,Vt?.({ReactiveElement:M}),(J.reactiveElementVersions??=[]).push("2.1.2");const ot=globalThis,vt=e=>e,X=ot.trustedTypes,$t=X?X.createPolicy("lit-html",{createHTML:e=>e}):void 0,yt="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,bt="?"+S,Bt=`<${bt}>`,T=document,V=()=>T.createComment(""),B=e=>e===null||typeof e!="object"&&typeof e!="function",at=Array.isArray,Wt=e=>at(e)||typeof e?.[Symbol.iterator]=="function",nt=`[ 	
\f\r]`,W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,xt=/-->/g,wt=/>/g,H=RegExp(`>|${nt}(?:([^\\s"'>=/]+)(${nt}*=${nt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ct=/'/g,Et=/"/g,At=/^(?:script|style|textarea|title)$/i,St=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),l=St(1),L=St(2),D=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),Pt=new WeakMap,k=T.createTreeWalker(T,129);function Ot(e,t){if(!at(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return $t!==void 0?$t.createHTML(t):t}const Ft=(e,t)=>{const s=e.length-1,r=[];let i,o=t===2?"<svg>":t===3?"<math>":"",a=W;for(let h=0;h<s;h++){const n=e[h];let _,d,p=-1,b=0;for(;b<n.length&&(a.lastIndex=b,d=a.exec(n),d!==null);)b=a.lastIndex,a===W?d[1]==="!--"?a=xt:d[1]!==void 0?a=wt:d[2]!==void 0?(At.test(d[2])&&(i=RegExp("</"+d[2],"g")),a=H):d[3]!==void 0&&(a=H):a===H?d[0]===">"?(a=i??W,p=-1):d[1]===void 0?p=-2:(p=a.lastIndex-d[2].length,_=d[1],a=d[3]===void 0?H:d[3]==='"'?Et:Ct):a===Et||a===Ct?a=H:a===xt||a===wt?a=W:(a=H,i=void 0);const C=a===H&&e[h+1].startsWith("/>")?" ":"";o+=a===W?n+Bt:p>=0?(r.push(_),n.slice(0,p)+yt+n.slice(p)+S+C):n+S+(p===-2?h:C)}return[Ot(e,o+(e[s]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),r]};class F{constructor({strings:t,_$litType$:s},r){let i;this.parts=[];let o=0,a=0;const h=t.length-1,n=this.parts,[_,d]=Ft(t,s);if(this.el=F.createElement(_,r),k.currentNode=this.el.content,s===2||s===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=k.nextNode())!==null&&n.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(const p of i.getAttributeNames())if(p.endsWith(yt)){const b=d[a++],C=i.getAttribute(p).split(S),j=/([.?@])?(.*)/.exec(b);n.push({type:1,index:o,name:j[2],strings:C,ctor:j[1]==="."?Gt:j[1]==="?"?Kt:j[1]==="@"?Zt:Q}),i.removeAttribute(p)}else p.startsWith(S)&&(n.push({type:6,index:o}),i.removeAttribute(p));if(At.test(i.tagName)){const p=i.textContent.split(S),b=p.length-1;if(b>0){i.textContent=X?X.emptyScript:"";for(let C=0;C<b;C++)i.append(p[C],V()),k.nextNode(),n.push({type:2,index:++o});i.append(p[b],V())}}}else if(i.nodeType===8)if(i.data===bt)n.push({type:2,index:o});else{let p=-1;for(;(p=i.data.indexOf(S,p+1))!==-1;)n.push({type:7,index:o}),p+=S.length-1}o++}}static createElement(t,s){const r=T.createElement("template");return r.innerHTML=t,r}}function N(e,t,s=e,r){if(t===D)return t;let i=r!==void 0?s._$Co?.[r]:s._$Cl;const o=B(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(e),i._$AT(e,s,r)),r!==void 0?(s._$Co??=[])[r]=i:s._$Cl=i),i!==void 0&&(t=N(e,i._$AS(e,t.values),i,r)),t}class qt{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:s},parts:r}=this._$AD,i=(t?.creationScope??T).importNode(s,!0);k.currentNode=i;let o=k.nextNode(),a=0,h=0,n=r[0];for(;n!==void 0;){if(a===n.index){let _;n.type===2?_=new q(o,o.nextSibling,this,t):n.type===1?_=new n.ctor(o,n.name,n.strings,this,t):n.type===6&&(_=new Jt(o,this,t)),this._$AV.push(_),n=r[++h]}a!==n?.index&&(o=k.nextNode(),a++)}return k.currentNode=T,i}p(t){let s=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,s),s+=r.strings.length-2):r._$AI(t[s])),s++}}class q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,r,i){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=N(this,t,s),B(t)?t===c||t==null||t===""?(this._$AH!==c&&this._$AR(),this._$AH=c):t!==this._$AH&&t!==D&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Wt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==c&&B(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:s,_$litType$:r}=t,i=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=F.createElement(Ot(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(s);else{const o=new qt(i,this),a=o.u(this.options);o.p(s),this.T(a),this._$AH=o}}_$AC(t){let s=Pt.get(t.strings);return s===void 0&&Pt.set(t.strings,s=new F(t)),s}k(t){at(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let r,i=0;for(const o of t)i===s.length?s.push(r=new q(this.O(V()),this.O(V()),this,this.options)):r=s[i],r._$AI(o),i++;i<s.length&&(this._$AR(r&&r._$AB.nextSibling,i),s.length=i)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t!==this._$AB;){const r=vt(t).nextSibling;vt(t).remove(),t=r}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,r,i,o){this.type=1,this._$AH=c,this._$AN=void 0,this.element=t,this.name=s,this._$AM=i,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=c}_$AI(t,s=this,r,i){const o=this.strings;let a=!1;if(o===void 0)t=N(this,t,s,0),a=!B(t)||t!==this._$AH&&t!==D,a&&(this._$AH=t);else{const h=t;let n,_;for(t=o[0],n=0;n<o.length-1;n++)_=N(this,h[r+n],s,n),_===D&&(_=this._$AH[n]),a||=!B(_)||_!==this._$AH[n],_===c?t=c:t!==c&&(t+=(_??"")+o[n+1]),this._$AH[n]=_}a&&!i&&this.j(t)}j(t){t===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Gt extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===c?void 0:t}}class Kt extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==c)}}class Zt extends Q{constructor(t,s,r,i,o){super(t,s,r,i,o),this.type=5}_$AI(t,s=this){if((t=N(this,t,s,0)??c)===D)return;const r=this._$AH,i=t===c&&r!==c||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,o=t!==c&&(r===c||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class Jt{constructor(t,s,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t)}}const Yt=ot.litHtmlPolyfillSupport;Yt?.(F,q),(ot.litHtmlVersions??=[]).push("3.3.2");const Xt=(e,t,s)=>{const r=s?.renderBefore??t;let i=r._$litPart$;if(i===void 0){const o=s?.renderBefore??null;r._$litPart$=i=new q(t.insertBefore(V(),o),o,void 0,s??{})}return i._$AI(e),i};const lt=globalThis;class E extends M{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Xt(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return D}}E._$litElement$=!0,E.finalized=!0,lt.litElementHydrateSupport?.({LitElement:E});const Qt=lt.litElementPolyfillSupport;Qt?.({LitElement:E}),(lt.litElementVersions??=[]).push("4.2.2");const I=e=>(t,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const te={attribute:!0,type:String,converter:Y,reflect:!1,hasChanged:it},ee=(e=te,t,s)=>{const{kind:r,metadata:i}=s;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),r==="setter"&&((e=Object.create(e)).wrapped=!0),o.set(s.name,e),r==="accessor"){const{name:a}=s;return{set(h){const n=t.get.call(this);t.set.call(this,h),this.requestUpdate(a,n,e,!0,h)},init(h){return h!==void 0&&this.C(a,void 0,e,h),h}}}if(r==="setter"){const{name:a}=s;return function(h){const n=this[a];t.call(this,h),this.requestUpdate(a,n,e,!0,h)}}throw Error("Unsupported decorator location: "+r)};function u(e){return(t,s)=>typeof s=="object"?ee(e,t,s):((r,i,o)=>{const a=i.hasOwnProperty(o);return i.constructor.createProperty(o,r),a?Object.getOwnPropertyDescriptor(i,o):void 0})(e,t,s)}function g(e){return u({...e,state:!0,attribute:!1})}const se=async()=>{if(!(customElements.get("ha-entity-picker")&&customElements.get("ha-form"))){if(!customElements.get("ha-selector")){await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");e.hass={panels:[{url_path:"tmp",component_name:"config"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await document.createElement("ha-panel-config").routerOptions.routes.automation.load()}if(!customElements.get("ha-entity-picker"))try{await(await(await window.loadCardHelpers()).createCardElement({type:"entities",entities:[]})).constructor.getConfigElement()}catch{}if(!customElements.get("ha-entity-picker"))try{await Promise.race([customElements.whenDefined("ha-selector"),new Promise((s,r)=>setTimeout(()=>r(new Error("timeout")),1e4))]);const e=document.querySelector("home-assistant")?.hass,t=document.createElement("div");t.style.cssText="position:fixed;left:-9999px;opacity:0;pointer-events:none",document.body.appendChild(t);try{const s=document.createElement("ha-selector");s.hass=e,s.selector={entity:{}},t.appendChild(s),await Promise.race([customElements.whenDefined("ha-entity-picker"),new Promise(r=>setTimeout(r,5e3))])}finally{t.remove()}}catch{}if(await customElements.whenDefined("ha-card"),await Promise.race([customElements.whenDefined("ha-form"),new Promise(e=>setTimeout(e,1e4))]),!customElements.get("ha-date-range-picker"))try{await(await window.loadCardHelpers()).createCardElement({type:"energy-date-selection",entities:[]}),await Promise.race([customElements.whenDefined("ha-date-range-picker"),new Promise((t,s)=>setTimeout(s,5e3))])}catch{}if(!customElements.get("ha-chart-base"))try{await(await window.loadCardHelpers()).createCardElement({type:"statistics-graph",entities:[]}),await Promise.race([customElements.whenDefined("ha-chart-base"),new Promise((t,s)=>setTimeout(s,5e3))])}catch{}}},ht=e=>{const t=parseFloat(e);return Number.isFinite(t)?t:0},re=(e,t)=>{const s=n=>{const _=t.entities[n];return _?e.states[_]:void 0},r=s("circuit_current"),i=n=>ht(r?.attributes[`state_circuitTotalPhaseConductorCurrentL${n}`]),[o,a,h]=[i(1),i(2),i(3)];return{id:t.device_id,name:t.name,serialNumber:t.serial,status:s("status")?.state??"unknown",power:ht(s("power")?.state),currentLimit:ht(s("max_circuit_limit")?.state),currentUsage:Math.max(o,a,h),l1_usage:o,l2_usage:a,l3_usage:h}},ie="M12,3A1,1 0 0,1 13,4V4.39C17.65,5.15 21,7.45 21,10.13C21,11.19 19.82,12.14 18,12.8V19H19V21H5V19H6V12.8C4.18,12.14 3,11.19 3,10.13C3,7.45 6.35,5.15 11,4.39V4A1,1 0 0,1 12,3M12,6.13C8.13,6.13 5,7.45 5,9.13C5,10.81 8.13,12.13 12,12.13C15.87,12.13 19,10.81 19,9.13C19,7.45 15.87,6.13 12,6.13M12,14.13C9.8,14.13 8,15.93 8,18.13V19H16V18.13C16,15.93 14.2,14.13 12,14.13Z",oe="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.66,19.59 13.4,20 12,20C9.8,20 8,18.2 8,16V11.27L2,5.27M12,2C12.55,2 13,2.45 13,3V3.39C17.65,4.15 21,6.45 21,9.13C21,10.19 19.82,11.14 18,11.8V17.27L13.73,13C15.6,12.59 17,11.5 17,10.13C17,8.45 13.87,7.13 10,7.13C9.05,7.13 8.15,7.21 7.34,7.34L5.11,5.11C6.7,4.24 8.74,3.64 11,3.39V3C11,2.45 11.45,2 12,2M12,14C13.2,14 14.24,14.53 14.92,15.35L10.65,11.08C10.22,11.68 10,12.31 10,13C10,14.1 10.9,15 12,15V14Z";var ae=Object.defineProperty,ne=Object.getOwnPropertyDescriptor,$=(e,t,s,r)=>{for(var i=r>1?void 0:r?ne(t,s):t,o=e.length-1,a;o>=0;o--)(a=e[o])&&(i=(r?a(t,s,i):a(i))||i);return r&&i&&ae(t,s,i),i};let f=class extends E{constructor(){super(...arguments),this.chargerId="",this.name="",this.serialNumber="",this.status="",this.power=0,this.currentLimit=0,this.currentUsage=0,this.l1Usage=0,this.l2Usage=0,this.l3Usage=0,this.configured=!1,this.targets=null,this.mode=null}_formatTarget(e){return e===null?"–":e.toFixed(0)}render(){const e=this.configured?this.status==="charging"?"accent-charging":"accent-idle":"accent-unconfigured";return l`
      <ha-card .header=${this.name} @click=${this._handleClick}>
        <div class="accent ${e}"></div>
        <ha-svg-icon
          class="configured-icon ${this.configured?"is-configured":""}"
          .path=${this.configured?ie:oe}
          title=${this.configured?"Load balancing configured":"Load balancing NOT configured"}
        ></ha-svg-icon>

        <div class="card-content">
          <div class="row">
            <span class="label">Serial:</span>
            <span class="value">${this.serialNumber}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span class="value status ${this.status.toLowerCase()}">${this.status}</span>
          </div>
          <div class="row">
            <span class="label">Power:</span>
            <span class="value">${this.power.toFixed(1)} kW</span>
          </div>
          <div class="row">
            <span class="label">Usage (P1/P2/P3):</span>
            <span class="value">${this.l1Usage.toFixed(1)} / ${this.l2Usage.toFixed(1)} / ${this.l3Usage.toFixed(1)} A</span>
          </div>
          ${this.configured&&this.targets?l`
              <div class="row">
                <span class="label">Target (P1/P2/P3):</span>
                <span class="value">${this.targets.map(t=>this._formatTarget(t)).join(" / ")} A</span>
              </div>
              <div class="row">
                <span class="label">Load balancing:</span>
                <span class="value mode ${this.mode??""}">${this.mode??"unknown"}</span>
              </div>`:""}
          <div class="row">
            <span class="label">Current Limit:</span>
            <span class="value">${this.currentLimit} A</span>
          </div>
          <div class="progress-bar">
             <div class="progress" style="width: ${Math.min(100,this.currentUsage/this.currentLimit*100)}%"></div>
          </div>
        </div>
        <div class="card-actions">
          ${this.configured?l`<ha-button>Details</ha-button>`:l`<ha-button class="warning">Configure</ha-button>`}
        </div>
      </ha-card>
    `}_handleClick(){this.dispatchEvent(new CustomEvent("charger-selected",{detail:{chargerId:this.chargerId},bubbles:!0,composed:!0}))}};f.styles=U`
    ha-card {
      cursor: pointer;
      transition: box-shadow 0.2s ease, transform 0.15s ease;
      overflow: hidden;
      position: relative;
      height: 100%;
      box-sizing: border-box;
    }

    ha-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .configured-icon {
      position: absolute;
      top: 16px;
      right: 16px;
      color: var(--disabled-text-color);
      z-index: 1;
    }

    .configured-icon.is-configured {
      color: var(--success-color, #4caf50);
    }

    .card-content {
      flex-grow: 1;
      padding-top: 0;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .label {
      color: var(--secondary-text-color);
    }

    .value {
      font-weight: 500;
    }

    .status.charging {
      color: var(--success-color, #4caf50);
    }

    .mode.limited {
      color: var(--warning-color, #ff9800);
    }

    .mode.failsafe {
      color: var(--error-color);
    }

    .status.idle {
      color: var(--secondary-text-color);
    }

    .progress-bar {
      height: 8px;
      background-color: var(--secondary-background-color);
      border-radius: 4px;
      margin-top: 12px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background-color: var(--primary-color);
      transition: width 0.5s ease-in-out;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      border-top: 1px solid var(--divider-color);
      padding: 4px 8px;
    }

    /* Colored left accent based on mode */
    .accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }

    .accent-charging {
      background: var(--warning-color, #00ff88);
    }

    .accent-idle {
      background: var(--disabled-text-color, #bdbdbd);
    }

    .accent-unconfigured {
      background: transparent;
    }
    
    .warning {
      --mdc-theme-primary: var(--error-color);
    }
  `,$([u()],f.prototype,"chargerId",2),$([u()],f.prototype,"name",2),$([u()],f.prototype,"serialNumber",2),$([u()],f.prototype,"status",2),$([u({type:Number})],f.prototype,"power",2),$([u({type:Number})],f.prototype,"currentLimit",2),$([u({type:Number})],f.prototype,"currentUsage",2),$([u({type:Number})],f.prototype,"l1Usage",2),$([u({type:Number})],f.prototype,"l2Usage",2),$([u({type:Number})],f.prototype,"l3Usage",2),$([u({type:Boolean})],f.prototype,"configured",2),$([u({attribute:!1})],f.prototype,"targets",2),$([u()],f.prototype,"mode",2),f=$([I("cc-charger-card")],f);var le=Object.defineProperty,he=Object.getOwnPropertyDescriptor,P=(e,t,s,r)=>{for(var i=r>1?void 0:r?he(t,s):t,o=e.length-1,a;o>=0;o--)(a=e[o])&&(i=(r?a(t,s,i):a(i))||i);return r&&i&&le(t,s,i),i};const Tt=["L1","L2","L3"],ce=[{value:"P1",label:"Charger phase 1"},{value:"P2",label:"Charger phase 2"},{value:"P3",label:"Charger phase 3"}];let A=class extends E{constructor(){super(...arguments),this.chargerId="",this.households={},this.config=null,this._data={L1:"P1",L2:"P2",L3:"P3"},this._error="",this._saving=!1}willUpdate(e){e.has("config")&&this.config&&(this._data={household_id:this.config.household_id,...this.config.phase_map})}get _schema(){return[{name:"household_id",required:!0,selector:{select:{mode:"dropdown",options:Object.values(this.households).map(e=>({value:e.household_id,label:e.name}))}}},...Tt.map(e=>({name:e,required:!0,selector:{select:{mode:"dropdown",options:ce}}}))]}get _phaseMapValid(){return new Set(Tt.map(e=>this._data[e])).size===3}render(){if(Object.keys(this.households).length===0)return l`
        <ha-card header="Load balancing configuration">
          <div class="card-content">
            <p class="warning-text">
              No households are configured. Add a household in the "Households" tab before
              configuring load balancing for this charger.
            </p>
          </div>
        </ha-card>
      `;const e=!!this._data.household_id&&this._phaseMapValid;return l`
      <ha-card header="Load balancing configuration">
        <div class="card-content">
          <p class="description">
            Select the household this charger is connected to, and which charger phase each
            household phase is wired to.
          </p>
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${this._schema}
            .computeLabel=${t=>t.name==="household_id"?"Household":`Household ${t.name}`}
            @value-changed=${t=>this._data=t.detail.value}
          ></ha-form>
          ${this._phaseMapValid?c:l`<p class="error">Each charger phase can only be selected once.</p>`}
          ${this._error?l`<p class="error">${this._error}</p>`:c}
        </div>
        <div class="card-actions">
          ${this.config?l`<ha-button variant="danger" appearance="plain" @click=${this._remove}>
                Remove configuration
              </ha-button>`:c}
          <ha-button .disabled=${!e||this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `}async _call(e){this._saving=!0,this._error="";try{await this.hass.callWS(e),this.dispatchEvent(new CustomEvent("config-saved",{bubbles:!0,composed:!0}))}catch(t){this._error=t?.message??String(t)}finally{this._saving=!1}}_save(){const{household_id:e,L1:t,L2:s,L3:r}=this._data;return this._call({type:"generic_charge_controller/chargers/save",charger_id:this.chargerId,config:{type:"easee",household_id:e,phase_map:{L1:t,L2:s,L3:r}}})}_remove(){return this._call({type:"generic_charge_controller/chargers/delete",charger_id:this.chargerId})}};A.styles=U`
    .description {
      color: var(--secondary-text-color);
      margin-top: 0;
    }

    .warning-text,
    .error {
      color: var(--error-color);
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `,P([u({attribute:!1})],A.prototype,"hass",2),P([u()],A.prototype,"chargerId",2),P([u({attribute:!1})],A.prototype,"households",2),P([u({attribute:!1})],A.prototype,"config",2),P([g()],A.prototype,"_data",2),P([g()],A.prototype,"_error",2),P([g()],A.prototype,"_saving",2),A=P([I("cc-load-balancer-settings")],A);var de=Object.defineProperty,pe=Object.getOwnPropertyDescriptor,ct=(e,t,s,r)=>{for(var i=r>1?void 0:r?pe(t,s):t,o=e.length-1,a;o>=0;o--)(a=e[o])&&(i=(r?a(t,s,i):a(i))||i);return r&&i&&de(t,s,i),i};const ue=["l1","l2","l3"];let G=class extends E{_phaseValue(e){const t=this.hass.states[e];if(!t||t.state==="unavailable"||t.state==="unknown")return l`<span class="unavailable">unavailable</span>`;const s=t.attributes.unit_of_measurement??"";return l`${t.state} ${s}`}render(){const e=this.household;return l`
      <ha-card .header=${e.name}>
        <div class="card-content">
          <div class="row">
            <span class="label">Main fuse:</span>
            <span class="value">${e.fuse_a} A</span>
          </div>
          ${ue.map(t=>{const s=e[`${t}_entity`];return l`
              <div class="row">
                <span class="label" title=${s}>${t.toUpperCase()}:</span>
                <span class="value">${this._phaseValue(s)}</span>
              </div>
            `})}
        </div>
        <div class="card-actions">
          <ha-button variant="danger" appearance="plain" @click=${this._delete}>Delete</ha-button>
          <ha-button @click=${this._edit}>Edit</ha-button>
        </div>
      </ha-card>
    `}_fire(e){this.dispatchEvent(new CustomEvent(e,{detail:{householdId:this.household.household_id},bubbles:!0,composed:!0}))}_edit(){this._fire("household-edit")}_delete(){this._fire("household-delete")}};G.styles=U`
    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-content {
      flex-grow: 1;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .label {
      color: var(--secondary-text-color);
    }

    .value {
      font-weight: 500;
    }

    .unavailable {
      color: var(--error-color);
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `,ct([u({attribute:!1})],G.prototype,"hass",2),ct([u({attribute:!1})],G.prototype,"household",2),G=ct([I("cc-household-card")],G);var ge=Object.defineProperty,_e=Object.getOwnPropertyDescriptor,R=(e,t,s,r)=>{for(var i=r>1?void 0:r?_e(t,s):t,o=e.length-1,a;o>=0;o--)(a=e[o])&&(i=(r?a(t,s,i):a(i))||i);return r&&i&&ge(t,s,i),i};const dt=e=>({name:e,required:!0,selector:{entity:{filter:{domain:"sensor",device_class:"current"}}}}),me=[{name:"name",required:!0,selector:{text:{}}},{name:"fuse_a",required:!0,selector:{number:{min:6,max:250,step:1,mode:"box",unit_of_measurement:"A"}}},dt("l1_entity"),dt("l2_entity"),dt("l3_entity")],fe={name:"Name",fuse_a:"Main fuse rating",l1_entity:"Current sensor L1",l2_entity:"Current sensor L2",l3_entity:"Current sensor L3"};let O=class extends E{constructor(){super(...arguments),this.household=null,this._data={fuse_a:20},this._error="",this._saving=!1}willUpdate(e){if(e.has("household")&&this.household){const{household_id:t,...s}=this.household;this._data=s}}get _valid(){const e=this._data;return!!(e.name?.trim()&&e.fuse_a&&e.l1_entity&&e.l2_entity&&e.l3_entity)}render(){return l`
      <ha-card .header=${this.household?`Edit ${this.household.name}`:"New household"}>
        <div class="card-content">
          <p class="description">
            The main fuse rating applies to all three phases. Pick the sensors that report the
            total current per phase for the household, for example from a power meter reader.
          </p>
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${me}
            .computeLabel=${e=>fe[e.name]??e.name}
            @value-changed=${e=>this._data=e.detail.value}
          ></ha-form>
          ${this._error?l`<p class="error">${this._error}</p>`:c}
        </div>
        <div class="card-actions">
          <ha-button appearance="plain" @click=${this._cancel}>Cancel</ha-button>
          <ha-button .disabled=${!this._valid||this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `}async _save(){this._saving=!0,this._error="";try{await this.hass.callWS({type:"generic_charge_controller/households/save",...this.household?{household_id:this.household.household_id}:{},config:this._data}),this.dispatchEvent(new CustomEvent("household-saved",{bubbles:!0,composed:!0}))}catch(e){this._error=e?.message??String(e)}finally{this._saving=!1}}_cancel(){this.dispatchEvent(new CustomEvent("editor-closed",{bubbles:!0,composed:!0}))}};O.styles=U`
    .description {
      color: var(--secondary-text-color);
      margin-top: 0;
    }

    .error {
      color: var(--error-color);
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `,R([u({attribute:!1})],O.prototype,"hass",2),R([u({attribute:!1})],O.prototype,"household",2),R([g()],O.prototype,"_data",2),R([g()],O.prototype,"_error",2),R([g()],O.prototype,"_saving",2),O=R([I("cc-household-editor")],O);var ve=Object.defineProperty,$e=Object.getOwnPropertyDescriptor,w=(e,t,s,r)=>{for(var i=r>1?void 0:r?$e(t,s):t,o=e.length-1,a;o>=0;o--)(a=e[o])&&(i=(r?a(t,s,i):a(i))||i);return r&&i&&ve(t,s,i),i};const ye=[{hours:6,label:"6 h"},{hours:24,label:"24 h"},{hours:72,label:"3 d"},{hours:168,label:"7 d"}],tt=["P1","P2","P3"],be=[{state:"charging",label:"Charging"},{state:"limited",label:"Limited"},{state:"failsafe",label:"Failsafe"},{state:"idle",label:"Idle"}],xe=6e4,pt=200,x={top:10,right:52,bottom:22,left:42},Ht=10,we=8,Ce=2;function et(e,t){let s=0,r=e.length-1,i;for(;s<=r;){const o=s+r>>1;e[o].t<=t?(i=e[o],s=o+1):r=o-1}return i}function kt(e){for(const t of[1,2,5,10,20,50])if(e/t<=5)return t;return 100}let y=class extends E{constructor(){super(...arguments),this.targetEntities=[],this.modeEntity=null,this._hours=24,this._targets=[],this._modes=[],this._range=[0,0],this._loading=!1,this._error="",this._width=600,this._hoverT=null,this._fetchKey=""}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>this._fetch(),xe)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer),this._resizeObserver?.disconnect()}firstUpdated(){const e=this.renderRoot.querySelector(".chart");this._resizeObserver=new ResizeObserver(t=>{const s=Math.round(t[0].contentRect.width);s>0&&(this._width=s)}),this._resizeObserver.observe(e)}willUpdate(){this.toggleAttribute("dark",!!this.hass?.themes?.darkMode);const e=JSON.stringify([this.targetEntities,this.modeEntity,this._hours]);e!==this._fetchKey&&this.targetEntities.length>0&&(this._fetchKey=e,this._fetch())}async _fetch(){if(this.targetEntities.length===0)return;const e=Date.now(),t=e-this._hours*36e5,s=[...this.targetEntities,...this.modeEntity?[this.modeEntity]:[]];this._loading=!0;try{const r=await this.hass.callWS({type:"history/history_during_period",start_time:new Date(t).toISOString(),end_time:new Date(e).toISOString(),entity_ids:s,minimal_response:!0,no_attributes:!0,significant_changes_only:!1}),i=o=>(r[o]??[]).map(a=>({t:Math.max(a.lu*1e3,t),s:a.s}));this._targets=this.targetEntities.map(o=>i(o).map(({t:a,s:h})=>{const n=parseFloat(h);return{t:a,v:Number.isFinite(n)?n:null}})),this._modes=this.modeEntity?i(this.modeEntity):[],this._range=[t,e],this._error=""}catch(r){this._error=`History could not be loaded: ${r?.message??r}`}finally{this._loading=!1}}get _plotRight(){return this._width-x.right}_x(e){const[t,s]=this._range;return x.left+(e-t)/(s-t)*(this._plotRight-x.left)}get _yMax(){const e=this._targets.flat().map(r=>r.v??0),t=Math.max(10,...e),s=kt(t);return Math.ceil(t/s)*s}_y(e){return x.top+(1-e/this._yMax)*(pt-x.top-x.bottom)}_formatTime(e,t){return new Intl.DateTimeFormat(this.hass.language,{...t?{weekday:"short",day:"numeric"}:{},hour:"2-digit",minute:"2-digit"}).format(new Date(e))}_stepPath(e,t){const s=this._range[1];let r="",i=!1;return e.forEach((o,a)=>{const h=a+1<e.length?e[a+1].t:s;if(o.v===null){i=!1;return}const n=this._y(o.v)+t;r+=i?` V${n}`:` M${this._x(o.t)},${n}`,r+=` H${this._x(h)}`,i=!0}),r.trim()}_endLabels(){const e=this._targets.map((t,s)=>{const r=t[t.length-1];return r?.v!=null?{i:s,y:this._y(r.v),v:r.v}:null}).filter(t=>t!==null).sort((t,s)=>t.y-s.y);for(let t=1;t<e.length;t++)e[t].y=Math.max(e[t].y,e[t-1].y+12);return e}_onPointerMove(e){const t=e.currentTarget,s=e.clientX-t.getBoundingClientRect().left;if(s<x.left||s>this._plotRight){this._hoverT=null;return}const[r,i]=this._range;this._hoverT=r+(s-x.left)/(this._plotRight-x.left)*(i-r)}render(){return l`
      <ha-card header="Calculated charging currents">
        <div class="card-content">
          <div class="controls">
            <div class="ranges">
              ${ye.map(e=>l`
                  <button
                    class="range ${e.hours===this._hours?"active":""}"
                    @click=${()=>this._hours=e.hours}
                  >
                    ${e.label}
                  </button>
                `)}
            </div>
            ${this._renderLegend()}
          </div>
          ${this.targetEntities.length===0?l`<p class="hint">Save the load balancing configuration to start recording.</p>`:c}
          ${this._error?l`<p class="error">${this._error}</p>`:c}
          <div class="chart ${this._loading?"loading":""}">
            ${this._range[1]>0?this._renderChart():c}
          </div>
          ${this._range[1]>0?this._renderTable():c}
        </div>
      </ha-card>
    `}_renderLegend(){return l`
      <div class="legend">
        ${tt.map((e,t)=>l`<span class="key"><span class="line s${t+1}"></span>${e}</span>`)}
        ${this.modeEntity?be.map(e=>l`<span class="key"><span class="swatch ${e.state}"></span>${e.label}</span>`):c}
      </div>
    `}_renderChart(){const e=this._width,[t,s]=this._range,r=this._hours>24,i=kt(this._yMax),o=Array.from({length:this._yMax/i+1},(d,p)=>p*i),a=e<420?3:5,h=Array.from({length:a},(d,p)=>t+(s-t)*p/(a-1)),n=pt+we,_=n+(this.modeEntity?Ht:0)+2;return l`
      <svg
        width=${e}
        height=${_}
        role="img"
        aria-label="Target charging current per phase over time"
        @pointermove=${this._onPointerMove}
        @pointerleave=${()=>this._hoverT=null}
      >
        ${o.map(d=>L`
            <line class="grid" x1=${x.left} x2=${this._plotRight} y1=${this._y(d)} y2=${this._y(d)}></line>
            <text class="axis" x=${x.left-6} y=${this._y(d)} text-anchor="end" dominant-baseline="middle">${d===this._yMax?`${d} A`:d}</text>
          `)}
        ${h.map((d,p)=>L`
            <text
              class="axis"
              x=${this._x(d)}
              y=${pt-x.bottom+15}
              text-anchor=${p===0?"start":p===a-1?"end":"middle"}
            >${this._formatTime(d,r)}</text>
          `)}
        ${this._targets.map((d,p)=>L`
            <path class="series s${p+1}" d=${this._stepPath(d,(p-1)*Ce)}></path>
          `)}
        ${this._endLabels().map(d=>L`
            <text class="end-label" x=${this._plotRight+6} y=${d.y} dominant-baseline="middle">
              ${tt[d.i]} ${d.v}
            </text>
          `)}
        ${this.modeEntity?this._modes.map((d,p)=>{const b=this._x(d.t),C=this._x(p+1<this._modes.length?this._modes[p+1].t:s),j=C-b>3?C-b-1:C-b;return L`<rect class="band ${d.s}" x=${b} y=${n} width=${Math.max(j,0)} height=${Ht} rx="2"></rect>`}):c}
        ${this._hoverT!==null?L`<line class="crosshair" x1=${this._x(this._hoverT)} x2=${this._x(this._hoverT)} y1=${x.top} y2=${_}></line>`:c}
      </svg>
      ${this._hoverT!==null?this._renderTooltip(this._hoverT):c}
    `}_renderTooltip(e){const t=this._x(e),s=t>this._width/2,r=et(this._modes,e)?.s;return l`
      <div class="tooltip" style="${s?`right:${this._width-t+8}px`:`left:${t+8}px`}">
        <div class="tooltip-time">${this._formatTime(e,!0)}</div>
        ${this._targets.map((i,o)=>{const a=et(i,e)?.v;return l`
            <div class="tooltip-row">
              <span class="line s${o+1}"></span>
              <strong>${a==null?"–":`${a} A`}</strong>
              <span class="secondary">${tt[o]}</span>
            </div>
          `})}
        ${r?l`<div class="tooltip-row">
              <span class="swatch ${r}"></span>
              <strong>${r}</strong>
              <span class="secondary">Mode</span>
            </div>`:c}
      </div>
    `}_renderTable(){const e=[...new Set([...this._targets.flat().map(t=>t.t),...this._modes.map(t=>t.t)])].sort((t,s)=>s-t).slice(0,200);return l`
      <details>
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              ${tt.map(t=>l`<th class="num">${t} (A)</th>`)}
              ${this.modeEntity?l`<th>Mode</th>`:c}
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>l`
                <tr>
                  <td>${this._formatTime(t,!0)}</td>
                  ${this._targets.map(s=>{const r=et(s,t)?.v;return l`<td class="num">${r??"–"}</td>`})}
                  ${this.modeEntity?l`<td>${et(this._modes,t)?.s??"–"}</td>`:c}
                </tr>
              `)}
          </tbody>
        </table>
      </details>
    `}};y.styles=U`
    :host {
      /* Categorical slots 1-3 (validated all-pairs, light and dark) */
      --cc-series-1: #2a78d6;
      --cc-series-2: #eb6834;
      --cc-series-3: #1baf7a;
      --cc-idle: #c3c2b7;
      /* Status colors, reserved for the mode */
      --cc-good: #0ca30c;
      --cc-warning: #fab219;
      --cc-critical: #d03b3b;
    }

    :host([dark]) {
      --cc-series-1: #3987e5;
      --cc-series-2: #d95926;
      --cc-series-3: #199e70;
      --cc-idle: #4a4a46;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .ranges {
      display: flex;
      gap: 4px;
    }

    .range {
      border: 1px solid var(--divider-color);
      background: none;
      color: var(--primary-text-color);
      border-radius: 12px;
      padding: 2px 10px;
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }

    .range.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .key {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .line {
      display: inline-block;
      width: 14px;
      height: 2px;
      border-radius: 1px;
    }

    .swatch {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .line.s1 { background: var(--cc-series-1); }
    .line.s2 { background: var(--cc-series-2); }
    .line.s3 { background: var(--cc-series-3); }

    .chart {
      position: relative;
      width: 100%;
      transition: opacity 0.2s;
    }

    .chart.loading {
      opacity: 0.5;
    }

    svg {
      display: block;
      overflow: visible;
      touch-action: pan-y;
    }

    .grid {
      stroke: var(--divider-color);
      stroke-width: 1;
    }

    .axis {
      fill: var(--secondary-text-color);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }

    .series {
      fill: none;
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .series.s1 { stroke: var(--cc-series-1); }
    .series.s2 { stroke: var(--cc-series-2); }
    .series.s3 { stroke: var(--cc-series-3); }

    .end-label {
      fill: var(--secondary-text-color);
      font-size: 11px;
    }

    .band.charging, .swatch.charging { fill: var(--cc-good); background: var(--cc-good); }
    .band.limited, .swatch.limited { fill: var(--cc-warning); background: var(--cc-warning); }
    .band.failsafe, .swatch.failsafe { fill: var(--cc-critical); background: var(--cc-critical); }
    .band.idle, .swatch.idle { fill: var(--cc-idle); background: var(--cc-idle); }
    .band { fill: transparent; }

    .crosshair {
      stroke: var(--secondary-text-color);
      stroke-width: 1;
      pointer-events: none;
    }

    .tooltip {
      position: absolute;
      top: 0;
      pointer-events: none;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      white-space: nowrap;
    }

    .tooltip-time {
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }

    .tooltip-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .secondary {
      color: var(--secondary-text-color);
    }

    details {
      margin-top: 12px;
      font-size: 13px;
    }

    summary {
      cursor: pointer;
      color: var(--secondary-text-color);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }

    th, td {
      text-align: left;
      padding: 4px 8px;
      border-bottom: 1px solid var(--divider-color);
    }

    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .hint {
      color: var(--secondary-text-color);
    }

    .error {
      color: var(--error-color);
    }
  `,w([u({attribute:!1})],y.prototype,"hass",2),w([u({attribute:!1})],y.prototype,"targetEntities",2),w([u({attribute:!1})],y.prototype,"modeEntity",2),w([g()],y.prototype,"_hours",2),w([g()],y.prototype,"_targets",2),w([g()],y.prototype,"_modes",2),w([g()],y.prototype,"_range",2),w([g()],y.prototype,"_loading",2),w([g()],y.prototype,"_error",2),w([g()],y.prototype,"_width",2),w([g()],y.prototype,"_hoverT",2),y=w([I("cc-charger-history")],y);var Ee=Object.defineProperty,Ae=Object.getOwnPropertyDescriptor,v=(e,t,s,r)=>{for(var i=r>1?void 0:r?Ae(t,s):t,o=e.length-1,a;o>=0;o--)(a=e[o])&&(i=(r?a(t,s,i):a(i))||i);return r&&i&&Ee(t,s,i),i};const K="generic_charge_controller";let m=class extends E{constructor(){super(...arguments),this.narrow=!1,this.route={path:""},this.panel={},this._elementsLoaded=!1,this._selectedChargerId=null,this._activeTab="households",this._routeApplied=!1,this._households={},this._chargerConfigs={},this._discoveredChargers=[],this._entities={households:{},chargers:{}},this._editingHousehold=null,this._error=""}firstUpdated(){this._loadElements(),this._loadData()}async _loadElements(){await se(),this._elementsLoaded=!0}async _loadData(){try{const[e,t,s,r]=await Promise.all([this.hass.callWS({type:`${K}/households/get`}),this.hass.callWS({type:`${K}/chargers/get`}),this.hass.callWS({type:`${K}/chargers/discover`}),this.hass.callWS({type:`${K}/entities`})]);this._households=e,this._chargerConfigs=t,this._discoveredChargers=s,this._entities=r}catch(e){this._error=`Error loading data from Charge Controller backend: ${e?.message??e}`}}willUpdate(e){e.has("route")&&this._applyRoute()}connectedCallback(){super.connectedCallback(),this._routeApplied||(this._applyRoute(),this._routeApplied=!0)}render(){if(!this._elementsLoaded)return l`<div class="loading">Loading...</div>`;const e=this._discoveredChargers.map(r=>re(this.hass,r)),t=!!this._selectedChargerId,s=t?e.find(r=>r.id===this._selectedChargerId)??null:null;return l`
      <div class="toolbar">
        ${t?l`
            <ha-icon-button .label=${"Back"} @click=${this._goBack}>
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`:c}
        <div class="title">
          ${t?s?.name??"Charger Details":"Charge Controller"}
        </div>
        ${t?c:l`
            <div class="tabs">
              <div
                class="tab ${this._activeTab==="households"?"active":""}"
                @click=${()=>this._activeTab="households"}
              >
                Households
              </div>
              <div
                class="tab ${this._activeTab==="chargers"?"active":""}"
                @click=${()=>this._activeTab="chargers"}
              >
                Chargers
              </div>
            </div>
          `}
      </div>
      <div class="content">
        ${this._error?l`<div class="error-banner" @click=${()=>this._error=""}>${this._error}</div>`:c}
        ${t?this._renderDetail(s):this._activeTab==="households"?this._renderHouseholds():this._renderChargers(e)}
      </div>
    `}_chargerValue(e,t){const s=this._entities.chargers[e]?.[t],r=parseFloat(this.hass.states[s]?.state);return Number.isFinite(r)?r:null}_renderChargerCard(e,t){const s=this._entities.chargers[e.id],r=s?[1,2,3].map(o=>this._chargerValue(e.id,`target_current_P${o}`)):null,i=s?.mode?this.hass.states[s.mode]?.state:void 0;return l`
      <cc-charger-card
        .chargerId=${e.id}
        .name=${e.name}
        .serialNumber=${e.serialNumber}
        .status=${e.status}
        .power=${e.power}
        .currentLimit=${e.currentLimit}
        .currentUsage=${e.currentUsage}
        .l1Usage=${e.l1_usage}
        .l2Usage=${e.l2_usage}
        .l3Usage=${e.l3_usage}
        .configured=${!!this._chargerConfigs[e.id]}
        .targets=${r}
        .mode=${i??null}
        @charger-selected=${t?this._onChargerSelected:null}
      ></cc-charger-card>
    `}_renderChargers(e){if(e.length===0)return l`<p>No Easee chargers detected in your system.</p>`;const t=r=>this._chargerConfigs[r.id]?.household_id,s=e.filter(r=>{const i=t(r);return!i||!this._households[i]});return l`
      ${Object.values(this._households).map(r=>this._renderChargerGroup(r.name,e.filter(i=>t(i)===r.household_id),"No chargers assigned to this household."))}
      ${s.length>0?this._renderChargerGroup("Not configured",s,""):c}
    `}_renderChargerGroup(e,t,s){return l`
      <section class="group">
        <h2 class="group-header">${e}</h2>
        ${t.length===0?l`<p class="group-empty">${s}</p>`:l`<div class="grid">${t.map(r=>this._renderChargerCard(r,!0))}</div>`}
      </section>
    `}_renderHouseholds(){if(this._editingHousehold!==null){const t=this._editingHousehold==="new"?null:this._households[this._editingHousehold];return l`
        <div class="detail-view">
          <cc-household-editor
            .hass=${this.hass}
            .household=${t}
            @household-saved=${this._onHouseholdSaved}
            @editor-closed=${()=>this._editingHousehold=null}
          ></cc-household-editor>
        </div>
      `}const e=Object.values(this._households);return l`
      <div class="actions">
        <ha-button @click=${()=>this._editingHousehold="new"}>Add household</ha-button>
      </div>
      ${e.length===0?l`<p>No households configured yet.</p>`:l`
            <div class="grid">
              ${e.map(t=>l`
                  <cc-household-card
                    .hass=${this.hass}
                    .household=${t}
                    @household-edit=${s=>this._editingHousehold=s.detail.householdId}
                    @household-delete=${this._onHouseholdDelete}
                  ></cc-household-card>
                `)}
            </div>
          `}
    `}_renderDetail(e){return e?l`
      <div class="detail-view">
        ${this._renderChargerCard(e,!1)}
        <cc-load-balancer-settings
          .hass=${this.hass}
          .chargerId=${e.id}
          .households=${this._households}
          .config=${this._chargerConfigs[e.id]??null}
          @config-saved=${this._onChargerConfigSaved}
        ></cc-load-balancer-settings>
        <cc-charger-history
          .hass=${this.hass}
          .targetEntities=${this._targetEntities(e.id)}
          .modeEntity=${this._entities.chargers[e.id]?.mode??null}
        ></cc-charger-history>
      </div>
    `:l`<p>Charger not found.</p>`}_targetEntities(e){const t=this._entities.chargers[e]??{},s=[t.target_current_P1,t.target_current_P2,t.target_current_P3];return s.every(r=>r)?s:[]}async _onChargerConfigSaved(){await this._loadData(),setTimeout(()=>this._loadData(),3e3)}_navigate(e){history.replaceState(null,"",`/charge-controller${e}`),window.dispatchEvent(new Event("location-changed"))}_goBack(){this._selectedChargerId=null,this._navigate("")}_onChargerSelected(e){this._selectedChargerId=e.detail.chargerId,this._navigate(`/charger/${e.detail.chargerId}`)}async _onHouseholdSaved(){this._editingHousehold=null,await this._loadData()}async _onHouseholdDelete(e){const t=this._households[e.detail.householdId];if(!(!t||!confirm(`Delete household "${t.name}"?`)))try{await this.hass.callWS({type:`${K}/households/delete`,household_id:t.household_id}),await this._loadData()}catch(s){this._error=s?.message??String(s)}}_applyRoute(){const e=this.route?.path??"";e.startsWith("/charger/")?this._selectedChargerId=decodeURIComponent(e.slice(9)):this._selectedChargerId=null,this._routeApplied=!0}};m.styles=U`
    :host {
      display: block;
      height: 100vh;
      background-color: var(--primary-background-color);
      color: var(--primary-text-color);
    }

    .toolbar {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 16px;
      background-color: var(--app-header-background-color, var(--primary-background-color));
      color: var(--app-header-text-color, var(--primary-text-color));
      border-bottom: 1px solid var(--divider-color);
      font-size: 20px;
    }

    .toolbar .title {
      flex: 1;
    }

    .tabs {
      display: flex;
      height: 100%;
      align-items: center;
    }

    .tab {
      padding: 0 16px;
      cursor: pointer;
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 16px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }

    .tab.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }

    .content {
      padding: 16px;
      height: calc(100vh - 56px - 32px);
      overflow-y: auto;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .detail-view {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    .group + .group {
      margin-top: 32px;
    }

    .group-header {
      margin: 0 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--divider-color);
      font-size: 18px;
      font-weight: 500;
    }

    .group-empty {
      color: var(--secondary-text-color);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .error-banner {
      background-color: var(--error-color);
      color: var(--text-primary-color, #fff);
      padding: 8px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      cursor: pointer;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    ha-icon-button {
      margin-right: 8px;
    }
  `,v([u({attribute:!1})],m.prototype,"hass",2),v([u({type:Boolean,reflect:!0})],m.prototype,"narrow",2),v([u({type:Object})],m.prototype,"route",2),v([u({type:Object})],m.prototype,"panel",2),v([g()],m.prototype,"_elementsLoaded",2),v([g()],m.prototype,"_selectedChargerId",2),v([g()],m.prototype,"_activeTab",2),v([g()],m.prototype,"_routeApplied",2),v([g()],m.prototype,"_households",2),v([g()],m.prototype,"_chargerConfigs",2),v([g()],m.prototype,"_discoveredChargers",2),v([g()],m.prototype,"_entities",2),v([g()],m.prototype,"_editingHousehold",2),v([g()],m.prototype,"_error",2),m=v([I("charge-controller-panel")],m)})();
