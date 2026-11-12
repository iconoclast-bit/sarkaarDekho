/* Guard: loads before everything else, as its own small file, so it still runs if the main bundle fails to load.
   1. Checks whatever this site saved in the browser before any other code reads it.
   2. Supports "forget when I close this tab" mode.
   3. Turns load failures and unexpected errors into a message with a way out, never a blank page.
   Nothing here talks to a server. */
(function(){
"use strict";
var G=window.PPD_GUARD={errors:[],version:1};
var PREFIX="pdk",PRIVATE="pdk_private",STASH="pdk_stash",ALIVE="pdk_alive",MAX_BYTES=60000;

/* ---------- safe storage access ---------- */
function ls(){try{return window.localStorage}catch(e){return null}}
function ss(){try{return window.sessionStorage}catch(e){return null}}
function ownKeys(){var s=ls(),out=[];if(!s)return out;try{for(var i=0;i<s.length;i++){var k=s.key(i);if(k&&k.indexOf(PREFIX)===0)out.push(k)}}catch(e){}return out}
function drop(k){var s=ls();if(s)try{s.removeItem(k)}catch(e){}}
G.erase=function(){ownKeys().forEach(drop);var t=ss();if(t)try{t.removeItem(STASH);t.removeItem(ALIVE)}catch(e){}};
G.isPrivate=function(){var s=ls();try{return !!s&&s.getItem(PRIVATE)==="1"}catch(e){return false}};
G.setPrivate=function(on){var s=ls(),t=ss();if(!s)return false;
  try{if(on){s.setItem(PRIVATE,"1");if(t)t.setItem(ALIVE,"1")}else{s.removeItem(PRIVATE);if(t){t.removeItem(STASH);t.removeItem(ALIVE)}}return true}catch(e){return false}};

/* ---------- what each saved item must look like ---------- */
function isObj(v){return !!v&&typeof v==="object"&&!Array.isArray(v)}
function strList(v,max){return Array.isArray(v)&&v.length<=max&&v.every(function(x){return typeof x==="string"&&x.length<=40})}
function decide(v){return isObj(v)&&strList(v.issues,12)}
var SHAPES=[
  ["pdk_loc",isObj],["pdk_ops",isObj],["pdk_me",isObj],["pdk_mv",isObj],
  ["pdk3_dec",decide],["pdk_ddec",decide],["pdk_sdec_",decide],
  ["pdk4_cmp",function(v){return strList(v,6)}],["pdk_dcmp",function(v){return strList(v,6)}],["pdk_scmp_",function(v){return strList(v,6)}],
  ["pdk_scope",function(v){return v==="state"||v==="centre"}]
];
function shapeFor(k){for(var i=0;i<SHAPES.length;i++){var n=SHAPES[i][0];if(k===n||(n.charAt(n.length-1)==="_"&&k.indexOf(n)===0&&k.length<=n.length+6))return SHAPES[i][1]}return null}
function sanitise(){
  var s=ls();if(!s)return;
  ownKeys().forEach(function(k){
    if(k===PRIVATE)return;
    var check=shapeFor(k),raw=null,ok=false;
    if(check){try{raw=s.getItem(k);ok=raw!=null&&raw.length<=MAX_BYTES&&check(JSON.parse(raw))}catch(e){ok=false}}
    if(!ok)drop(k);
  });
}

/* ---------- "forget when I close this tab" ---------- */
function privateStart(){
  var s=ls(),t=ss();if(!s||!G.isPrivate())return;
  var kept=null;
  if(t){try{kept=t.getItem(STASH)}catch(e){}}
  ownKeys().forEach(function(k){if(k!==PRIVATE)drop(k)});
  if(kept){try{var o=JSON.parse(kept);if(isObj(o))Object.keys(o).forEach(function(k){if(k.indexOf(PREFIX)===0&&k!==PRIVATE&&typeof o[k]==="string")s.setItem(k,o[k])})}catch(e){}}
  if(t)try{t.setItem(ALIVE,"1")}catch(e){}
}
function privateEnd(){
  var s=ls(),t=ss();if(!s||!G.isPrivate())return;
  var o={};ownKeys().forEach(function(k){if(k!==PRIVATE){try{o[k]=s.getItem(k)}catch(e){}}});
  if(t)try{t.setItem(STASH,JSON.stringify(o))}catch(e){}
  ownKeys().forEach(function(k){if(k!==PRIVATE)drop(k)});
}
try{privateStart();sanitise()}catch(e){}
window.addEventListener("pagehide",function(){try{privateEnd()}catch(e){}});
window.addEventListener("pageshow",function(ev){if(ev.persisted){try{privateStart()}catch(e){}}});

/* ---------- errors ---------- */
G.report=function(err,where){
  var msg=err&&err.message?err.message:String(err);
  G.errors.push({at:new Date().toISOString(),where:where||"",msg:msg.slice(0,300)});
  if(G.errors.length>20)G.errors.shift();
  if(window.console&&console.error)console.error("[ppd]",where||"",err);
};
function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n}
function notice(title,body){
  if(document.getElementById("ppd-fatal"))return;
  var box=el("div","ppd-fatal");box.id="ppd-fatal";box.setAttribute("role","alert");
  var inner=el("div","ppd-fatal-in");
  inner.appendChild(el("b","",title));inner.appendChild(el("span","",body));
  var btn=el("button","btn btn-p btn-s","Reload");btn.type="button";btn.setAttribute("data-ppd-reload","1");inner.appendChild(btn);
  box.appendChild(inner);
  var app=document.getElementById("app"),boot=document.querySelector(".ppd-boot");
  if(boot&&app){app.textContent="";app.appendChild(box)}else if(document.body)document.body.appendChild(box);
}
G.notice=notice;
/* A script or stylesheet of this site that fails to load is tried once more under a fresh address, which also
   gets past a failed answer the browser may have kept. The address changes hourly, so a good copy is reused. */
function retry(t){
  var url=t.src||t.href||"";
  if(url.indexOf(location.origin+"/assets/")!==0||url.indexOf("?r=")>=0)return false;
  var isScript=t.tagName==="SCRIPT",n=document.createElement(isScript?"script":"link"),u=url+"?r="+Math.floor(Date.now()/3600000);
  if(t.integrity)n.integrity=t.integrity;
  if(isScript){n.async=false;n.src=u}else{n.rel="stylesheet";n.href=u}
  setTimeout(function(){(document.head||document.documentElement).appendChild(n)},700);
  return true;
}
G.retry=retry;
window.addEventListener("error",function(ev){
  var t=ev.target;
  if(t&&t!==window&&t.tagName){
    if(t.tagName==="IMG"){if(t.parentNode)t.parentNode.removeChild(t);return}
    if(t.tagName==="SCRIPT"||(t.tagName==="LINK"&&t.rel==="stylesheet")){
      G.report("failed to load "+(t.src||t.href||""),"load");
      if(!retry(t))notice("The site didn't load fully.","Your connection may have dropped. Check it and reload.");
    }
    return;
  }
  G.report(ev.error||ev.message,"window");
},true);
window.addEventListener("unhandledrejection",function(ev){G.report(ev.reason,"promise")});
/* A stylesheet can fail before this file starts listening, so check the ones already on the page:
   one that failed has no rules. */
try{var sheets=document.querySelectorAll('link[rel="stylesheet"]');for(var q=0;q<sheets.length;q++){var sh=sheets[q].sheet;if(!sh||!sh.cssRules.length)retry(sheets[q])}}catch(e){}
/* If the first page has not been drawn after 12 seconds, say so. */
setTimeout(function(){if(document.querySelector(".ppd-boot"))notice("This is taking longer than it should.","Check your connection and reload.")},12000);

/* ---------- reload and reset controls (reset asks twice) ---------- */
document.addEventListener("click",function(ev){
  var t=ev.target&&ev.target.closest?ev.target:null;if(!t)return;
  if(t.closest("[data-ppd-reload]")){window.location.reload();return}
  var r=t.closest("[data-ppd-reset],[data-ppd-erase]");
  if(r){
    if(r.getAttribute("data-armed")!=="1"){
      r.setAttribute("data-armed","1");r.setAttribute("data-label",r.textContent);r.textContent="Tap again to erase. This can't be undone.";
      setTimeout(function(){if(r.getAttribute("data-armed")==="1"){r.removeAttribute("data-armed");r.textContent=r.getAttribute("data-label")||"Erase"}},6000);
      return;
    }
    var keepPrivate=G.isPrivate();
    G.erase();if(keepPrivate)G.setPrivate(true);
    try{history.replaceState(null,"","#home")}catch(e){}
    window.location.reload();
  }
});
})();
