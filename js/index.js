// 用于保存当前正在显示的动画的引用
let currentAnimation;
let isHiding = false;
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


const socket = io.connect('http://localhost:5500');

socket.on('message', function(data) {
    showMessage(data.content);
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

// 获取所有具有相同 name 属性的单选按钮
const radioButtons = document.querySelectorAll('input[name="show_mode"]');

// 显示文本内容的函数 
function showSubtitle(text) {
    // 清空之前的文本内容
    clearSubtitle();

    // 停止当前的动画（如果有）
    if (currentAnimation) {
        cancelAnimationFrame(currentAnimation);
    }

    clearTimeout(hideSubtitle_Timeout);

    // 渐变显示
    function show1() {
        const subtitleDiv = document.getElementById("subtitle");
        subtitleDiv.innerText = text;
        subtitleDiv.style.opacity = 0;
        subtitleDiv.style.transition = `opacity ${gradient_show_time / 1000}s ease-in`;

        setTimeout(() => {
            subtitleDiv.style.opacity = 1;
        }, 100); // 延迟 100 毫秒以确保渐变效果有效

        hideSubtitle_Timeout = setTimeout(() => {
            hideSubtitle(hide_time);
        }, show_over_hide_time + gradient_show_time);
    }

    // 逐字显示文本
    function show2() {
        const subtitleDiv = document.getElementById("subtitle");
        subtitleDiv.innerText = "";
        subtitleDiv.style.opacity = 1;

        const textArray = text.split("");
        let currentIndex = 0;

        function showNextCharacter() {
            if (currentIndex < textArray.length) {
                subtitleDiv.innerText += textArray[currentIndex];
                currentIndex++;
                setTimeout(showNextCharacter, single_char_show_time);
            } else if (show_over_hide_time + single_char_show_time * text.length) {
                hideSubtitle_Timeout = setTimeout(() => {
                    hideSubtitle(hide_time);
                }, show_over_hide_time + single_char_show_time * text.length);
            }
        }

        showNextCharacter();
    }

    // 遍历单选按钮并检查哪一个被选中
    radioButtons.forEach((radio) => {
        if (radio.checked) {
            // 此单选按钮被选中
            const selectedValue = radio.value;
            console.log(`选中的值是：${selectedValue}`);
            if(selectedValue == "1") show1();
            else show2();
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
function get_config() {
    document.getElementById('input_hide_time').value = hide_time;
    document.getElementById('input_show_over_hide_time').value = show_over_hide_time;
    document.getElementById('input_single_char_show_time').value = single_char_show_time;
    document.getElementById('input_gradient_show_time').value = gradient_show_time;
    document.getElementById('input_fontFamily').value = subtitle_font_family;
}

function showMessage(message) {
    // 获取下当前的配置信息
    set_config();

    showSubtitle(message);
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

// 背景色盘
// 获取元素
const customDiv = document.getElementById("subtitle_bg");
const openColorPickerBtn = document.getElementById("openColorPicker");
const colorPicker = document.getElementById("colorPicker");

// 打开色盘按钮点击事件
openColorPickerBtn.addEventListener("click", () => {
    colorPicker.click(); // 触发颜色选择器的点击事件
});

// 颜色选择器变化事件
colorPicker.addEventListener("input", () => {
    const selectedColor = colorPicker.value;
    customDiv.style.backgroundColor = selectedColor; // 设置背景颜色
});

// 文字色盘
// 获取元素
const customDiv2 = document.getElementById("subtitle");
const openColorPickerBtn2 = document.getElementById("openColorPicker2");
const colorPicker2 = document.getElementById("colorPicker2");

// 打开色盘按钮点击事件
openColorPickerBtn2.addEventListener("click", () => {
    colorPicker2.click(); // 触发颜色选择器的点击事件
});

// 颜色选择器变化事件
colorPicker2.addEventListener("input", () => {
    const selectedColor = colorPicker2.value;
    customDiv2.style.color = selectedColor; // 设置背景颜色
});

get_config();

// 显示框字体动态调节
const subtitle = document.getElementById('subtitle');
const fontFamily = document.getElementById('input_fontFamily');

fontFamily.addEventListener('input', function(){
    subtitle.style.fontFamily = this.value;
})