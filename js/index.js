// 用于保存当前正在显示的动画的引用
let currentAnimation;
let isHiding = false;
let currentTimeout = null;
let hideSubtitle_Timeout;
// 隐藏字幕的动画时间
let hide_time = 1000;
// 显示完毕多久后隐藏字幕
let show_over_hide_time = 2000;
// 单个字符显示耗时
let single_char_show_time = 200;
// 渐变显示耗时
let gradient_show_time = 500;
// 显示框字体
let subtitle_font_family = '宋体';
const currentUrl = window.location.href;
// 服务端口
const server_port = 5500
// 配置
let config = null;
// tip弹窗数量
let tipCounter = 0;

// 获取URL的IP和端口
function getHostWithPortFromUrl(urlString) {
    const url = new URL(urlString);
    const { hostname, port, protocol } = url;
    const defaultPorts = {
        'http:': '80',
        'https:': '443'
    };

    const hostWithPort = port ? `${hostname}:${port}` : `${hostname}:${defaultPorts[protocol] || ''}`;
    return {
        "host": hostname,
        "port": port || defaultPorts[protocol] || '',
        "ip_port": hostWithPort
    };
}

// 背景色盘
// 获取元素
const customDiv = document.getElementById("subtitle_bg");
const openColorPickerBtn = document.getElementById("openColorPicker");
const colorPicker = document.getElementById("colorPicker");

// 文字色盘
// 获取元素
const customDiv2 = document.getElementById("subtitle");
const openColorPickerBtn2 = document.getElementById("openColorPicker2");
const colorPicker2 = document.getElementById("colorPicker2");

// 页面背景色盘
// 获取元素
const customDiv3 = document.body;
const openColorPickerBtn3 = document.getElementById("openColorPicker3");
const colorPicker3 = document.getElementById("colorPicker3");

const socket = io.connect(`http://${getHostWithPortFromUrl(currentUrl).host}:${server_port}`);

socket.on('message', function(data) {
    // 解码URL编码后显示
    showMessage(data);
});

// 获取输入框中的值并转为整数
function getNumber(input, defaultValue = 0) {
    let value = input.value;
    let number = parseInt(value);

    if (isNaN(number) || value === '') {
        number = defaultValue; 
    }

    return number;
}

// 显示提示框
function showtip(type, text, timeout=3000) {
    const tip = document.createElement("div");
    tip.className = "tip";
    tip.style.bottom = `${tipCounter * 40}px`; // 垂直定位
    tip.innerText = text;
    if (type == "error") {
      tip.style.backgroundColor = "#ff0000";
    }

    document.body.appendChild(tip);

    setTimeout(function () {
      document.body.removeChild(tip);
      tipCounter--;
      if (tipCounter < 0) tipCounter = 0;
    }, timeout);

    // 是否实现多tip窗
    tipCounter++;
    if (tipCounter > 3) tipCounter = 0;
}

