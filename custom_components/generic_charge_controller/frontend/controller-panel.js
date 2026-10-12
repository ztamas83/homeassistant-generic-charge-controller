/*
Generic Charge Controller includes third-party code under the following licenses.

--------------------------------------------------------------------------------
RoomMind
https://github.com/snazzybean/roommind

Used in:
  frontend/src/load-ha-elements.ts
  frontend/src/types/ha-elements.d.ts
  custom_components/generic_charge_controller/frontend/controller-panel.js (built)

MIT License

Copyright (c) 2026 SnazzyBean

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function(){"use strict";const Q=globalThis,nt=Q.ShadowRoot&&(Q.ShadyCSS===void 0||Q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,lt=Symbol(),$t=new WeakMap;let yt=class{constructor(t,s,r){if(this._$cssResult$=!0,r!==lt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o;const s=this.t;if(nt&&t===void 0){const r=s!==void 0&&s.length===1;r&&(t=$t.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&$t.set(s,t))}return t}toString(){return this.cssText}};const jt=e=>new yt(typeof e=="string"?e:e+"",void 0,lt),T=(e,...t)=>{const s=e.length===1?e[0]:t.reduce((r,i,a)=>r+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[a+1],e[0]);return new yt(s,e,lt)},Rt=(e,t)=>{if(nt)e.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of t){const r=document.createElement("style"),i=Q.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=s.cssText,e.appendChild(r)}},bt=nt?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let s="";for(const r of t.cssRules)s+=r.cssText;return jt(s)})(e):e;const{is:It,defineProperty:zt,getOwnPropertyDescriptor:Vt,getOwnPropertyNames:Bt,getOwnPropertySymbols:Wt,getPrototypeOf:Ft}=Object,tt=globalThis,xt=tt.trustedTypes,qt=xt?xt.emptyScript:"",Gt=tt.reactiveElementPolyfillSupport,q=(e,t)=>e,et={toAttribute(e,t){switch(t){case Boolean:e=e?qt:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=e!==null;break;case Number:s=e===null?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch{s=null}}return s}},ht=(e,t)=>!It(e,t),wt={attribute:!0,type:String,converter:et,reflect:!1,useDefault:!1,hasChanged:ht};Symbol.metadata??=Symbol("metadata"),tt.litPropertyMetadata??=new WeakMap;let j=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=wt){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(t,s),!s.noAccessor){const r=Symbol(),i=this.getPropertyDescriptor(t,r,s);i!==void 0&&zt(this.prototype,t,i)}}static getPropertyDescriptor(t,s,r){const{get:i,set:a}=Vt(this.prototype,t)??{get(){return this[s]},set(o){this[s]=o}};return{get:i,set(o){const c=i?.call(this);a?.call(this,o),this.requestUpdate(t,c,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??wt}static _$Ei(){if(this.hasOwnProperty(q("elementProperties")))return;const t=Ft(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(q("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(q("properties"))){const s=this.properties,r=[...Bt(s),...Wt(s)];for(const i of r)this.createProperty(i,s[i])}const t=this[Symbol.metadata];if(t!==null){const s=litPropertyMetadata.get(t);if(s!==void 0)for(const[r,i]of s)this.elementProperties.set(r,i)}this._$Eh=new Map;for(const[s,r]of this.elementProperties){const i=this._$Eu(s,r);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const s=[];if(Array.isArray(t)){const r=new Set(t.flat(1/0).reverse());for(const i of r)s.unshift(bt(i))}else t!==void 0&&s.push(bt(t));return s}static _$Eu(t,s){const r=s.attribute;return r===!1?void 0:typeof r=="string"?r:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const r of s.keys())this.hasOwnProperty(r)&&(t.set(r,this[r]),delete this[r]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Rt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,r){this._$AK(t,r)}_$ET(t,s){const r=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,r);if(i!==void 0&&r.reflect===!0){const a=(r.converter?.toAttribute!==void 0?r.converter:et).toAttribute(s,r.type);this._$Em=t,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(t,s){const r=this.constructor,i=r._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const a=r.getPropertyOptions(i),o=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:et;this._$Em=i;const c=o.fromAttribute(s,a.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(t,s,r,i=!1,a){if(t!==void 0){const o=this.constructor;if(i===!1&&(a=this[t]),r??=o.getPropertyOptions(t),!((r.hasChanged??ht)(a,s)||r.useDefault&&r.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,r))))return;this.C(t,s,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,s,{useDefault:r,reflect:i,wrapped:a},o){r&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??s??this[t]),a!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||r||(s=void 0),this._$AL.set(t,s)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,a]of this._$Ep)this[i]=a;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[i,a]of r){const{wrapped:o}=a,c=this[i];o!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,a,c)}}let t=!1;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(s)):this._$EM()}catch(r){throw t=!1,this._$EM(),r}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(t){}firstUpdated(t){}};j.elementStyles=[],j.shadowRootOptions={mode:"open"},j[q("elementProperties")]=new Map,j[q("finalized")]=new Map,Gt?.({ReactiveElement:j}),(tt.reactiveElementVersions??=[]).push("2.1.2");const ct=globalThis,Ct=e=>e,st=ct.trustedTypes,Et=st?st.createPolicy("lit-html",{createHTML:e=>e}):void 0,At="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,St="?"+H,Jt=`<${St}>`,U=document,G=()=>U.createComment(""),J=e=>e===null||typeof e!="object"&&typeof e!="function",dt=Array.isArray,Kt=e=>dt(e)||typeof e?.[Symbol.iterator]=="function",pt=`[ 	
\f\r]`,K=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Pt=/-->/g,Ot=/>/g,D=RegExp(`>|${pt}(?:([^\\s"'>=/]+)(${pt}*=${pt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Tt=/'/g,Ht=/"/g,Lt=/^(?:script|style|textarea|title)$/i,kt=e=>(t,...s)=>({_$litType$:e,strings:t,values:s}),n=kt(1),R=kt(2),I=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Mt=new WeakMap,N=U.createTreeWalker(U,129);function Ut(e,t){if(!dt(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Et!==void 0?Et.createHTML(t):t}const Zt=(e,t)=>{const s=e.length-1,r=[];let i,a=t===2?"<svg>":t===3?"<math>":"",o=K;for(let c=0;c<s;c++){const l=e[c];let _,d,u=-1,b=0;for(;b<l.length&&(o.lastIndex=b,d=o.exec(l),d!==null);)b=o.lastIndex,o===K?d[1]==="!--"?o=Pt:d[1]!==void 0?o=Ot:d[2]!==void 0?(Lt.test(d[2])&&(i=RegExp("</"+d[2],"g")),o=D):d[3]!==void 0&&(o=D):o===D?d[0]===">"?(o=i??K,u=-1):d[1]===void 0?u=-2:(u=o.lastIndex-d[2].length,_=d[1],o=d[3]===void 0?D:d[3]==='"'?Ht:Tt):o===Ht||o===Tt?o=D:o===Pt||o===Ot?o=K:(o=D,i=void 0);const A=o===D&&e[c+1].startsWith("/>")?" ":"";a+=o===K?l+Jt:u>=0?(r.push(_),l.slice(0,u)+At+l.slice(u)+H+A):l+H+(u===-2?c:A)}return[Ut(e,a+(e[s]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),r]};class Z{constructor({strings:t,_$litType$:s},r){let i;this.parts=[];let a=0,o=0;const c=t.length-1,l=this.parts,[_,d]=Zt(t,s);if(this.el=Z.createElement(_,r),N.currentNode=this.el.content,s===2||s===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=N.nextNode())!==null&&l.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const u of i.getAttributeNames())if(u.endsWith(At)){const b=d[o++],A=i.getAttribute(u).split(H),F=/([.?@])?(.*)/.exec(b);l.push({type:1,index:a,name:F[2],strings:A,ctor:F[1]==="."?Yt:F[1]==="?"?Qt:F[1]==="@"?te:rt}),i.removeAttribute(u)}else u.startsWith(H)&&(l.push({type:6,index:a}),i.removeAttribute(u));if(Lt.test(i.tagName)){const u=i.textContent.split(H),b=u.length-1;if(b>0){i.textContent=st?st.emptyScript:"";for(let A=0;A<b;A++)i.append(u[A],G()),N.nextNode(),l.push({type:2,index:++a});i.append(u[b],G())}}}else if(i.nodeType===8)if(i.data===St)l.push({type:2,index:a});else{let u=-1;for(;(u=i.data.indexOf(H,u+1))!==-1;)l.push({type:7,index:a}),u+=H.length-1}a++}}static createElement(t,s){const r=U.createElement("template");return r.innerHTML=t,r}}function z(e,t,s=e,r){if(t===I)return t;let i=r!==void 0?s._$Co?.[r]:s._$Cl;const a=J(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,s,r)),r!==void 0?(s._$Co??=[])[r]=i:s._$Cl=i),i!==void 0&&(t=z(e,i._$AS(e,t.values),i,r)),t}class Xt{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:s},parts:r}=this._$AD,i=(t?.creationScope??U).importNode(s,!0);N.currentNode=i;let a=N.nextNode(),o=0,c=0,l=r[0];for(;l!==void 0;){if(o===l.index){let _;l.type===2?_=new X(a,a.nextSibling,this,t):l.type===1?_=new l.ctor(a,l.name,l.strings,this,t):l.type===6&&(_=new ee(a,this,t)),this._$AV.push(_),l=r[++c]}o!==l?.index&&(a=N.nextNode(),o++)}return N.currentNode=U,i}p(t){let s=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(t,r,s),s+=r.strings.length-2):r._$AI(t[s])),s++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,r,i){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=z(this,t,s),J(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==I&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Kt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&J(this._$AH)?this._$AA.nextSibling.data=t:this.T(U.createTextNode(t)),this._$AH=t}$(t){const{values:s,_$litType$:r}=t,i=typeof r=="number"?this._$AC(t):(r.el===void 0&&(r.el=Z.createElement(Ut(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(s);else{const a=new Xt(i,this),o=a.u(this.options);a.p(s),this.T(o),this._$AH=a}}_$AC(t){let s=Mt.get(t.strings);return s===void 0&&Mt.set(t.strings,s=new Z(t)),s}k(t){dt(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let r,i=0;for(const a of t)i===s.length?s.push(r=new X(this.O(G()),this.O(G()),this,this.options)):r=s[i],r._$AI(a),i++;i<s.length&&(this._$AR(r&&r._$AB.nextSibling,i),s.length=i)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t!==this._$AB;){const r=Ct(t).nextSibling;Ct(t).remove(),t=r}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class rt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,r,i,a){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=s,this._$AM=i,this.options=a,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=h}_$AI(t,s=this,r,i){const a=this.strings;let o=!1;if(a===void 0)t=z(this,t,s,0),o=!J(t)||t!==this._$AH&&t!==I,o&&(this._$AH=t);else{const c=t;let l,_;for(t=a[0],l=0;l<a.length-1;l++)_=z(this,c[r+l],s,l),_===I&&(_=this._$AH[l]),o||=!J(_)||_!==this._$AH[l],_===h?t=h:t!==h&&(t+=(_??"")+a[l+1]),this._$AH[l]=_}o&&!i&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Yt extends rt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}}class Qt extends rt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}}class te extends rt{constructor(t,s,r,i,a){super(t,s,r,i,a),this.type=5}_$AI(t,s=this){if((t=z(this,t,s,0)??h)===I)return;const r=this._$AH,i=t===h&&r!==h||t.capture!==r.capture||t.once!==r.once||t.passive!==r.passive,a=t!==h&&(r===h||i);i&&this.element.removeEventListener(this.name,this,r),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ee{constructor(t,s,r){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(t){z(this,t)}}const se=ct.litHtmlPolyfillSupport;se?.(Z,X),(ct.litHtmlVersions??=[]).push("3.3.2");const re=(e,t,s)=>{const r=s?.renderBefore??t;let i=r._$litPart$;if(i===void 0){const a=s?.renderBefore??null;r._$litPart$=i=new X(t.insertBefore(G(),a),a,void 0,s??{})}return i._$AI(e),i};const ut=globalThis;class w extends j{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=re(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}}w._$litElement$=!0,w.finalized=!0,ut.litElementHydrateSupport?.({LitElement:w});const ie=ut.litElementPolyfillSupport;ie?.({LitElement:w}),(ut.litElementVersions??=[]).push("4.2.2");const L=e=>(t,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const ae={attribute:!0,type:String,converter:et,reflect:!1,hasChanged:ht},oe=(e=ae,t,s)=>{const{kind:r,metadata:i}=s;let a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r==="setter"&&((e=Object.create(e)).wrapped=!0),a.set(s.name,e),r==="accessor"){const{name:o}=s;return{set(c){const l=t.get.call(this);t.set.call(this,c),this.requestUpdate(o,l,e,!0,c)},init(c){return c!==void 0&&this.C(o,void 0,e,c),c}}}if(r==="setter"){const{name:o}=s;return function(c){const l=this[o];t.call(this,c),this.requestUpdate(o,l,e,!0,c)}}throw Error("Unsupported decorator location: "+r)};function p(e){return(t,s)=>typeof s=="object"?oe(e,t,s):((r,i,a)=>{const o=i.hasOwnProperty(a);return i.constructor.createProperty(a,r),o?Object.getOwnPropertyDescriptor(i,a):void 0})(e,t,s)}function g(e){return p({...e,state:!0,attribute:!1})}const ne=async()=>{if(!(customElements.get("ha-entity-picker")&&customElements.get("ha-form"))){if(!customElements.get("ha-selector")){await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");e.hass={panels:[{url_path:"tmp",component_name:"config"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await document.createElement("ha-panel-config").routerOptions.routes.automation.load()}if(!customElements.get("ha-entity-picker"))try{await(await(await window.loadCardHelpers()).createCardElement({type:"entities",entities:[]})).constructor.getConfigElement()}catch{}if(!customElements.get("ha-entity-picker"))try{await Promise.race([customElements.whenDefined("ha-selector"),new Promise((s,r)=>setTimeout(()=>r(new Error("timeout")),1e4))]);const e=document.querySelector("home-assistant")?.hass,t=document.createElement("div");t.style.cssText="position:fixed;left:-9999px;opacity:0;pointer-events:none",document.body.appendChild(t);try{const s=document.createElement("ha-selector");s.hass=e,s.selector={entity:{}},t.appendChild(s),await Promise.race([customElements.whenDefined("ha-entity-picker"),new Promise(r=>setTimeout(r,5e3))])}finally{t.remove()}}catch{}await customElements.whenDefined("ha-card"),await Promise.race([customElements.whenDefined("ha-form"),new Promise(e=>setTimeout(e,1e4))])}},gt=e=>{const t=parseFloat(e);return Number.isFinite(t)?t:0},le=(e,t)=>{const s=l=>{const _=t.entities[l];return _?e.states[_]:void 0},r=s("circuit_current"),i=l=>gt(r?.attributes[`state_circuitTotalPhaseConductorCurrentL${l}`]),[a,o,c]=[i(1),i(2),i(3)];return{id:t.device_id,name:t.name,serialNumber:t.serial,status:s("status")?.state??"unknown",power:gt(s("power")?.state),currentLimit:gt(s("max_circuit_limit")?.state),currentUsage:Math.max(a,o,c),l1_usage:a,l2_usage:o,l3_usage:c}},he="M12,3A1,1 0 0,1 13,4V4.39C17.65,5.15 21,7.45 21,10.13C21,11.19 19.82,12.14 18,12.8V19H19V21H5V19H6V12.8C4.18,12.14 3,11.19 3,10.13C3,7.45 6.35,5.15 11,4.39V4A1,1 0 0,1 12,3M12,6.13C8.13,6.13 5,7.45 5,9.13C5,10.81 8.13,12.13 12,12.13C15.87,12.13 19,10.81 19,9.13C19,7.45 15.87,6.13 12,6.13M12,14.13C9.8,14.13 8,15.93 8,18.13V19H16V18.13C16,15.93 14.2,14.13 12,14.13Z",ce="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.66,19.59 13.4,20 12,20C9.8,20 8,18.2 8,16V11.27L2,5.27M12,2C12.55,2 13,2.45 13,3V3.39C17.65,4.15 21,6.45 21,9.13C21,10.19 19.82,11.14 18,11.8V17.27L13.73,13C15.6,12.59 17,11.5 17,10.13C17,8.45 13.87,7.13 10,7.13C9.05,7.13 8.15,7.21 7.34,7.34L5.11,5.11C6.7,4.24 8.74,3.64 11,3.39V3C11,2.45 11.45,2 12,2M12,14C13.2,14 14.24,14.53 14.92,15.35L10.65,11.08C10.22,11.68 10,12.31 10,13C10,14.1 10.9,15 12,15V14Z";var de=Object.defineProperty,pe=Object.getOwnPropertyDescriptor,$=(e,t,s,r)=>{for(var i=r>1?void 0:r?pe(t,s):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,s,i):o(i))||i);return r&&i&&de(t,s,i),i};let m=class extends w{constructor(){super(...arguments),this.chargerId="",this.name="",this.serialNumber="",this.status="",this.power=0,this.currentLimit=0,this.currentUsage=0,this.l1Usage=0,this.l2Usage=0,this.l3Usage=0,this.configured=!1,this.targets=null,this.mode=null,this.controlActive=null}_formatTarget(e){return e===null?"–":e.toFixed(0)}render(){const e=this.configured?this.status==="charging"?"accent-charging":"accent-idle":"accent-unconfigured";return n`
      <ha-card .header=${this.name} @click=${this._handleClick}>
        <div class="accent ${e}"></div>
        <ha-svg-icon
          class="configured-icon ${this.configured?"is-configured":""}"
          .path=${this.configured?he:ce}
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
          ${this.configured&&this.targets?n`
              <div class="row">
                <span class="label">Target (P1/P2/P3):</span>
                <span class="value">${this.targets.map(t=>this._formatTarget(t)).join(" / ")} A</span>
              </div>
              <div class="row">
                <span class="label">Load balancing:</span>
                <span class="value mode ${this.mode??""}">${this.mode??"unknown"}</span>
              </div>
              <div class="row">
                <span class="label">Sending limits:</span>
                <span class="value">${this.controlActive===null?"–":this.controlActive?"On":"Off"}</span>
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
          ${this.configured?n`<ha-button>Details</ha-button>`:n`<ha-button class="warning">Configure</ha-button>`}
        </div>
      </ha-card>
    `}_handleClick(){this.dispatchEvent(new CustomEvent("charger-selected",{detail:{chargerId:this.chargerId},bubbles:!0,composed:!0}))}};m.styles=T`
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
  `,$([p()],m.prototype,"chargerId",2),$([p()],m.prototype,"name",2),$([p()],m.prototype,"serialNumber",2),$([p()],m.prototype,"status",2),$([p({type:Number})],m.prototype,"power",2),$([p({type:Number})],m.prototype,"currentLimit",2),$([p({type:Number})],m.prototype,"currentUsage",2),$([p({type:Number})],m.prototype,"l1Usage",2),$([p({type:Number})],m.prototype,"l2Usage",2),$([p({type:Number})],m.prototype,"l3Usage",2),$([p({type:Boolean})],m.prototype,"configured",2),$([p({attribute:!1})],m.prototype,"targets",2),$([p()],m.prototype,"mode",2),$([p({attribute:!1})],m.prototype,"controlActive",2),m=$([L("cc-charger-card")],m);var ue=Object.defineProperty,ge=Object.getOwnPropertyDescriptor,O=(e,t,s,r)=>{for(var i=r>1?void 0:r?ge(t,s):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,s,i):o(i))||i);return r&&i&&ue(t,s,i),i};const _t=["L1","L2","L3"],_e=[{value:"P1",label:"Charger phase 1"},{value:"P2",label:"Charger phase 2"},{value:"P3",label:"Charger phase 3"}];let S=class extends w{constructor(){super(...arguments),this.chargerId="",this.households={},this.config=null,this._data={L1:"P1",L2:"P2",L3:"P3"},this._error="",this._saving=!1,this._expanded=null}willUpdate(e){e.has("config")&&this.config&&(this._data={household_id:this.config.household_id,...this.config.phase_map}),this._expanded===null&&(this._expanded=!this.config)}_summary(){if(!this.config)return"Not configured";const e=this.households[this.config.household_id]?.name??"Unknown household",t=_t.map(s=>`${s}→${this.config.phase_map[s]}`).join(", ");return`${e} · ${t}`}_renderHeader(){return n`
      <button
        class="header"
        aria-expanded=${this._expanded?"true":"false"}
        @click=${()=>this._expanded=!this._expanded}
      >
        <span class="header-text">
          <span class="title">Load balancing configuration</span>
          ${this._expanded?h:n`<span class="summary">${this._summary()}</span>`}
        </span>
        <span class="chevron ${this._expanded?"open":""}" aria-hidden="true">▾</span>
      </button>
    `}get _schema(){return[{name:"household_id",required:!0,selector:{select:{mode:"dropdown",options:Object.values(this.households).map(e=>({value:e.household_id,label:e.name}))}}},..._t.map(e=>({name:e,required:!0,selector:{select:{mode:"dropdown",options:_e}}}))]}get _phaseMapValid(){return new Set(_t.map(e=>this._data[e])).size===3}render(){if(Object.keys(this.households).length===0)return n`
        <ha-card header="Load balancing configuration">
          <div class="card-content">
            <p class="warning-text">
              No households are configured. Add a household in the "Households" tab before
              configuring load balancing for this charger.
            </p>
          </div>
        </ha-card>
      `;const e=!!this._data.household_id&&this._phaseMapValid;return this._expanded?n`
      <ha-card>
        ${this._renderHeader()}
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
          ${this._phaseMapValid?h:n`<p class="error">Each charger phase can only be selected once.</p>`}
          ${this._error?n`<p class="error">${this._error}</p>`:h}
        </div>
        <div class="card-actions">
          ${this.config?n`<ha-button variant="danger" appearance="plain" @click=${this._remove}>
                Remove configuration
              </ha-button>`:h}
          <ha-button .disabled=${!e||this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `:n`<ha-card>${this._renderHeader()}</ha-card>`}async _call(e){this._saving=!0,this._error="";try{return await this.hass.callWS(e),this.dispatchEvent(new CustomEvent("config-saved",{bubbles:!0,composed:!0})),!0}catch(t){return this._error=t?.message??String(t),!1}finally{this._saving=!1}}async _save(){const{household_id:e,L1:t,L2:s,L3:r}=this._data;await this._call({type:"generic_charge_controller/chargers/save",charger_id:this.chargerId,config:{type:"easee",household_id:e,phase_map:{L1:t,L2:s,L3:r}}})&&(this._expanded=!1)}_remove(){return this._call({type:"generic_charge_controller/chargers/delete",charger_id:this.chargerId})}};S.styles=T`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: 100%;
      padding: 16px;
      border: none;
      background: none;
      color: var(--primary-text-color);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .title {
      font-size: var(--ha-card-header-font-size, 20px);
    }

    .summary {
      color: var(--secondary-text-color);
      font-size: 14px;
    }

    .chevron {
      color: var(--secondary-text-color);
      font-size: 20px;
      transition: transform 0.2s;
      transform: rotate(-90deg);
    }

    .chevron.open {
      transform: none;
    }

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
  `,O([p({attribute:!1})],S.prototype,"hass",2),O([p()],S.prototype,"chargerId",2),O([p({attribute:!1})],S.prototype,"households",2),O([p({attribute:!1})],S.prototype,"config",2),O([g()],S.prototype,"_data",2),O([g()],S.prototype,"_error",2),O([g()],S.prototype,"_saving",2),O([g()],S.prototype,"_expanded",2),S=O([L("cc-load-balancer-settings")],S);var fe=Object.defineProperty,me=Object.getOwnPropertyDescriptor,ft=(e,t,s,r)=>{for(var i=r>1?void 0:r?me(t,s):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,s,i):o(i))||i);return r&&i&&fe(t,s,i),i};const ve=["l1","l2","l3"];let Y=class extends w{_phaseValue(e){const t=this.hass.states[e];if(!t||t.state==="unavailable"||t.state==="unknown")return n`<span class="unavailable">unavailable</span>`;const s=t.attributes.unit_of_measurement??"";return n`${t.state} ${s}`}render(){const e=this.household;return n`
      <ha-card .header=${e.name}>
        <div class="card-content">
          <div class="row">
            <span class="label">Main fuse:</span>
            <span class="value">${e.fuse_a} A</span>
          </div>
          ${ve.map(t=>{const s=e[`${t}_entity`];return n`
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
    `}_fire(e){this.dispatchEvent(new CustomEvent(e,{detail:{householdId:this.household.household_id},bubbles:!0,composed:!0}))}_edit(){this._fire("household-edit")}_delete(){this._fire("household-delete")}};Y.styles=T`
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
  `,ft([p({attribute:!1})],Y.prototype,"hass",2),ft([p({attribute:!1})],Y.prototype,"household",2),Y=ft([L("cc-household-card")],Y);var $e=Object.defineProperty,ye=Object.getOwnPropertyDescriptor,V=(e,t,s,r)=>{for(var i=r>1?void 0:r?ye(t,s):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,s,i):o(i))||i);return r&&i&&$e(t,s,i),i};const mt=e=>({name:e,required:!0,selector:{entity:{filter:{domain:"sensor",device_class:"current"}}}}),be=[{name:"name",required:!0,selector:{text:{}}},{name:"fuse_a",required:!0,selector:{number:{min:6,max:250,step:1,mode:"box",unit_of_measurement:"A"}}},mt("l1_entity"),mt("l2_entity"),mt("l3_entity")],xe={name:"Name",fuse_a:"Main fuse rating",l1_entity:"Current sensor L1",l2_entity:"Current sensor L2",l3_entity:"Current sensor L3"};let k=class extends w{constructor(){super(...arguments),this.household=null,this._data={fuse_a:20},this._error="",this._saving=!1}willUpdate(e){if(e.has("household")&&this.household){const{household_id:t,...s}=this.household;this._data=s}}get _valid(){const e=this._data;return!!(e.name?.trim()&&e.fuse_a&&e.l1_entity&&e.l2_entity&&e.l3_entity)}render(){return n`
      <ha-card .header=${this.household?`Edit ${this.household.name}`:"New household"}>
        <div class="card-content">
          <p class="description">
            The main fuse rating applies to all three phases. Pick the sensors that report the
            total current per phase for the household, for example from a power meter reader.
          </p>
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${be}
            .computeLabel=${e=>xe[e.name]??e.name}
            @value-changed=${e=>this._data=e.detail.value}
          ></ha-form>
          ${this._error?n`<p class="error">${this._error}</p>`:h}
        </div>
        <div class="card-actions">
          <ha-button appearance="plain" @click=${this._cancel}>Cancel</ha-button>
          <ha-button .disabled=${!this._valid||this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `}async _save(){this._saving=!0,this._error="";try{await this.hass.callWS({type:"generic_charge_controller/households/save",...this.household?{household_id:this.household.household_id}:{},config:this._data}),this.dispatchEvent(new CustomEvent("household-saved",{bubbles:!0,composed:!0}))}catch(e){this._error=e?.message??String(e)}finally{this._saving=!1}}_cancel(){this.dispatchEvent(new CustomEvent("editor-closed",{bubbles:!0,composed:!0}))}};k.styles=T`
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
  `,V([p({attribute:!1})],k.prototype,"hass",2),V([p({attribute:!1})],k.prototype,"household",2),V([g()],k.prototype,"_data",2),V([g()],k.prototype,"_error",2),V([g()],k.prototype,"_saving",2),k=V([L("cc-household-editor")],k);var we=Object.defineProperty,Ce=Object.getOwnPropertyDescriptor,C=(e,t,s,r)=>{for(var i=r>1?void 0:r?Ce(t,s):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,s,i):o(i))||i);return r&&i&&we(t,s,i),i};const Ee=[{hours:6,label:"6 h"},{hours:24,label:"24 h"},{hours:72,label:"3 d"},{hours:168,label:"7 d"}],it=["P1","P2","P3"],Ae=[{state:"charging",label:"Charging"},{state:"limited",label:"Limited"},{state:"failsafe",label:"Failsafe"},{state:"idle",label:"Idle"}],Se=6e4,vt=200,x={top:10,right:52,bottom:22,left:42},Dt=10,Pe=8,Oe=2;function at(e,t){let s=0,r=e.length-1,i;for(;s<=r;){const a=s+r>>1;e[a].t<=t?(i=e[a],s=a+1):r=a-1}return i}function Nt(e){for(const t of[1,2,5,10,20,50])if(e/t<=5)return t;return 100}let y=class extends w{constructor(){super(...arguments),this.targetEntities=[],this.modeEntity=null,this._hours=24,this._targets=[],this._modes=[],this._range=[0,0],this._loading=!1,this._error="",this._width=600,this._hoverT=null,this._fetchKey=""}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>this._fetch(),Se)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer),this._resizeObserver?.disconnect()}firstUpdated(){const e=this.renderRoot.querySelector(".chart");this._resizeObserver=new ResizeObserver(t=>{const s=Math.round(t[0].contentRect.width);s>0&&(this._width=s)}),this._resizeObserver.observe(e)}willUpdate(){this.toggleAttribute("dark",!!this.hass?.themes?.darkMode);const e=JSON.stringify([this.targetEntities,this.modeEntity,this._hours]);e!==this._fetchKey&&this.targetEntities.length>0&&(this._fetchKey=e,this._fetch())}async _fetch(){if(this.targetEntities.length===0)return;const e=Date.now(),t=e-this._hours*36e5,s=[...this.targetEntities,...this.modeEntity?[this.modeEntity]:[]];this._loading=!0;try{const r=await this.hass.callWS({type:"history/history_during_period",start_time:new Date(t).toISOString(),end_time:new Date(e).toISOString(),entity_ids:s,minimal_response:!0,no_attributes:!0,significant_changes_only:!1}),i=a=>(r[a]??[]).map(o=>({t:Math.max(o.lu*1e3,t),s:o.s}));this._targets=this.targetEntities.map(a=>i(a).map(({t:o,s:c})=>{const l=parseFloat(c);return{t:o,v:Number.isFinite(l)?l:null}})),this._modes=this.modeEntity?i(this.modeEntity):[],this._range=[t,e],this._error=""}catch(r){this._error=`History could not be loaded: ${r?.message??r}`}finally{this._loading=!1}}get _plotRight(){return this._width-x.right}_x(e){const[t,s]=this._range;return x.left+(e-t)/(s-t)*(this._plotRight-x.left)}get _yMax(){const e=this._targets.flat().map(r=>r.v??0),t=Math.max(10,...e),s=Nt(t);return Math.ceil(t/s)*s}_y(e){return x.top+(1-e/this._yMax)*(vt-x.top-x.bottom)}_formatTime(e,t){return new Intl.DateTimeFormat(this.hass.language,{...t?{weekday:"short",day:"numeric"}:{},hour:"2-digit",minute:"2-digit"}).format(new Date(e))}_stepPath(e,t){const s=this._range[1];let r="",i=!1;return e.forEach((a,o)=>{const c=o+1<e.length?e[o+1].t:s;if(a.v===null){i=!1;return}const l=this._y(a.v)+t;r+=i?` V${l}`:` M${this._x(a.t)},${l}`,r+=` H${this._x(c)}`,i=!0}),r.trim()}_endLabels(){const e=this._targets.map((t,s)=>{const r=t[t.length-1];return r?.v!=null?{i:s,y:this._y(r.v),v:r.v}:null}).filter(t=>t!==null).sort((t,s)=>t.y-s.y);for(let t=1;t<e.length;t++)e[t].y=Math.max(e[t].y,e[t-1].y+12);return e}_onPointerMove(e){const t=e.currentTarget,s=e.clientX-t.getBoundingClientRect().left;if(s<x.left||s>this._plotRight){this._hoverT=null;return}const[r,i]=this._range;this._hoverT=r+(s-x.left)/(this._plotRight-x.left)*(i-r)}render(){return n`
      <ha-card header="Calculated charging currents">
        <div class="card-content">
          <div class="controls">
            <div class="ranges">
              ${Ee.map(e=>n`
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
          ${this.targetEntities.length===0?n`<p class="hint">Save the load balancing configuration to start recording.</p>`:h}
          ${this._error?n`<p class="error">${this._error}</p>`:h}
          <div class="chart ${this._loading?"loading":""}">
            ${this._range[1]>0?this._renderChart():h}
          </div>
          ${this._range[1]>0?this._renderTable():h}
        </div>
      </ha-card>
    `}_renderLegend(){return n`
      <div class="legend">
        ${it.map((e,t)=>n`<span class="key"><span class="line s${t+1}"></span>${e}</span>`)}
        ${this.modeEntity?Ae.map(e=>n`<span class="key"><span class="swatch ${e.state}"></span>${e.label}</span>`):h}
      </div>
    `}_renderChart(){const e=this._width,[t,s]=this._range,r=this._hours>24,i=Nt(this._yMax),a=Array.from({length:this._yMax/i+1},(d,u)=>u*i),o=e<420?3:5,c=Array.from({length:o},(d,u)=>t+(s-t)*u/(o-1)),l=vt+Pe,_=l+(this.modeEntity?Dt:0)+2;return n`
      <svg
        width=${e}
        height=${_}
        role="img"
        aria-label="Target charging current per phase over time"
        @pointermove=${this._onPointerMove}
        @pointerleave=${()=>this._hoverT=null}
      >
        ${a.map(d=>R`
            <line class="grid" x1=${x.left} x2=${this._plotRight} y1=${this._y(d)} y2=${this._y(d)}></line>
            <text class="axis" x=${x.left-6} y=${this._y(d)} text-anchor="end" dominant-baseline="middle">${d===this._yMax?`${d} A`:d}</text>
          `)}
        ${c.map((d,u)=>R`
            <text
              class="axis"
              x=${this._x(d)}
              y=${vt-x.bottom+15}
              text-anchor=${u===0?"start":u===o-1?"end":"middle"}
            >${this._formatTime(d,r)}</text>
          `)}
        ${this._targets.map((d,u)=>R`
            <path class="series s${u+1}" d=${this._stepPath(d,(u-1)*Oe)}></path>
          `)}
        ${this._endLabels().map(d=>R`
            <text class="end-label" x=${this._plotRight+6} y=${d.y} dominant-baseline="middle">
              ${it[d.i]} ${d.v}
            </text>
          `)}
        ${this.modeEntity?this._modes.map((d,u)=>{const b=this._x(d.t),A=this._x(u+1<this._modes.length?this._modes[u+1].t:s),F=A-b>3?A-b-1:A-b;return R`<rect class="band ${d.s}" x=${b} y=${l} width=${Math.max(F,0)} height=${Dt} rx="2"></rect>`}):h}
        ${this._hoverT!==null?R`<line class="crosshair" x1=${this._x(this._hoverT)} x2=${this._x(this._hoverT)} y1=${x.top} y2=${_}></line>`:h}
      </svg>
      ${this._hoverT!==null?this._renderTooltip(this._hoverT):h}
    `}_renderTooltip(e){const t=this._x(e),s=t>this._width/2,r=at(this._modes,e)?.s;return n`
      <div class="tooltip" style="${s?`right:${this._width-t+8}px`:`left:${t+8}px`}">
        <div class="tooltip-time">${this._formatTime(e,!0)}</div>
        ${this._targets.map((i,a)=>{const o=at(i,e)?.v;return n`
            <div class="tooltip-row">
              <span class="line s${a+1}"></span>
              <strong>${o==null?"–":`${o} A`}</strong>
              <span class="secondary">${it[a]}</span>
            </div>
          `})}
        ${r?n`<div class="tooltip-row">
              <span class="swatch ${r}"></span>
              <strong>${r}</strong>
              <span class="secondary">Mode</span>
            </div>`:h}
      </div>
    `}_renderTable(){const e=[...new Set([...this._targets.flat().map(t=>t.t),...this._modes.map(t=>t.t)])].sort((t,s)=>s-t).slice(0,200);return n`
      <details>
        <summary>Show as table</summary>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              ${it.map(t=>n`<th class="num">${t} (A)</th>`)}
              ${this.modeEntity?n`<th>Mode</th>`:h}
            </tr>
          </thead>
          <tbody>
            ${e.map(t=>n`
                <tr>
                  <td>${this._formatTime(t,!0)}</td>
                  ${this._targets.map(s=>{const r=at(s,t)?.v;return n`<td class="num">${r??"–"}</td>`})}
                  ${this.modeEntity?n`<td>${at(this._modes,t)?.s??"–"}</td>`:h}
                </tr>
              `)}
          </tbody>
        </table>
      </details>
    `}};y.styles=T`
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
  `,C([p({attribute:!1})],y.prototype,"hass",2),C([p({attribute:!1})],y.prototype,"targetEntities",2),C([p({attribute:!1})],y.prototype,"modeEntity",2),C([g()],y.prototype,"_hours",2),C([g()],y.prototype,"_targets",2),C([g()],y.prototype,"_modes",2),C([g()],y.prototype,"_range",2),C([g()],y.prototype,"_loading",2),C([g()],y.prototype,"_error",2),C([g()],y.prototype,"_width",2),C([g()],y.prototype,"_hoverT",2),y=C([L("cc-charger-history")],y);var Te=Object.defineProperty,He=Object.getOwnPropertyDescriptor,B=(e,t,s,r)=>{for(var i=r>1?void 0:r?He(t,s):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,s,i):o(i))||i);return r&&i&&Te(t,s,i),i};const ot=(e,t,s,r)=>({name:e,required:!0,selector:{number:{min:t,max:s,step:1,mode:"slider",unit_of_measurement:r}}}),Le=[ot("charger_update_interval_s",30,60,"s"),ot("safety_margin_a",0,5,"A"),ot("ramp_up_a_per_min",1,10,"A/min"),ot("stale_after_s",60,600,"s")],ke={charger_update_interval_s:"Charger update interval",safety_margin_a:"Safety margin below the fuse rating",ramp_up_a_per_min:"Ramp-up speed after a load drops",stale_after_s:"Treat a meter as failed after no report for"},Me={charger_update_interval_s:"New limits are sent to the charger at most this often. A household phase above 150% of the fuse for more than 10 s is sent at once.",safety_margin_a:"Current kept free on every phase.",ramp_up_a_per_min:"Lower targets apply at once; higher targets rise at most this fast.",stale_after_s:"A meter sensor that has not reported for this long counts as unknown, which pauses charging (failsafe)."};let M=class extends w{constructor(){super(...arguments),this._data=null,this._saved=null,this._error="",this._saving=!1}firstUpdated(){this._load()}async _load(){try{const e=await this.hass.callWS({type:"generic_charge_controller/settings/get"});this._data=e,this._saved=e}catch(e){this._error=e?.message??String(e)}}render(){const e=JSON.stringify(this._data)!==JSON.stringify(this._saved);return n`
      <ha-card header="Load balancing">
        <div class="card-content">
          <p class="description">
            Limits are recalculated whenever a meter or charger value changes.
          </p>
          ${this._data?n`<ha-form
                .hass=${this.hass}
                .data=${this._data}
                .schema=${Le}
                .computeLabel=${t=>ke[t.name]??t.name}
                .computeHelper=${t=>Me[t.name]??""}
                @value-changed=${t=>this._data=t.detail.value}
              ></ha-form>`:h}
          ${this._error?n`<p class="error">${this._error}</p>`:h}
        </div>
        <div class="card-actions">
          <ha-button .disabled=${!e||this._saving} @click=${this._save}>Save</ha-button>
        </div>
      </ha-card>
    `}async _save(){this._saving=!0,this._error="";try{const e=await this.hass.callWS({type:"generic_charge_controller/settings/save",changes:this._data});this._data=e,this._saved=e}catch(e){this._error=e?.message??String(e)}finally{this._saving=!1}}};M.styles=T`
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
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `,B([p({attribute:!1})],M.prototype,"hass",2),B([g()],M.prototype,"_data",2),B([g()],M.prototype,"_saved",2),B([g()],M.prototype,"_error",2),B([g()],M.prototype,"_saving",2),M=B([L("cc-settings")],M);var Ue=Object.defineProperty,De=Object.getOwnPropertyDescriptor,P=(e,t,s,r)=>{for(var i=r>1?void 0:r?De(t,s):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,s,i):o(i))||i);return r&&i&&Ue(t,s,i),i};const Ne=["L1","L2","L3"],je={idle:"Idle (not charging)",charging:"Charging, not limited",limited:"Charging, limited to protect the main fuse",failsafe:"Failsafe: household load unknown, charging paused"};let E=class extends w{constructor(){super(...arguments),this.household=null,this.chargerEntities={},this.householdEntities={},this.discovered=null,this.settings=null,this._busy=!1,this._error=""}_state(e){return e?this.hass.states[e]:void 0}_amps(e,t){const s=parseFloat(this._state(e)?.state);return Number.isFinite(s)?`${s.toFixed(t)} A`:"–"}render(){const t=this._state(this.chargerEntities.control_switch)?.state==="on",s=this._state(this.chargerEntities.mode),r=s?.state,i=s?.attributes??{},a=i.reasons??[],o=i.last_sent??null,c=i.last_sent_at??null,l=this.discovered!==null&&!this.discovered.entities.circuit_current;return n`
      <ha-card header="Load balancing status">
        <div class="card-content">
          <div class="control ${t?"on":""}">
            <div>
              <div class="control-title">
                Sending limits to the charger: <strong>${t?"On":"Off"}</strong>
              </div>
              <div class="secondary">
                ${t?"Calculated limits are sent while a car is connected.":"Limits are calculated and shown, but not sent to the charger."}
              </div>
            </div>
            <ha-button
              .disabled=${this._busy||!this.chargerEntities.control_switch}
              @click=${()=>this._setActive(!t)}
            >
              ${t?"Stop":"Start"}
            </ha-button>
          </div>
          ${this._error?n`<p class="error">${this._error}</p>`:h}

          <div class="mode ${r??""}">${r?je[r]??r:"Mode unknown"}</div>
          ${a.length?n`<ul class="reasons">${a.map(_=>n`<li>${_}</li>`)}</ul>`:h}

          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th class="num">Household</th>
                <th class="num">Charger</th>
                <th class="num">Target</th>
              </tr>
            </thead>
            <tbody>
              ${Ne.map(_=>{const d=this.config.phase_map[_];return n`
                  <tr>
                    <td>${_} <span class="secondary">→ ${d}</span></td>
                    <td class="num">${this._amps(this.householdEntities[_],1)}</td>
                    <td class="num">
                      ${this._amps(this.chargerEntities[`charger_current_${d}`],1)}
                    </td>
                    <td class="num strong">
                      ${this._amps(this.chargerEntities[`target_current_${d}`],0)}
                    </td>
                  </tr>
                `})}
            </tbody>
          </table>

          <div class="facts secondary">
            ${this.household?n`<span>Main fuse ${this.household.fuse_a} A</span>`:h}
            ${this.settings?n`<span>Safety margin ${this.settings.safety_margin_a} A</span>
                  <span>Charger update every ${this.settings.charger_update_interval_s} s</span>`:h}
            ${o?n`<span>
                  Last sent ${["P1","P2","P3"].map(_=>o[_]).join(" / ")} A
                  ${c?n`at ${new Date(c).toLocaleTimeString(this.hass.language)}`:h}
                </span>`:h}
          </div>

          ${l?n`<p class="hint">
                Charger phase currents are not available${this.discovered?.disabled_entities.includes("circuit_current")?n`: the Easee entity <strong>Circuit current</strong> is disabled. Enable it
                      in Home Assistant (Settings → Entities)`:h}.
                Until then the whole household load counts as other load, so targets are lower
                while charging.
              </p>`:h}
        </div>
      </ha-card>
    `}async _setActive(e){if(!(e&&!confirm("Start sending load balancing limits to the charger?"))){this._busy=!0,this._error="";try{await this.hass.callService("switch",e?"turn_on":"turn_off",{entity_id:this.chargerEntities.control_switch})}catch(t){this._error=t?.message??String(t)}finally{this._busy=!1}}}};E.styles=T`
    .control {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      margin-bottom: 16px;
    }

    .control.on {
      border-color: var(--success-color, #4caf50);
    }

    .control-title {
      margin-bottom: 2px;
    }

    .secondary {
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .mode {
      font-weight: 500;
    }

    .mode.limited {
      color: var(--warning-color, #ff9800);
    }

    .mode.failsafe {
      color: var(--error-color);
    }

    .reasons {
      margin: 4px 0 0;
      padding-left: 20px;
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    th,
    td {
      text-align: left;
      padding: 6px 8px;
      border-bottom: 1px solid var(--divider-color);
    }

    th {
      color: var(--secondary-text-color);
      font-weight: 500;
      font-size: 13px;
    }

    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .strong {
      font-weight: 600;
    }

    .facts {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      margin-top: 12px;
    }

    .hint {
      margin-bottom: 0;
      padding: 8px 12px;
      border-radius: 6px;
      background: rgba(255, 152, 0, 0.12);
      font-size: 13px;
    }

    .error {
      color: var(--error-color);
    }
  `,P([p({attribute:!1})],E.prototype,"hass",2),P([p({attribute:!1})],E.prototype,"config",2),P([p({attribute:!1})],E.prototype,"household",2),P([p({attribute:!1})],E.prototype,"chargerEntities",2),P([p({attribute:!1})],E.prototype,"householdEntities",2),P([p({attribute:!1})],E.prototype,"discovered",2),P([p({attribute:!1})],E.prototype,"settings",2),P([g()],E.prototype,"_busy",2),P([g()],E.prototype,"_error",2),E=P([L("cc-charger-status")],E);var Re=Object.defineProperty,Ie=Object.getOwnPropertyDescriptor,v=(e,t,s,r)=>{for(var i=r>1?void 0:r?Ie(t,s):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(i=(r?o(t,s,i):o(i))||i);return r&&i&&Re(t,s,i),i};const W="generic_charge_controller";let f=class extends w{constructor(){super(...arguments),this.narrow=!1,this.route={path:""},this.panel={},this._elementsLoaded=!1,this._selectedChargerId=null,this._activeTab="households",this._routeApplied=!1,this._households={},this._chargerConfigs={},this._discoveredChargers=[],this._entities={households:{},chargers:{}},this._settings=null,this._editingHousehold=null,this._error=""}firstUpdated(){this._loadElements(),this._loadData()}async _loadElements(){await ne(),this._elementsLoaded=!0}async _loadData(){try{const[e,t,s,r,i]=await Promise.all([this.hass.callWS({type:`${W}/households/get`}),this.hass.callWS({type:`${W}/chargers/get`}),this.hass.callWS({type:`${W}/chargers/discover`}),this.hass.callWS({type:`${W}/entities`}),this.hass.callWS({type:`${W}/settings/get`})]);this._settings=i,this._households=e,this._chargerConfigs=t,this._discoveredChargers=s,this._entities=r}catch(e){this._error=`Error loading data from Charge Controller backend: ${e?.message??e}`}}willUpdate(e){e.has("route")&&this._applyRoute()}connectedCallback(){super.connectedCallback(),this._routeApplied||(this._applyRoute(),this._routeApplied=!0)}render(){if(!this._elementsLoaded)return n`<div class="loading">Loading...</div>`;const e=this._discoveredChargers.map(r=>le(this.hass,r)),t=!!this._selectedChargerId,s=t?e.find(r=>r.id===this._selectedChargerId)??null:null;return n`
      <div class="toolbar">
        ${t?n`
            <ha-icon-button .label=${"Back"} @click=${this._goBack}>
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`:h}
        <div class="title">
          ${t?s?.name??"Charger Details":"Charge Controller"}
        </div>
        ${t?h:n`
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
              <div
                class="tab ${this._activeTab==="settings"?"active":""}"
                @click=${()=>this._activeTab="settings"}
              >
                Settings
              </div>
            </div>
          `}
      </div>
      <div class="content">
        ${this._error?n`<div class="error-banner" @click=${()=>this._error=""}>${this._error}</div>`:h}
        ${t?this._renderDetail(s):this._activeTab==="households"?this._renderHouseholds():this._activeTab==="chargers"?this._renderChargers(e):n`<div class="detail-view"><cc-settings .hass=${this.hass}></cc-settings></div>`}
      </div>
    `}_chargerValue(e,t){const s=this._entities.chargers[e]?.[t],r=parseFloat(this.hass.states[s]?.state);return Number.isFinite(r)?r:null}_renderChargerCard(e,t){const s=this._entities.chargers[e.id],r=s?[1,2,3].map(o=>this._chargerValue(e.id,`target_current_P${o}`)):null,i=s?.mode?this.hass.states[s.mode]?.state:void 0,a=s?.control_switch?this.hass.states[s.control_switch]?.state==="on":null;return n`
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
        .controlActive=${a}
        @charger-selected=${t?this._onChargerSelected:null}
      ></cc-charger-card>
    `}_renderChargers(e){if(e.length===0)return n`<p>No Easee chargers detected in your system.</p>`;const t=r=>this._chargerConfigs[r.id]?.household_id,s=e.filter(r=>{const i=t(r);return!i||!this._households[i]});return n`
      ${Object.values(this._households).map(r=>this._renderChargerGroup(r.name,e.filter(i=>t(i)===r.household_id),"No chargers assigned to this household."))}
      ${s.length>0?this._renderChargerGroup("Not configured",s,""):h}
    `}_renderChargerGroup(e,t,s){return n`
      <section class="group">
        <h2 class="group-header">${e}</h2>
        ${t.length===0?n`<p class="group-empty">${s}</p>`:n`<div class="grid">${t.map(r=>this._renderChargerCard(r,!0))}</div>`}
      </section>
    `}_renderHouseholds(){if(this._editingHousehold!==null){const t=this._editingHousehold==="new"?null:this._households[this._editingHousehold];return n`
        <div class="detail-view">
          <cc-household-editor
            .hass=${this.hass}
            .household=${t}
            @household-saved=${this._onHouseholdSaved}
            @editor-closed=${()=>this._editingHousehold=null}
          ></cc-household-editor>
        </div>
      `}const e=Object.values(this._households);return n`
      <div class="actions">
        <ha-button @click=${()=>this._editingHousehold="new"}>Add household</ha-button>
      </div>
      ${e.length===0?n`<p>No households configured yet.</p>`:n`
            <div class="grid">
              ${e.map(t=>n`
                  <cc-household-card
                    .hass=${this.hass}
                    .household=${t}
                    @household-edit=${s=>this._editingHousehold=s.detail.householdId}
                    @household-delete=${this._onHouseholdDelete}
                  ></cc-household-card>
                `)}
            </div>
          `}
    `}_renderDetail(e){return e?n`
      <div class="detail-view">
        ${this._renderChargerCard(e,!1)}
        ${this._chargerConfigs[e.id]?n`<cc-charger-status
              .hass=${this.hass}
              .config=${this._chargerConfigs[e.id]}
              .household=${this._households[this._chargerConfigs[e.id].household_id]??null}
              .chargerEntities=${this._entities.chargers[e.id]??{}}
              .householdEntities=${this._entities.households[this._chargerConfigs[e.id].household_id]??{}}
              .discovered=${this._discoveredChargers.find(t=>t.device_id===e.id)??null}
              .settings=${this._settings}
            ></cc-charger-status>`:h}
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
    `:n`<p>Charger not found.</p>`}_targetEntities(e){const t=this._entities.chargers[e]??{},s=[t.target_current_P1,t.target_current_P2,t.target_current_P3];return s.every(r=>r)?s:[]}async _onChargerConfigSaved(){await this._loadData(),setTimeout(()=>this._loadData(),3e3)}_navigate(e){history.replaceState(null,"",`/charge-controller${e}`),window.dispatchEvent(new Event("location-changed"))}_goBack(){this._selectedChargerId=null,this._navigate("")}_onChargerSelected(e){this._selectedChargerId=e.detail.chargerId,this._navigate(`/charger/${e.detail.chargerId}`)}async _onHouseholdSaved(){this._editingHousehold=null,await this._loadData()}async _onHouseholdDelete(e){const t=this._households[e.detail.householdId];if(!(!t||!confirm(`Delete household "${t.name}"?`)))try{await this.hass.callWS({type:`${W}/households/delete`,household_id:t.household_id}),await this._loadData()}catch(s){this._error=s?.message??String(s)}}_applyRoute(){const e=this.route?.path??"";e.startsWith("/charger/")?this._selectedChargerId=decodeURIComponent(e.slice(9)):this._selectedChargerId=null,this._routeApplied=!0}};f.styles=T`
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
  `,v([p({attribute:!1})],f.prototype,"hass",2),v([p({type:Boolean,reflect:!0})],f.prototype,"narrow",2),v([p({type:Object})],f.prototype,"route",2),v([p({type:Object})],f.prototype,"panel",2),v([g()],f.prototype,"_elementsLoaded",2),v([g()],f.prototype,"_selectedChargerId",2),v([g()],f.prototype,"_activeTab",2),v([g()],f.prototype,"_routeApplied",2),v([g()],f.prototype,"_households",2),v([g()],f.prototype,"_chargerConfigs",2),v([g()],f.prototype,"_discoveredChargers",2),v([g()],f.prototype,"_entities",2),v([g()],f.prototype,"_settings",2),v([g()],f.prototype,"_editingHousehold",2),v([g()],f.prototype,"_error",2),f=v([L("charge-controller-panel")],f)})();
