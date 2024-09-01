import logging
import webbrowser
from flask import Flask, send_from_directory, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import json

from utils.common import Common
from utils.logger import Configure_logger

common = Common()

# 日志文件路径
log_file = "./log/log-" + common.get_bj_time(1) + ".txt"
Configure_logger(log_file)

# 获取 werkzeug 库的日志记录器
werkzeug_logger = logging.getLogger("werkzeug")
# 设置 httpx 日志记录器的级别为 WARNING
werkzeug_logger.setLevel(logging.WARNING)

config_file_path = "config.json"

app = Flask(__name__, static_folder='./')
CORS(app)  # 允许跨域请求
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/index.html')
def serve_file():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/css/index.css')
def serve_file2():
    return send_from_directory(app.static_folder, 'css/index.css')

@app.route('/js/index.js')
def serve_file3():
    return send_from_directory(app.static_folder, 'js/index.js')

@app.route('/js/socket.io.js')
def serve_file4():
    return send_from_directory(app.static_folder, 'js/socket.io.js')

@socketio.on('message')
def handle_message(data):
    content = data['content']
    emit('message', {'content': content}, broadcast=True)

@app.route('/get_config', methods=['GET'])
def get_config():
    try:
        
        # 打开文件并解析JSON数据
        with open(config_file_path, 'r', encoding="utf-8") as file:
            data = json.load(file)

        return jsonify(data)
    except Exception as e:
        return jsonify({"code": -1, "message": f"获取本地配置失败{e}"})
    
@app.route('/save_config', methods=['POST'])
def save_config():
    try:
        content = request.get_json()
        logging.info(content)

        try:
            with open(config_file_path, 'w', encoding="utf-8") as config_file:
                json.dump(content, config_file, indent=2, ensure_ascii=False)
                config_file.flush()  # 刷新缓冲区，确保写入立即生效

            logging.info("配置数据已成功写入文件！")
            return jsonify({"code": 200, "message": "配置数据已成功写入文件！"})
        except Exception as e:
            logging.error(f"无法写入配置文件！{e}")
            return jsonify({"code": -1, "message": "无法写入配置文件！{e}"})

        
    except Exception as e:
        return jsonify({"code": -1, "message": f"无法写入配置文件！{e}"})
    
@app.route('/send_message', methods=['GET'])
def send_message():
    try:
        content = request.args.get('content')
        # 显示延迟 默认单位为 毫秒
        start_delay = request.args.get('start_delay', default=0, type=int)
        
        # 将数据发送到 WebSocket
        socketio.emit('message', {'content': content, 'start_delay': start_delay})

        logging.info(f"延时：{start_delay}毫秒, 打印内容：{content}")

        return jsonify({"code": 200, "message": "数据发送到WebSocket成功"})
    except Exception as e:
        return jsonify({"code": -1, "message": f"数据发送到WebSocket失败\n{e}"})

if __name__ == '__main__':
    port = 5500
    url = f'http://localhost:{port}/index.html'
    webbrowser.open(url)
    logging.info(f"浏览器访问地址：{url}")
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