// 获取当前配置
function get_config() {
    var url = `http://${getHostWithPortFromUrl(currentUrl).host}:${server_port}/get_config`;

    fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.text();
            }
            throw new Error("网络响应失败");
        })
        .then(function (data) {
            // 处理响应数据
            console.log(data);

            var data_json = JSON.parse(data);

            config = data_json;

            try {
                document.getElementById('input_fontFamily').value = config["subtitle_font_family"];
                document.getElementById('input_fontSize').value = config["subtitle_font_size"];
                document.getElementById('input_webkit_text_stroke').value = config["subtitle_webkit_text_stroke"];
                document.getElementById('input_font_weight').value = config["subtitle_font_weight"];
                document.getElementById('input_subtitle_bg_width').value = config["subtitle_bg_width"];
                document.getElementById('input_subtitle_bg_height').value = config["subtitle_bg_height"];
                document.getElementById('input_single_char_show_time').value = config["single_char_show_time"];
                document.getElementById('input_gradient_show_time').value = config["gradient_show_time"];
                document.getElementById('input_hide_time').value = config["hide_time"];
                document.getElementById('input_show_over_hide_time').value = config["show_over_hide_time"];
                document.querySelector('input[name="show_mode"][value="' + config["show_mode"]+ '"]').checked = true;
                customDiv.style.backgroundColor = config["bg_color"];
                customDiv2.style.color = config["font_color"];
                customDiv3.style.backgroundColor = config["body_bg_color"];

                // 隐藏字幕的动画时间
                hide_time = parseInt(config["hide_time"]);
                // 显示完毕多久后隐藏字幕
                show_over_hide_time = parseInt(config["show_over_hide_time"]);
                // 单个字符显示耗时
                single_char_show_time = parseInt(config["single_char_show_time"]);
                // 渐变显示耗时
                gradient_show_time = parseInt(config["gradient_show_time"]);
                // 显示框字体
                subtitle_font_family = config["subtitle_font_family"];
                strokeWidth = 10;

                document.getElementById('subtitle_bg').style.width = config["subtitle_bg_width"];
                document.getElementById('subtitle_bg').style.height = config["subtitle_bg_height"];

                document.getElementById('subtitle').style.fontFamily = config["subtitle_font_family"];
                document.getElementById('subtitle').style.fontSize = config["subtitle_font_size"];
                document.getElementById('subtitle').style.webkitTextStroke = config["subtitle_webkit_text_stroke"];
                document.getElementById('subtitle').style.fontWeight = config["subtitle_font_weight"];

                // 加载色盘初始值
                document.getElementById("colorPicker").value = config["bg_color"];
                document.getElementById("colorPicker2").value = config["font_color"];
                document.getElementById("colorPicker3").value = config["body_bg_color"];

                showtip("info", "本地配置加载完毕");
            } catch (error) {
                // 处理错误
                console.error(error);
            }
        })
        .catch(function (error) {
            // 处理错误
            console.error(error);
        });
}

// 保存配置
function save_config() {
    try {
        config["subtitle_font_family"] = document.getElementById('input_fontFamily').value;
        config["subtitle_font_size"] = document.getElementById('input_fontSize').value;
        config["subtitle_webkit_text_stroke"] = document.getElementById('input_webkit_text_stroke').value;
        config["subtitle_font_weight"] = document.getElementById('input_font_weight').value;
        config["single_char_show_time"] = parseInt(document.getElementById('input_single_char_show_time').value);
        config["gradient_show_time"] = parseInt(document.getElementById('input_gradient_show_time').value);
        config["hide_time"] = parseInt(document.getElementById('input_hide_time').value);
        config["show_over_hide_time"] = parseInt(document.getElementById('input_show_over_hide_time').value);
        config["show_mode"] = document.querySelector('input[name="show_mode"]:checked').value;
        config["subtitle_bg_width"] = document.getElementById('subtitle_bg').style.width;
        config["subtitle_bg_height"] = document.getElementById('subtitle_bg').style.height;

        config["bg_color"] = colorPicker.value;
        config["font_color"] = colorPicker2.value;
        config["body_bg_color"] = colorPicker3.value;

    } catch (error) {
        console.error(error);
        return;
    }

    // 构建请求选项对象
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // 指定请求体为JSON格式
        },
        body: JSON.stringify(config), // 将JSON数据序列化为字符串并作为请求体
    };

    console.log(requestOptions);

    // 构建完整的URL，包含查询参数
    const url = `http://${getHostWithPortFromUrl(currentUrl).host}:${server_port}/save_config`;

    // 发送GET请求
    fetch(url, requestOptions)
        .then(function (response) {
            if (response.ok) {
                return response.json(); // 解析响应数据为JSON
            }
            showtip("error", "保存配置失败");
            throw new Error("网络响应失败");
        })
        .then(function (data) {
            // 处理响应数据
            console.log(data);
            showtip("info", "保存配置成功");
        })
        .catch(function (error) {
            // 处理错误
            console.error(error);
            showtip("error", "保存配置失败，" + error.toString());
        });
}

// 获取所有具有相同 name 属性的单选按钮
const radioButtons = document.querySelectorAll('input[name="show_mode"]');

