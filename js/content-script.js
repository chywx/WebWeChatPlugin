//console.log('这是content script!');
WebQ = {
	QueryString : function(val) {
		var uri = window.location.search;
		var re = new RegExp("" +val+ "=([^\&\?]*)", "ig");
		return ((uri.match(re))?(uri.match(re)[0].substr(val.length+1)):null); 
	}
};
const baseurl = "https://wxs.xinghengedu.com";
var questions = new Map();
function getDeviceID() {
    return "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
};
function getSkey(){
	let src = $(".main .avatar img").prop("src");
	return src.substring(src.indexOf("skey=")+5)
};
function getUserName(){
	let src = $(".main .avatar img").prop("src");
	return src.substring(src.indexOf("username=")+9,src.indexOf("&skey="));
};
function getToUserName(){
	return $(".chat_list .active").data("username");
};
function sendAjaxMsg(fromusername,tousername,msg){
//	console.log(WebQ.QueryString("uin"));
	$.ajax({
		url: '/cgi-bin/mmwebwx-bin/webwxsendmsg?lang=zh_CN',
		type: 'POST',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify({
				"BaseRequest":{
					"Uin":$.cookie("wxuin"),
					"Sid":$.cookie("wxsid"),
					"Skey":getSkey(),
					"DeviceID":getDeviceID()
				},
				"Msg":{
					"Type":1,
					"Content":msg,
					"FromUserName":fromusername,
					"ToUserName":tousername
				},
				"Scene":0
			}),
		success: function(d) {
			if(d.BaseResponse.Ret != "0"){
				tip(d.BaseResponse.Ret + "您需要退出微信,关闭所有浏览器，重新登陆！");
			}
		  //console.log(d);
		},
		complete: function(){
			console.log('complete');
		}
	});
};




function anylseQuestion(){
	let esusername = WebQ.QueryString("uin");
	if(esusername == null || esusername == ''){
		esusername = '397bcafe8a88afb8a40b705b524dd235';
	}
	let groupname = $("#chatArea .title_name").text();
	let personcount = $("#chatArea .title_count").text();
	personcount = (personcount || '').replace("(","").replace(")","");
	personcount = (personcount || '0');
	$.post(baseurl + "/xing/replaceInto.do?productType="+$("#zhuanye").val()
				+"&esusername="+esusername
				+"&groupname="+groupname
				+"&personcount="+personcount
				+"&nickname="+$(".header .nickname").text().trim()
				,function(data){
					console.log(data);
				});
	let waitFati = function(dtd){
		let zhuanye = $("#zhuanye").val(), jiange = $("#fatijiange").val(), shuliang = Number($("#fatishuliang").val())+1;
//		console.log(zhuanye);
		let i = 0,username = $(".chat_list .active .info .nickname").text().trim();
		let fromusername = getUserName(),tousername = getToUserName();
		let list = questions.get(zhuanye);
		console.log("list",list);
// 　　　　let tasks = function(){
// 			let question = list[i++];
// 			console.log(i,question);
// 			let msg = username+"已发送"+(i)+"道题" + question.ProductType;
// 			let commTestSubject = (question.CommonTestSubject || '').replace('none','');
// 			let sendMsg = (commTestSubject.trim() == ''?'':commTestSubject.trim()+'\n') + question.TestSubject 
// 						+ '\nA : ' + question.AnswerA
// 						+ '\nB : ' + question.AnswerB
// 						+ '\nC : ' + question.AnswerC
// 						+ '\nD : ' + question.AnswerD
// 						+ '\nE : ' + question.AnswerE ;
// 			let sendAns = "正确答案:" + question.QuestionAnswer  ;
// 			if((question.Analysis.trim() || '') != ''){
// 				sendAns = sendAns + "\n解析:" + question.Analysis.trim();
// 			}
// 			sendAjaxMsg(fromusername,tousername,sendMsg);
				
// 			setTimeout(function(){
// 					sendAjaxMsg(fromusername,tousername,sendAns);
// 				},jiange*900);
// 			tip(msg);
// 			if(i>=shuliang){
// 				dtd.resolve(); // 改变Deferred对象的执行状态
// 			}else{
// 				setTimeout(tasks,jiange*1000);
// 			}
			
// 　　　　};

		let tasks = function(){	
			let question = list[i++];
			console.log(i,question,shuliang);
			let msg = username+"已发送"+(i)+"道题" + question.ProductType;
			let commTestSubject = (question.CommonTestSubject || '').replace('none','');
			let sendMsg = (commTestSubject.trim() == ''?'':commTestSubject.trim()+'\n') + question.TestSubject 
						+ '\nA : ' + question.AnswerA
						+ '\nB : ' + question.AnswerB
						+ '\nC : ' + question.AnswerC
						+ '\nD : ' + question.AnswerD;
			if(question.AnswerE){
				sendMsg += '\nE : ' + question.AnswerE;
			}	
			let sendAns = "正确答案:";
			if(i >= 2){
				let question2 = list[(i - 2)];
				sendAns = sendAns + question2.QuestionAnswer;
				if((question2.Analysis.trim() || '') != ''){
					sendAns = sendAns + "\n解析:" + question2.Analysis.trim();
				}
			}
			if(i == 1){
				sendAjaxMsg(fromusername,tousername,sendMsg);
			}else if(i>=shuliang){
				sendAjaxMsg(fromusername,tousername,sendAns);
			}else{
				sendAjaxMsg(fromusername,tousername,sendAns+'\n\n'+sendMsg);
			}
			tip(msg);
			if(i>=shuliang){
				dtd.resolve(); // 改变Deferred对象的执行状态
			}else{
				setTimeout(tasks,jiange*1000);
			}
　　　　};

　　　　setTimeout(tasks,3000);
　　　　return dtd.promise();
	};
	$.Deferred(waitFati)
		.done(function(){ tip("发题结束了"); })
		.fail(function(){ alert("出错啦！"); });
};


