(function(){"use strict";const B=globalThis,J=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),re=new WeakMap;let ie=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(J&&e===void 0){const r=t!==void 0&&t.length===1;r&&(e=re.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),r&&re.set(t,e))}return e}toString(){return this.cssText}};const ye=s=>new ie(typeof s=="string"?s:s+"",void 0,K),z=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((r,i,o)=>r+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+s[o+1],s[0]);return new ie(t,s,K)},we=(s,e)=>{if(J)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const r=document.createElement("style"),i=B.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=t.cssText,s.appendChild(r)}},oe=J?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const r of e.cssRules)t+=r.cssText;return ye(t)})(s):s;const{is:Ce,defineProperty:Ae,getOwnPropertyDescriptor:Ee,getOwnPropertyNames:xe,getOwnPropertySymbols:Se,getPrototypeOf:Pe}=Object,V=globalThis,ae=V.trustedTypes,He=ae?ae.emptyScript:"",Ue=V.reactiveElementPolyfillSupport,N=(s,e)=>s,W={toAttribute(s,e){switch(e){case Boolean:s=s?He:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},Y=(s,e)=>!Ce(s,e),ne={attribute:!0,type:String,converter:W,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;let U=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ne){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const r=Symbol(),i=this.getPropertyDescriptor(e,r,t);i!==void 0&&Ae(this.prototype,e,i)}}static getPropertyDescriptor(e,t,r){const{get:i,set:o}=Ee(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:i,set(a){const c=i?.call(this);o?.call(this,a),this.requestUpdate(e,c,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ne}static _$Ei(){if(this.hasOwnProperty(N("elementProperties")))return;const e=Pe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(N("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(N("properties"))){const t=this.properties,r=[...xe(t),...Se(t)];for(const i of r)this.createProperty(i,t[i])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[r,i]of t)this.elementProperties.set(r,i)}this._$Eh=new Map;for(const[t,r]of this.elementProperties){const i=this._$Eu(t,r);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const r=new Set(e.flat(1/0).reverse());for(const i of r)t.unshift(oe(i))}else e!==void 0&&t.push(oe(e));return t}static _$Eu(e,t){const r=t.attribute;return r===!1?void 0:typeof r=="string"?r:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const r of t.keys())this.hasOwnProperty(r)&&(e.set(r,this[r]),delete this[r]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return we(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$AK(e,r)}_$ET(e,t){const r=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,r);if(i!==void 0&&r.reflect===!0){const o=(r.converter?.toAttribute!==void 0?r.converter:W).toAttribute(t,r.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,t){const r=this.constructor,i=r._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const o=r.getPropertyOptions(i),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:W;this._$Em=i;const c=a.fromAttribute(t,o.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(e,t,r,i=!1,o){if(e!==void 0){const a=this.constructor;if(i===!1&&(o=this[e]),r??=a.getPropertyOptions(e),!((r.hasChanged??Y)(o,t)||r.useDefault&&r.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,r))))return;this.C(e,t,r)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:r,reflect:i,wrapped:o},a){r&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),o!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||r||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const r=this.constructor.elementProperties;if(r.size>0)for(const[i,o]of r){const{wrapped:a}=o,c=this[i];a!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,o,c)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(r=>r.hostUpdate?.()),this.update(t)):this._$EM()}catch(r){throw e=!1,this._$EM(),r}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};U.elementStyles=[],U.shadowRootOptions={mode:"open"},U[N("elementProperties")]=new Map,U[N("finalized")]=new Map,Ue?.({ReactiveElement:U}),(V.reactiveElementVersions??=[]).push("2.1.2");const Q=globalThis,ce=s=>s,F=Q.trustedTypes,le=F?F.createPolicy("lit-html",{createHTML:s=>s}):void 0,he="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,de="?"+C,Oe=`<${de}>`,S=document,M=()=>S.createComment(""),D=s=>s===null||typeof s!="object"&&typeof s!="function",X=Array.isArray,Ie=s=>X(s)||typeof s?.[Symbol.iterator]=="function",ee=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pe=/-->/g,ue=/>/g,P=RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ge=/'/g,_e=/"/g,fe=/^(?:script|style|textarea|title)$/i,Le=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),l=Le(1),O=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),me=new WeakMap,H=S.createTreeWalker(S,129);function ve(s,e){if(!X(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return le!==void 0?le.createHTML(e):e}const Te=(s,e)=>{const t=s.length-1,r=[];let i,o=e===2?"<svg>":e===3?"<math>":"",a=R;for(let c=0;c<t;c++){const n=s[c];let u,g,h=-1,f=0;for(;f<n.length&&(a.lastIndex=f,g=a.exec(n),g!==null);)f=a.lastIndex,a===R?g[1]==="!--"?a=pe:g[1]!==void 0?a=ue:g[2]!==void 0?(fe.test(g[2])&&(i=RegExp("</"+g[2],"g")),a=P):g[3]!==void 0&&(a=P):a===P?g[0]===">"?(a=i??R,h=-1):g[1]===void 0?h=-2:(h=a.lastIndex-g[2].length,u=g[1],a=g[3]===void 0?P:g[3]==='"'?_e:ge):a===_e||a===ge?a=P:a===pe||a===ue?a=R:(a=P,i=void 0);const $=a===P&&s[c+1].startsWith("/>")?" ":"";o+=a===R?n+Oe:h>=0?(r.push(u),n.slice(0,h)+he+n.slice(h)+C+$):n+C+(h===-2?c:$)}return[ve(s,o+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]};class k{constructor({strings:e,_$litType$:t},r){let i;this.parts=[];let o=0,a=0;const c=e.length-1,n=this.parts,[u,g]=Te(e,t);if(this.el=k.createElement(u,r),H.currentNode=this.el.content,t===2||t===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=H.nextNode())!==null&&n.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const h of i.getAttributeNames())if(h.endsWith(he)){const f=g[a++],$=i.getAttribute(h).split(C),x=/([.?@])?(.*)/.exec(f);n.push({type:1,index:o,name:x[2],strings:$,ctor:x[1]==="."?Me:x[1]==="?"?De:x[1]==="@"?Re:q}),i.removeAttribute(h)}else h.startsWith(C)&&(n.push({type:6,index:o}),i.removeAttribute(h));if(fe.test(i.tagName)){const h=i.textContent.split(C),f=h.length-1;if(f>0){i.textContent=F?F.emptyScript:"";for(let $=0;$<f;$++)i.append(h[$],M()),H.nextNode(),n.push({type:2,index:++o});i.append(h[f],M())}}}else if(i.nodeType===8)if(i.data===de)n.push({type:2,index:o});else{let h=-1;for(;(h=i.data.indexOf(C,h+1))!==-1;)n.push({type:7,index:o}),h+=C.length-1}o++}}static createElement(e,t){const r=S.createElement("template");return r.innerHTML=e,r}}function I(s,e,t=s,r){if(e===O)return e;let i=r!==void 0?t._$Co?.[r]:t._$Cl;const o=D(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(s),i._$AT(s,t,r)),r!==void 0?(t._$Co??=[])[r]=i:t._$Cl=i),i!==void 0&&(e=I(s,i._$AS(s,e.values),i,r)),e}class Ne{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:r}=this._$AD,i=(e?.creationScope??S).importNode(t,!0);H.currentNode=i;let o=H.nextNode(),a=0,c=0,n=r[0];for(;n!==void 0;){if(a===n.index){let u;n.type===2?u=new j(o,o.nextSibling,this,e):n.type===1?u=new n.ctor(o,n.name,n.strings,this,e):n.type===6&&(u=new ke(o,this,e)),this._$AV.push(u),n=r[++c]}a!==n?.index&&(o=H.nextNode(),a++)}return H.currentNode=S,i}p(e){let t=0;for(const r of this._$AV)r!==void 0&&(r.strings!==void 0?(r._$AI(e,r,t),t+=r.strings.length-2):r._$AI(e[t])),t++}}class j{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=I(this,e,t),D(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==O&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ie(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:r}=e,i=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=k.createElement(ve(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(t);else{const o=new Ne(i,this),a=o.u(this.options);o.p(t),this.T(a),this._$AH=o}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new k(e)),t}k(e){X(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,i=0;for(const o of e)i===t.length?t.push(r=new j(this.O(M()),this.O(M()),this,this.options)):r=t[i],r._$AI(o),i++;i<t.length&&(this._$AR(r&&r._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const r=ce(e).nextSibling;ce(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,r,i,o){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=o,r.length>2||r[0]!==""||r[1]!==""?(this._$AH=Array(r.length-1).fill(new String),this.strings=r):this._$AH=p}_$AI(e,t=this,r,i){const o=this.strings;let a=!1;if(o===void 0)e=I(this,e,t,0),a=!D(e)||e!==this._$AH&&e!==O,a&&(this._$AH=e);else{const c=e;let n,u;for(e=o[0],n=0;n<o.length-1;n++)u=I(this,c[r+n],t,n),u===O&&(u=this._$AH[n]),a||=!D(u)||u!==this._$AH[n],u===p?e=p:e!==p&&(e+=(u??"")+o[n+1]),this._$AH[n]=u}a&&!i&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Me extends q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}}class De extends q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}}class Re extends q{constructor(e,t,r,i,o){super(e,t,r,i,o),this.type=5}_$AI(e,t=this){if((e=I(this,e,t,0)??p)===O)return;const r=this._$AH,i=e===p&&r!==p||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,o=e!==p&&(r===p||i);i&&this.element.removeEventListener(this.name,this,r),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ke{constructor(e,t,r){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=r}get _$AU(){return this._$AM._$AU}_$AI(e){I(this,e)}}const je=Q.litHtmlPolyfillSupport;je?.(k,j),(Q.litHtmlVersions??=[]).push("3.3.2");const Be=(s,e,t)=>{const r=t?.renderBefore??e;let i=r._$litPart$;if(i===void 0){const o=t?.renderBefore??null;r._$litPart$=i=new j(e.insertBefore(M(),o),o,void 0,t??{})}return i._$AI(s),i};const te=globalThis;class A extends U{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Be(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}}A._$litElement$=!0,A.finalized=!0,te.litElementHydrateSupport?.({LitElement:A});const ze=te.litElementPolyfillSupport;ze?.({LitElement:A}),(te.litElementVersions??=[]).push("4.2.2");const Z=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};const Ve={attribute:!0,type:String,converter:W,reflect:!1,hasChanged:Y},We=(s=Ve,e,t)=>{const{kind:r,metadata:i}=t;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),r==="setter"&&((s=Object.create(s)).wrapped=!0),o.set(t.name,s),r==="accessor"){const{name:a}=t;return{set(c){const n=e.get.call(this);e.set.call(this,c),this.requestUpdate(a,n,s,!0,c)},init(c){return c!==void 0&&this.C(a,void 0,s,c),c}}}if(r==="setter"){const{name:a}=t;return function(c){const n=this[a];e.call(this,c),this.requestUpdate(a,n,s,!0,c)}}throw Error("Unsupported decorator location: "+r)};function d(s){return(e,t)=>typeof t=="object"?We(s,e,t):((r,i,o)=>{const a=i.hasOwnProperty(o);return i.constructor.createProperty(o,r),a?Object.getOwnPropertyDescriptor(i,o):void 0})(s,e,t)}function y(s){return d({...s,state:!0,attribute:!1})}const Fe=async()=>{if(!customElements.get("ha-entity-picker")){if(!customElements.get("ha-selector")){await customElements.whenDefined("partial-panel-resolver");const s=document.createElement("partial-panel-resolver");s.hass={panels:[{url_path:"tmp",component_name:"config"}]},s._updateRoutes(),await s.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await document.createElement("ha-panel-config").routerOptions.routes.automation.load()}if(!customElements.get("ha-entity-picker"))try{await(await(await window.loadCardHelpers()).createCardElement({type:"entities",entities:[]})).constructor.getConfigElement()}catch{}if(!customElements.get("ha-entity-picker"))try{await Promise.race([customElements.whenDefined("ha-selector"),new Promise((t,r)=>setTimeout(()=>r(new Error("timeout")),1e4))]);const s=document.querySelector("home-assistant")?.hass,e=document.createElement("div");e.style.cssText="position:fixed;left:-9999px;opacity:0;pointer-events:none",document.body.appendChild(e);try{const t=document.createElement("ha-selector");t.hass=s,t.selector={entity:{}},e.appendChild(t),await Promise.race([customElements.whenDefined("ha-entity-picker"),new Promise(r=>setTimeout(r,5e3))])}finally{e.remove()}}catch{}if(await customElements.whenDefined("ha-card"),!customElements.get("ha-date-range-picker"))try{await(await window.loadCardHelpers()).createCardElement({type:"energy-date-selection",entities:[]}),await Promise.race([customElements.whenDefined("ha-date-range-picker"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}if(!customElements.get("ha-chart-base"))try{await(await window.loadCardHelpers()).createCardElement({type:"statistics-graph",entities:[]}),await Promise.race([customElements.whenDefined("ha-chart-base"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}}},qe=s=>{const e=Object.values(s.entities).filter(i=>i.platform==="easee"),t=new Set;for(const i of e)i.device_id&&t.add(i.device_id);const r=[];for(const i of t){const o=s.devices[i];if(!o)continue;const c=Object.values(s.entities).filter(T=>T.device_id===i).reduce((T,$e)=>{const be=s.states[$e.entity_id];return be&&T.set($e.entity_id,be),T},new Map),n=T=>`sensor.${o.name?.toLowerCase().replace(/\s+/g,"_")}_${T}`,u=c.get(n("status"))?.state||"Unknown",g=parseFloat(c.get(n("power"))?.state||"0"),h=parseFloat(c.get(n("max_circuit_limit"))?.state||"0"),f=c.get(n("circuit_current"));let $=0,x=0,se=0;f&&($=parseFloat(f.attributes.state_circuitTotalPhaseConductorCurrentL1)||0,x=parseFloat(f.attributes.state_circuitTotalPhaseConductorCurrentL2)||0,se=parseFloat(f.attributes.state_circuitTotalPhaseConductorCurrentL3)||0),r.push({id:i,name:o.name||"Unknown Charger",serialNumber:o.serial_number||"N/A",status:u,power:g,currentLimit:h,currentUsage:Math.max($,x,se),l1_usage:$,l2_usage:x,l3_usage:se,configured:!1})}return r},Ze="M12,3A1,1 0 0,1 13,4V4.39C17.65,5.15 21,7.45 21,10.13C21,11.19 19.82,12.14 18,12.8V19H19V21H5V19H6V12.8C4.18,12.14 3,11.19 3,10.13C3,7.45 6.35,5.15 11,4.39V4A1,1 0 0,1 12,3M12,6.13C8.13,6.13 5,7.45 5,9.13C5,10.81 8.13,12.13 12,12.13C15.87,12.13 19,10.81 19,9.13C19,7.45 15.87,6.13 12,6.13M12,14.13C9.8,14.13 8,15.93 8,18.13V19H16V18.13C16,15.93 14.2,14.13 12,14.13Z",Ge="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.66,19.59 13.4,20 12,20C9.8,20 8,18.2 8,16V11.27L2,5.27M12,2C12.55,2 13,2.45 13,3V3.39C17.65,4.15 21,6.45 21,9.13C21,10.19 19.82,11.14 18,11.8V17.27L13.73,13C15.6,12.59 17,11.5 17,10.13C17,8.45 13.87,7.13 10,7.13C9.05,7.13 8.15,7.21 7.34,7.34L5.11,5.11C6.7,4.24 8.74,3.64 11,3.39V3C11,2.45 11.45,2 12,2M12,14C13.2,14 14.24,14.53 14.92,15.35L10.65,11.08C10.22,11.68 10,12.31 10,13C10,14.1 10.9,15 12,15V14Z";var Je=Object.defineProperty,Ke=Object.getOwnPropertyDescriptor,v=(s,e,t,r)=>{for(var i=r>1?void 0:r?Ke(e,t):e,o=s.length-1,a;o>=0;o--)(a=s[o])&&(i=(r?a(e,t,i):a(i))||i);return r&&i&&Je(e,t,i),i};let _=class extends A{constructor(){super(...arguments),this.chargerId="",this.name="",this.serialNumber="",this.status="",this.power=0,this.currentLimit=0,this.currentUsage=0,this.l1Usage=0,this.l2Usage=0,this.l3Usage=0,this.configured=!1}render(){const s=this.configured?this.status==="charging"?"accent-charging":"accent-idle":"accent-unconfigured";return l`
      <ha-card .header=${this.name} @click=${this._handleClick}>
        <div class="accent ${s}"></div>
        <ha-svg-icon
          class="configured-icon ${this.configured?"is-configured":""}"
          .path=${this.configured?Ze:Ge}
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
    `}_handleClick(){this.dispatchEvent(new CustomEvent("charger-selected",{detail:{chargerId:this.chargerId},bubbles:!0,composed:!0}))}};_.styles=z`
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
  `,v([d()],_.prototype,"chargerId",2),v([d()],_.prototype,"name",2),v([d()],_.prototype,"serialNumber",2),v([d()],_.prototype,"status",2),v([d({type:Number})],_.prototype,"power",2),v([d({type:Number})],_.prototype,"currentLimit",2),v([d({type:Number})],_.prototype,"currentUsage",2),v([d({type:Number})],_.prototype,"l1Usage",2),v([d({type:Number})],_.prototype,"l2Usage",2),v([d({type:Number})],_.prototype,"l3Usage",2),v([d({type:Boolean})],_.prototype,"configured",2),_=v([Z("cc-charger-card")],_);var Ye=Object.defineProperty,Qe=Object.getOwnPropertyDescriptor,E=(s,e,t,r)=>{for(var i=r>1?void 0:r?Qe(e,t):e,o=s.length-1,a;o>=0;o--)(a=s[o])&&(i=(r?a(e,t,i):a(i))||i);return r&&i&&Ye(e,t,i),i};let w=class extends A{constructor(){super(...arguments),this.chargerId="",this.households={},this._selectedHouseholdId="",this._house_l1="cl1",this._house_l2="cl2",this._house_l3="cl3"}firstUpdated(){this._loadConfig()}async _loadConfig(){try{const e=(await this.hass.callWS({type:"generic_charge_controller/chargers/get"}))[this.chargerId];e&&(this._selectedHouseholdId=e.household_id||"",this._house_l1=e.house_l1||"cl1",this._house_l2=e.house_l2||"cl2",this._house_l3=e.house_l3||"cl3")}catch(s){console.error("Error loading charger config:",s)}}render(){const s=Object.values(this.households);return s.length===0?l`
        <ha-card header="Load Balancing Configuration">
          <div class="card-content">
            <p class="warning-text">
              No households are currently enabled. At least one household must be enabled in the "Households" tab before you can configure load balancing for this charger.
            </p>
          </div>
        </ha-card>
      `:l`
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
              ${s.map(e=>{const t=this.hass.devices[e.device_id],r=t?t.name.replace(/Tibber Pulse/gi,"").trim()||t.name:e.device_id;return l`<option value=${e.device_id} ?selected=${this._selectedHouseholdId===e.device_id}>${r}</option>`})}
            </select>
          </div>

          ${this._selectedHouseholdId?l`
            <div class="phase-mapping">
              <p class="description">
                Map your home's phases to the phases on the charger.
              </p>
              
              ${[1,2,3].map(e=>{const t=this[`_house_l${e}`];return l`
                  <div class="settings-row phase-row">
                    <span class="label">Home L${e}:</span>
                    <select 
                      .value=${t}
                      @change=${r=>this[`_house_l${e}`]=r.target.value}
                    >
                      <option value="cl1" ?selected=${t==="cl1"}>Charger L1</option>
                      <option value="cl2" ?selected=${t==="cl2"}>Charger L2</option>
                      <option value="cl3" ?selected=${t==="cl3"}>Charger L3</option>
                    </select>
                  </div>
                `})}
            </div>
          `:p}
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
    `}async _save(){try{await this.hass.callWS({type:"generic_charge_controller/chargers/save",charger_id:this.chargerId,config:{household_id:this._selectedHouseholdId,house_l1:this._house_l1,house_l2:this._house_l2,house_l3:this._house_l3}}),this.dispatchEvent(new CustomEvent("config-saved",{bubbles:!0,composed:!0}))}catch(s){console.error("Error saving charger config:",s)}}};w.styles=z`
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

    .phase-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .phase-row .label {
      margin-bottom: 0;
      white-space: nowrap;
      min-width: 80px;
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

    .phase-mapping {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px dashed var(--divider-color);
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px;
      border-top: 1px solid var(--divider-color);
    }
  `,E([d({attribute:!1})],w.prototype,"hass",2),E([d()],w.prototype,"chargerId",2),E([d({attribute:!1})],w.prototype,"households",2),E([y()],w.prototype,"_selectedHouseholdId",2),E([y()],w.prototype,"_house_l1",2),E([y()],w.prototype,"_house_l2",2),E([y()],w.prototype,"_house_l3",2),w=E([Z("cc-load-balancer-settings")],w);var Xe=Object.defineProperty,et=Object.getOwnPropertyDescriptor,G=(s,e,t,r)=>{for(var i=r>1?void 0:r?et(e,t):e,o=s.length-1,a;o>=0;o--)(a=s[o])&&(i=(r?a(e,t,i):a(i))||i);return r&&i&&Xe(e,t,i),i};let L=class extends A{constructor(){super(...arguments),this.deviceId="",this.name="",this.enabled=!1}render(){return l`
      <ha-card .header=${this.name}>
        <div class="card-content">
          ${this.enabled?l`<p>Monitoring enabled for this household.</p>`:l`<p>Tibber Pulse device detected. Enable it to start monitoring household load.</p>`}
        </div>
        <div class="card-actions">
          ${this.enabled?l`<ha-button @click=${this._remove} class="warning">Remove</ha-button>`:l`<ha-button @click=${this._enable}>Enable</ha-button>`}
        </div>
      </ha-card>
    `}_enable(){this.dispatchEvent(new CustomEvent("household-enabled",{detail:{deviceId:this.deviceId},bubbles:!0,composed:!0}))}_remove(){this.dispatchEvent(new CustomEvent("household-removed",{detail:{deviceId:this.deviceId},bubbles:!0,composed:!0}))}};L.styles=z`
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
  `,G([d()],L.prototype,"deviceId",2),G([d()],L.prototype,"name",2),G([d({type:Boolean})],L.prototype,"enabled",2),L=G([Z("cc-household-card")],L);var tt=Object.defineProperty,st=Object.getOwnPropertyDescriptor,b=(s,e,t,r)=>{for(var i=r>1?void 0:r?st(e,t):e,o=s.length-1,a;o>=0;o--)(a=s[o])&&(i=(r?a(e,t,i):a(i))||i);return r&&i&&tt(e,t,i),i};let m=class extends A{constructor(){super(...arguments),this.narrow=!1,this.route={path:""},this.panel={},this._elementsLoaded=!1,this._selectedChargerId=null,this._activeTab="chargers",this._routeApplied=!1,this._configuredHouseholds={},this._configuredChargers={}}firstUpdated(){this._loadElements(),this._loadData()}async _loadElements(){await Fe(),this._elementsLoaded=!0}async _loadData(){try{this._configuredHouseholds=await this.hass.callWS({type:"generic_charge_controller/households/get"}),this._configuredChargers=await this.hass.callWS({type:"generic_charge_controller/chargers/get"})}catch(s){console.error("Error loading data from Charge Controller backend:",s)}}willUpdate(s){s.has("route")&&this._applyRoute()}connectedCallback(){super.connectedCallback(),this._routeApplied||(this._applyRoute(),this._routeApplied=!0)}render(){if(!this._elementsLoaded)return l`<div class="loading">Loading...</div>`;const s=!!this._selectedChargerId,e=qe(this.hass),t=s?e.find(r=>r.id===this._selectedChargerId):null;return l`
      <div class="toolbar">
        ${s?l`
            <ha-icon-button
              .label=${"Back"}
              @click=${this._goBack}
            >
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`:p}
        <div class="title">
          ${s?t?.name??"Charger Details":"Charge Controller"}
        </div>
        ${s?p:l`
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
    `}_renderGrid(s){return l`
      ${s.length===0?l`<p>No Easee chargers detected in your system.</p>`:l`
            <div class="grid">
              ${s.map(e=>{const t=!!this._configuredChargers[e.id];return l`
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
                  .configured=${t}
                  @charger-selected=${this._onChargerSelected}
                ></cc-charger-card>
              `})}
            </div>
          `}
    `}_renderHouseholds(){const s=Object.values(this.hass.devices).filter(e=>e.model==="Tibber Pulse");return l`
      ${s.length===0?l`<p>No Tibber Pulse devices detected in your system.</p>`:l`
            <div class="grid">
              ${s.map(e=>{const t=e.name.replace(/Tibber Pulse/gi,"").trim()||e.name,r=!!this._configuredHouseholds[e.id];return l`
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
    `}_renderDetail(s){if(!s)return l`<p>Charger not found.</p>`;const e=!!this._configuredChargers[s.id];return l`
      <div class="detail-view">
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
    `}_navigate(s){history.replaceState(null,"",`/charge-controller${s}`),window.dispatchEvent(new Event("location-changed"))}_goBack(){this._selectedChargerId=null,this._navigate("")}_onChargerSelected(s){this._selectedChargerId=s.detail.chargerId,this._navigate(`/charger/${s.detail.chargerId}`)}async _onHouseholdEnabled(s){console.log(`Enable household for device: ${s.detail.deviceId}`);try{const e=await this.hass.callWS({type:"generic_charge_controller/households/save",device_id:s.detail.deviceId,config:{enabled:!0}});this._configuredHouseholds={...this._configuredHouseholds,[s.detail.deviceId]:e}}catch(e){console.error("Error saving household:",e)}}async _onHouseholdRemoved(s){console.log(`Household removed for device: ${s.detail.deviceId}`);try{await this.hass.callWS({type:"generic_charge_controller/households/delete",device_id:s.detail.deviceId});const e={...this._configuredHouseholds};delete e[s.detail.deviceId],this._configuredHouseholds=e}catch(e){console.error("Error deleting household:",e)}}_applyRoute(){const s=this.route?.path??"";s.startsWith("/charger/")?this._selectedChargerId=decodeURIComponent(s.slice(9)):this._selectedChargerId=null,this._routeApplied=!0}};m.styles=z`
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
  `,b([d({attribute:!1})],m.prototype,"hass",2),b([d({type:Boolean,reflect:!0})],m.prototype,"narrow",2),b([d({type:Object})],m.prototype,"route",2),b([d({type:Object})],m.prototype,"panel",2),b([y()],m.prototype,"_elementsLoaded",2),b([y()],m.prototype,"_selectedChargerId",2),b([y()],m.prototype,"_activeTab",2),b([y()],m.prototype,"_routeApplied",2),b([y()],m.prototype,"_configuredHouseholds",2),b([y()],m.prototype,"_configuredChargers",2),m=b([Z("charge-controller-panel")],m)})();
