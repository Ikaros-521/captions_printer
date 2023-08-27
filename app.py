import logging
import webbrowser
from flask import Flask, send_from_directory, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from utils.common import Common
from utils.logger import Configure_logger

common = Common()

# 日志文件路径
log_file = "./log/log-" + common.get_bj_time(1) + ".txt"
Configure_logger(log_file)

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

@app.route('/send_message', methods=['GET'])
def send_message():
    try:
        content = request.args.get('content')
        
        # 将数据发送到 WebSocket
        socketio.emit('message', {'content': content})

        return jsonify({"code": 200, "message": "数据发送到WebSocket成功"})
    except Exception as e:
        return jsonify({"code": -1, "message": f"数据发送到WebSocket失败\n{e}"})

if __name__ == '__main__':
    port = 5500
    url = f'http://localhost:{port}/index.html'
    webbrowser.open(url)
    logging.info(f"浏览器访问地址：{url}")
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
