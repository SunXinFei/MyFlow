## 前端流程图绘制工具
本地服务打开index.html
http://127.0.0.1:5500/index.html 进入浏览状态
![浏览](http://img.sunxinfei.com/githubMyFlow/readme/view.pngview.png)
http://127.0.0.1:5500/index.html#edit 进入编辑状态
![编辑](http://img.sunxinfei.com/githubMyFlow/readme/edit.pngedit.png)

## Release
### V1.0.2
* 新增浏览态新增流程图放缩功能
* 支持浏览态的浏览器窗口最佳视图，即横纵向放缩至最佳比例

### V1.0.1
* 新增连接线箭头的控制
* 新增连接线是否为虚线的控制
* 新增文本换行功能，包括节点和连线
* 新增连接线拐点节点以及小方块节点
* 新增上下左右移动按钮功能
* 支持节点内写入原生html
* 修复连线创建后，修改node节点ID，连线数据未对应修改的情况
* 修复拖拽节点/连接线type变换后，文本换行失效的bug

### V1.0.0 
*  双击连接线or节点，可以编辑文本
* 节点输入框支持输入“名称”或“名称^业务唯一DOM的ID”
* 点击连接线可以修改连接线的折线or直线，
* 保存功能支持输出JSON，并且会保存到本地localStorage