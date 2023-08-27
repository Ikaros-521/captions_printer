# 前言
用于通过打字的方式，在web实现动态的字幕显示效果。  
支持HTTP API，可以配合其他程序协同工作。  

# 使用&部署
开发系统：win11  
python：3.10  
安装依赖：`pip install -r requirements.txt`  
运行：`python app.py`  
浏览器访问：`http://127.0.0.1:5500/index.html`  

## 整合包
整合包下载：{https://github.com/Ikaros-521/captions_printer/releases](https://github.com/Ikaros-521/captions_printer/releases)  
整合包直接解压，运行bat即可使用。  

# FAQ
1.5500端口冲突  
可以修改`app.py`和`js/index.js`中，搜索`5500`，全部改成你的新端口即可。  

# 更新日志
- v0.1.0
  - 初始功能实现，发布demo
- v0.1.1
  - 新增依赖txt
  - 美化UI
  - 新增文字色盘、背景色盘
  - 新增文本显示模式的单选框切换
  - 优化接口返回内容
  - 优化文档
  - 加长文本输入框
  - 新增忽略
  - 新增整合包