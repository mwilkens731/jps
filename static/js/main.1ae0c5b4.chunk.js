(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{112:function(e,t,n){e.exports=n(227)},117:function(e,t,n){},129:function(e,t){},131:function(e,t){},163:function(e,t){},164:function(e,t){},212:function(e,t){},214:function(e,t){},227:function(e,t,n){"use strict";n.r(t);var a=n(3),o=n.n(a),c=n(107),s=n.n(c),i=(n(117),n(34)),r=n(35),u=n(39),l=n(36),h=n(40),p=(n(57),n(55)),d=n.n(p),m=n(108),f=n(18),y={appName:"juanpierresucks",appId:"mxfalV3c",clientId:"dj0yJmk9WW9hSlNxcDllcUZwJnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTU5",clientSecret:"4a1c4d6e5af02bfe69e226d666a5113a7b2b35a6",corsAnywhereUrl:"https://cors-anywhere.herokuapp.com/",leagueKey:"mlb.l.74981"},g=n(230),v=n(109),b=n.n(v),w=n(126),k=function(e){function t(e){var n;return Object(i.a)(this,t),(n=Object(u.a)(this,Object(l.a)(t).call(this,e))).state={oauth:new w.OAuth2(y.clientId,y.clientSecret,"https://api.login.yahoo.com/","oauth2/request_auth","oauth2/get_token"),oauthWithProxy:new w.OAuth2(y.clientId,y.clientSecret,y.corsAnywhereUrl+"https://api.login.yahoo.com/","oauth2/request_auth","oauth2/get_token")},n.state.oauthWithProxy.useAuthorizationHeaderforGET(!0),n.saveLoginResults=n.saveLoginResults.bind(Object(f.a)(Object(f.a)(n))),n.saveGameId=n.saveGameId.bind(Object(f.a)(Object(f.a)(n))),n}return Object(h.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){var e=Object(m.a)(d.a.mark(function e(t){var n;return d.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:(n=b.a.parse(this.props.location.search).code)||this.state.code?this.state.oauthWithProxy.getOAuthAccessToken(n,{grant_type:"authorization_code",redirect_uri:"https://mwilkens731.github.io/jps"},this.saveLoginResults):window.location.assign(this.state.oauth.getAuthorizeUrl({redirect_uri:"https://mwilkens731.github.io/jps",response_type:"code"}));case 2:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}()},{key:"saveLoginResults",value:function(e,t,n,a){e?console.log(e):(console.log("success!"),console.log("access",n),console.log("refresh",a),this.state.oauthWithProxy.get(y.corsAnywhereUrl+"https://fantasysports.yahooapis.com/fantasy/v2/league/"+y.leagueKey+"?format=json",a.access_token,this.saveGameId)),this.setState({code:t,accessToken:a.access_token})}},{key:"saveGameId",value:function(e){console.log("response",e)}},{key:"render",value:function(){return o.a.createElement("div",null,o.a.createElement("div",null,"Hi"),o.a.createElement("div",null,"this.state.accessToken"))}}]),t}(a.Component),j=Object(g.a)(k),O=n(232),_=n(233),A=n(231),E=function(e){function t(){return Object(i.a)(this,t),Object(u.a)(this,Object(l.a)(t).apply(this,arguments))}return Object(h.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){return o.a.createElement("div",{className:"App"},o.a.createElement(O.a,null,o.a.createElement(_.a,null,o.a.createElement(A.a,{path:"/",component:j}))))}}]),t}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(o.a.createElement(E,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},57:function(e,t,n){}},[[112,1,2]]]);
//# sourceMappingURL=main.1ae0c5b4.chunk.js.map