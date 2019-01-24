/*******
<div id="js-page-limit" class="page-limit" data-page-total='10' data-current-index='1'>
    正在加载更多...
</div>
var pageLimit = new PageLimit({
                elem:$('#js-page-limit'),
                loadType:'scroll',
                loadStepText:['获取更多','正在加载..','没有更多数据'],
                url:'data/test.json',
                callback:function(ret){
                    console.log(ret)
                },
                params:{
                    type:'home',
                    limit:20
                }
        });
@elem -> 指定触发分页的钩子元素
@loadType -> 触发分页的方式，手动敲击tap、滚动到底部触发scroll
@url -> 分页的接口
@loadStepText -> 触发分页的几个步骤的显示文本，三步，前，正在，最后一页
@callback -> 分页数据请求返回成功
@params -> 指定接口查询串

@name 杨永
@call 18911082352
@version 1.0.0
*********/

(function($) {
  var PageLimit = function(setting) {
    var _this_ = this;
    //扩展相关数据
    this.setting = PageLimit._DEFAULT_SETTING_;
    this.setting = $.extend({}, this.setting, setting);
    //保存总页数和当前页
    this.pageTotalSize = Number(this.setting.elem.attr('data-page-total'));
    this.pageCurrentIdx = Number(this.setting.elem.attr('data-current-index'));
    //初始化的时候加载一页
    this.setting.isLoadOnePage && this.loadPage();
    //根据加载类型，初始化不同的触发方式
    if (this.pageTotalSize > this.pageCurrentIdx) {
      if (this.setting.loadType == 'tap') {
        this.setting.elem
          .tap(function() {
            _this_.loadPage();
          })
          .text(this.setting.loadStepText[0]);
      } else {
        //如果是上拉触发
        this.setting.elem.css('opacity', 0);
        $(window).scroll(function() {
          window.clearTimeout(this.timer);
          this.timer = window.setTimeout(function() {
            var scrollTop = $(window).scrollTop();
            var offsetTop = _this_.setting.elem.offset().top;
            if (scrollTop + window.innerHeight >= offsetTop) {
              _this_.setting.elem.css('opacity', 1);
              if (!_this_.setting.elem.hasClass('page-state-loading')) {
                _this_.loadPage();
              }
            }
          }, 200);
        });
      }
    } else {
      _this_.setting.elem.hide();
    }
  };

  PageLimit._DEFAULT_SETTING_ = {
    elem: null,
    loadType: 'pull',
    url: '你还没有指定url.json',
    loadStepText: ['获取更多', '正在加载..', '没有更多数据'],
    isLoadOnePage: null,
    callback: null,
    params: {}
  };

  PageLimit.prototype = {
    loadPage: function(index) {
      var self = this;
      var setting = this.setting;
      //如果加载完毕
      if (setting.elem.hasClass('page-state-loaded')) {
        setting.elem.text(setting.loadStepText[2]).css('opacity', 1);
        return;
      }
      if (setting.loadType == 'tap') {
        setting.elem.text(setting.loadStepText[1]);
      } else {
        setting.elem.text(setting.loadStepText[1]).css('opacity', 1);
      }

      //当发起加载的时候，给加载标增加class=page-state-loading
      setting.elem.addClass('page-state-loading');
      //把当前加载页设置到params
      this.pageCurrentIdx = index || this.pageCurrentIdx;
      setting.params.page = this.pageCurrentIdx;
      //发起请求
      $.get(setting.url, setting.params, function(ret) {
        if (setting.loadType == 'tap') {
          setting.elem.text(setting.loadStepText[0]);
        } else {
          setting.elem.text(setting.loadStepText[0]).css('opacity', 0);
        }
        //当页数加载完毕，给加载标签增加状态
        if (self.pageCurrentIdx == self.pageTotalSize) {
          setting.elem.addClass('page-state-loaded');
        }
        //加载成功后，把当前页加1、删除class=page-state-loading
        setting.elem
          .removeClass('page-state-loading')
          .attr('data-current-index', setting.params.page);
        self.pageCurrentIdx++;
        //回调函数
        setting.callback && setting.callback(ret);
      });
    }
  };

  window.PageLimit = PageLimit;
})(Zepto);
