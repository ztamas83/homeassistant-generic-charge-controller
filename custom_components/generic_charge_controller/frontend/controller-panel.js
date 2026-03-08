(function(){"use strict";const j=globalThis,G=j.ShadowRoot&&(j.ShadyCSS===void 0||j.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,J=Symbol(),te=new WeakMap;let se=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==J)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(G&&e===void 0){const r=t!==void 0&&t.length===1;r&&(e=te.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&te.set(t,e))}return e}toString(){return this.cssText}};const me=s=>new se(typeof s=="string"?s:s+"",void 0,J),B=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((r,i,o)=>r+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+s[o+1],s[0]);return new se(t,s,J)},_e=(s,e)=>{if(G)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const r=document.createElement("style"),i=j.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=t.cssText,s.appendChild(r)}},re=G?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const r of e.cssRules)t+=r.cssText;return me(t)})(s):s;const{is:$e,defineProperty:be,getOwnPropertyDescriptor:ye,getOwnPropertyNames:we,getOwnPropertySymbols:Ce,getPrototypeOf:Ae}=Object,z=globalThis,ie=z.trustedTypes,Ee=ie?ie.emptyScript:"",xe=z.reactiveElementPolyfillSupport,T=(s,e)=>s,V={toAttribute(s,e){switch(e){case Boolean:s=s?Ee:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},K=(s,e)=>!$e(s,e),oe={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:K};Symbol.metadata??=Symbol("metadata"),z.litPropertyMetadata??=new WeakMap;let H=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=oe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const r=Symbol(),i=this.getPropertyDescriptor(e,r,t);i!==void 0&&be(this.prototype,e,i)}}static getPropertyDescriptor(e,t,r){const{get:i,set:o}=ye(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:i,set(n){const c=i?.call(this);o?.call(this,n),this.requestUpdate(e,c,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??oe}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;const e=Ae(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){const t=this.properties,r=[...we(t),...Ce(t)];for(const i of r)this.createProperty(i,t[i])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[r,i]of t)this.elementProperties.set(r,i)}this._$Eh=new Map;for(const[t,r]of this.elementProperties){const i=this._$Eu(t,r);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const i of r)t.unshift(re(i))}else e!==void 0&&t.push(re(e));return t}static _$Eu(e,t){const r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return _e(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){const r=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,r);if(i!==void 0&&r.reflect===!0){const o=(r.converter?.toAttribute!==void 0?r.converter:V).toAttribute(t,r.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,t){const r=this.constructor,i=r._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const o=r.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:V;this._$Em=i;const c=n.fromAttribute(t,o.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(e,t,r,i=!1,o){if(e!==void 0){const n=this.constructor;if(i===!1&&(o=this[e]),r??=n.getPropertyOptions(e),!((r.hasChanged??K)(o,t)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:i,wrapped:o},n){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),o!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[i,o]of r){const{wrapped:n}=o,c=this[i];n!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,o,c)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};H.elementStyles=[],H.shadowRootOptions={mode:"open"},H[T("elementProperties")]=new Map,H[T("finalized")]=new Map,xe?.({ReactiveElement:H}),(z.reactiveElementVersions??=[]).push("2.1.2");const Y=globalThis,ne=s=>s,W=Y.trustedTypes,ae=W?W.createPolicy("lit-html",{createHTML:s=>s}):void 0,ce="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,le="?"+y,Se=`<${le}>`,C=document,N=()=>C.createComment(""),M=s=>s===null||typeof s!="object"&&typeof s!="function",Q=Array.isArray,Pe=s=>Q(s)||typeof s?.[Symbol.iterator]=="function",X=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,de=/-->/g,he=/>/g,A=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),pe=/'/g,ue=/"/g,ge=/^(?:script|style|textarea|title)$/i,He=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),d=He(1),O=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),fe=new WeakMap,E=C.createTreeWalker(C,129);function ve(s,e){if(!Q(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ae!==void 0?ae.createHTML(e):e}const Oe=(s,e)=>{const t=s.length-1,r=[];let i,o=e===2?"<svg>":e===3?"<math>":"",n=L;for(let c=0;c<t;c++){const a=s[c];let p,g,l=-1,f=0;for(;f<a.length&&(n.lastIndex=f,g=n.exec(a),g!==null);)f=n.lastIndex,n===L?g[1]==="!--"?n=de:g[1]!==void 0?n=he:g[2]!==void 0?(ge.test(g[2])&&(i=RegExp("</"+g[2],"g")),n=A):g[3]!==void 0&&(n=A):n===A?g[0]===">"?(n=i??L,l=-1):g[1]===void 0?l=-2:(l=n.lastIndex-g[2].length,p=g[1],n=g[3]===void 0?A:g[3]==='"'?ue:pe):n===ue||n===pe?n=A:n===de||n===he?n=L:(n=A,i=void 0);const $=n===A&&s[c+1].startsWith("/>")?" ":"";o+=n===L?a+Se:l>=0?(r.push(p),a.slice(0,l)+ce+a.slice(l)+y+$):a+y+(l===-2?c:$)}return[ve(s,o+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};class D{constructor({strings:e,_$litType$:t},r){let i;this.parts=[];let o=0,n=0;const c=e.length-1,a=this.parts,[p,g]=Oe(e,t);if(this.el=D.createElement(p,r),E.currentNode=this.el.content,t===2||t===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=E.nextNode())!==null&&a.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const l of i.getAttributeNames())if(l.endsWith(ce)){const f=g[n++],$=i.getAttribute(l).split(y),P=/([.?@])?(.*)/.exec(f);a.push({type:1,index:o,name:P[2],strings:$,ctor:P[1]==="."?Ie:P[1]==="?"?Te:P[1]==="@"?Ne:q}),i.removeAttribute(l)}else l.startsWith(y)&&(a.push({type:6,index:o}),i.removeAttribute(l));if(ge.test(i.tagName)){const l=i.textContent.split(y),f=l.length-1;if(f>0){i.textContent=W?W.emptyScript:"";for(let $=0;$<f;$++)i.append(l[$],N()),E.nextNode(),a.push({type:2,index:++o});i.append(l[f],N())}}}else if(i.nodeType===8)if(i.data===le)a.push({type:2,index:o});else{let l=-1;for(;(l=i.data.indexOf(y,l+1))!==-1;)a.push({type:7,index:o}),l+=y.length-1}o++}}static createElement(e,t){const r=C.createElement("template");return r.innerHTML=e,r}}function U(s,e,t=s,r){if(e===O)return e;let i=r!==void 0?t._$Co?.[r]:t._$Cl;const o=M(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(s),i._$AT(s,t,r)),r!==void 0?(t._$Co??=[])[r]=i:t._$Cl=i),i!==void 0&&(e=U(s,i._$AS(s,e.values),i,r)),e}class Ue{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:r}=this._$AD,i=(e?.creationScope??C).importNode(t,!0);E.currentNode=i;let o=E.nextNode(),n=0,c=0,a=r[0];for(;a!==void 0;){if(n===a.index){let p;a.type===2?p=new R(o,o.nextSibling,this,e):a.type===1?p=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(p=new Me(o,this,e)),this._$AV.push(p),a=r[++c]}n!==a?.index&&(o=E.nextNode(),n++)}return E.currentNode=C,i}p(e){let t=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,i){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=U(this,e,t),M(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==O&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Pe(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&M(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:r}=e,i=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=D.createElement(ve(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(t);else{const o=new Ue(i,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=fe.get(e.strings);return t===void 0&&fe.set(e.strings,t=new D(e)),t}k(e){Q(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,i=0;for(const o of e)i===t.length?t.push(r=new R(this.O(N()),this.O(N()),this,this.options)):r=t[i],r._$AI(o),i++;i<t.length&&(this._$AR(r&&r._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const r=ne(e).nextSibling;ne(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,i,o){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=h}_$AI(e,t=this,r,i){const o=this.strings;let n=!1;if(o===void 0)e=U(this,e,t,0),n=!M(e)||e!==this._$AH&&e!==O,n&&(this._$AH=e);else{const c=e;let a,p;for(e=o[0],a=0;a<o.length-1;a++)p=U(this,c[r+a],t,a),p===O&&(p=this._$AH[a]),n||=!M(p)||p!==this._$AH[a],p===h?e=h:e!==h&&(e+=(p??"")+o[a+1]),this._$AH[a]=p}n&&!i&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ie extends q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}}class Te extends q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}}class Ne extends q{constructor(e,t,r,i,o){super(e,t,r,i,o),this.type=5}_$AI(e,t=this){if((e=U(this,e,t,0)??h)===O)return;const r=this._$AH,i=e===h&&r!==h||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==h&&(r===h||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Me{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){U(this,e)}}const Le=Y.litHtmlPolyfillSupport;Le?.(D,R),(Y.litHtmlVersions??=[]).push("3.3.2");const De=(s,e,t)=>{const r=t?.renderBefore??e;let i=r._$litPart$;if(i===void 0){const o=t?.renderBefore??null;r._$litPart$=i=new R(e.insertBefore(N(),o),o,void 0,t??{})}return i._$AI(s),i};const ee=globalThis;class w extends H{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=De(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}}w._$litElement$=!0,w.finalized=!0,ee.litElementHydrateSupport?.({LitElement:w});const Re=ee.litElementPolyfillSupport;Re?.({LitElement:w}),(ee.litElementVersions??=[]).push("4.2.2");const F=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};const ke={attribute:!0,type:String,converter:V,reflect:!1,hasChanged:K},je=(s=ke,e,t)=>{const{kind:r,metadata:i}=t;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),r==="setter"&&((s=Object.create(s)).wrapped=!0),o.set(t.name,s),r==="accessor"){const{name:n}=t;return{set(c){const a=e.get.call(this);e.set.call(this,c),this.requestUpdate(n,a,s,!0,c)},init(c){return c!==void 0&&this.C(n,void 0,s,c),c}}}if(r==="setter"){const{name:n}=t;return function(c){const a=this[n];e.call(this,c),this.requestUpdate(n,a,s,!0,c)}}throw Error("Unsupported decorator location: "+r)};function u(s){return(e,t)=>typeof t=="object"?je(s,e,t):((r,i,o)=>{const n=i.hasOwnProperty(o);return i.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(i,o):void 0})(s,e,t)}function x(s){return u({...s,state:!0,attribute:!1})}const Be=async()=>{if(!customElements.get("ha-entity-picker")){if(!customElements.get("ha-selector")){await customElements.whenDefined("partial-panel-resolver");const s=document.createElement("partial-panel-resolver");s.hass={panels:[{url_path:"tmp",component_name:"config"}]},s._updateRoutes(),await s.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await document.createElement("ha-panel-config").routerOptions.routes.automation.load()}if(!customElements.get("ha-entity-picker"))try{await(await(await window.loadCardHelpers()).createCardElement({type:"entities",entities:[]})).constructor.getConfigElement()}catch{}if(!customElements.get("ha-entity-picker"))try{await Promise.race([customElements.whenDefined("ha-selector"),new Promise((t,r)=>setTimeout(()=>r(new Error("timeout")),1e4))]);const s=document.querySelector("home-assistant")?.hass,e=document.createElement("div");e.style.cssText="position:fixed;left:-9999px;opacity:0;pointer-events:none",document.body.appendChild(e);try{const t=document.createElement("ha-selector");t.hass=s,t.selector={entity:{}},e.appendChild(t),await Promise.race([customElements.whenDefined("ha-entity-picker"),new Promise(r=>setTimeout(r,5e3))])}finally{e.remove()}}catch{}if(await customElements.whenDefined("ha-card"),!customElements.get("ha-date-range-picker"))try{await(await window.loadCardHelpers()).createCardElement({type:"energy-date-selection",entities:[]}),await Promise.race([customElements.whenDefined("ha-date-range-picker"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}if(!customElements.get("ha-chart-base"))try{await(await window.loadCardHelpers()).createCardElement({type:"statistics-graph",entities:[]}),await Promise.race([customElements.whenDefined("ha-chart-base"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}}},ze=s=>{const e=Object.values(s.entities).filter(i=>i.platform==="easee"),t=new Set;for(const i of e)i.device_id&&t.add(i.device_id);const r=[];for(const i of t){const o=s.devices[i];if(!o)continue;const c=Object.values(s.entities).filter(f=>f.device_id===i).reduce((f,$)=>{const P=s.states[$.entity_id];return P&&f.set($.entity_id,P),f},new Map);console.log(`State map for device ${i}: `,c);const a=f=>`sensor.${o.name?.toLowerCase().replace(/\s+/g,"_")}_${f}`,p=c.get(a("status"))?.state||"Unknown",g=parseFloat(c.get(a("power"))?.state||"0"),l=parseFloat(c.get(a("max_circuit_limit"))?.state||"0");r.push({id:i,name:o.name||"Unknown Charger",serialNumber:o.serial_number||"N/A",status:p,power:g,currentLimit:l,currentUsage:g*1e3/230,configured:!1})}return r},Ve="M12,3A1,1 0 0,1 13,4V4.39C17.65,5.15 21,7.45 21,10.13C21,11.19 19.82,12.14 18,12.8V19H19V21H5V19H6V12.8C4.18,12.14 3,11.19 3,10.13C3,7.45 6.35,5.15 11,4.39V4A1,1 0 0,1 12,3M12,6.13C8.13,6.13 5,7.45 5,9.13C5,10.81 8.13,12.13 12,12.13C15.87,12.13 19,10.81 19,9.13C19,7.45 15.87,6.13 12,6.13M12,14.13C9.8,14.13 8,15.93 8,18.13V19H16V18.13C16,15.93 14.2,14.13 12,14.13Z",We="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.66,19.59 13.4,20 12,20C9.8,20 8,18.2 8,16V11.27L2,5.27M12,2C12.55,2 13,2.45 13,3V3.39C17.65,4.15 21,6.45 21,9.13C21,10.19 19.82,11.14 18,11.8V17.27L13.73,13C15.6,12.59 17,11.5 17,10.13C17,8.45 13.87,7.13 10,7.13C9.05,7.13 8.15,7.21 7.34,7.34L5.11,5.11C6.7,4.24 8.74,3.64 11,3.39V3C11,2.45 11.45,2 12,2M12,14C13.2,14 14.24,14.53 14.92,15.35L10.65,11.08C10.22,11.68 10,12.31 10,13C10,14.1 10.9,15 12,15V14Z";var qe=Object.defineProperty,Fe=Object.getOwnPropertyDescriptor,b=(s,e,t,r)=>{for(var i=r>1?void 0:r?Fe(e,t):e,o=s.length-1,n;o>=0;o--)(n=s[o])&&(i=(r?n(e,t,i):n(i))||i);return r&&i&&qe(e,t,i),i};let m=class extends w{constructor(){super(...arguments),this.chargerId="",this.name="",this.serialNumber="",this.status="",this.power=0,this.currentLimit=0,this.currentUsage=0,this.configured=!1}render(){const s=this.configured?this.status==="charging"?"accent-charging":"accent-idle":"accent-unconfigured";return d`
      <ha-card .header=${this.name} @click=${this._handleClick}>
        <div class="accent ${s}"></div>
        <ha-svg-icon
          class="configured-icon ${this.configured?"is-configured":""}"
          .path=${this.configured?Ve:We}
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
            <span class="label">Current Limit:</span>
            <span class="value">${this.currentLimit} A</span>
          </div>
          <div class="row">
            <span class="label">Current Usage:</span>
            <span class="value">${this.currentUsage.toFixed(1)} A</span>
          </div>
          <div class="progress-bar">
             <div class="progress" style="width: ${Math.min(100,this.currentUsage/this.currentLimit*100)}%"></div>
          </div>
        </div>
        <div class="card-actions">
          ${this.configured?d`<ha-button>Details</ha-button>`:d`<ha-button class="warning">Configure</ha-button>`}
        </div>
      </ha-card>
    `}_handleClick(){this.dispatchEvent(new CustomEvent("charger-selected",{detail:{chargerId:this.chargerId},bubbles:!0,composed:!0}))}};m.styles=B`
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
    
    /* Configure prompt for unconfigured areas */
    .configure-prompt {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color, #eee);
    }
  `,b([u()],m.prototype,"chargerId",2),b([u()],m.prototype,"name",2),b([u()],m.prototype,"serialNumber",2),b([u()],m.prototype,"status",2),b([u({type:Number})],m.prototype,"power",2),b([u({type:Number})],m.prototype,"currentLimit",2),b([u({type:Number})],m.prototype,"currentUsage",2),b([u({type:Boolean})],m.prototype,"configured",2),m=b([F("cc-charger-card")],m);var Ze=Object.defineProperty,Ge=Object.getOwnPropertyDescriptor,k=(s,e,t,r)=>{for(var i=r>1?void 0:r?Ge(e,t):e,o=s.length-1,n;o>=0;o--)(n=s[o])&&(i=(r?n(e,t,i):n(i))||i);return r&&i&&Ze(e,t,i),i};let S=class extends w{constructor(){super(...arguments),this.chargerId="",this.households={},this._selectedHouseholdId=""}firstUpdated(){this._loadConfig()}async _loadConfig(){try{const e=(await this.hass.callWS({type:"generic_charge_controller/chargers/get"}))[this.chargerId];e&&(this._selectedHouseholdId=e.household_id||"")}catch(s){console.error("Error loading charger config:",s)}}render(){const s=Object.values(this.households);return s.length===0?d`
        <ha-card header="Load Balancing Configuration">
          <div class="card-content">
            <p class="warning-text">
              No households are currently enabled. At least one household must be enabled in the "Households" tab before you can configure load balancing for this charger.
            </p>
          </div>
        </ha-card>
      `:d`
      <ha-card header="Load Balancing Configuration">
        <div class="card-content">
          <p class="description">
            Select the household this charger should be connected to for load balancing.
          </p>
          
          <div class="settings-row">
            <span class="label">Connected Household</span>
            <select 
              .value=${this._selectedHouseholdId}
              @change=${e=>this._selectedHouseholdId=e.target.value}
            >
              <option value="">Select a household...</option>
              ${s.map(e=>{const t=this.hass.devices[e.device_id],r=t?t.name.replace(/Tibber Pulse/gi,"").trim()||t.name:e.device_id;return d`<option value=${e.device_id} ?selected=${this._selectedHouseholdId===e.device_id}>${r}</option>`})}
            </select>
          </div>
        </div>
        <div class="card-actions">
           <ha-button 
             .disabled=${!this._selectedHouseholdId}
             @click=${this._save}
           >
             Save Configuration
           </ha-button>
        </div>
      </ha-card>
    `}async _save(){try{await this.hass.callWS({type:"generic_charge_controller/chargers/save",charger_id:this.chargerId,config:{household_id:this._selectedHouseholdId}}),this.dispatchEvent(new CustomEvent("config-saved",{bubbles:!0,composed:!0}))}catch(s){console.error("Error saving charger config:",s)}}};S.styles=B`
    .description {
      color: var(--secondary-text-color);
      margin-bottom: 16px;
    }

    .warning-text {
      color: var(--error-color);
      font-weight: 500;
    }

    .settings-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
    }

    .label {
      font-weight: 500;
      margin-bottom: 8px;
    }

    select {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      background-color: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `,k([u({attribute:!1})],S.prototype,"hass",2),k([u()],S.prototype,"chargerId",2),k([u({attribute:!1})],S.prototype,"households",2),k([x()],S.prototype,"_selectedHouseholdId",2),S=k([F("cc-load-balancer-settings")],S);var Je=Object.defineProperty,Ke=Object.getOwnPropertyDescriptor,Z=(s,e,t,r)=>{for(var i=r>1?void 0:r?Ke(e,t):e,o=s.length-1,n;o>=0;o--)(n=s[o])&&(i=(r?n(e,t,i):n(i))||i);return r&&i&&Je(e,t,i),i};let I=class extends w{constructor(){super(...arguments),this.deviceId="",this.name="",this.enabled=!1}render(){return d`
      <ha-card .header=${this.name}>
        <div class="card-content">
          ${this.enabled?d`<p>Monitoring enabled for this household.</p>`:d`<p>Tibber Pulse device detected. Enable it to start monitoring household load.</p>`}
        </div>
        <div class="card-actions">
          ${this.enabled?d`<ha-button @click=${this._remove} class="warning">Remove</ha-button>`:d`<ha-button @click=${this._enable}>Enable</ha-button>`}
        </div>
      </ha-card>
    `}_enable(){this.dispatchEvent(new CustomEvent("household-enabled",{detail:{deviceId:this.deviceId},bubbles:!0,composed:!0}))}_remove(){this.dispatchEvent(new CustomEvent("household-removed",{detail:{deviceId:this.deviceId},bubbles:!0,composed:!0}))}};I.styles=B`
    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card-content {
      flex-grow: 1;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }

    .warning {
      --mdc-theme-primary: var(--error-color);
    }
  `,Z([u()],I.prototype,"deviceId",2),Z([u()],I.prototype,"name",2),Z([u({type:Boolean})],I.prototype,"enabled",2),I=Z([F("cc-household-card")],I);var Ye=Object.defineProperty,Qe=Object.getOwnPropertyDescriptor,_=(s,e,t,r)=>{for(var i=r>1?void 0:r?Qe(e,t):e,o=s.length-1,n;o>=0;o--)(n=s[o])&&(i=(r?n(e,t,i):n(i))||i);return r&&i&&Ye(e,t,i),i};let v=class extends w{constructor(){super(...arguments),this.narrow=!1,this.route={path:""},this.panel={},this._elementsLoaded=!1,this._selectedChargerId=null,this._activeTab="chargers",this._routeApplied=!1,this._configuredHouseholds={},this._configuredChargers={}}firstUpdated(){this._loadElements(),this._loadData()}async _loadElements(){await Be(),this._elementsLoaded=!0}async _loadData(){try{this._configuredHouseholds=await this.hass.callWS({type:"generic_charge_controller/households/get"}),this._configuredChargers=await this.hass.callWS({type:"generic_charge_controller/chargers/get"})}catch(s){console.error("Error loading data from Charge Controller backend:",s)}}willUpdate(s){s.has("route")&&this._applyRoute()}connectedCallback(){super.connectedCallback(),this._routeApplied||(this._applyRoute(),this._routeApplied=!0)}render(){if(!this._elementsLoaded)return d`<div class="loading">Loading...</div>`;const s=!!this._selectedChargerId,e=ze(this.hass),t=s?e.find(r=>r.id===this._selectedChargerId):null;return d`
      <div class="toolbar">
        ${s?d`
            <ha-icon-button
              .label=${"Back"}
              @click=${this._goBack}
            >
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`:h}
        <div class="title">
          ${s?t?.name??"Charger Details":"Charge Controller"}
        </div>
        ${s?h:d`
            <div class="tabs">
              <div 
                class="tab ${this._activeTab==="chargers"?"active":""}" 
                @click=${()=>this._activeTab="chargers"}
              >
                Chargers
              </div>
              <div 
                class="tab ${this._activeTab==="households"?"active":""}" 
                @click=${()=>this._activeTab="households"}
              >
                Households
              </div>
            </div>
          `}
      </div>
      <div class="content">
        ${s?this._renderDetail(t):this._activeTab==="chargers"?this._renderGrid(e):this._renderHouseholds()}
      </div>
    `}_renderGrid(s){return d`
      ${s.length===0?d`<p>No Easee chargers detected in your system.</p>`:d`
            <div class="grid">
              ${s.map(e=>{const t=!!this._configuredChargers[e.id];return d`
                <cc-charger-card
                  .chargerId=${e.id}
                  .name=${e.name}
                  .serialNumber=${e.serialNumber}
                  .status=${e.status}
                  .power=${e.power}
                  .currentLimit=${e.currentLimit}
                  .currentUsage=${e.currentUsage}
                  .configured=${t}
                  @charger-selected=${this._onChargerSelected}
                ></cc-charger-card>
              `})}
            </div>
          `}
    `}_renderHouseholds(){const s=Object.values(this.hass.devices).filter(e=>e.model==="Tibber Pulse");return d`
      ${s.length===0?d`<p>No Tibber Pulse devices detected in your system.</p>`:d`
            <div class="grid">
              ${s.map(e=>{const t=e.name.replace(/Tibber Pulse/gi,"").trim()||e.name,r=!!this._configuredHouseholds[e.id];return d`
                  <cc-household-card
                    .deviceId=${e.id}
                    .name=${t}
                    .enabled=${r}
                    @household-enabled=${this._onHouseholdEnabled}
                    @household-removed=${this._onHouseholdRemoved}
                  ></cc-household-card>
                `})}
            </div>
          `}
    `}_renderDetail(s){if(!s)return d`<p>Charger not found.</p>`;const e=!!this._configuredChargers[s.id];return d`
      <div class="detail-view">
        <cc-charger-card
          .chargerId=${s.id}
          .name=${s.name}
          .serialNumber=${s.serialNumber}
          .status=${s.status}
          .power=${s.power}
          .currentLimit=${s.currentLimit}
          .currentUsage=${s.currentUsage}
          .configured=${e}
        ></cc-charger-card>

        <cc-load-balancer-settings
          .hass=${this.hass}
          .chargerId=${s.id}
          .households=${this._configuredHouseholds}
          @config-saved=${this._loadData}
        ></cc-load-balancer-settings>

        <ha-card header="Statistics">
          <div class="card-content">
            <p>Placeholder for charging statistics and history.</p>
          </div>
        </ha-card>
      </div>
    `}_navigate(s){history.replaceState(null,"",`/charge-controller${s}`),window.dispatchEvent(new Event("location-changed"))}_goBack(){this._selectedChargerId=null,this._navigate("")}_onChargerSelected(s){this._selectedChargerId=s.detail.chargerId,this._navigate(`/charger/${s.detail.chargerId}`)}async _onHouseholdEnabled(s){console.log(`Enable household for device: ${s.detail.deviceId}`);try{const e=await this.hass.callWS({type:"generic_charge_controller/households/save",device_id:s.detail.deviceId,config:{enabled:!0}});this._configuredHouseholds={...this._configuredHouseholds,[s.detail.deviceId]:e}}catch(e){console.error("Error saving household:",e)}}async _onHouseholdRemoved(s){console.log(`Household removed for device: ${s.detail.deviceId}`);try{await this.hass.callWS({type:"generic_charge_controller/households/delete",device_id:s.detail.deviceId});const e={...this._configuredHouseholds};delete e[s.detail.deviceId],this._configuredHouseholds=e}catch(e){console.error("Error deleting household:",e)}}_applyRoute(){const s=this.route?.path??"";s.startsWith("/charger/")?this._selectedChargerId=decodeURIComponent(s.slice(9)):this._selectedChargerId=null,this._routeApplied=!0}};v.styles=B`
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

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    ha-icon-button {
      margin-right: 8px;
    }
  `,_([u({attribute:!1})],v.prototype,"hass",2),_([u({type:Boolean,reflect:!0})],v.prototype,"narrow",2),_([u({type:Object})],v.prototype,"route",2),_([u({type:Object})],v.prototype,"panel",2),_([x()],v.prototype,"_elementsLoaded",2),_([x()],v.prototype,"_selectedChargerId",2),_([x()],v.prototype,"_activeTab",2),_([x()],v.prototype,"_routeApplied",2),_([x()],v.prototype,"_configuredHouseholds",2),_([x()],v.prototype,"_configuredChargers",2),v=_([F("charge-controller-panel")],v)})();
