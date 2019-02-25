chrome.runtime.onInstalled.addListener(function(){
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    // 只有打开wx才显示pageAction
                    new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'qq.com'}})
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});


chrome.commands.onCommand.addListener(function(command) {

	if('toggle-tags'==command){
		    alert(command);
		alert($("#editArea").text());
	}
    console.log(command);
})



// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log('收到来自content-script的消息：');
	console.log(request, sender, sendResponse);
	sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
});

/*$('#test_cors').click((e) => {
	$.get('https://www.baidu.com', function(html){
		console.log( html);
		alert('跨域调用成功！');
	});
});
*/
/*$(".btn-fati").click((e) => {
	$.get("https://wxs.xinghengedu.com/xing/fenggeQuery.do?productType=ZHIYEYISHI",function(data){
		console.log(data);
	});
});*/
	

/*$('#get_popup_title').click(e => {
	var views = chrome.extension.getViews({type:'popup'});
	if(views.length > 0) {
		alert(views[0].document.title);
	} else {
		alert('popup未打开！');
	}
});*/

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 当前标签打开某个链接
function openUrlCurrentTab(url)
{
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: url});
	})
}

// 新标签打开某个链接
function openUrlNewTab(url)
{
	chrome.tabs.create({url: url});
}

// 预留一个方法给popup调用
function testBackground() {
	alert('你好，我是background！');

}

// 是否显示图片
var showImage;
chrome.storage.sync.get({showImage: true}, function(items) {
	showImage = items.showImage;
});
