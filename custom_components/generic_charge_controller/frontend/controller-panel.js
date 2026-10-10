(function(){"use strict";const B=globalThis,J=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),re=new WeakMap;let ie=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(J&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=re.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&re.set(t,e))}return e}toString(){return this.cssText}};const ye=r=>new ie(typeof r=="string"?r:r+"",void 0,K),z=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((s,i,o)=>s+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new ie(t,r,K)},we=(r,e)=>{if(J)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),i=B.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,r.appendChild(s)}},oe=J?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return ye(t)})(r):r;const{is:Ce,defineProperty:Ae,getOwnPropertyDescriptor:Ee,getOwnPropertyNames:xe,getOwnPropertySymbols:Se,getPrototypeOf:Pe}=Object,V=globalThis,ae=V.trustedTypes,He=ae?ae.emptyScript:"",Ue=V.reactiveElementPolyfillSupport,N=(r,e)=>r,W={toAttribute(r,e){switch(e){case Boolean:r=r?He:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},Y=(r,e)=>!Ce(r,e),ne={attribute:!0,type:String,converter:W,reflect:!1,useDefault:!1,hasChanged:Y};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;let U=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ne){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(e,s,t);i!==void 0&&Ae(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){const{get:i,set:o}=Ee(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:i,set(a){const c=i?.call(this);o?.call(this,a),this.requestUpdate(e,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ne}static _$Ei(){if(this.hasOwnProperty(N("elementProperties")))return;const e=Pe(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(N("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(N("properties"))){const t=this.properties,s=[...xe(t),...Se(t)];for(const i of s)this.createProperty(i,t[i])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,i]of t)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const i of s)t.unshift(oe(i))}else e!==void 0&&t.push(oe(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return we(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(i!==void 0&&s.reflect===!0){const o=(s.converter?.toAttribute!==void 0?s.converter:W).toAttribute(t,s.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,t){const s=this.constructor,i=s._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const o=s.getPropertyOptions(i),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:W;this._$Em=i;const c=a.fromAttribute(t,o.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(e,t,s,i=!1,o){if(e!==void 0){const a=this.constructor;if(i===!1&&(o=this[e]),s??=a.getPropertyOptions(e),!((s.hasChanged??Y)(o,t)||s.useDefault&&s.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:o},a){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),o!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,o]of s){const{wrapped:a}=o,c=this[i];a!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,o,c)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};U.elementStyles=[],U.shadowRootOptions={mode:"open"},U[N("elementProperties")]=new Map,U[N("finalized")]=new Map,Ue?.({ReactiveElement:U}),(V.reactiveElementVersions??=[]).push("2.1.2");const Q=globalThis,ce=r=>r,F=Q.trustedTypes,le=F?F.createPolicy("lit-html",{createHTML:r=>r}):void 0,de="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,he="?"+C,Oe=`<${he}>`,S=document,M=()=>S.createComment(""),D=r=>r===null||typeof r!="object"&&typeof r!="function",X=Array.isArray,Ie=r=>X(r)||typeof r?.[Symbol.iterator]=="function",ee=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ue=/-->/g,pe=/>/g,P=RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ge=/'/g,_e=/"/g,fe=/^(?:script|style|textarea|title)$/i,Le=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),l=Le(1),O=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),ve=new WeakMap,H=S.createTreeWalker(S,129);function me(r,e){if(!X(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return le!==void 0?le.createHTML(e):e}const Te=(r,e)=>{const t=r.length-1,s=[];let i,o=e===2?"<svg>":e===3?"<math>":"",a=R;for(let c=0;c<t;c++){const n=r[c];let p,g,d=-1,f=0;for(;f<n.length&&(a.lastIndex=f,g=a.exec(n),g!==null);)f=a.lastIndex,a===R?g[1]==="!--"?a=ue:g[1]!==void 0?a=pe:g[2]!==void 0?(fe.test(g[2])&&(i=RegExp("</"+g[2],"g")),a=P):g[3]!==void 0&&(a=P):a===P?g[0]===">"?(a=i??R,d=-1):g[1]===void 0?d=-2:(d=a.lastIndex-g[2].length,p=g[1],a=g[3]===void 0?P:g[3]==='"'?_e:ge):a===_e||a===ge?a=P:a===ue||a===pe?a=R:(a=P,i=void 0);const $=a===P&&r[c+1].startsWith("/>")?" ":"";o+=a===R?n+Oe:d>=0?(s.push(p),n.slice(0,d)+de+n.slice(d)+C+$):n+C+(d===-2?c:$)}return[me(r,o+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class j{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let o=0,a=0;const c=e.length-1,n=this.parts,[p,g]=Te(e,t);if(this.el=j.createElement(p,s),H.currentNode=this.el.content,t===2||t===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=H.nextNode())!==null&&n.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const d of i.getAttributeNames())if(d.endsWith(de)){const f=g[a++],$=i.getAttribute(d).split(C),x=/([.?@])?(.*)/.exec(f);n.push({type:1,index:o,name:x[2],strings:$,ctor:x[1]==="."?Me:x[1]==="?"?De:x[1]==="@"?Re:q}),i.removeAttribute(d)}else d.startsWith(C)&&(n.push({type:6,index:o}),i.removeAttribute(d));if(fe.test(i.tagName)){const d=i.textContent.split(C),f=d.length-1;if(f>0){i.textContent=F?F.emptyScript:"";for(let $=0;$<f;$++)i.append(d[$],M()),H.nextNode(),n.push({type:2,index:++o});i.append(d[f],M())}}}else if(i.nodeType===8)if(i.data===he)n.push({type:2,index:o});else{let d=-1;for(;(d=i.data.indexOf(C,d+1))!==-1;)n.push({type:7,index:o}),d+=C.length-1}o++}}static createElement(e,t){const s=S.createElement("template");return s.innerHTML=e,s}}function I(r,e,t=r,s){if(e===O)return e;let i=s!==void 0?t._$Co?.[s]:t._$Cl;const o=D(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,t,s)),s!==void 0?(t._$Co??=[])[s]=i:t._$Cl=i),i!==void 0&&(e=I(r,i._$AS(r,e.values),i,s)),e}class Ne{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??S).importNode(t,!0);H.currentNode=i;let o=H.nextNode(),a=0,c=0,n=s[0];for(;n!==void 0;){if(a===n.index){let p;n.type===2?p=new k(o,o.nextSibling,this,e):n.type===1?p=new n.ctor(o,n.name,n.strings,this,e):n.type===6&&(p=new je(o,this,e)),this._$AV.push(p),n=s[++c]}a!==n?.index&&(o=H.nextNode(),a++)}return H.currentNode=S,i}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=I(this,e,t),D(e)?e===u||e==null||e===""?(this._$AH!==u&&this._$AR(),this._$AH=u):e!==this._$AH&&e!==O&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ie(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==u&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=j.createElement(me(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const o=new Ne(i,this),a=o.u(this.options);o.p(t),this.T(a),this._$AH=o}}_$AC(e){let t=ve.get(e.strings);return t===void 0&&ve.set(e.strings,t=new j(e)),t}k(e){X(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const o of e)i===t.length?t.push(s=new k(this.O(M()),this.O(M()),this,this.options)):s=t[i],s._$AI(o),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=ce(e).nextSibling;ce(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,o){this.type=1,this._$AH=u,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(e,t=this,s,i){const o=this.strings;let a=!1;if(o===void 0)e=I(this,e,t,0),a=!D(e)||e!==this._$AH&&e!==O,a&&(this._$AH=e);else{const c=e;let n,p;for(e=o[0],n=0;n<o.length-1;n++)p=I(this,c[s+n],t,n),p===O&&(p=this._$AH[n]),a||=!D(p)||p!==this._$AH[n],p===u?e=u:e!==u&&(e+=(p??"")+o[n+1]),this._$AH[n]=p}a&&!i&&this.j(e)}j(e){e===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Me extends q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===u?void 0:e}}class De extends q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==u)}}class Re extends q{constructor(e,t,s,i,o){super(e,t,s,i,o),this.type=5}_$AI(e,t=this){if((e=I(this,e,t,0)??u)===O)return;const s=this._$AH,i=e===u&&s!==u||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,o=e!==u&&(s===u||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class je{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){I(this,e)}}const ke=Q.litHtmlPolyfillSupport;ke?.(j,k),(Q.litHtmlVersions??=[]).push("3.3.2");const Be=(r,e,t)=>{const s=t?.renderBefore??e;let i=s._$litPart$;if(i===void 0){const o=t?.renderBefore??null;s._$litPart$=i=new k(e.insertBefore(M(),o),o,void 0,t??{})}return i._$AI(r),i};const te=globalThis;class A extends U{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Be(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return O}}A._$litElement$=!0,A.finalized=!0,te.litElementHydrateSupport?.({LitElement:A});const ze=te.litElementPolyfillSupport;ze?.({LitElement:A}),(te.litElementVersions??=[]).push("4.2.2");const Z=r=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(r,e)}):customElements.define(r,e)};const Ve={attribute:!0,type:String,converter:W,reflect:!1,hasChanged:Y},We=(r=Ve,e,t)=>{const{kind:s,metadata:i}=t;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),o.set(t.name,r),s==="accessor"){const{name:a}=t;return{set(c){const n=e.get.call(this);e.set.call(this,c),this.requestUpdate(a,n,r,!0,c)},init(c){return c!==void 0&&this.C(a,void 0,r,c),c}}}if(s==="setter"){const{name:a}=t;return function(c){const n=this[a];e.call(this,c),this.requestUpdate(a,n,r,!0,c)}}throw Error("Unsupported decorator location: "+s)};function h(r){return(e,t)=>typeof t=="object"?We(r,e,t):((s,i,o)=>{const a=i.hasOwnProperty(o);return i.constructor.createProperty(o,s),a?Object.getOwnPropertyDescriptor(i,o):void 0})(r,e,t)}function y(r){return h({...r,state:!0,attribute:!1})}const Fe=async()=>{if(!customElements.get("ha-entity-picker")){if(!customElements.get("ha-selector")){await customElements.whenDefined("partial-panel-resolver");const r=document.createElement("partial-panel-resolver");r.hass={panels:[{url_path:"tmp",component_name:"config"}]},r._updateRoutes(),await r.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config"),await document.createElement("ha-panel-config").routerOptions.routes.automation.load()}if(!customElements.get("ha-entity-picker"))try{await(await(await window.loadCardHelpers()).createCardElement({type:"entities",entities:[]})).constructor.getConfigElement()}catch{}if(!customElements.get("ha-entity-picker"))try{await Promise.race([customElements.whenDefined("ha-selector"),new Promise((t,s)=>setTimeout(()=>s(new Error("timeout")),1e4))]);const r=document.querySelector("home-assistant")?.hass,e=document.createElement("div");e.style.cssText="position:fixed;left:-9999px;opacity:0;pointer-events:none",document.body.appendChild(e);try{const t=document.createElement("ha-selector");t.hass=r,t.selector={entity:{}},e.appendChild(t),await Promise.race([customElements.whenDefined("ha-entity-picker"),new Promise(s=>setTimeout(s,5e3))])}finally{e.remove()}}catch{}if(await customElements.whenDefined("ha-card"),!customElements.get("ha-date-range-picker"))try{await(await window.loadCardHelpers()).createCardElement({type:"energy-date-selection",entities:[]}),await Promise.race([customElements.whenDefined("ha-date-range-picker"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}if(!customElements.get("ha-chart-base"))try{await(await window.loadCardHelpers()).createCardElement({type:"statistics-graph",entities:[]}),await Promise.race([customElements.whenDefined("ha-chart-base"),new Promise((e,t)=>setTimeout(t,5e3))])}catch{}}},qe=r=>{const e=Object.values(r.entities).filter(i=>i.platform==="easee"),t=new Set;for(const i of e)i.device_id&&t.add(i.device_id);const s=[];for(const i of t){const o=r.devices[i];if(!o)continue;const c=Object.values(r.entities).filter(T=>T.device_id===i).reduce((T,$e)=>{const be=r.states[$e.entity_id];return be&&T.set($e.entity_id,be),T},new Map),n=T=>`sensor.${o.name?.toLowerCase().replace(/\s+/g,"_")}_${T}`,p=c.get(n("status"))?.state||"Unknown",g=parseFloat(c.get(n("power"))?.state||"0"),d=parseFloat(c.get(n("max_circuit_limit"))?.state||"0"),f=c.get(n("circuit_current"));let $=0,x=0,se=0;f&&($=parseFloat(f.attributes.state_circuitTotalPhaseConductorCurrentL1)||0,x=parseFloat(f.attributes.state_circuitTotalPhaseConductorCurrentL2)||0,se=parseFloat(f.attributes.state_circuitTotalPhaseConductorCurrentL3)||0),s.push({id:i,name:o.name||"Unknown Charger",serialNumber:o.serial_number||"N/A",status:p,power:g,currentLimit:d,currentUsage:Math.max($,x,se),l1_usage:$,l2_usage:x,l3_usage:se,configured:!1})}return s},Ze="M12,3A1,1 0 0,1 13,4V4.39C17.65,5.15 21,7.45 21,10.13C21,11.19 19.82,12.14 18,12.8V19H19V21H5V19H6V12.8C4.18,12.14 3,11.19 3,10.13C3,7.45 6.35,5.15 11,4.39V4A1,1 0 0,1 12,3M12,6.13C8.13,6.13 5,7.45 5,9.13C5,10.81 8.13,12.13 12,12.13C15.87,12.13 19,10.81 19,9.13C19,7.45 15.87,6.13 12,6.13M12,14.13C9.8,14.13 8,15.93 8,18.13V19H16V18.13C16,15.93 14.2,14.13 12,14.13Z",Ge="M2,5.27L3.28,4L20,20.72L18.73,22L15.65,18.92C14.66,19.59 13.4,20 12,20C9.8,20 8,18.2 8,16V11.27L2,5.27M12,2C12.55,2 13,2.45 13,3V3.39C17.65,4.15 21,6.45 21,9.13C21,10.19 19.82,11.14 18,11.8V17.27L13.73,13C15.6,12.59 17,11.5 17,10.13C17,8.45 13.87,7.13 10,7.13C9.05,7.13 8.15,7.21 7.34,7.34L5.11,5.11C6.7,4.24 8.74,3.64 11,3.39V3C11,2.45 11.45,2 12,2M12,14C13.2,14 14.24,14.53 14.92,15.35L10.65,11.08C10.22,11.68 10,12.31 10,13C10,14.1 10.9,15 12,15V14Z";var Je=Object.defineProperty,Ke=Object.getOwnPropertyDescriptor,m=(r,e,t,s)=>{for(var i=s>1?void 0:s?Ke(e,t):e,o=r.length-1,a;o>=0;o--)(a=r[o])&&(i=(s?a(e,t,i):a(i))||i);return s&&i&&Je(e,t,i),i};let _=class extends A{constructor(){super(...arguments),this.chargerId="",this.name="",this.serialNumber="",this.status="",this.power=0,this.currentLimit=0,this.currentUsage=0,this.l1Usage=0,this.l2Usage=0,this.l3Usage=0,this.configured=!1}render(){const r=this.configured?this.status==="charging"?"accent-charging":"accent-idle":"accent-unconfigured";return l`
      <ha-card .header=${this.name} @click=${this._handleClick}>
        <div class="accent ${r}"></div>
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
  `,m([h()],_.prototype,"chargerId",2),m([h()],_.prototype,"name",2),m([h()],_.prototype,"serialNumber",2),m([h()],_.prototype,"status",2),m([h({type:Number})],_.prototype,"power",2),m([h({type:Number})],_.prototype,"currentLimit",2),m([h({type:Number})],_.prototype,"currentUsage",2),m([h({type:Number})],_.prototype,"l1Usage",2),m([h({type:Number})],_.prototype,"l2Usage",2),m([h({type:Number})],_.prototype,"l3Usage",2),m([h({type:Boolean})],_.prototype,"configured",2),_=m([Z("cc-charger-card")],_);var Ye=Object.defineProperty,Qe=Object.getOwnPropertyDescriptor,E=(r,e,t,s)=>{for(var i=s>1?void 0:s?Qe(e,t):e,o=r.length-1,a;o>=0;o--)(a=r[o])&&(i=(s?a(e,t,i):a(i))||i);return s&&i&&Ye(e,t,i),i};let w=class extends A{constructor(){super(...arguments),this.chargerId="",this.households={},this._selectedHouseholdId="",this._house_l1="cl1",this._house_l2="cl2",this._house_l3="cl3"}firstUpdated(){this._loadConfig()}async _loadConfig(){try{const e=(await this.hass.callWS({type:"generic_charge_controller/chargers/get"}))[this.chargerId];e&&(this._selectedHouseholdId=e.household_id||"",this._house_l1=e.house_l1||"cl1",this._house_l2=e.house_l2||"cl2",this._house_l3=e.house_l3||"cl3")}catch(r){console.error("Error loading charger config:",r)}}render(){const r=Object.values(this.households);return r.length===0?l`
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
              ${r.map(e=>{const t=this.hass.devices[e.device_id],s=t?t.name.replace(/Tibber Pulse/gi,"").trim()||t.name:e.device_id;return l`<option value=${e.device_id} ?selected=${this._selectedHouseholdId===e.device_id}>${s}</option>`})}
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
                      @change=${s=>this[`_house_l${e}`]=s.target.value}
                    >
                      <option value="cl1" ?selected=${t==="cl1"}>Charger L1</option>
                      <option value="cl2" ?selected=${t==="cl2"}>Charger L2</option>
                      <option value="cl3" ?selected=${t==="cl3"}>Charger L3</option>
                    </select>
                  </div>
                `})}
            </div>
          `:u}
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
    `}async _save(){try{await this.hass.callWS({type:"generic_charge_controller/chargers/save",charger_id:this.chargerId,config:{household_id:this._selectedHouseholdId,house_l1:this._house_l1,house_l2:this._house_l2,house_l3:this._house_l3}}),this.dispatchEvent(new CustomEvent("config-saved",{bubbles:!0,composed:!0}))}catch(r){console.error("Error saving charger config:",r)}}};w.styles=z`
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
  `,E([h({attribute:!1})],w.prototype,"hass",2),E([h()],w.prototype,"chargerId",2),E([h({attribute:!1})],w.prototype,"households",2),E([y()],w.prototype,"_selectedHouseholdId",2),E([y()],w.prototype,"_house_l1",2),E([y()],w.prototype,"_house_l2",2),E([y()],w.prototype,"_house_l3",2),w=E([Z("cc-load-balancer-settings")],w);var Xe=Object.defineProperty,et=Object.getOwnPropertyDescriptor,G=(r,e,t,s)=>{for(var i=s>1?void 0:s?et(e,t):e,o=r.length-1,a;o>=0;o--)(a=r[o])&&(i=(s?a(e,t,i):a(i))||i);return s&&i&&Xe(e,t,i),i};let L=class extends A{constructor(){super(...arguments),this.deviceId="",this.name="",this.enabled=!1}render(){return l`
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
  `,G([h()],L.prototype,"deviceId",2),G([h()],L.prototype,"name",2),G([h({type:Boolean})],L.prototype,"enabled",2),L=G([Z("cc-household-card")],L);var tt=Object.defineProperty,st=Object.getOwnPropertyDescriptor,b=(r,e,t,s)=>{for(var i=s>1?void 0:s?st(e,t):e,o=r.length-1,a;o>=0;o--)(a=r[o])&&(i=(s?a(e,t,i):a(i))||i);return s&&i&&tt(e,t,i),i};let v=class extends A{constructor(){super(...arguments),this.narrow=!1,this.route={path:""},this.panel={},this._elementsLoaded=!1,this._selectedChargerId=null,this._activeTab="chargers",this._routeApplied=!1,this._configuredHouseholds={},this._configuredChargers={}}firstUpdated(){this._loadElements(),this._loadData()}async _loadElements(){await Fe(),this._elementsLoaded=!0}async _loadData(){try{this._configuredHouseholds=await this.hass.callWS({type:"generic_charge_controller/households/get"}),this._configuredChargers=await this.hass.callWS({type:"generic_charge_controller/chargers/get"})}catch(r){console.error("Error loading data from Charge Controller backend:",r)}}willUpdate(r){r.has("route")&&this._applyRoute()}connectedCallback(){super.connectedCallback(),this._routeApplied||(this._applyRoute(),this._routeApplied=!0)}render(){if(!this._elementsLoaded)return l`<div class="loading">Loading...</div>`;const r=!!this._selectedChargerId,e=qe(this.hass),t=r?e.find(s=>s.id===this._selectedChargerId):null;return l`
      <div class="toolbar">
        ${r?l`
            <ha-icon-button
              .label=${"Back"}
              @click=${this._goBack}
            >
              <ha-icon .icon=${"mdi:arrow-left"}></ha-icon>
            </ha-icon-button>`:u}
        <div class="title">
          ${r?t?.name??"Charger Details":"Charge Controller"}
        </div>
        ${r?u:l`
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
        ${r?this._renderDetail(t):this._activeTab==="chargers"?this._renderGrid(e):this._renderHouseholds()}
      </div>
    `}_renderGrid(r){return l`
      ${r.length===0?l`<p>No Easee chargers detected in your system.</p>`:l`
            <div class="grid">
              ${r.map(e=>{const t=!!this._configuredChargers[e.id];return l`
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
    `}_renderHouseholds(){const r=Object.values(this.hass.devices).filter(e=>e.model==="Tibber Pulse");return l`
      ${r.length===0?l`<p>No Tibber Pulse devices detected in your system.</p>`:l`
            <div class="grid">
              ${r.map(e=>{const t=e.name.replace(/Tibber Pulse/gi,"").trim()||e.name,s=!!this._configuredHouseholds[e.id];return l`
                  <cc-household-card
                    .deviceId=${e.id}
                    .name=${t}
                    .enabled=${s}
                    @household-enabled=${this._onHouseholdEnabled}
                    @household-removed=${this._onHouseholdRemoved}
                  ></cc-household-card>
                `})}
            </div>
          `}
    `}_renderDetail(r){if(!r)return l`<p>Charger not found.</p>`;const e=!!this._configuredChargers[r.id];return l`
      <div class="detail-view">
        <cc-charger-card
          .chargerId=${r.id}
          .name=${r.name}
          .serialNumber=${r.serialNumber}
          .status=${r.status}
          .power=${r.power}
          .currentLimit=${r.currentLimit}
          .currentUsage=${r.currentUsage}
          .l1Usage=${r.l1_usage}
          .l2Usage=${r.l2_usage}
          .l3Usage=${r.l3_usage}
          .configured=${e}
        ></cc-charger-card>

        <cc-load-balancer-settings
          .hass=${this.hass}
          .chargerId=${r.id}
          .households=${this._configuredHouseholds}
          @config-saved=${this._loadData}
        ></cc-load-balancer-settings>

        <ha-card header="Statistics">
          <div class="card-content">
            <p>Placeholder for charging statistics and history.</p>
          </div>
        </ha-card>
      </div>
    `}_navigate(r){history.replaceState(null,"",`/charge-controller${r}`),window.dispatchEvent(new Event("location-changed"))}_goBack(){this._selectedChargerId=null,this._navigate("")}_onChargerSelected(r){this._selectedChargerId=r.detail.chargerId,this._navigate(`/charger/${r.detail.chargerId}`)}async _onHouseholdEnabled(r){const e=r.detail.deviceId;console.log(`Enable household for device: ${e}`);const t=Object.values(this.hass.entities).filter(i=>i.device_id===e),s={enabled:!0};for(const i of t)i.entity_id.includes("current_l1")?s.l1_sensor=i.entity_id:i.entity_id.includes("current_l2")?s.l2_sensor=i.entity_id:i.entity_id.includes("current_l3")&&(s.l3_sensor=i.entity_id);try{const i=await this.hass.callWS({type:"generic_charge_controller/households/save",device_id:e,config:s});this._configuredHouseholds={...this._configuredHouseholds,[e]:i}}catch(i){console.error("Error saving household:",i)}}async _onHouseholdRemoved(r){console.log(`Household removed for device: ${r.detail.deviceId}`);try{await this.hass.callWS({type:"generic_charge_controller/households/delete",device_id:r.detail.deviceId});const e={...this._configuredHouseholds};delete e[r.detail.deviceId],this._configuredHouseholds=e}catch(e){console.error("Error deleting household:",e)}}_applyRoute(){const r=this.route?.path??"";r.startsWith("/charger/")?this._selectedChargerId=decodeURIComponent(r.slice(9)):this._selectedChargerId=null,this._routeApplied=!0}};v.styles=z`
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
  `,b([h({attribute:!1})],v.prototype,"hass",2),b([h({type:Boolean,reflect:!0})],v.prototype,"narrow",2),b([h({type:Object})],v.prototype,"route",2),b([h({type:Object})],v.prototype,"panel",2),b([y()],v.prototype,"_elementsLoaded",2),b([y()],v.prototype,"_selectedChargerId",2),b([y()],v.prototype,"_activeTab",2),b([y()],v.prototype,"_routeApplied",2),b([y()],v.prototype,"_configuredHouseholds",2),b([y()],v.prototype,"_configuredChargers",2),v=b([Z("charge-controller-panel")],v)})();
