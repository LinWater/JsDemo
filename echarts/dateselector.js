var Class = {
    create: function() {
        return function() {
            this.initialize.apply(this, arguments);
        }
    }
}
var extend = function(destination, source) {
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
}
//********************************************
var Jcalendar =  Class.create();
Jcalendar.prototype = {
    initialize:function(options){
        this.setOptions(options);
        var $ = new Date();
        this.drawCalendar($.getFullYear(),$.getMonth() + 1,$.getDate());
    },
    setOptions: function(options) {
        this.options = {//默认属性集中写在这里。
            id:'jcalendar_'+ new Date().getTime(),
            text_id:null,//用于输入日期的文本域的ID
            parent_id:null//指定父节点
        };
        extend(this.options, options || {});
    },
    fillArray : function(year,month){
        var f = new Date(year, month -1  ,1).getDay(), //求出当月的第一天是星期几
        dates = new Date(year, month , 0).getDate(),//上个月的第零天就是今个月的最后一天
        arr = new Array(42);//用来装载日期的数组，日期以‘xxxx-xx-xx’的形式表示
        for(var i = 0; i < dates ; i ++ ,f ++){
            arr[f] = year +'-'+ month +'-'+ (i+1) ;
        }
        return arr;
    },
    addToDom:function(calendar){
        var parent = document.getElementById(this.options.parent_id) ||document.getElementsByTagName('body')[0];
        parent.insertBefore(calendar,null);
    },
    drawCalendar : function(year,month,date){
        var $ = document,$$ = 'createElement',calendar = this.getHandle(),
        weeks = "日一二三四五六".split(''),//日历第二行的内容，显示星期几
        a =  $[$$]('a'),//日历的a元素，用于克隆
        tt =  $[$$]("tt"),//日历页眉的tt元素，用于克隆
        thead = $[$$]('span'),//日历页眉
        fragment = $.createDocumentFragment(),//减少DOM刷新页面的次数
        arr = this.fillArray(year,month),//保存当月的日期
        tts = [],//用于保存tt元素的引用
        text_id  = this.options.text_id,//用于输入日期的文本域的ID
        ths = this;//用于保存Jcalendar对象的实例的引用
        if(calendar) {
            calendar.innerHTML = '';
        }else{
            calendar = $[$$]('div');//日历的容器元素
            this.addToDom(calendar);//把日历加入DOM树中
            calendar.setAttribute('id', this.getId());//设置ID
        }
        for(var i = 0;i<4;i++){//循环生成出个时间按钮。
            var clone = tt.cloneNode(true);//比重新createElement快
            clone.onclick =  (function(index){
                return function(){//在闭包里绑定事件
                    ths.redrawCalendar(year,month,date,index)
                }
            })(i);
            tts[i] = clone;//保存引用
            if(i==2) thead.appendChild($.createTextNode(year+"年"+month+"月"+date+"日"));
            thead.appendChild(clone);
        }
        tts[0].innerHTML = '&lt;&lt;';
        tts[1].innerHTML = '&nbsp;&nbsp;&lt;';
        tts[2].innerHTML = '&gt;&nbsp;&nbsp;';
        tts[3].innerHTML = '&gt;&gt;';
        fragment.appendChild(thead);
        for(i = 0;i <7;i++){
            var th = a.cloneNode(true);
            th.innerHTML = weeks[i];
            th.className = 'week';
            fragment.appendChild(th);
        }
        for(i = 0;i <42;i++){
            var td = a.cloneNode(true);
            if(arr[i] == undefined ){
                fragment.appendChild(td);
            }else{
                var html = arr[i].split('-')[2];
                td.innerHTML = html;
                td.className = 'day';
                td.href = "javascript:void(0)";//为ie6准备的
                (date && html == date)&&(td.className += ' current') ;
                (i%7 == 0 || i%7 == 6)&&(td.className += ' weekend') ;
                td.onclick = (function(i){
                    return function(){
                        text_id &&($.getElementById(text_id).value = i);
                        calendar.style.display = 'none';
                        if(/msie|MSIE 6/.test(navigator.userAgent)){
                            var mask = document.getElementById("calendar_mask");
                            mask.parentNode.removeChild(mask);
                        }
                    }
                })(arr[i]);
                fragment.appendChild(td);
            }
        }
        calendar.appendChild(fragment);
    },
    getId:function(){//返回id
        return this.options.id;
    },
    getHandle:function(){//返回其容器，用于重设样式（显示或隐藏，定位等等）
        return document.getElementById(this.getId());
    },
    listenTo:function(id){//对文本域进行监听
        id = id || this.options.text_id;
        if(id && document.getElementById(id)){
            var calendar = this.getHandle(),
            textfield = document.getElementById(id)
            calendar.style.display = 'none';
            textfield.onfocus = function(){
                textfield.style.position = 'relative';
                var l = textfield.offsetLeft + 'px',
                t = (textfield.clientHeight + textfield.offsetTop)+ 'px';
                if(/msie|MSIE 6/.test(navigator.userAgent)){
                    var iframe = document.createElement("<iframe id='calendar_mask' style='left:"+l
                        +";width:300px;filter:mask();position:absolute;"+";top:"+t
                        +"height:160px;z-index:1;'></iframe>");//z-index不能为负数
                    textfield.parentNode.insertBefore(iframe,textfield);
                }
                with(calendar.style){
                    position="absolute";
                    display = 'block';
                    zIndex = 100;
                    left = l;
                    top = t;
                    }
            };
        }
    },
    redrawCalendar : function(year,month,date,index){
        switch(index){
            case 0 ://preyear
                year--;
                break;
            case 1://premonth
                month--;
                (month < 1) &&(year--,month = 12)  ;
                break;
            case 2://nextmonth
                month++;
                (month > 12)&&(year++,month = 1) ;
                break;
            case 3://nextyear
                year++;
                break;
        }
        this.drawCalendar(year,month,date);
    }
}
 
window.onload = function(){
    new Jcalendar({
        id:'jcalendar',
        text_id:'datepicker'
    }).listenTo();
};