$(function(){
	
	// chy
	//$(".ng-scope div .ng-scope").click(function(e){
	$(document).on("click.nickname","[ng-repeat='chatContact in chatList track by chatContact.UserName']",function(){
		console.log("group",$("#chatArea .title_name").text());
		let groupVal  = $("#chatArea .title_name").text();
		let esusername = WebQ.QueryString("uin");
		if(esusername == null || esusername == ''){
			esusername = '397bcafe8a88afb8a40b705b524dd235';
		}
		//console.log("cookie值：",$.cookie("mm_lang"),$.cookie("5411a124b0dee3b08bde02ae3142d289_五狗待拯救好青年"));
		let recordCookieVal = $.cookie(esusername+"_"+groupVal);
		console.log("recordCookieVal",recordCookieVal,recordCookieVal != null);
		if(recordCookieVal != null){
			var recordArr = recordCookieVal.split("_");
			$("#zhuanye").val(recordArr[0]);
			$("#fatijiange").val(recordArr[2]);
			$("#fatishuliang").val(recordArr[3]);
			$("#tixing").val(recordArr[4]);
		}else{
			$("#zhuanye").val("");
			$("#fatijiange").val();
			$("#fatishuliang").val();
			$("#tixing").val(1);
		}

	})
	

	let esusername = WebQ.QueryString("uin");
	if(esusername == null || esusername == ''){
		esusername = '397bcafe8a88afb8a40b705b524dd235';
	}
	console.log("esusername",esusername);
	if((esusername || '')!=''){
		$("body").append(`<div class="chooseitem"><p>请合理设置发题间隔</p><p>过于频繁容易被微信封号!</p>
					专业选择:<select id="zhuanye"><option value="">-请选择-</option>
					<option value="ZHIYEYISHI">临床执业</option>
					<option value="ZHULIYISHI">临床助理</option>
					<option value="XIYAO">执业西药师</option>
					<option value="ZHONGYAOSHI">执业中药师</option>
					<option value="ZHONGYIZHIYE">中医执业</option>
					<option value="ZHONGYIZHULI">中医助理</option>
					<option value="ZHONGXIYIZHIYE">中西医执业</option>
					<option value="ZHONGXIYIZHULI">中西医助理</option>
					<option value="HUSHILOW">护士执业</option>
					<option value="HUSHIHIGH">初级护师</option>
					<option value="ZHUGUANHUSHI">主管护师</option>
					<option value="KOUQIANGZHIYE">口腔执业</option>
					<option value="KOUQIANGZHULI">口腔助理</option>
					<option value="XIANGCUNQUANKEYISHI">乡村全科医师</option>
					<option value="YIJIRENLIZIYUAN">一级人力资源</option>
					<option value="ERJIRENLIZIYUAN">人力资源管理师二级</option>
					<option value="SANJIRENLIZIYUAN">三级人力资源管理师</option>
					<option value="SIJIRENLIZIYUAN">四级人力资源</option>
					</select><br/>
					<input type="checkbox" name="questionType" value='历年真题'>历年真题<br/>
					<div class="ysfk hide">
					<input name="xyfk" type="checkbox" value='1'>药1
					<input name="xyfk"  type="checkbox" value='2'>药2
					<input name="xyfk"  type="checkbox" value='3'>药综
					<input name="xyfk"  type="checkbox" value='4'>法规
					</div>
					发题间隔:<input type="number" name="fatijiange" id="fatijiange" value="60"/>秒<br/>
					发题数量:<input type="number" name="fatishuliang" id="fatishuliang" value="30"/>道<br/>
					桌面提醒:<select id="tixing"><option value="1">是</option>
					<option value="2">否</option>
					</select><br/>
					<center><button class="btn btn_send btn-kaishifati" href="javascript:;" >开始发题</button></center>
					</div>`);
		
	}


	$(document).on("change.zhuanye","#zhuanye",function(){
		if($(this).val()!='XIYAO' && $(this).val()!='ZHONGYAOSHI'){
			$(".ysfk").removeClass("hide").addClass("hide");
			$('input[name="xyfk"]:checked').prop("checked",false);
		}else{
			$(".ysfk").removeClass("hide");
		}
	});

	$(document).on("click.kaishifati",".btn-kaishifati",function(){
		let ysfk = '';
		$('input[name="xyfk"]:checked').each(function() {
			if($(this).val()!="")ysfk += $(this).val()+",";
		});	

		let questionType = "";
		$("input[name='questionType']:checked").each(function(){
			if($(this).val()!='')questionType += $(this).val()+",";
		});

		if($("#zhuanye").val() == ""){
			tip("请选择专业!");
			return false;
		}
		if($("#fatijiange").val() == "" || $("#fatijiange").val() <=10){
			tip("时间间隔必须大于10秒!");
			return false;
		}
		if($("#fatishuliang").val() == "" || $("#fatishuliang").val() <=0 || $("#fatishuliang").val() >180){
			tip("发题数量不能小于1道,且不能大于180道!");
			return false;
		}
		$("#editArea").text("正在准备数据。。。");
		let zhuanye = $("#zhuanye").val();
//		if(questions.has(zhuanye)){
//			//console.log(questions.get(zhuanye));
//			anylseQuestion();
//		}else{
			let username = getUserName(),nickname = $(".header .nickname").text().trim();
			let esusername = WebQ.QueryString("uin");
			if(esusername == null || esusername == ''){
				esusername = '397bcafe8a88afb8a40b705b524dd235';
			}
			if(nickname == ''){
				tip("请先登陆微信!");
				return false;
			}
			
			$.get(baseurl + "/xing/fenggeQuery.do?productType="+zhuanye+"&ysfk="+ysfk+"&questionType="+questionType+"&esusername="+esusername+"&username="+$.cookie("wxuin")+"&nickname="+nickname+"&time="+(new Date().getTime()),function(data){
				if(data.code=="200"){
					questions.set(zhuanye,data.data);

					// chy发送成功之后进行cookie记录操作
					let groupname = $("#chatArea .title_name").text();
					let fatijiange = $("#fatijiange").val();
					let fatishuliang = $("#fatishuliang").val();
					let tixing = $("#tixing").val();
					$.cookie(esusername+"_"+groupname,zhuanye+"_"+questionType+"_"+fatijiange+"_"+fatishuliang+"_"+tixing,{expires: 365 });
					
					anylseQuestion();
				}else{
					if(data.code=="204"){
						tip("系统检测到您未从星恒教育客户管理系统登陆,请从正确的入口打开重试!");
					}else{
						tip("数据准备失败!");
					}
				}
			});
			
//		}
		tip("开始发题");
	});
	
});

// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function()
{
	// 注入自定义JS
	injectCustomJs();
	injectCustomJs("js/jquery.cookie.js");
	//injectCustomJs("js/ajaxhook.js");

});

// 向页面注入JS
function injectCustomJs(jsPath)
{
	jsPath = jsPath || 'js/inject.js';
	var temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function()
	{
		// 放在页面不好看，执行完后移除掉
		this.parentNode.removeChild(this);
	};
	document.body.appendChild(temp);
}

// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log('收到来自 ' + (sender.tab ? "content-script(" + sender.tab.url + ")" : "popup或者background") + ' 的消息：', request);
	if(request.cmd == 'update_font_size') {
		var ele = document.createElement('style');
		ele.innerHTML = `* {font-size: ${request.size}px !important;}`;
		document.head.appendChild(ele);
	}
	else {
		tip(JSON.stringify(request));
		sendResponse('我收到你的消息了：'+JSON.stringify(request));
	}
});

// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行sendMessageToBackground()
function sendMessageToBackground(message) {
	chrome.runtime.sendMessage({greeting: message || ''}, function(response) {
		//tip('收到来自后台的回复：' + response);
	});
}

function checkNotification(msg) {
	if(!("Notification" in window)) {
	}
	// check whether notification permissions have alredy been granted
	else if(Notification.permission === "granted") {
		// If it's okay let's create a notification
		new Notification('星恒教育', {
                body: msg,
                icon: $(".main .avatar img").prop("src")
            });
	}
	// Otherwise, ask the user for permission
	else if(Notification.permission !== 'denied') {
		Notification.requestPermission(function(permission) {
			// If the user accepts, let's create a notification
			if(permission === "granted") {
				new Notification('星恒教育', {
	                body: msg,
	                icon: $(".main .avatar img").prop("src")
	            });
			}
		});
	}

}

