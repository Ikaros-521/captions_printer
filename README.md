# 前言
用于通过打字的方式，在web实现动态的字幕显示效果。  
支持HTTP API，可以配合其他程序协同工作。  

# 使用&部署
开发系统：win11  
python：3.10  
安装依赖：`pip install -r requirements.txt`  
运行：`python app.py`  
浏览器访问：`http://127.0.0.1:5500/index.html`  
视频教程：[https://www.bilibili.com/video/BV13h4y1e7z8/](https://www.bilibili.com/video/BV13h4y1e7z8/)  

## 整合包
整合包下载：  
github：[https://github.com/Ikaros-521/captions_printer/releases](https://github.com/Ikaros-521/captions_printer/releases)  
夸克网盘：[https://pan.quark.cn/s/4b75f239f535](https://pan.quark.cn/s/4b75f239f535)  
阿里网盘：[https://www.aliyundrive.com/s/76nVRNCewzb](https://www.aliyundrive.com/s/76nVRNCewzb)  
整合包直接解压，运行bat即可使用。  

# API

api（get请求）：`http://127.0.0.1:5500/send_message?content=这里就是传入的内容了\n将会显示在显示框中&start_delay=1000&keep_time=5000`    
也支持post请求

## 参考例程
```python
# 请求web字幕打印机
def send_to_web_captions_printer(self, api_ip_port, data):
    """请求web字幕打印机

    Args:
        api_ip_port (str): api请求地址
        data (dict): 包含用户名,弹幕内容

    Returns:
        bool: True/False
    """

    # user_name = data["username"]
    content = data["content"]

    # 记录数据库):
    try:
        response = requests.get(url=api_ip_port + f'/send_message?content={content}')
        response.raise_for_status()  # 检查响应的状态码

        result = response.content
        ret = json.loads(result)

        logging.debug(ret)

        if ret['code'] == 200:
            logging.debug(ret['message'])
            return True
        else:
            logging.error(ret['message'])
            return False
    except Exception as e:
        logging.error('web字幕打印机请求失败！请确认配置是否正确或者服务端是否运行！')
        logging.error(traceback.format_exc())
        return False
```

# FAQ
1.5500端口冲突  
可以修改`app.py`和`js/index.js`和`index.html`中，搜索`5500`，全部改成你的新端口即可。  

# 更新日志
- v0.5.1
  - send_message接口新增参数 keep_time，用于控制字幕显示时间（毫秒）,可以不传，默认为自动计算时长
  - send_message接口支持get或post请求
  - send_message接口 content参数 传入\n时，将被替换为换行符（将不支持直接的\n显示）
- v0.5.0
  - send_message接口新增参数 start_delay，用于控制字幕显示延时时间（毫秒）,可以不传，默认为0
- v0.4.1
  - 修复字体配置无法保存的bug
  - 新增 页面背景色盘、字体描边、字体粗细、文字背景宽高控制，使用更加灵活
- v0.4.0
  - 修复逐字显示模式下，高频请求下，文字错乱显示的问题
- v0.3.3
  - 修复文字字体无法固化的bug
- v0.3.2
  - 增加文字字体大小设置
  - 增加功能响应后的提示弹窗
- v0.3.1
  - 提高werkzeug日志等级，只打印输出内容，让日志更加清爽
  - 对特殊符号解码，解决URL编码显示问题
- v0.3.0
  - 支持配置本地化
- v0.2.0
  - 支持字体设置，支持显示隐藏参数自定义
- v0.1.2
  - 新增日志记录
  - 新增自动打开浏览器访问功能
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
- v0.1.0
  - 初始功能实现，发布demo