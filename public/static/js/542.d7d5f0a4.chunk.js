"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[542],{6542:function(e,s,n){n.r(s),n.d(s,{default:function(){return f}});var r=n(4165),t=n(5861),a=n(9439),c=n(2791),i=n(1087),l=n(184),u=function(e){return(0,l.jsx)("div",{className:"avatar ".concat(e.className),style:e.style,children:(0,l.jsx)("img",{src:e.image,alt:e.alt,style:{width:e.width,height:e.width}})})},d=n(3373),o=function(e){return(0,l.jsx)("li",{className:"user-item",children:(0,l.jsx)(d.Z,{className:"user-item__content",children:(0,l.jsxs)(i.rU,{to:"/".concat(e.id,"/places"),children:[(0,l.jsx)("div",{className:"user-item__image",children:(0,l.jsx)(u,{image:e.image,alt:e.name})}),(0,l.jsxs)("div",{className:"user-item__info",children:[(0,l.jsx)("h2",{children:e.name}),(0,l.jsxs)("h3",{children:[e.placeCount," ",1===e.placeCount?"place":"places"]})]})]})})})},h=function(e){return 0===e.items.length?(0,l.jsx)("div",{className:"center",children:(0,l.jsx)(d.Z,{children:(0,l.jsx)("h2",{children:"No users found."})})}):(0,l.jsx)("ul",{className:"users-list",children:e.items.map((function(e){return(0,l.jsx)(o,{id:e.id,image:e.image,name:e.name,placeCount:e.places.length},e.id)}))})},m=n(5434),x=n(9895),p=n(9508),f=function(){var e=(0,p.x)(),s=e.isLoading,n=e.error,i=e.sendRequest,u=e.clearError,d=(0,c.useState)(),o=(0,a.Z)(d,2),f=o[0],j=o[1];return(0,c.useEffect)((function(){var e=function(){var e=(0,t.Z)((0,r.Z)().mark((function e(){var s;return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,i("".concat("https://rodcdev-socialmedia-places.herokuapp.com/api","/users"));case 3:s=e.sent,j(s.users),e.next=9;break;case 7:e.prev=7,e.t0=e.catch(0);case 9:case"end":return e.stop()}}),e,null,[[0,7]])})));return function(){return e.apply(this,arguments)}}();e()}),[i]),(0,l.jsxs)(c.Fragment,{children:[(0,l.jsx)(m.Z,{error:n,onClear:u}),s&&(0,l.jsx)("div",{className:"center",children:(0,l.jsx)(x.Z,{})}),!s&&f&&(0,l.jsx)(h,{items:f})]})}}}]);
//# sourceMappingURL=542.d7d5f0a4.chunk.js.map