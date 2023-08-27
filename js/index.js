// 用于保存当前正在显示的动画的引用
let currentAnimation;
let isHiding = false;
let hideSubtitle_Timeout;
let hide_time = 1000;
let auto_hide_time = 2000;

const socket = io.connect('http://localhost:5500');

socket.on('message', function(data) {
    showMessage(data.content);
});

// 获取所有具有相同 name 属性的单选按钮
const radioButtons = document.querySelectorAll('input[name="show_mode"]');

// 显示文本内容的函数
function showSubtitle(text, duration, auto_hide_time) {
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
        subtitleDiv.style.transition = `opacity ${duration / 1000}s ease-in`;

        setTimeout(() => {
            subtitleDiv.style.opacity = 1;
        }, 100); // 延迟 100 毫秒以确保渐变效果有效

        hideSubtitle_Timeout = setTimeout(() => {
            hideSubtitle(hide_time);
        }, auto_hide_time);
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
                setTimeout(showNextCharacter, duration);
            } else if (auto_hide_time) {
                hideSubtitle_Timeout = setTimeout(() => {
                    hideSubtitle(hide_time);
                }, auto_hide_time);
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

function showMessage(message) {
    showSubtitle(message, 200, auto_hide_time);
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
