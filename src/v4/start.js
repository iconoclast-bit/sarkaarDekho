/* Start: runs once every module above has loaded, so the first page is drawn with all of them in place. */
(function(){
"use strict";
var P=window.PPD;
function fail(e){var G=window.PPD_GUARD;if(G){G.report(e,"start");G.notice("The site couldn't start.","Reload to try again.")}}
function go(){try{P.boot()}catch(e){fail(e)}}
/* If the guard file did not load, fetch it once more under a fresh address. */
if(!window.PPD_GUARD){
  var s=document.querySelector('script[src*="/assets/guard."]');
  if(s&&s.src.indexOf("?r=")<0){var n=document.createElement("script");n.src=s.src+"?r="+Math.floor(Date.now()/3600000);if(s.integrity)n.integrity=s.integrity;document.head.appendChild(n)}
}
if(!P||typeof P.boot!=="function"){fail(new Error("app missing"));return}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();
})();
