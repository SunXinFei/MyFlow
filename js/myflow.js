(function (w) {
  var Class = function (parent) {
    var _class = function () {
      this.init.apply(this, arguments);
    };

    if (parent) {
      var subClass = function () { };
      subClass.prototype = parent.prototype;
      _class.prototype = new subClass();
    }
    _class.prototype.init = function () { };

    _class.fn = _class.prototype;
    _class.fn.parent = _class;
    _class._super = _class.__proto__;

    _class.proxy = function (func) {
      var self = this;
      var _arguments = [];

      for (var i = 1; i < arguments.length; i++) {
        _arguments.push(arguments[i]);
      }

      return (function () {
        if (_arguments.length <= 0) {
          _arguments = arguments;
        }
        return func.apply(self, _arguments);
      });
    };

    _class.fn.proxy = _class.proxy;

    _class.extend = function (obj) {
      var extended = obj.extended;
      for (var i in obj) {
        _class[i] = obj[i];
      }

      if (extended) {
        extended(_class);
      }
    };

    _class.include = function (obj) {
      var included = obj.included;
      for (var i in obj) {
        _class.fn[i] = obj[i];
      }

      if (included) {
        included(_class);
      }
    };

    return _class;
  };

  w.Class = Class;
}(window));

let MyFlow = {
  lrMargin: 20//流程图最外层容器的左右margin值;
};
MyFlow.myFlowObj = {};

MyFlow.Constant = {
  exceptID: ['flowadviser', 'flowheadtitle'], //排除poptip的的DOMID
  property: {
    scaleRuleObj: { widthScale: 1, heightScale: 1 },//缩放比例
    width: window.innerWidth - MyFlow.lrMargin, //流程图的容器宽度
    height: window.innerHeight - MyFlow.lrMargin, //流程图的容器高度
    headLabel: true,
    toolBtns: ['littlerect lrect', 'conectnode lcircle'],
    // toolBtns: ["start round", "end round", "task round", "node", "chat", "state", "plug", "join", "fork", "complex mix"],
    haveHead: location.hash === '#edit' ? true : false, //是否有编辑器head
    // headBtns: ["new", "open", "save", "undo", "redo", "reload"], //如果haveHead=true，则定义HEAD区的按钮
    headBtns: ["save", "undo", "redo", 'moveleft', 'moveup', 'moveright', 'movedown'], //如果haveHead=true，则定义HEAD区的按钮
    haveTool: location.hash === '#edit' ? true : false,//是否需要左边的工具栏，这决定了渲染完成后是编辑模式还是只读模式
    haveGroup: true,
    useOperStack: true, //是否编辑态有压栈弹栈
    haveMemo: true, //是否有节点连线编辑与便笺编辑两种工作区状态的切换开关。即是否有展示或编辑便笺的功能。
    colors: {
      mark: '#000',
      line: '#000'
    },
    headBtnEvents: {
      save: () => { myFlow.export() },
    }
  },
  remark: {
    cursor: "选择指针",
    mutiselect: "绘制节点",
    direct: "结点连线",
    littlerect: '小方形',
    conectnode: '连接中间节点',
    group: "泳道"
  }
};

MyFlow.Action = {

};

MyFlow.Global = {

};

MyFlow.DataProvider = {

};

MyFlow.CustomEvent = {

};

MyFlow.Helper = {

};

MyFlow.util = {
  setNewScaleRule: function (changeScale) {//重新设置流程图的放缩比例
    let tmpW;
    let tmpH;
    if (changeScale === 'small') {
      tmpW = Number((MyFlow.Constant.property.scaleRuleObj.widthScale - 0.1).toFixed(1));
      tmpH = Number((MyFlow.Constant.property.scaleRuleObj.heightScale - 0.1).toFixed(1));
      if (tmpW < 0.3 || tmpH < 0.3) {
        return;
      }
    } else {
      tmpW = Number((MyFlow.Constant.property.scaleRuleObj.widthScale + 0.1).toFixed(1));
      tmpH = Number((MyFlow.Constant.property.scaleRuleObj.heightScale + 0.1).toFixed(1));
      if (tmpW > 2 || tmpH > 2) {
        return;
      }
    }
    MyFlow.Constant.property.scaleRuleObj = { widthScale: tmpW, heightScale: tmpH };
  },
  getMaxTopLeft: function () {//获取流程图的最下和最右的节点位置，用来估算流程图的边界
    let maxTop = 0;
    let maxLeft = 0;
    for (let attr in MyFlowJsondata.nodes) {
      if (maxTop < MyFlowJsondata.nodes[attr].top) {
        maxTop = MyFlowJsondata.nodes[attr].top;
      }

      if (maxLeft < MyFlowJsondata.nodes[attr].left) {
        maxLeft = MyFlowJsondata.nodes[attr].left;
      }
    }
    return { maxTop, maxLeft };
  }
};

MyFlow.Common = {

};

