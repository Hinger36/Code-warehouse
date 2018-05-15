/*事件绑定*/
function addEvent(ele, event, handle) {
	if (ele.addEventListener) {
		ele.addEventListener(event, handle, false);
	} else if (ele.attachEvent) {
		ele.attachEvent('on' + event, function () {
			handle.call(this);
		})	
	} else {
		ele['on' + event] = handle;
	}
}

/*原生ajax封装*/
var my = {
	createXHR: function () {
		if (window.XMLHttpRequest) {
			//IE7+、Firefox、Opera、Chrome 和Safari  
			return new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			//IE6 及以下
			return new ActiveXObject('Microsoft.XMLHTTP');
		} else {
			throw new Error('浏览器不支持XHR对象！');
		}
	},

	ajax: function (obj) {
		if (obj.dataType === 'json') {
			var xhr = this.createXHR();
			//通过使用JS随机字符串解决IE浏览器第二次默认获取缓存的问题 
			obj.url = obj.url + '?rand=' + Math.random();
			//通过params()将名值对转换成字符串
			obj.data = this.formatParams(obj.data);

			if (obj.type === 'get') {
				obj.url += obj.url.indexOf('?') == -1 ? '?' + obj.data: '&' + obj.data;
			}
			if(obj.async === true) {
				//使用异步调用的时候，需要触发readystatechange 事件  
				xhr.onreadystatechange = function () {
					/**
					 * 0: 请求未初始化
					 * 1: 服务器连接已建立
					 * 2: 请求已接收
					 * 3: 请求处理中
					 * 4: 请求已完成，且响应已就绪
					 */
					if (obj.readyState === 4) {
						callback();
					}
				};
			}
			//在使用XHR对象时，必须先调用open()方法，  
            //它接受三个参数：请求类型(get、post)、请求的URL和表示是否异步。
            xhr.open(obj.type, obj.url, obj.async);
            if (obj.type === 'post') {
            	//post方式需要自己设置http的请求头，来模仿表单提交。  
                //放在open方法之后，send方法之前。
                xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
                //post方式将数据放在send()方法里
                xhr.send(obj.data);
            } else {
            	//get方式则填null  
            	xhr.send(null);
            }
            if (obj.async === false) {
            	callback();
            }

            var callback = function () {
            	if(xhr.status === 200) {
            		obj.success(xhr.responseText);
            	} else {
            		alert('获取数据错误！错误代号：' + xhr.status + '，错误信息：' + xhr.statusText);
            	}
            };
		} else if (obj.dataType === 'jsonp') {
			var Head = document.getElementsByTagName('head')[0];
			var Script = document.createElement('script');
			var callbackName = 'callback' + +new Date();
			var params = this.formatParams(obj.data) + '&callback=' + callbackName;     //按时间戳拼接字符串

			//拼接好src  
            oScript.src = obj.url.split("?") + '?' + params;  
            //插入script标签  
            oHead.insertBefore(oScript, oHead.firstChild);  
            //jsonp的回调函数  
            window[callbackName] = function(json){  
                var callback = obj.success;  
                callback(json);  
                oHead.removeChild(oScript); 
            };   
		}
	},
	formatParams : function(data){  
        var arr = [];  
        for(var i in data){  
            //特殊字符传参产生的问题可以使用encodeURIComponent()进行编码处理  
            arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));  
        }  
        return arr.join('&');  
    }  
};

// //调用时的用法：
// my.ajax({  
//     type : 'get',  
//     url : '',  
//     data : {  
//         jian : '',  
//         zhi : '',  
//         dui : ''  
//     },  
//     dataType : 'json/jsonp',  
//     async : 'true/false',  
//     success : function(data){  
//         //.......  
//     }  
// });  
// 
// 
//浅度克隆
const shallowClone = function (obj) {
	let result = {};
	for (let key in obj) {
		result[key] = obj[key]
	}
	return result; 
}

//深度克隆
//1.利用JSON进行序列化和反序列化就能产生深度克隆的效果
//缺点：
// 1、无法实现对函数、RegExp的特殊对象的克隆
// 2、会抛弃对象的constructor，所有的构造函数都会指向Object
// 3、对象有循环引用会报错
const strClone = function(obj = undefined){
    return JSON.parse(JSON.stringify(obj));
};

/*
 * 深克隆
 *
 * @method
 *
 * @for none
 *
 * @param {*} [v = undefined] 需要被赋值的变量
 *
 * @return {*} 已经复制完成的变量
 */
const deepCloneAll = function (parent) {

    let parents = [];
    let children = [];

    const _type = function (v) {
        if(typeof v === 'function'){
            return 7;
        }
        if(!v || typeof v !== 'object'){
            return 0;
        }
        if(Object.prototype.toString.call(v) === '[object Object]'){
            return 1;
        }
        if(Object.prototype.toString.call(v) === '[object Array]') {
            return 2;
        }
        if(Object.prototype.toString.call(v) === '[object Date]'){
            return 3;
        }
        if(Object.prototype.toString.call(v) === '[object Promise]'){
            return 4;
        }
        if(Object.prototype.toString.call(v) === '[object RegExp]') {
            return 5;
        }
        if(Object.prototype.toString.call(v) === '[object Map]'
            || Object.prototype.toString.call(v) === '[object Set]') {
            return 6;
        }
    };
    const _clone = function (parent) {
        let type = _type(parent);

        let child;
        let proto;

        switch (type) {
            case 0:
                return parent;
            case 1:
                child = new v.__proto__.constructor();
                let keys;
                keys = Object.keys(parent);
                for(let i = 0, len = keys.length; i < len; i++){
                    child[keys[i]] = deepClone(parent[keys[i]]);
                }
                break;
            case 2:
                child = [];
                break;
            case 3:
                child = new Date(parent.getTime());
                break;
            case 4:
                child = parent;
                break;
            case 5:
                child = RegExp(parent.source, parent.multiline? 'm' : parent.ignoreCase ? 'i' : parent.global ? 'g' : '');
                break;
            case 6:
                child = new Set(parent);
                break;
            case 7:
                child = eval(parent,toString());
                break;
            default:
                proto = Object.getPrototypeOf(parent);
                child = Object.create(proto);
        }

        const index = parents.indexOf(parent)

        if(index !== -1){
            return children[index];
        }
        parents.push(parent);
        children.push(child);

        for(let i in parent){
            child[i] = _clone(parent[i]);
        }
        return child;
    };

    return _clone(parent);
};