// 显示文本内容的函数 data为json数据
function showSubtitle(data) {
    // console.log(data.content);
    let lines = data.content.split('\\n');
    let text = lines.map(line => {
        let decodedLine = decodeURIComponent(line);
        return decodedLine.replace(/\\n/g, '\\n');
    }).join('<br>');

    // 清空之前的文本内容
    clearSubtitle();

    // 取消正在进行的显示
    if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
    }

    // 停止当前的动画（如果有）
    if (currentAnimation) {
        cancelAnimationFrame(currentAnimation);
    }

    clearTimeout(hideSubtitle_Timeout);

    // 渐变显示
    function show1(keep_time) {
        const subtitleDiv = document.getElementById("subtitle");
        subtitleDiv.innerHTML = text;
        subtitleDiv.style.opacity = 0;
        subtitleDiv.style.transition = `opacity ${gradient_show_time / 1000}s ease-in`;

        setTimeout(() => {
            subtitleDiv.style.opacity = 1;
        }, 100); // 延迟 100 毫秒以确保渐变效果有效

        if (keep_time == 0) {
            hideSubtitle_Timeout = setTimeout(() => {
                hideSubtitle(hide_time);
            }, show_over_hide_time + gradient_show_time);
        } else {
            hideSubtitle_Timeout = setTimeout(() => {
                hideSubtitle(hide_time);
            }, keep_time);
        }
        
    }

    // 逐字显示文本
    function show2(keep_time) {
        const subtitleDiv = document.getElementById("subtitle");
        subtitleDiv.innerHTML = "";
        subtitleDiv.style.opacity = 1;
    
        // 将文本拆分为HTML标签和文本内容
        const textArray = text.split(/(<br>|<[^>]+>)/);
        let currentIndex = 0;
    
        function showNextPart() {
            if (currentIndex < textArray.length) {
                const part = textArray[currentIndex];
                if (part.startsWith('<')) {
                    // 如果是HTML标签，直接添加
                    subtitleDiv.innerHTML += part;
                    currentIndex++;
                    // 立即显示下一部分，不需要延迟
                    showNextPart();
                } else {
                    // 如果是文本内容，逐字显示
                    const chars = part.split('');
                    let charIndex = 0;
    
                    function showNextChar() {
                        if (charIndex < chars.length) {
                            subtitleDiv.innerHTML += chars[charIndex];
                            charIndex++;
                            currentTimeout = setTimeout(showNextChar, single_char_show_time);
                        } else {
                            currentIndex++;
                            showNextPart();
                        }
                    }
    
                    showNextChar();
                }
            } else {
                const totalTime = keep_time === 0 ? 
                    (show_over_hide_time + single_char_show_time * text.length) : 
                    keep_time;
    
                hideSubtitle_Timeout = setTimeout(() => {
                    hideSubtitle(hide_time);
                }, totalTime);
            }
        }
    
        showNextPart();
    }

    var keep_time = 0;
    // 判断是否有keep_time参数
    if ("keep_time" in data) {
        keep_time = parseInt(data.keep_time);
    }

    // 遍历单选按钮并检查哪一个被选中
    radioButtons.forEach((radio) => {
        if (radio.checked) {
            // 此单选按钮被选中
            const selectedValue = radio.value;
            console.log(`选中的值是：${selectedValue}`);
            if(selectedValue == "1") show1(keep_time);
            else show2(keep_time);
        }
    });
    
}

// 清空内容的函数
function clearSubtitle() {
    const subtitleDiv = document.getElementById("subtitle");
    subtitleDiv.innerText = "";
}

// 渐变隐藏的函数
function hideSubtitle(fadeOutDuration) {
    if (isHiding) {
        return; // 如果已经在隐藏过程中，不要再次触发
    }
    isHiding = true;

    const subtitleDiv = document.getElementById("subtitle");
    subtitleDiv.style.transition = `opacity ${fadeOutDuration}ms`;
    subtitleDiv.style.opacity = 0;

    setTimeout(() => {
        clearSubtitle();
        isHiding = false;
    }, fadeOutDuration);
}