MyFlow.Business = (function () {

  let FlowClass = (function () {
    let flowClass = new Class();

    flowClass.include({
      init: function () { },
      initData: function () {
        FlowHomePageClass.init();
      },
      export: function () {
        let tmpString = JSON.stringify(FlowHomePageClass.flowObj.exportData());
        $("#result").val(tmpString);
        if (!window.localStorage) {
          alert("浏览器支持localstorage");
          return false;
        } else {
          let storage = window.localStorage;
          //写入字段
          storage["MyFlowJsondata"] = tmpString;
        }
      },
      resetScale: function (changeScale) {
        MyFlow.util.setNewScaleRule(changeScale);
        $(".GooFlow_work_inner").css('transform', `scale(${MyFlow.Constant.property.scaleRuleObj.widthScale},${MyFlow.Constant.property.scaleRuleObj.heightScale})`);
        FlowHomePageClass.resetFlowInnerOverflow();
      }
    });

    return flowClass;
  })();

  let FlowHomePageClass = (function () {
    let flowHomePageClass = new Class();
    flowHomePageClass.flowObj = {};

    flowHomePageClass.extend({
      init: function () {
        if (location.hash !== '#edit') {
          $('#result').css('display', 'none');
        }
        //获取流程图边界
        let tmpObj = MyFlow.util.getMaxTopLeft();
        //初始化流程图的放缩比例
        this.initScaleRuleObj(tmpObj);
        //初始化流程图对象
        this.initFlowObj();
        //若为流程图浏览态，绑定若干事件
        if (!MyFlow.Constant.property.haveTool) {
          this.addEventForDomWhenView();
          //设置流程图的overflow
          this.resetFlowInnerOverflow();
        }
      },
      initFlowObj: function () {//初始化流程图对象
        //创建并获取流程图对象
        flowHomePageClass.flowObj = $.createGooFlow($("#demo"), MyFlow.Constant.property);
        //设定左侧工具栏中每一种节点或按钮的说明文字。
        flowHomePageClass.flowObj.setNodeRemarks(MyFlow.Constant.remark);
        let tmpData = window.localStorage["MyFlowJsondata"] ? JSON.parse(window.localStorage["MyFlowJsondata"]) : {};
        //流程图加载数据
        flowHomePageClass.flowObj.loadData(MyFlowJsondata);
      },
      initScaleRuleObj: function (tmpObj) {//初始化流程图的放缩横向纵向值
        MyFlow.Constant.property.innerWidth = tmpObj.maxLeft + 200;
        MyFlow.Constant.property.innerHeight = tmpObj.maxTop + 50;
        let tmpScaleWidth = (MyFlow.Constant.property.width - MyFlow.lrMargin) / MyFlow.Constant.property.innerWidth;
        let tmpScaleHeight = MyFlow.Constant.property.height / MyFlow.Constant.property.innerHeight;
        MyFlow.Constant.property.scaleRuleObj = { widthScale: tmpScaleWidth, heightScale: tmpScaleHeight };
      },
      resetFlowInnerOverflow: function () {
        let innnerWidth = $('.GooFlow_work_inner').width() * MyFlow.Constant.property.scaleRuleObj.widthScale;
        let innnerHeight = $('.GooFlow_work_inner').height() * MyFlow.Constant.property.scaleRuleObj.heightScale;
        if (innnerWidth >(MyFlow.Constant.property.width + 50) || innnerHeight > (MyFlow.Constant.property.height +50) ) {
          $('.GooFlow_work').css('overflow', 'scroll');
        } else {
          $('.GooFlow_work').css('overflow', 'visible');
        }
      },
      addEventForDomWhenView: function () {
        for (let attr in MyFlowJsondata.nodes) {
          if (MyFlow.Constant.exceptID.indexOf(attr) === -1) {
            $(`#${attr}`).mouseover(function () {
              let _this = $(this);
              _this.justToolsTip({
                // container:'.GooFlow_work_inner',
                animation: "moveInTop",
                contents: _this.text()
              });
            }).click(function () {
              alert($(this).text())
            });
          }
        }
      }
      // let pathList = document.querySelectorAll('#draw_demo path:nth-child(2)');
      //动画
      // for (let i = 0; i < pathList.length; i++) {
      //   let start = performance.now();
      //   let path = pathList[i];
      //   let len = path.getTotalLength();

      //   let box = document.createElement("div");
      //   box.setAttribute("class", "to-animate");
      //   document.body.appendChild(box);
      //   flowHomePageClass.frame(start, path, len, box);
      // }
      //动画
      // frame: function (start, path, len, box) {
      //   let now = performance.now() + len * 100;
      //   let phase = ((now - start) / 5000) % 1;
      //   let point = path.getPointAtLength(len * phase);
      //   box.style.transform = 'translate3d(' + point.x + 'px,' + point.y + 'px,0)'; // IE
      //   box.style.WebkitTransform = 'translate3d(' + point.x + 'px,' + point.y + 'px,0)'; // Chrome&Safari  
      //   requestAnimationFrame(() => {
      //     flowHomePageClass.frame(start, path, len, box);
      //   });
      // }
    });
    return flowHomePageClass;
  })();

  let classResult = {};

  classResult.FlowClass = FlowClass;

  return classResult;
})();

$(function () {
  myFlow = new MyFlow.Business.FlowClass();
  myFlow.initData();
});