(this.webpackJsonptoohak=this.webpackJsonptoohak||[]).push([[0],{71:function(e,t,a){e.exports=a(88)},88:function(e,t,a){"use strict";a.r(t);var n=a(0),o=a.n(n),r=a(10),s=a.n(r),c=a(16),i=a(17),l=a(19),u=a(18),m=a(45),d=a(24),p=a(12),h=a(5),f=a.n(h),g=a(9),v=a(15),b=a(29),y=a.n(b),E=(a(59),a(60),y.a.initializeApp({apiKey:"AIzaSyArVyBRB-XMiStAmjP5mCV2v2PmScbEpi8",authDomain:"integrity-step-capstone.firebaseapp.com",databaseURL:"https://integrity-step-capstone.firebaseio.com",projectId:"integrity-step-capstone",storageBucket:"integrity-step-capstone.appspot.com",messagingSenderId:"359578935158",appId:"1:359578935158:web:89d46122b0609b4a95a457",measurementId:"G-GMNRGZQ858"})),k=y.a.auth(),w=(y.a.firestore(),y.a.firestore()),j=(new y.a.auth.GoogleAuthProvider,function(e,t,a,n){var o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1e4,r=w.collection("Rooms").doc();r.set({day_index:0,phase:"no-host",password:n,starting_money:o});var s=r.id;return S(null,null,e).then((function(e){O(e,t).then((function(t){r.update({symbols:e,dates:t.dates}),I(e,s,t.period,t.dates)}))})),s});var O=function(){var e=Object(g.a)(f.a.mark((function e(t,a){var n,o,r,s,c,i,l,u,m,d,p,h,g,v;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,w.collection("Ticker-Info").doc("Stock").collection("Stocks").where("Symbol","in",t).get();case 2:for(n=e.sent,o=0,r=new Date,s=r.getFullYear(),n.forEach((function(e){o<e.data().IPOyear&&(o=e.data().IPOyear)})),3,c=s-(o+1),i=Math.floor((12*c-3)/a),l=Math.floor(Math.random()*(i-3)+3),u=new Date(o+1,1,1),m=new Date(o+1,1+l,1),f=u,b=m,d=new Date(+f+Math.random()*(b-f)),p=[],h=d,g=0;g<a;g++)p.push(h.toISOString().substring(0,10)),h=new Date(h.setMonth(h.getMonth()+l));return v={dates:p,period:l},e.abrupt("return",v);case 19:case"end":return e.stop()}var f,b}),e)})));return function(t,a){return e.apply(this,arguments)}}(),S=function(){var e=Object(g.a)(f.a.mark((function e(t,a,n){var o,r,s,c,i,l,u,m,d,p,h,g,v;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(o=[],null===a||null===t){e.next=24;break}return(r=new FormData).append("Industry",t),r.append("Sector",a),r.append("NumOfSymbols",n),e.prev=6,e.next=9,fetch("http://localhost:8080/get-symbols",{method:"POST",mode:"cors",body:r});case 9:return s=e.sent,e.next=12,s.json();case 12:if(!(c=e.sent).hasOwnProperty("Error")){e.next=16;break}return console.log("No Symbols for your query"),e.abrupt("return",o);case 16:o=c.symbols,e.next=22;break;case 19:e.prev=19,e.t0=e.catch(6),console.log("Error with Query: "+e.t0);case 22:e.next=57;break;case 24:if(null===t){e.next=36;break}return e.next=27,w.collection("Ticker-Info").doc("Industry").get();case 27:return i=e.sent,l=i.data().Industry[t],u=Math.floor(Math.random()*(l-n)+n),e.next=32,w.collection("Ticker-Info").doc("Stock").collection("Stocks").where("Industry","==",t).where("IndustryPos","<=",u).orderBy("IndustryPos").limit(n).get();case 32:e.sent.forEach((function(e){o.push(e.data().Symbol)})),e.next=57;break;case 36:if(null===a){e.next=48;break}return e.next=39,w.collection("Ticker-Info").doc("Sector").get();case 39:return m=e.sent,d=m.data().Sector[a],p=Math.floor(Math.random()*(d-n)+n),e.next=44,w.collection("Ticker-Info").doc("Stock").collection("Stocks").where("Sector","==",a).where("SectorPos","<=",p).orderBy("SectorPos").limit(n).get();case 44:e.sent.forEach((function(e){o.push(e.data().Symbol)})),e.next=57;break;case 48:return e.next=50,w.collection("Ticker-Info").doc("Stock").get();case 50:return h=e.sent,g=h.data().NumOfStocks-1,v=Math.floor(Math.random()*(g-n)+n),e.next=55,w.collection("Ticker-Info").doc("Stock").collection("Stocks").where("RandomPos",">=",v).orderBy("RandomPos").limit(n).get();case 55:e.sent.forEach((function(e){o.push(e.data().Symbol)}));case 57:return e.abrupt("return",o);case 58:case"end":return e.stop()}}),e,null,[[6,19]])})));return function(t,a,n){return e.apply(this,arguments)}}(),I=function(){var e=Object(g.a)(f.a.mark((function e(t,a,n,o){var r;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return(r=new FormData).append("symbol",JSON.stringify(t)),r.append("RoomId",a),r.append("end-date",JSON.stringify(o)),e.prev=4,e.next=7,fetch("http://localhost:8080/get-prices",{method:"POST",mode:"cors",body:r});case 7:e.next=12;break;case 9:e.prev=9,e.t0=e.catch(4),console.log("Error is "+e.t0);case 12:return r.append("periodLen",n),e.prev=13,e.next=16,fetch("http://localhost:8080/get-stock-image",{method:"POST",mode:"cors",body:r});case 16:e.next=21;break;case 18:e.prev=18,e.t1=e.catch(13),console.log("Error is "+e.t1);case 21:case"end":return e.stop()}}),e,null,[[4,9],[13,18]])})));return function(t,a,n,o){return e.apply(this,arguments)}}();var x=function(e){Object(l.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(c.a)(this,a),(n=t.call(this,e)).state={pagetype:"not-created",gameId:""},n.createGameWrapper=n.createGameWrapper.bind(Object(v.a)(n)),n}return Object(i.a)(a,[{key:"componentDidMount",value:function(){}},{key:"createGameWrapper",value:function(){var e=Object(g.a)(f.a.mark((function e(){var t;return f.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,j(2,3,null,"");case 2:t=e.sent,this.setState({pagetype:"created",gameId:t});case 4:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this;console.log("render called");var t=this.state,a=t.pagetype,n=t.gameId;return console.log(a),console.log(n),o.a.createElement("div",{className:"app-page create-page"},"not-created"===a&&o.a.createElement("button",{onClick:Object(g.a)(f.a.mark((function t(){return f.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.createGameWrapper();case 2:return t.abrupt("return",t.sent);case 3:case"end":return t.stop()}}),t)})))}," Create Game! "),"created"===a&&o.a.createElement("div",null,o.a.createElement("span",null,"Created game PIN: ")," ",o.a.createElement("span",{className:"dynamic-text"},n)," ",o.a.createElement(d.b,{to:"/host"},"Copy this ID and use it host the game")))}}]),a}(n.Component),G=a(36),C=a(118),N=a(119),P=a(120);n.Component;var q=function(e){Object(l.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(c.a)(this,a),(n=t.call(this,e)).handleChangeSelect=function(e){n.setState(Object(G.a)({},e.target.name,e.target.value))},n.handleChange=function(e){return function(t){n.setState(Object(G.a)({},e,t.target.value))}},n.state={phase:"not-joined",questionNum:0,gameId:null,password:"",authenticated:"no",listening:"no",users:[]},n.userExists=n.userExists.bind(Object(v.a)(n)),n.updateUsers=n.updateUsers.bind(Object(v.a)(n)),n.joinGame=n.joinGame.bind(Object(v.a)(n)),n.updatePhase=n.updatePhase.bind(Object(v.a)(n)),n.initGameListener=n.initGameListener.bind(Object(v.a)(n)),n.restartGame=n.restartGame.bind(Object(v.a)(n)),n.quitGame=n.quitGame.bind(Object(v.a)(n)),n.endGame=n.endGame.bind(Object(v.a)(n)),n}return Object(i.a)(a,[{key:"componentDidMount",value:function(){this.state.gameId}},{key:"componentDidChange",value:function(){}},{key:"userExists",value:function(e){var t=this.state.users;return console.log("type of users: "+typeof t),Array.from(t).forEach((function(t,a){if(t.id==e)return!0})),!1}},{key:"updatePhase",value:function(e){var t=this.state.gameId;this.setState({phase:e}),w.collection("Rooms").doc(t).update({phase:e})}},{key:"restartGame",value:function(){}},{key:"quitGame",value:function(){this.props.toggleHeader;this.updateGame({phase:null})}},{key:"endGame",value:function(){this.updateGame({phase:"final_result"})}},{key:"addDummyUser",value:function(e){var t=this.state.gameId,a={nickname:e,investments:[],personal_value:-1,money_left:-1,gains:0,losses:0};w.collection("Rooms").doc(t).collection("users").doc(e).set(a)}},{key:"updateUsers",value:function(){var e=this.state,t=(e.password,e.gameId),a=this;w.collection("Rooms").doc(t).collection("users").get().then((function(e){e.docs.forEach((function(e){if(!a.userExists(e.id)){console.log("adding new user"),console.log("user id is "+e.id);var t=e.data();a.setState({users:a.state.users.concat([t])})}}))}))}},{key:"joinGame",value:function(){var e=this.state,t=e.password,a=e.gameId,n=this,o=w.collection("Rooms").doc(a);o.get().then((function(e){if(e.exists){var r=e.data();r.password===t&&"no-host"===r.phase?(n.setState({authenticated:"yes",phase:"connection"}),n.addDummyUser("dummy user"),n.updateUsers(),n.initGameListener(),o.update({phase:"connection"})):console.log("wrong password")}else console.log("room "+a+" does not exist")}))}},{key:"initGameListener",value:function(){var e=this.state.gameId,t=w.collection("Rooms").doc(e),a=this;t.onSnapshot((function(e){a.updateUsers()}))}},{key:"startGame",value:function(){this.updatePhase("question")}},{key:"advanceQuestion",value:function(){var e=this.state.gameId;this.setState({questionNum:this.state.questionNum+1}),w.collection("Rooms").doc(e).update({date_index:this.state.questionNum})}},{key:"render",value:function(){var e=this,t=this.state,a=t.gameId,n=t.password,r=t.phase,s=t.authenticated,c=t.users,i=t.questionNum;this.updateGame,this.restartGame,this.endGame,this.quitGame;if("no"===s)return o.a.createElement("div",{className:"page-container host-page"},o.a.createElement(P.a,null,o.a.createElement(C.a,{label:"Game PIN",name:"Game ID",value:a,onChange:this.handleChange("gameId")})),o.a.createElement(P.a,null,o.a.createElement(C.a,{label:"Password",type:"password",name:"password",value:n,onChange:this.handleChange("password")})),o.a.createElement(N.a,{onClick:function(){return e.joinGame()},variant:"contained"},"Host"));if("yes"===s){if("connection"===r)return o.a.createElement("div",{className:"page-container host-page"},o.a.createElement("p",null," Users List "),o.a.createElement("ul",{id:"user-list"},c.map((function(e){return o.a.createElement("li",null,e.nickname)}))),o.a.createElement("button",{onClick:function(){return e.startGame()}},"start stonks game"));if("question"===r)return o.a.createElement("div",{className:"page-container host-page"},o.a.createElement("span",null,"Current question: ")," ",o.a.createElement("span",{className:"dynamic-text"},i),o.a.createElement("p",null," Users List "),o.a.createElement("ul",{id:"user-list"},c.map((function(e){return o.a.createElement("li",{key:e.id},e.nickname)}))),o.a.createElement("button",{onClick:function(){return e.advanceQuestion()}},"next question"))}}}]),a}(n.Component),M=(n.Component,a(89),function(e){Object(l.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(c.a)(this,a),(n=t.call(this,e)).handleChangeSelect=function(e){n.setState(Object(G.a)({},e.target.name,e.target.value))},n.handleChange=function(e){return function(t){n.setState(Object(G.a)({},e,t.target.value))}},n.state={gameId:null,password:"",userId:"",nickname:"",phase:"not-joined",questionNum:0,chartURLs:[],technicalIndicatorUrls:[],net_worth:0,cash:[],curShares:[],prices:[]},n.addUser=n.addUser.bind(Object(v.a)(n)),n.joinGame=n.joinGame.bind(Object(v.a)(n)),n.initGameListener=n.initGameListener.bind(Object(v.a)(n)),n}return Object(i.a)(a,[{key:"componentDidMount",value:function(){}},{key:"initGameListener",value:function(){var e=this,t=this.state,a=t.questionNum,n=t.gameId,o=t.phase;t.nickname;w.collection("Rooms").doc(n).onSnapshot((function(t){var n=t.data(),r=n.day_index,s=n.phase;console.log(n),a!=r&&e.setState({questionNum:r+1}),o!==s&&e.setState({phase:s})}))}},{key:"joinGame",value:function(){var e=this.state,t=e.gameId,a=e.password,n=e.nickname,o=this;w.collection("Rooms").doc(t).get().then((function(e){if(e.exists){var r=e.data();if(r.password===a&&"connection"===r.phase){var s=o.addUser(n,r.starting_money);o.setState({phase:"connection",userId:s,net_worth:r.starting_money,cash:r.starting_money}),o.initGameListener()}else r.password===a?console.log("game not being hosted yet"):"connection"===r.phase?console.log("incorrect password"):console.log("game does not exist")}else console.log("room "+t+" does not exist")}))}},{key:"render",value:function(){var e=this,t=this.state,a=(t.game,t.phase),n=t.password,r=t.nickname,s=(t.playerKey,t.questionNum),c=t.gameId;t.recentGameId,t.recentGame,t.isRedirected,t.gametype;return console.log(s),"not-joined"===a?o.a.createElement("div",{className:"page-container play-page"},o.a.createElement("div",null,o.a.createElement(P.a,null,o.a.createElement(C.a,{label:"Nickname",name:"nickname",value:r,onChange:this.handleChange("nickname")})),o.a.createElement(P.a,null,o.a.createElement(C.a,{label:"Game PIN",name:"Game ID",value:c,onChange:this.handleChange("gameId")})),o.a.createElement(P.a,null,o.a.createElement(C.a,{label:"Password",type:"password",name:"password",value:n,onChange:this.handleChange("password")})),o.a.createElement(N.a,{onClick:function(){return e.joinGame()},variant:"contained"},"Join"))):"connection"===a?o.a.createElement("div",null,o.a.createElement("p",null," Connected. Please wait for host to start game. ")):"question"===a?o.a.createElement("div",null,o.a.createElement("span",null,"Current question: ")," ",o.a.createElement("span",{className:"dynamic-text"},s),o.a.createElement("p",null," (question info will be displayed here) "),o.a.createElement("button",null," Buy "),o.a.createElement("button",null," Sell "),o.a.createElement("button",null," Hold ")):void 0}}]),a}(n.Component)),D=Object(n.createContext)({user:null}),R=(n.Component,function(e){Object(l.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(c.a)(this,a),(n=t.call(this,e)).state={},n}return Object(i.a)(a,[{key:"render",value:function(){return o.a.createElement(n.Fragment,null,o.a.createElement(m.a,null,o.a.createElement("title",null," toohak stonks quizzes ")),o.a.createElement("div",{id:"home"},o.a.createElement("section",null,o.a.createElement("div",null),o.a.createElement("h1",null,"toohak app"),o.a.createElement("div",{className:"play-button-container"},o.a.createElement("ul",null,o.a.createElement("li",null,o.a.createElement(d.b,{to:"/play"},"Play")))),o.a.createElement("div",{className:"host-button-container"},o.a.createElement("p",null,o.a.createElement(d.b,{to:"/host"},"Host a room"))),o.a.createElement("div",{className:"create-button-container"},o.a.createElement("p",null,o.a.createElement(d.b,{to:"/create"},"Create a room"))),o.a.createElement("div",{className:"auth-container"},o.a.createElement(d.b,{to:"/auth/signIn"},"Login"),o.a.createElement(d.b,{to:"/auth/signUp"},"Signup")))))}}]),a}(n.Component)),U=function(e){Object(l.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(c.a)(this,a),(n=t.call(this,e)).state={},n}return Object(i.a)(a,[{key:"render",value:function(){return o.a.createElement(d.a,null,o.a.createElement("div",{className:"App"},o.a.createElement("div",{id:"content"},o.a.createElement(p.a,{exact:!0,path:"/play",render:function(){return o.a.createElement(M,null)}}),o.a.createElement(p.a,{exact:!0,path:"/host",render:function(){return o.a.createElement(q,null)}}),o.a.createElement(p.a,{exact:!0,path:"/create",render:function(){return o.a.createElement(x,null)}}),o.a.createElement(p.a,{exact:!0,path:"/",render:function(){return o.a.createElement(R,null)}}))))}}]),a}(n.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(o.a.createElement(o.a.StrictMode,null,o.a.createElement(U,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[71,1,2]]]);
//# sourceMappingURL=main.be89451c.chunk.js.map