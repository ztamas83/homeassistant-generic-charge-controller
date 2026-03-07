(function(){"use strict";const k=globalThis,V=k.ShadowRoot&&(k.ShadyCSS===void 0||k.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,z=Symbol(),J=new WeakMap;let K=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==z)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(V&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=J.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&J.set(t,e))}return e}toString(){return this.cssText}};const ue=i=>new K(typeof i=="string"?i:i+"",void 0,z),Y=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((s,r,n)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[n+1],i[0]);return new K(t,i,z)},fe=(i,e)=>{if(V)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),r=k.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}},Q=V?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return ue(t)})(i):i;const{is:ge,defineProperty:$e,getOwnPropertyDescriptor:me,getOwnPropertyNames:_e,getOwnPropertySymbols:ve,getPrototypeOf:ye}=Object,R=globalThis,X=R.trustedTypes,be=X?X.emptyScript:"",we=R.reactiveElementPolyfillSupport,O=(i,e)=>i,I={toAttribute(i,e){switch(e){case Boolean:i=i?be:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},W=(i,e)=>!ge(i,e),ee={attribute:!0,type:String,converter:I,reflect:!1,useDefault:!1,hasChanged:W};Symbol.metadata??=Symbol("metadata"),R.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ee){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(e,s,t);r!==void 0&&$e(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){const{get:r,set:n}=me(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:r,set(o){const c=r?.call(this);n?.call(this,o),this.requestUpdate(e,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ee}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;const e=ye(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){const t=this.properties,s=[..._e(t),...ve(t)];for(const r of s)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,r]of t)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const r=this._$Eu(t,s);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(Q(r))}else e!==void 0&&t.push(Q(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return fe(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){const n=(s.converter?.toAttribute!==void 0?s.converter:I).toAttribute(t,s.type);this._$Em=e,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const n=s.getPropertyOptions(r),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:I;this._$Em=r;const c=o.fromAttribute(t,n.type);this[r]=c??this._$Ej?.get(r)??c,this._$Em=null}}requestUpdate(e,t,s,r=!1,n){if(e!==void 0){const o=this.constructor;if(r===!1&&(n=this[e]),s??=o.getPropertyOptions(e),!((s.hasChanged??W)(n,t)||s.useDefault&&s.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:r,wrapped:n},o){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),n!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,n]of s){const{wrapped:o}=n,c=this[r];o!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,n,c)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[O("elementProperties")]=new Map,x[O("finalized")]=new Map,we?.({ReactiveElement:x}),(R.reactiveElementVersions??=[]).push("2.1.2");const q=globalThis,te=i=>i,D=q.trustedTypes,se=D?D.createPolicy("lit-html",{createHTML:i=>i}):void 0,ie="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,re="?"+b,Ae=`<${re}>`,w=document,N=()=>w.createComment(""),M=i=>i===null||typeof i!="object"&&typeof i!="function",F=Array.isArray,Ce=i=>F(i)||typeof i?.[Symbol.iterator]=="function",Z=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ne=/-->/g,oe=/>/g,A=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ae=/'/g,ce=/"/g,le=/^(?:script|style|textarea|title)$/i,Ee=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),_=Ee(1),S=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),he=new WeakMap,C=w.createTreeWalker(w,129);function de(i,e){if(!F(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return se!==void 0?se.createHTML(e):e}const xe=(i,e)=>{const t=i.length-1,s=[];let r,n=e===2?"<svg>":e===3?"<math>":"",o=H;for(let c=0;c<t;c++){const a=i[c];let h,d,l=-1,u=0;for(;u<a.length&&(o.lastIndex=u,d=o.exec(a),d!==null);)u=o.lastIndex,o===H?d[1]==="!--"?o=ne:d[1]!==void 0?o=oe:d[2]!==void 0?(le.test(d[2])&&(r=RegExp("</"+d[2],"g")),o=A):d[3]!==void 0&&(o=A):o===A?d[0]===">"?(o=r??H,l=-1):d[1]===void 0?l=-2:(l=o.lastIndex-d[2].length,h=d[1],o=d[3]===void 0?A:d[3]==='"'?ce:ae):o===ce||o===ae?o=A:o===ne||o===oe?o=H:(o=A,r=void 0);const m=o===A&&i[c+1].startsWith("/>")?" ":"";n+=o===H?a+Ae:l>=0?(s.push(h),a.slice(0,l)+ie+a.slice(l)+b+m):a+b+(l===-2?c:m)}return[de(i,n+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class L{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let n=0,o=0;const c=e.length-1,a=this.parts,[h,d]=xe(e,t);if(this.el=L.createElement(h,s),C.currentNode=this.el.content,t===2||t===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(r=C.nextNode())!==null&&a.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(const l of r.getAttributeNames())if(l.endsWith(ie)){const u=d[o++],m=r.getAttribute(l).split(b),E=/([.?@])?(.*)/.exec(u);a.push({type:1,index:n,name:E[2],strings:m,ctor:E[1]==="."?Pe:E[1]==="?"?Ue:E[1]==="@"?Oe:j}),r.removeAttribute(l)}else l.startsWith(b)&&(a.push({type:6,index:n}),r.removeAttribute(l));if(le.test(r.tagName)){const l=r.textContent.split(b),u=l.length-1;if(u>0){r.textContent=D?D.emptyScript:"";for(let m=0;m<u;m++)r.append(l[m],N()),C.nextNode(),a.push({type:2,index:++n});r.append(l[u],N())}}}else if(r.nodeType===8)if(r.data===re)a.push({type:2,index:n});else{let l=-1;for(;(l=r.data.indexOf(b,l+1))!==-1;)a.push({type:7,index:n}),l+=b.length-1}n++}}static createElement(e,t){const s=w.createElement("template");return s.innerHTML=e,s}}function P(i,e,t=i,s){if(e===S)return e;let r=s!==void 0?t._$Co?.[s]:t._$Cl;const n=M(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(i),r._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=r:t._$Cl=r),r!==void 0&&(e=P(i,r._$AS(i,e.values),r,s)),e}class Se{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,r=(e?.creationScope??w).importNode(t,!0);C.currentNode=r;let n=C.nextNode(),o=0,c=0,a=s[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new T(n,n.nextSibling,this,e):a.type===1?h=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(h=new Ne(n,this,e)),this._$AV.push(h),a=s[++c]}o!==a?.index&&(n=C.nextNode(),o++)}return C.currentNode=w,r}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class T{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,r){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=P(this,e,t),M(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ce(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&M(this._$AH)?this._$AA.nextSibling.data=e:this.T(w.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=L.createElement(de(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(t);else{const n=new Se(r,this),o=n.u(this.options);n.p(t),this.T(o),this._$AH=n}}_$AC(e){let t=he.get(e.strings);return t===void 0&&he.set(e.strings,t=new L(e)),t}k(e){F(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const n of e)r===t.length?t.push(s=new T(this.O(N()),this.O(N()),this,this.options)):s=t[r],s._$AI(n),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=te(e).nextSibling;te(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class j{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,r,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}_$AI(e,t=this,s,r){const n=this.strings;let o=!1;if(n===void 0)e=P(this,e,t,0),o=!M(e)||e!==this._$AH&&e!==S,o&&(this._$AH=e);else{const c=e;let a,h;for(e=n[0],a=0;a<n.length-1;a++)h=P(this,c[s+a],t,a),h===S&&(h=this._$AH[a]),o||=!M(h)||h!==this._$AH[a],h===p?e=p:e!==p&&(e+=(h??"")+n[a+1]),this._$AH[a]=h}o&&!r&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Pe extends j{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}}class Ue extends j{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}}class Oe extends j{constructor(e,t,s,r,n){super(e,t,s,r,n),this.type=5}_$AI(e,t=this){if((e=P(this,e,t,0)??p)===S)return;const s=this._$AH,r=e===p&&s!==p||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==p&&(s===p||r);r&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ne{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){P(this,e)}}const Me=q.litHtmlPolyfillSupport;Me?.(L,T),(q.litHtmlVersions??=[]).push("3.3.2");const He=(i,e,t)=>{const s=t?.renderBefore??e;let r=s._$litPart$;if(r===void 0){const n=t?.renderBefore??null;s._$litPart$=r=new T(e.insertBefore(N(),n),n,void 0,t??{})}return r._$AI(i),r};const G=globalThis;class U extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=He(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}}U._$litElement$=!0,U.finalized=!0,G.litElementHydrateSupport?.({LitElement:U});const Le=G.litElementPolyfillSupport;Le?.({LitElement:U}),(G.litElementVersions??=[]).push("4.2.2");const pe=i=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(i,e)}):customElements.define(i,e)};const Te={attribute:!0,type:String,converter:I,reflect:!1,hasChanged:W},ke=(i=Te,e,t)=>{const{kind:s,metadata:r}=t;let n=globalThis.litPropertyMetadata.get(r);if(n===void 0&&globalThis.litPropertyMetadata.set(r,n=new Map),s==="setter"&&((i=Object.create(i)).wrapped=!0),n.set(t.name,i),s==="accessor"){const{name:o}=t;return{set(c){const a=e.get.call(this);e.set.call(this,c),this.requestUpdate(o,a,i,!0,c)},init(c){return c!==void 0&&this.C(o,void 0,i,c),c}}}if(s==="setter"){const{name:o}=t;return function(c){const a=this[o];e.call(this,c),this.requestUpdate(o,a,i,!0,c)}}throw Error("Unsupported decorator location: "+s)};function f(i){return(e,t)=>typeof t=="object"?ke(i,e,t):((s,r,n)=>{const o=r.hasOwnProperty(n);return r.constructor.createProperty(n,s),o?Object.getOwnPropertyDescriptor(r,n):void 0})(i,e,t)}function B(i){return f({...i,state:!0,attribute:!1})}const Re=async()=>{if(!customElements.get("ha-entity-picker")){if(!customElements.get("ha-selector")){await customElements.whenDefined("partial-panel-resolver");const i=document.createElement("partial-panel-resolver");i.hass={panels:[{url_path:"tmp",component_name:"config"}]},i._updateRoutes(),await i.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await document.createElement("ha-panel-config").routerOptions.routes.automation.load()}if(!customElements.get("ha-entity-picker"))try{await(await(await window.loadCardHelpers()).createCardElement({type:"entities",entities:[]})).constructor.getConfigElement()}catch{}if(!customElements.get("ha-entity-picker"))try{await Promise.race([customElements.whenDefined("ha-selector"),new Promise((t,s)=>setTimeout(()=>s(new Error("timeout")),1e4))]);const i=document.querySelector("home-assistant")?.hass,e=document.createElement("div");e.style.cssText="position:fixed;left:-9999px;opacity:0;pointer-events:none",document.body.appendChild(e);try{const t=document.createElement("ha-selector");t.hass=i,t.selector={entity:{}},e.appendChild(t),await Promise.race([customElements.whenDefined("ha-entity-picker"),new Promise(s=>setTimeout(s,5e3))])}finally{e.remove()}}catch{}if(await customElements.whenDefined("ha-card"),!customElements.get("ha-date-range-picker"))try{await(await window.loadCardHelpers()).createCardElement({type:"energy-date-selection",entities:[]}),await Promise.race([customElements.whenDefined("ha-date-range-picker"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}if(!customElements.get("ha-chart-base"))try{await(await window.loadCardHelpers()).createCardElement({type:"statistics-graph",entities:[]}),await Promise.race([customElements.whenDefined("ha-chart-base"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}}},Ie=i=>{const e=Object.values(i.entities).filter(r=>r.platform==="easee"),t=new Set;for(const r of e)r.device_id&&t.add(r.device_id);const s=[];for(const r of t){const n=i.devices[r];if(!n)continue;const c=Object.values(i.entities).filter(u=>u.device_id===r).reduce((u,m)=>{const E=i.states[m.entity_id];return E&&u.set(m.entity_id,E),u},new Map);console.log(`State map for device ${r}: `,c);const a=u=>`sensor.${n.name?.toLowerCase().replace(/\s+/g,"_")}_${u}`,h=c.get(a("status"))?.state||"Unknown",d=parseFloat(c.get(a("power"))?.state||"0"),l=parseFloat(c.get(a("max_circuit_limit"))?.state||"0");s.push({id:r,name:n.name||"Unknown Charger",serialNumber:n.serial_number||"N/A",status:h,power:d,currentLimit:l,currentUsage:d*1e3/230,configured:!1})}return s},De="M12,3A1,1 0 0,1 13,4V4.39C17.65,5.15 21,7.45 21,10.13C21,11.19 19.82,12.14 18,12.8V19H19V21H5V19H6V12.8C4.18,12.14 3,11.19 3,10.13C3,7.45 6.35,5.15 11,4.39V4A1,1 0 0,1 12,3M12,6.13C8.13,6.13 5,7.45 5,9.13C5,10.81 8.13,12.13 12,12.13C15.87,12.13 19,10.81 19,9.13C19,7.45 15.87,6.13 12,6.13M12,14.13C9.8,14.13 8,15.93 8,18.13V19H16V18.13C16,15.93 14.2,14.13 12,14.13Z",je="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.66,19.59 13.4,20 12,20C9.8,20 8,18.2 8,16V11.27L2,5.27M12,2C12.55,2 13,2.45 13,3V3.39C17.65,4.15 21,6.45 21,9.13C21,10.19 19.82,11.14 18,11.8V17.27L13.73,13C15.6,12.59 17,11.5 17,10.13C17,8.45 13.87,7.13 10,7.13C9.05,7.13 8.15,7.21 7.34,7.34L5.11,5.11C6.7,4.24 8.74,3.64 11,3.39V3C11,2.45 11.45,2 12,2M12,14C13.2,14 14.24,14.53 14.92,15.35L10.65,11.08C10.22,11.68 10,12.31 10,13C10,14.1 10.9,15 12,15V14Z";var Be=Object.defineProperty,Ve=Object.getOwnPropertyDescriptor,v=(i,e,t,s)=>{for(var r=s>1?void 0:s?Ve(e,t):e,n=i.length-1,o;n>=0;n--)(o=i[n])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&Be(e,t,r),r};let g=class extends U{constructor(){super(...arguments),this.chargerId="",this.name="",this.serialNumber="",this.status="",this.power=0,this.currentLimit=0,this.currentUsage=0,this.configured=!1}render(){const i=this.configured?this.status==="charging"?"accent-charging":"accent-idle":"accent-unconfigured";return _`
      <ha-card .header=${this.name} @click=${this._handleClick}>
        <div class="accent ${i}"></div>
        <ha-svg-icon
          class="configured-icon ${this.configured?"is-configured":""}"
          .path=${this.configured?De:je}
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
        <!-- Future action buttons can be added here -->
      </ha-card>
    `}_handleClick(){this.dispatchEvent(new CustomEvent("charger-selected",{detail:{chargerId:this.chargerId},bubbles:!0,composed:!0}))}};g.styles=Y`
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
  `,v([f()],g.prototype,"chargerId",2),v([f()],g.prototype,"name",2),v([f()],g.prototype,"serialNumber",2),v([f()],g.prototype,"status",2),v([f({type:Number})],g.prototype,"power",2),v([f({type:Number})],g.prototype,"currentLimit",2),v([f({type:Number})],g.prototype,"currentUsage",2),v([f({type:Boolean})],g.prototype,"configured",2),g=v([pe("cc-charger-card")],g);var ze=Object.defineProperty,We=Object.getOwnPropertyDescriptor,y=(i,e,t,s)=>{for(var r=s>1?void 0:s?We(e,t):e,n=i.length-1,o;n>=0;n--)(o=i[n])&&(r=(s?o(e,t,r):o(r))||r);return s&&r&&ze(e,t,r),r};let $=class extends U{constructor(){super(...arguments),this.narrow=!1,this.route={path:""},this.panel={},this._elementsLoaded=!1,this._selectedChargerId=null,this._activeTab="chargers",this._routeApplied=!1}firstUpdated(){this._loadElements()}async _loadElements(){await Re(),this._elementsLoaded=!0}willUpdate(i){i.has("route")&&this._applyRoute()}connectedCallback(){super.connectedCallback(),this._routeApplied||(this._applyRoute(),this._routeApplied=!0)}render(){if(!this._elementsLoaded)return _`<div class="loading">Loading...</div>`;const i=Ie(this.hass),e=!!this._selectedChargerId,t=e?i.find(s=>s.id===this._selectedChargerId):null;return _`
      <div class="toolbar">
        ${e?_`
            <ha-icon-button
              .label=${"Back"}
              @click=${this._goBack}
            >
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`:""}
        <div class="title">
          ${e?t?.name??"Charger Details":"Charge Controller"}
        </div>
      </div>
      <div class="content">
        ${e?this._renderDetail(t):this._renderGrid(i)}
      </div>
    `}_renderGrid(i){return _`
      ${i.length===0?_`<p>No Easee chargers detected in your system.</p>`:_`
            <div class="grid">
              ${i.map(e=>_`
                <cc-charger-card
                  .chargerId=${e.id}
                  .name=${e.name}
                  .serialNumber=${e.serialNumber}
                  .status=${e.status}
                  .power=${e.power}
                  .currentLimit=${e.currentLimit}
                  .currentUsage=${e.currentUsage}
                  .configured=${e.configured}
                  @charger-selected=${this._onChargerSelected}
                ></cc-charger-card>
              `)}
            </div>
          `}
    `}_renderDetail(i){return i?_`
      <div class="detail-view">
        <cc-charger-card
          .chargerId=${i.id}
          .name=${i.name}
          .serialNumber=${i.serialNumber}
          .status=${i.status}
          .power=${i.power}
          .currentLimit=${i.currentLimit}
          .currentUsage=${i.currentUsage}
          .configured=${i.configured}
        ></cc-charger-card>

        <ha-card header="Load Balancing Settings">
          <div class="card-content">
            <p>Placeholder for load balancing configuration.</p>
          </div>
        </ha-card>

        <ha-card header="Statistics">
          <div class="card-content">
            <p>Placeholder for charging statistics and history.</p>
          </div>
        </ha-card>
      </div>
    `:_`<p>Charger not found.</p>`}_navigate(i){history.replaceState(null,"",`/charge-controller${i}`),window.dispatchEvent(new Event("location-changed"))}_goBack(){this._selectedChargerId=null,this._navigate("")}_onChargerSelected(i){this._selectedChargerId=i.detail.chargerId,this._navigate(`/charger/${i.detail.chargerId}`)}_applyRoute(){const i=this.route?.path??"";i.startsWith("/charger/")?this._selectedChargerId=decodeURIComponent(i.slice(9)):this._selectedChargerId=null,this._routeApplied=!0}};$.styles=Y`
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
  `,y([f({attribute:!1})],$.prototype,"hass",2),y([f({type:Boolean,reflect:!0})],$.prototype,"narrow",2),y([f({type:Object})],$.prototype,"route",2),y([f({type:Object})],$.prototype,"panel",2),y([B()],$.prototype,"_elementsLoaded",2),y([B()],$.prototype,"_selectedChargerId",2),y([B()],$.prototype,"_activeTab",2),y([B()],$.prototype,"_routeApplied",2),$=y([pe("charge-controller-panel")],$)})();
