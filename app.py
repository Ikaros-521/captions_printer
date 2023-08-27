import time
from flask import Flask, send_from_directory, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS

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
    content = request.args.get('content')
    
    # 将数据发送到 WebSocket
    socketio.emit('message', {'content': content})

    return jsonify({"message": "数据发送到WebSocket"})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5500, debug=True)