// 设置配置到全局变量中
function set_config() {
    const input_hide_time = document.getElementById('input_hide_time');
    const input_show_over_hide_time = document.getElementById('input_show_over_hide_time');
    const input_single_char_show_time = document.getElementById('input_single_char_show_time');
    const input_gradient_show_time = document.getElementById('input_gradient_show_time');

    hide_time = getNumber(input_hide_time, 1000);
    show_over_hide_time = getNumber(input_show_over_hide_time, 2000);
    single_char_show_time = getNumber(input_single_char_show_time, 200);
    gradient_show_time = getNumber(input_gradient_show_time, 500);
}

// 获取配置到输入框
// function get_config() {
//     document.getElementById('input_hide_time').value = hide_time;
//     document.getElementById('input_show_over_hide_time').value = show_over_hide_time;
//     document.getElementById('input_single_char_show_time').value = single_char_show_time;
//     document.getElementById('input_gradient_show_time').value = gradient_show_time;
//     document.getElementById('input_fontFamily').value = subtitle_font_family;
// }

function showMessage(data) {
    // 获取下当前的配置信息
    set_config();

    if ("start_delay" in data) {
        // 延时执行
        setTimeout(function() {showSubtitle(data)}, parseFloat(data.start_delay));
    } else {
        showSubtitle(data);
    }
}

function sendMessage() {
    const content = document.getElementById('messageInput').value;
    socket.emit('message', { content });
}

// 输入框回车发送
function handleKeyPress(event) {
    if (event.key === "Enter") {
        // 如果按下的是回车键，则调用 sendMessage() 函数
        sendMessage();
    }
}

// 打开色盘按钮点击事件
openColorPickerBtn.addEventListener("click", () => {
    colorPicker.click(); // 触发颜色选择器的点击事件
});

// 颜色选择器变化事件
colorPicker.addEventListener("input", () => {
    const selectedColor = colorPicker.value;
    customDiv.style.backgroundColor = selectedColor; // 设置背景颜色
    // console.log("customDiv.style.backgroundColor=" + selectedColor);
    config["bg_color"] = selectedColor;
});

// 打开色盘按钮点击事件
openColorPickerBtn2.addEventListener("click", () => {
    colorPicker2.click(); // 触发颜色选择器的点击事件
});

// 颜色选择器变化事件
colorPicker2.addEventListener("input", () => {
    const selectedColor = colorPicker2.value;
    customDiv2.style.color = selectedColor; // 设置背景颜色
    // console.log("customDiv2.style.color=" + selectedColor);
    config["font_color"] = selectedColor;
});

// 打开色盘按钮点击事件
openColorPickerBtn3.addEventListener("click", () => {
    colorPicker3.click(); // 触发颜色选择器的点击事件
});

// 颜色选择器变化事件
colorPicker3.addEventListener("input", () => {
    const selectedColor = colorPicker3.value;
    customDiv3.style.backgroundColor = selectedColor; // 设置背景颜色
    // console.log("customDiv3.style.color=" + selectedColor);
    config["body_bg_color"] = selectedColor;
});

get_config();

// 显示框字体动态调节 添加事件监听
const subtitle = document.getElementById('subtitle');
const fontFamily = document.getElementById('input_fontFamily');
const fontSize = document.getElementById('input_fontSize');
const webkitTextStroke = document.getElementById('input_webkit_text_stroke');
const fontWeight = document.getElementById('input_font_weight');

fontFamily.addEventListener('input', function(){
    subtitle.style.fontFamily = this.value;
})

fontSize.addEventListener('input', function(){
    subtitle.style.fontSize = this.value;
})

webkitTextStroke.addEventListener('input', function(){
    subtitle.style.webkitTextStroke = this.value;
})

fontWeight.addEventListener('input', function(){
    subtitle.style.fontWeight = this.value;
})

// 字体背景 事件监听
const subtitle_bg = document.getElementById('subtitle_bg');
const subtitle_bg_width = document.getElementById('input_subtitle_bg_width');
const subtitle_bg_height = document.getElementById('input_subtitle_bg_height');

subtitle_bg_width.addEventListener('input', function(){
    subtitle_bg.style.width = this.value;
})

subtitle_bg_height.addEventListener('input', function(){
    subtitle_bg.style.height = this.value;
})
