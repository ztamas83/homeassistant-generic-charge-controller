(function(){"use strict";const B=globalThis,K=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),ae=new WeakMap;let ne=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(K&&e===void 0){const r=t!==void 0&&t.length===1;r&&(e=ae.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&ae.set(t,e))}return e}toString(){return this.cssText}};const Ce=s=>new ne(typeof s=="string"?s:s+"",void 0,Y),D=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((r,o,i)=>r+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+s[i+1],s[0]);return new ne(t,s,Y)},xe=(s,e)=>{if(K)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const r=document.createElement("style"),o=B.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=t.cssText,s.appendChild(r)}},le=K?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const r of e.cssRules)t+=r.cssText;return Ce(t)})(s):s;const{is:Ae,defineProperty:Ee,getOwnPropertyDescriptor:Se,getOwnPropertyNames:Pe,getOwnPropertySymbols:Oe,getPrototypeOf:He}=Object,W=globalThis,he=W.trustedTypes,Ue=he?he.emptyScript:"",Le=W.reactiveElementPolyfillSupport,T=(s,e)=>s,q={toAttribute(s,e){switch(e){case Boolean:s=s?Ue:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},Q=(s,e)=>!Ae(s,e),ce={attribute:!0,type:String,converter:q,reflect:!1,useDefault:!1,hasChanged:Q};Symbol.metadata??=Symbol("metadata"),W.litPropertyMetadata??=new WeakMap;let H=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ce){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const r=Symbol(),o=this.getPropertyDescriptor(e,r,t);o!==void 0&&Ee(this.prototype,e,o)}}static getPropertyDescriptor(e,t,r){const{get:o,set:i}=Se(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:o,set(a){const h=o?.call(this);i?.call(this,a),this.requestUpdate(e,h,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ce}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;const e=He(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){const t=this.properties,r=[...Pe(t),...Oe(t)];for(const o of r)this.createProperty(o,t[o])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[r,o]of t)this.elementProperties.set(r,o)}this._$Eh=new Map;for(const[t,r]of this.elementProperties){const o=this._$Eu(t,r);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const o of r)t.unshift(le(o))}else e!==void 0&&t.push(le(e));return t}static _$Eu(e,t){const r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return xe(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){const r=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,r);if(o!==void 0&&r.reflect===!0){const i=(r.converter?.toAttribute!==void 0?r.converter:q).toAttribute(t,r.type);this._$Em=e,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(e,t){const r=this.constructor,o=r._$Eh.get(e);if(o!==void 0&&this._$Em!==o){const i=r.getPropertyOptions(o),a=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:q;this._$Em=o;const h=a.fromAttribute(t,i.type);this[o]=h??this._$Ej?.get(o)??h,this._$Em=null}}requestUpdate(e,t,r,o=!1,i){if(e!==void 0){const a=this.constructor;if(o===!1&&(i=this[e]),r??=a.getPropertyOptions(e),!((r.hasChanged??Q)(i,t)||r.useDefault&&r.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:o,wrapped:i},a){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),i!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),o===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[o,i]of r){const{wrapped:a}=i,h=this[o];a!==!0||this._$AL.has(o)||h===void 0||this.C(o,void 0,i,h)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};H.elementStyles=[],H.shadowRootOptions={mode:"open"},H[T("elementProperties")]=new Map,H[T("finalized")]=new Map,Le?.({ReactiveElement:H}),(W.reactiveElementVersions??=[]).push("2.1.2");const X=globalThis,de=s=>s,F=X.trustedTypes,ue=F?F.createPolicy("lit-html",{createHTML:s=>s}):void 0,pe="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,ge="?"+C,Ne=`<${ge}>`,S=document,M=()=>S.createComment(""),I=s=>s===null||typeof s!="object"&&typeof s!="function",ee=Array.isArray,De=s=>ee(s)||typeof s?.[Symbol.iterator]=="function",te=`[ 	
\f\r]`,j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_e=/-->/g,fe=/>/g,P=RegExp(`>|${te}(?:([^\\s"'>=/]+)(${te}*=${te}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),me=/'/g,$e=/"/g,ve=/^(?:script|style|textarea|title)$/i,Te=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),l=Te(1),U=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),ye=new WeakMap,O=S.createTreeWalker(S,129);function be(s,e){if(!ee(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ue!==void 0?ue.createHTML(e):e}const Me=(s,e)=>{const t=s.length-1,r=[];let o,i=e===2?"<svg>":e===3?"<math>":"",a=j;for(let h=0;h<t;h++){const n=s[h];let p,_,u=-1,w=0;for(;w<n.length&&(a.lastIndex=w,_=a.exec(n),_!==null);)w=a.lastIndex,a===j?_[1]==="!--"?a=_e:_[1]!==void 0?a=fe:_[2]!==void 0?(ve.test(_[2])&&(o=RegExp("</"+_[2],"g")),a=P):_[3]!==void 0&&(a=P):a===P?_[0]===">"?(a=o??j,u=-1):_[1]===void 0?u=-2:(u=a.lastIndex-_[2].length,p=_[1],a=_[3]===void 0?P:_[3]==='"'?$e:me):a===$e||a===me?a=P:a===_e||a===fe?a=j:(a=P,o=void 0);const E=a===P&&s[h+1].startsWith("/>")?" ":"";i+=a===j?n+Ne:u>=0?(r.push(p),n.slice(0,u)+pe+n.slice(u)+C+E):n+C+(u===-2?h:E)}return[be(s,i+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};class k{constructor({strings:e,_$litType$:t},r){let o;this.parts=[];let i=0,a=0;const h=e.length-1,n=this.parts,[p,_]=Me(e,t);if(this.el=k.createElement(p,r),O.currentNode=this.el.content,t===2||t===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(o=O.nextNode())!==null&&n.length<h;){if(o.nodeType===1){if(o.hasAttributes())for(const u of o.getAttributeNames())if(u.endsWith(pe)){const w=_[a++],E=o.getAttribute(u).split(C),J=/([.?@])?(.*)/.exec(w);n.push({type:1,index:i,name:J[2],strings:E,ctor:J[1]==="."?je:J[1]==="?"?ke:J[1]==="@"?Re:Z}),o.removeAttribute(u)}else u.startsWith(C)&&(n.push({type:6,index:i}),o.removeAttribute(u));if(ve.test(o.tagName)){const u=o.textContent.split(C),w=u.length-1;if(w>0){o.textContent=F?F.emptyScript:"";for(let E=0;E<w;E++)o.append(u[E],M()),O.nextNode(),n.push({type:2,index:++i});o.append(u[w],M())}}}else if(o.nodeType===8)if(o.data===ge)n.push({type:2,index:i});else{let u=-1;for(;(u=o.data.indexOf(C,u+1))!==-1;)n.push({type:7,index:i}),u+=C.length-1}i++}}static createElement(e,t){const r=S.createElement("template");return r.innerHTML=e,r}}function L(s,e,t=s,r){if(e===U)return e;let o=r!==void 0?t._$Co?.[r]:t._$Cl;const i=I(e)?void 0:e._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(s),o._$AT(s,t,r)),r!==void 0?(t._$Co??=[])[r]=o:t._$Cl=o),o!==void 0&&(e=L(s,o._$AS(s,e.values),o,r)),e}class Ie{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:r}=this._$AD,o=(e?.creationScope??S).importNode(t,!0);O.currentNode=o;let i=O.nextNode(),a=0,h=0,n=r[0];for(;n!==void 0;){if(a===n.index){let p;n.type===2?p=new R(i,i.nextSibling,this,e):n.type===1?p=new n.ctor(i,n.name,n.strings,this,e):n.type===6&&(p=new Ve(i,this,e)),this._$AV.push(p),n=r[++h]}a!==n?.index&&(i=O.nextNode(),a++)}return O.currentNode=S,o}p(e){let t=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,o){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=L(this,e,t),I(e)?e===c||e==null||e===""?(this._$AH!==c&&this._$AR(),this._$AH=c):e!==this._$AH&&e!==U&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):De(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==c&&I(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:r}=e,o=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=k.createElement(be(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(t);else{const i=new Ie(o,this),a=i.u(this.options);i.p(t),this.T(a),this._$AH=i}}_$AC(e){let t=ye.get(e.strings);return t===void 0&&ye.set(e.strings,t=new k(e)),t}k(e){ee(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,o=0;for(const i of e)o===t.length?t.push(r=new R(this.O(M()),this.O(M()),this,this.options)):r=t[o],r._$AI(i),o++;o<t.length&&(this._$AR(r&&r._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const r=de(e).nextSibling;de(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Z{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,o,i){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=i,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=c}_$AI(e,t=this,r,o){const i=this.strings;let a=!1;if(i===void 0)e=L(this,e,t,0),a=!I(e)||e!==this._$AH&&e!==U,a&&(this._$AH=e);else{const h=e;let n,p;for(e=i[0],n=0;n<i.length-1;n++)p=L(this,h[r+n],t,n),p===U&&(p=this._$AH[n]),a||=!I(p)||p!==this._$AH[n],p===c?e=c:e!==c&&(e+=(p??"")+i[n+1]),this._$AH[n]=p}a&&!o&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class je extends Z{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}}class ke extends Z{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}}class Re extends Z{constructor(e,t,r,o,i){super(e,t,r,o,i),this.type=5}_$AI(e,t=this){if((e=L(this,e,t,0)??c)===U)return;const r=this._$AH,o=e===c&&r!==c||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,i=e!==c&&(r===c||o);o&&this.element.removeEventListener(this.name,this,r),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ve{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){L(this,e)}}const ze=X.litHtmlPolyfillSupport;ze?.(k,R),(X.litHtmlVersions??=[]).push("3.3.2");const Be=(s,e,t)=>{const r=t?.renderBefore??e;let o=r._$litPart$;if(o===void 0){const i=t?.renderBefore??null;r._$litPart$=o=new R(e.insertBefore(M(),i),i,void 0,t??{})}return o._$AI(s),o};const se=globalThis;class b extends H{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Be(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return U}}b._$litElement$=!0,b.finalized=!0,se.litElementHydrateSupport?.({LitElement:b});const We=se.litElementPolyfillSupport;We?.({LitElement:b}),(se.litElementVersions??=[]).push("4.2.2");const V=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};const qe={attribute:!0,type:String,converter:q,reflect:!1,hasChanged:Q},Fe=(s=qe,e,t)=>{const{kind:r,metadata:o}=t;let i=globalThis.litPropertyMetadata.get(o);if(i===void 0&&globalThis.litPropertyMetadata.set(o,i=new Map),r==="setter"&&((s=Object.create(s)).wrapped=!0),i.set(t.name,s),r==="accessor"){const{name:a}=t;return{set(h){const n=e.get.call(this);e.set.call(this,h),this.requestUpdate(a,n,s,!0,h)},init(h){return h!==void 0&&this.C(a,void 0,s,h),h}}}if(r==="setter"){const{name:a}=t;return function(h){const n=this[a];e.call(this,h),this.requestUpdate(a,n,s,!0,h)}}throw Error("Unsupported decorator location: "+r)};function d(s){return(e,t)=>typeof t=="object"?Fe(s,e,t):((r,o,i)=>{const a=o.hasOwnProperty(i);return o.constructor.createProperty(i,r),a?Object.getOwnPropertyDescriptor(o,i):void 0})(s,e,t)}function f(s){return d({...s,state:!0,attribute:!1})}const Ze=async()=>{if(!(customElements.get("ha-entity-picker")&&customElements.get("ha-form"))){if(!customElements.get("ha-selector")){await customElements.whenDefined("partial-panel-resolver");const s=document.createElement("partial-panel-resolver");s.hass={panels:[{url_path:"tmp",component_name:"config"}]},s._updateRoutes(),await s.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await document.createElement("ha-panel-config").routerOptions.routes.automation.load()}if(!customElements.get("ha-entity-picker"))try{await(await(await window.loadCardHelpers()).createCardElement({type:"entities",entities:[]})).constructor.getConfigElement()}catch{}if(!customElements.get("ha-entity-picker"))try{await Promise.race([customElements.whenDefined("ha-selector"),new Promise((t,r)=>setTimeout(()=>r(new Error("timeout")),1e4))]);const s=document.querySelector("home-assistant")?.hass,e=document.createElement("div");e.style.cssText="position:fixed;left:-9999px;opacity:0;pointer-events:none",document.body.appendChild(e);try{const t=document.createElement("ha-selector");t.hass=s,t.selector={entity:{}},e.appendChild(t),await Promise.race([customElements.whenDefined("ha-entity-picker"),new Promise(r=>setTimeout(r,5e3))])}finally{e.remove()}}catch{}if(await customElements.whenDefined("ha-card"),await Promise.race([customElements.whenDefined("ha-form"),new Promise(s=>setTimeout(s,1e4))]),!customElements.get("ha-date-range-picker"))try{await(await window.loadCardHelpers()).createCardElement({type:"energy-date-selection",entities:[]}),await Promise.race([customElements.whenDefined("ha-date-range-picker"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}if(!customElements.get("ha-chart-base"))try{await(await window.loadCardHelpers()).createCardElement({type:"statistics-graph",entities:[]}),await Promise.race([customElements.whenDefined("ha-chart-base"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}}},re=s=>{const e=parseFloat(s);return Number.isFinite(e)?e:0},Ge=(s,e)=>{const t=n=>{const p=e.entities[n];return p?s.states[p]:void 0},r=t("circuit_current"),o=n=>re(r?.attributes[`state_circuitTotalPhaseConductorCurrentL${n}`]),[i,a,h]=[o(1),o(2),o(3)];return{id:e.device_id,name:e.name,serialNumber:e.serial,status:t("status")?.state??"unknown",power:re(t("power")?.state),currentLimit:re(t("max_circuit_limit")?.state),currentUsage:Math.max(i,a,h),l1_usage:i,l2_usage:a,l3_usage:h}},Je="M12,3A1,1 0 0,1 13,4V4.39C17.65,5.15 21,7.45 21,10.13C21,11.19 19.82,12.14 18,12.8V19H19V21H5V19H6V12.8C4.18,12.14 3,11.19 3,10.13C3,7.45 6.35,5.15 11,4.39V4A1,1 0 0,1 12,3M12,6.13C8.13,6.13 5,7.45 5,9.13C5,10.81 8.13,12.13 12,12.13C15.87,12.13 19,10.81 19,9.13C19,7.45 15.87,6.13 12,6.13M12,14.13C9.8,14.13 8,15.93 8,18.13V19H16V18.13C16,15.93 14.2,14.13 12,14.13Z",Ke="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.66,19.59 13.4,20 12,20C9.8,20 8,18.2 8,16V11.27L2,5.27M12,2C12.55,2 13,2.45 13,3V3.39C17.65,4.15 21,6.45 21,9.13C21,10.19 19.82,11.14 18,11.8V17.27L13.73,13C15.6,12.59 17,11.5 17,10.13C17,8.45 13.87,7.13 10,7.13C9.05,7.13 8.15,7.21 7.34,7.34L5.11,5.11C6.7,4.24 8.74,3.64 11,3.39V3C11,2.45 11.45,2 12,2M12,14C13.2,14 14.24,14.53 14.92,15.35L10.65,11.08C10.22,11.68 10,12.31 10,13C10,14.1 10.9,15 12,15V14Z";var Ye=Object.defineProperty,Qe=Object.getOwnPropertyDescriptor,v=(s,e,t,r)=>{for(var o=r>1?void 0:r?Qe(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(o=(r?a(e,t,o):a(o))||o);return r&&o&&Ye(e,t,o),o};let m=class extends b{constructor(){super(...arguments),this.chargerId="",this.name="",this.serialNumber="",this.status="",this.power=0,this.currentLimit=0,this.currentUsage=0,this.l1Usage=0,this.l2Usage=0,this.l3Usage=0,this.configured=!1}render(){const s=this.configured?this.status==="charging"?"accent-charging":"accent-idle":"accent-unconfigured";return l`
      <ha-card .header=${this.name} @click=${this._handleClick}>
        <div class="accent ${s}"></div>
        <ha-svg-icon
          class="configured-icon ${this.configured?"is-configured":""}"
          .path=${this.configured?Je:Ke}
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
            <span class="label">Usage (L1/L2/L3):</span>
            <span class="value">${this.l1Usage.toFixed(1)} / ${this.l2Usage.toFixed(1)} / ${this.l3Usage.toFixed(1)} A</span>
          </div>
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
    `}_handleClick(){this.dispatchEvent(new CustomEvent("charger-selected",{detail:{chargerId:this.chargerId},bubbles:!0,composed:!0}))}};m.styles=D`
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
    
    .warning {
      --mdc-theme-primary: var(--error-color);
    }
  `,v([d()],m.prototype,"chargerId",2),v([d()],m.prototype,"name",2),v([d()],m.prototype,"serialNumber",2),v([d()],m.prototype,"status",2),v([d({type:Number})],m.prototype,"power",2),v([d({type:Number})],m.prototype,"currentLimit",2),v([d({type:Number})],m.prototype,"currentUsage",2),v([d({type:Number})],m.prototype,"l1Usage",2),v([d({type:Number})],m.prototype,"l2Usage",2),v([d({type:Number})],m.prototype,"l3Usage",2),v([d({type:Boolean})],m.prototype,"configured",2),m=v([V("cc-charger-card")],m);var Xe=Object.defineProperty,et=Object.getOwnPropertyDescriptor,x=(s,e,t,r)=>{for(var o=r>1?void 0:r?et(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(o=(r?a(e,t,o):a(o))||o);return r&&o&&Xe(e,t,o),o};const we=["L1","L2","L3"],tt=[{value:"P1",label:"Charger phase 1"},{value:"P2",label:"Charger phase 2"},{value:"P3",label:"Charger phase 3"}];let y=class extends b{constructor(){super(...arguments),this.chargerId="",this.households={},this.config=null,this._data={L1:"P1",L2:"P2",L3:"P3"},this._error="",this._saving=!1}willUpdate(s){s.has("config")&&this.config&&(this._data={household_id:this.config.household_id,...this.config.phase_map})}get _schema(){return[{name:"household_id",required:!0,selector:{select:{mode:"dropdown",options:Object.values(this.households).map(s=>({value:s.household_id,label:s.name}))}}},...we.map(s=>({name:s,required:!0,selector:{select:{mode:"dropdown",options:tt}}}))]}get _phaseMapValid(){return new Set(we.map(s=>this._data[s])).size===3}render(){if(Object.keys(this.households).length===0)return l`
        <ha-card header="Load balancing configuration">
          <div class="card-content">
            <p class="warning-text">
              No households are configured. Add a household in the "Households" tab before
              configuring load balancing for this charger.
            </p>
          </div>
        </ha-card>
      `;const s=!!this._data.household_id&&this._phaseMapValid;return l`
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
            .computeLabel=${e=>e.name==="household_id"?"Household":`Household ${e.name}`}
            @value-changed=${e=>this._data=e.detail.value}
          ></ha-form>
          ${this._phaseMapValid?c:l`<p class="error">Each charger phase can only be selected once.</p>`}
          ${this._error?l`<p class="error">${this._error}</p>`:c}
        </div>
        <div class="card-actions">
          ${this.config?l`<ha-button variant="danger" appearance="plain" @click=${this._remove}>
                Remove configuration
              </ha-button>`:c}
          <ha-button .disabled=${!s||this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `}async _call(s){this._saving=!0,this._error="";try{await this.hass.callWS(s),this.dispatchEvent(new CustomEvent("config-saved",{bubbles:!0,composed:!0}))}catch(e){this._error=e?.message??String(e)}finally{this._saving=!1}}_save(){const{household_id:s,L1:e,L2:t,L3:r}=this._data;return this._call({type:"generic_charge_controller/chargers/save",charger_id:this.chargerId,config:{type:"easee",household_id:s,phase_map:{L1:e,L2:t,L3:r}}})}_remove(){return this._call({type:"generic_charge_controller/chargers/delete",charger_id:this.chargerId})}};y.styles=D`
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
  `,x([d({attribute:!1})],y.prototype,"hass",2),x([d()],y.prototype,"chargerId",2),x([d({attribute:!1})],y.prototype,"households",2),x([d({attribute:!1})],y.prototype,"config",2),x([f()],y.prototype,"_data",2),x([f()],y.prototype,"_error",2),x([f()],y.prototype,"_saving",2),y=x([V("cc-load-balancer-settings")],y);var st=Object.defineProperty,rt=Object.getOwnPropertyDescriptor,oe=(s,e,t,r)=>{for(var o=r>1?void 0:r?rt(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(o=(r?a(e,t,o):a(o))||o);return r&&o&&st(e,t,o),o};const ot=["l1","l2","l3"];let z=class extends b{_phaseValue(s){const e=this.hass.states[s];if(!e||e.state==="unavailable"||e.state==="unknown")return l`<span class="unavailable">unavailable</span>`;const t=e.attributes.unit_of_measurement??"";return l`${e.state} ${t}`}render(){const s=this.household;return l`
      <ha-card .header=${s.name}>
        <div class="card-content">
          <div class="row">
            <span class="label">Main fuse:</span>
            <span class="value">${s.fuse_a} A</span>
          </div>
          ${ot.map(e=>{const t=s[`${e}_entity`];return l`
              <div class="row">
                <span class="label" title=${t}>${e.toUpperCase()}:</span>
                <span class="value">${this._phaseValue(t)}</span>
              </div>
            `})}
        </div>
        <div class="card-actions">
          <ha-button variant="danger" appearance="plain" @click=${this._delete}>Delete</ha-button>
          <ha-button @click=${this._edit}>Edit</ha-button>
        </div>
      </ha-card>
    `}_fire(s){this.dispatchEvent(new CustomEvent(s,{detail:{householdId:this.household.household_id},bubbles:!0,composed:!0}))}_edit(){this._fire("household-edit")}_delete(){this._fire("household-delete")}};z.styles=D`
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
  `,oe([d({attribute:!1})],z.prototype,"hass",2),oe([d({attribute:!1})],z.prototype,"household",2),z=oe([V("cc-household-card")],z);var it=Object.defineProperty,at=Object.getOwnPropertyDescriptor,N=(s,e,t,r)=>{for(var o=r>1?void 0:r?at(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(o=(r?a(e,t,o):a(o))||o);return r&&o&&it(e,t,o),o};const ie=s=>({name:s,required:!0,selector:{entity:{filter:{domain:"sensor",device_class:"current"}}}}),nt=[{name:"name",required:!0,selector:{text:{}}},{name:"fuse_a",required:!0,selector:{number:{min:6,max:250,step:1,mode:"box",unit_of_measurement:"A"}}},ie("l1_entity"),ie("l2_entity"),ie("l3_entity")],lt={name:"Name",fuse_a:"Main fuse rating",l1_entity:"Current sensor L1",l2_entity:"Current sensor L2",l3_entity:"Current sensor L3"};let A=class extends b{constructor(){super(...arguments),this.household=null,this._data={fuse_a:20},this._error="",this._saving=!1}willUpdate(s){if(s.has("household")&&this.household){const{household_id:e,...t}=this.household;this._data=t}}get _valid(){const s=this._data;return!!(s.name?.trim()&&s.fuse_a&&s.l1_entity&&s.l2_entity&&s.l3_entity)}render(){return l`
      <ha-card .header=${this.household?`Edit ${this.household.name}`:"New household"}>
        <div class="card-content">
          <p class="description">
            The main fuse rating applies to all three phases. Pick the sensors that report the
            total current per phase for the household, for example from a power meter reader.
          </p>
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${nt}
            .computeLabel=${s=>lt[s.name]??s.name}
            @value-changed=${s=>this._data=s.detail.value}
          ></ha-form>
          ${this._error?l`<p class="error">${this._error}</p>`:c}
        </div>
        <div class="card-actions">
          <ha-button appearance="plain" @click=${this._cancel}>Cancel</ha-button>
          <ha-button .disabled=${!this._valid||this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `}async _save(){this._saving=!0,this._error="";try{await this.hass.callWS({type:"generic_charge_controller/households/save",...this.household?{household_id:this.household.household_id}:{},config:this._data}),this.dispatchEvent(new CustomEvent("household-saved",{bubbles:!0,composed:!0}))}catch(s){this._error=s?.message??String(s)}finally{this._saving=!1}}_cancel(){this.dispatchEvent(new CustomEvent("editor-closed",{bubbles:!0,composed:!0}))}};A.styles=D`
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
  `,N([d({attribute:!1})],A.prototype,"hass",2),N([d({attribute:!1})],A.prototype,"household",2),N([f()],A.prototype,"_data",2),N([f()],A.prototype,"_error",2),N([f()],A.prototype,"_saving",2),A=N([V("cc-household-editor")],A);var ht=Object.defineProperty,ct=Object.getOwnPropertyDescriptor,$=(s,e,t,r)=>{for(var o=r>1?void 0:r?ct(e,t):e,i=s.length-1,a;i>=0;i--)(a=s[i])&&(o=(r?a(e,t,o):a(o))||o);return r&&o&&ht(e,t,o),o};const G="generic_charge_controller";let g=class extends b{constructor(){super(...arguments),this.narrow=!1,this.route={path:""},this.panel={},this._elementsLoaded=!1,this._selectedChargerId=null,this._activeTab="households",this._routeApplied=!1,this._households={},this._chargerConfigs={},this._discoveredChargers=[],this._editingHousehold=null,this._error=""}firstUpdated(){this._loadElements(),this._loadData()}async _loadElements(){await Ze(),this._elementsLoaded=!0}async _loadData(){try{const[s,e,t]=await Promise.all([this.hass.callWS({type:`${G}/households/get`}),this.hass.callWS({type:`${G}/chargers/get`}),this.hass.callWS({type:`${G}/chargers/discover`})]);this._households=s,this._chargerConfigs=e,this._discoveredChargers=t}catch(s){this._error=`Error loading data from Charge Controller backend: ${s?.message??s}`}}willUpdate(s){s.has("route")&&this._applyRoute()}connectedCallback(){super.connectedCallback(),this._routeApplied||(this._applyRoute(),this._routeApplied=!0)}render(){if(!this._elementsLoaded)return l`<div class="loading">Loading...</div>`;const s=this._discoveredChargers.map(r=>Ge(this.hass,r)),e=!!this._selectedChargerId,t=e?s.find(r=>r.id===this._selectedChargerId)??null:null;return l`
      <div class="toolbar">
        ${e?l`
            <ha-icon-button .label=${"Back"} @click=${this._goBack}>
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`:c}
        <div class="title">
          ${e?t?.name??"Charger Details":"Charge Controller"}
        </div>
        ${e?c:l`
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
        ${e?this._renderDetail(t):this._activeTab==="households"?this._renderHouseholds():this._renderChargers(s)}
      </div>
    `}_renderChargerCard(s,e){return l`
      <cc-charger-card
        .chargerId=${s.id}
        .name=${s.name}
        .serialNumber=${s.serialNumber}
        .status=${s.status}
        .power=${s.power}
        .currentLimit=${s.currentLimit}
        .currentUsage=${s.currentUsage}
        .l1Usage=${s.l1_usage}
        .l2Usage=${s.l2_usage}
        .l3Usage=${s.l3_usage}
        .configured=${!!this._chargerConfigs[s.id]}
        @charger-selected=${e?this._onChargerSelected:null}
      ></cc-charger-card>
    `}_renderChargers(s){if(s.length===0)return l`<p>No Easee chargers detected in your system.</p>`;const e=r=>this._chargerConfigs[r.id]?.household_id,t=s.filter(r=>{const o=e(r);return!o||!this._households[o]});return l`
      ${Object.values(this._households).map(r=>this._renderChargerGroup(r.name,s.filter(o=>e(o)===r.household_id),"No chargers assigned to this household."))}
      ${t.length>0?this._renderChargerGroup("Not configured",t,""):c}
    `}_renderChargerGroup(s,e,t){return l`
      <section class="group">
        <h2 class="group-header">${s}</h2>
        ${e.length===0?l`<p class="group-empty">${t}</p>`:l`<div class="grid">${e.map(r=>this._renderChargerCard(r,!0))}</div>`}
      </section>
    `}_renderHouseholds(){if(this._editingHousehold!==null){const e=this._editingHousehold==="new"?null:this._households[this._editingHousehold];return l`
        <div class="detail-view">
          <cc-household-editor
            .hass=${this.hass}
            .household=${e}
            @household-saved=${this._onHouseholdSaved}
            @editor-closed=${()=>this._editingHousehold=null}
          ></cc-household-editor>
        </div>
      `}const s=Object.values(this._households);return l`
      <div class="actions">
        <ha-button @click=${()=>this._editingHousehold="new"}>Add household</ha-button>
      </div>
      ${s.length===0?l`<p>No households configured yet.</p>`:l`
            <div class="grid">
              ${s.map(e=>l`
                  <cc-household-card
                    .hass=${this.hass}
                    .household=${e}
                    @household-edit=${t=>this._editingHousehold=t.detail.householdId}
                    @household-delete=${this._onHouseholdDelete}
                  ></cc-household-card>
                `)}
            </div>
          `}
    `}_renderDetail(s){return s?l`
      <div class="detail-view">
        ${this._renderChargerCard(s,!1)}
        <cc-load-balancer-settings
          .hass=${this.hass}
          .chargerId=${s.id}
          .households=${this._households}
          .config=${this._chargerConfigs[s.id]??null}
          @config-saved=${this._loadData}
        ></cc-load-balancer-settings>
      </div>
    `:l`<p>Charger not found.</p>`}_navigate(s){history.replaceState(null,"",`/charge-controller${s}`),window.dispatchEvent(new Event("location-changed"))}_goBack(){this._selectedChargerId=null,this._navigate("")}_onChargerSelected(s){this._selectedChargerId=s.detail.chargerId,this._navigate(`/charger/${s.detail.chargerId}`)}async _onHouseholdSaved(){this._editingHousehold=null,await this._loadData()}async _onHouseholdDelete(s){const e=this._households[s.detail.householdId];if(!(!e||!confirm(`Delete household "${e.name}"?`)))try{await this.hass.callWS({type:`${G}/households/delete`,household_id:e.household_id}),await this._loadData()}catch(t){this._error=t?.message??String(t)}}_applyRoute(){const s=this.route?.path??"";s.startsWith("/charger/")?this._selectedChargerId=decodeURIComponent(s.slice(9)):this._selectedChargerId=null,this._routeApplied=!0}};g.styles=D`
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
  `,$([d({attribute:!1})],g.prototype,"hass",2),$([d({type:Boolean,reflect:!0})],g.prototype,"narrow",2),$([d({type:Object})],g.prototype,"route",2),$([d({type:Object})],g.prototype,"panel",2),$([f()],g.prototype,"_elementsLoaded",2),$([f()],g.prototype,"_selectedChargerId",2),$([f()],g.prototype,"_activeTab",2),$([f()],g.prototype,"_routeApplied",2),$([f()],g.prototype,"_households",2),$([f()],g.prototype,"_chargerConfigs",2),$([f()],g.prototype,"_discoveredChargers",2),$([f()],g.prototype,"_editingHousehold",2),$([f()],g.prototype,"_error",2),g=$([V("charge-controller-panel")],g)})();