// 监听长连接
/*chrome.runtime.onConnect.addListener(function(port) {
	console.log(port);
	if(port.name == 'test-connect') {
		port.onMessage.addListener(function(msg) {
			console.log('收到长连接消息：', msg);
			tip('收到长连接消息：' + JSON.stringify(msg));
			if(msg.question == '你是谁啊？') port.postMessage({answer: '我是你爸！'});
		});
	}
});*/

window.addEventListener("message", function(e)
{
	console.log('收到消息：', e.data);
	if(e.data && e.data.cmd == 'invoke') {
		eval('('+e.data.code+')');
	}
	else if(e.data && e.data.cmd == 'message') {
		tip(e.data.data);
	}
}, false);


function initCustomEventListen() {
	var hiddenDiv = document.getElementById('myCustomEventDiv');
	if(!hiddenDiv) {
		hiddenDiv = document.createElement('div');
		hiddenDiv.style.display = 'none';
		hiddenDiv.id = 'myCustomEventDiv';
		document.body.appendChild(hiddenDiv);
	}
	hiddenDiv.addEventListener('myCustomEvent', function() {
		var eventData = document.getElementById('myCustomEventDiv').innerText;
		tip('收到自定义事件：' + eventData);
	});
}

var tipCount = 0;
// 简单的消息通知
function tip(info) {
	info = info || '';
	if($("#tixing").val()!='2'){
		checkNotification(info);
	}
	var ele = document.createElement('div');
	ele.className = 'chrome-plugin-simple-tip slideInLeft';
	ele.style.top = tipCount * 70 + 20 + 'px';
	ele.innerHTML = `<div>${info}</div>`;
	document.body.appendChild(ele);
	ele.classList.add('animated');
	tipCount++;
	setTimeout(() => {
		ele.style.top = '-100px';
		setTimeout(() => {
			ele.remove();
			tipCount--;
		}, 400);
	}, 3000);
}


/* 
function sendAjaxMsgQueue(fromusername,tousername,msg,delay){
//	console.log("ssss");
	console.log(tousername+":"+msg);
	
};

function anylseQuestionQueue(){
	let waitFati = function(dtd){
		let zhuanye = $("#zhuanye").val(), jiange = $("#fatijiange").val(), shuliang = $("#fatishuliang").val();
		let i = 1,username = $(".chat_list .active .info .nickname").text().trim();
		let fromusername = getUserName(),tousername = getToUserName();
		let list = questions.get(zhuanye);
		let question = null;
		while(true){
			let index = Math.round(Math.random()*100);
			question = list[index];
			if((question.QuestionAnswer.trim() || '') != ''){
				break;
			}
		}
		let commTestSubject = (question.CommonTestSubject || '').replace('none','');
		let sendMsg = (commTestSubject.trim() == ''?'':commTestSubject.trim()+'\n') + question.TestSubject 
					+ '\nA : ' + question.AnswerA
					+ '\nB : ' + question.AnswerB
					+ '\nC : ' + question.AnswerC
					+ '\nD : ' + question.AnswerD
					+ '\nE : ' + question.AnswerE ;
		let sendAns = "正确答案:" + question.QuestionAnswer  ;
		if((question.Analysis.trim() || '') != ''){
			sendAns = sendAns + "\n解析:" + question.Analysis.trim();
		}
　　		let tasksQues = function(){
			let msg = username+"已发送"+(i++)+"道题";
			let sfromusername = fromusername,stousername = tousername;
			sendAjaxMsgQueue(sfromusername,stousername,sendMsg,jiange*1000);
			console.log("lengthQues:"+$('body').queue('myqueue').length);
			$(this).dequeue('myqueue');
			tip(msg);
			
　　　　};
　　		let tasksAns = function(){
			sendAjaxMsgQueue(fromusername,tousername,sendAns,jiange*900);
			console.log("lengthAns:"+$('body').queue('myqueue').length);
			$(this).dequeue('myqueue');
			if(i>shuliang){
				dtd.resolve(); // 改变Deferred对象的执行状态
			}else{
			}
			
　　　　};
		$('body').delay(jiange*1000,'myqueue').queue('myqueue',tasksQues).delay(jiange*900,'myqueue').queue('myqueue',tasksAns);
		$('body').delay(jiange*1000,'myqueue').queue('myqueue',tasksQues).delay(jiange*900,'myqueue').queue('myqueue',tasksAns);
		console.log("length:"+$('body').queue('myqueue').length);
		$('body').dequeue('myqueue');
//　　　　setTimeout(tasks,3000);
　　　　return dtd.promise();
	};
	$.Deferred(waitFati)
		.done(function(){ alert("发题结束了"); })
		.fail(function(){ alert("出错啦！"); });
};*/