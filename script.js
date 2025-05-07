let mode = 'green'; // 始终以绿色模式开始
let totalDuration, chanceTrigger, chanceAllow, releaseDuration;
let startTime, countdown;
let releaseTriggered = false;
let phaseCount = 0;

// 预定义文字（每组5条，可自定义更多）
const greenMessages = {
    early: ['保持节奏', '轻柔触碰', '慢慢来', '感受每一刻', '控制速度'],
    mid: ['继续保持', '专注感觉', '别太快', '平稳前进', '享受过程'],
    late: ['接近边缘', '坚持住', '深呼吸', '保持冷静', '准备高潮']
};
const redMessages = {
    early: ['暂停触碰', '放松一下', '等待信号', '深吸一口气', '稍作停顿'],
    mid: ['保持冷静', '停止动作', '稍作休息', '控制呼吸', '等待时机'],
    late: ['完全停止', '控制自己', '准备结束', '放松身体', '保持耐心']
};

function playSound(id) {
    const audio = document.getElementById(id);
    audio.currentTime = 0;
    audio.play();
}

function startGame() {
    const params = new URLSearchParams(window.location.search);
    totalDuration = parseInt(params.get('totalTime')) * 60 * 1000;
    chanceTrigger = parseInt(params.get('chanceTrigger'));
    chanceAllow = parseInt(params.get('chanceAllow'));
    releaseDuration = parseInt(params.get('releaseDuration'));

    countdown = document.getElementById('countdown');
    startTime = Date.now();

    nextPhase(); // 确保第一阶段立即启动
}

function getRandomMessage(progress, mode) {
    const messages = mode === 'green' ? greenMessages : redMessages;
    if (progress <= 0.3) return messages.early[Math.floor(Math.random() * messages.early.length)];
    if (progress <= 0.7) return messages.mid[Math.floor(Math.random() * messages.mid.length)];
    return messages.late[Math.floor(Math.random() * messages.late.length)];
}

function createPhaseContainer(message) {
    phaseCount++;
    const container = document.getElementById('progress-container');
    const phaseDiv = document.createElement('div');
    phaseDiv.className = 'phase-container';
    phaseDiv.id = `phase-${phaseCount}`;

    const statusDiv = document.createElement('div');
    statusDiv.className = 'status';
    statusDiv.innerText = message;

    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress';
    progressDiv.id = `progress-${phaseCount}`;

    const barDiv = document.createElement('div');
    barDiv.className = 'bar';
    barDiv.id = `bar-${phaseCount}`;

    progressDiv.appendChild(barDiv);
    phaseDiv.appendChild(statusDiv);
    phaseDiv.appendChild(progressDiv);
    container.insertBefore(phaseDiv, container.firstChild);
    return barDiv;
}

function nextPhase() {
    if (releaseTriggered) return;

    const elapsed = Date.now() - startTime;
    if (elapsed >= totalDuration) {
        if (mode === 'green' && Math.random() < chanceTrigger / 100) {
            releaseTriggered = true;
            const allow = Math.random() < chanceAllow / 100;
            if (allow) {
                const message = '你可以释放了！';
                const bar = createPhaseContainer(message);
                bar.style.background = 'green';
                playSound('releaseAllowed');
                countdownPhase(releaseDuration, 'green', true);
            } else {
                const message = '不太走运，不能释放';
                const bar = createPhaseContainer(message);
                bar.style.background = 'red';
                playSound('releaseDenied');
                countdown.innerText = '';
            }
            return;
        }
    }

    mode = mode === 'green' ? 'red' : 'green';
    const remainRatio = 1 - elapsed / totalDuration;
    let duration = mode === 'green'
        ? getRandomInt(10, 60 * remainRatio)
        : getRandomInt(5, 30 * remainRatio);
    countdownPhase(duration, mode);
}

function countdownPhase(seconds, currentMode, finalPhase = false) {
    const progress = (Date.now() - startTime) / totalDuration;
    const message = getRandomMessage(progress, currentMode);
    const bar = createPhaseContainer(message);
    bar.style.background = currentMode === 'green' ? 'green' : 'red';
    playSound(currentMode === 'green' ? 'startGreen' : 'startRed');

    let current = seconds;
    let interval = setInterval(() => {
        bar.style.width = (current / seconds) * 100 + '%';
        countdown.innerText = current + ' 秒';

        // 仅在最后3秒播放轻柔提示音
        if (current <= 3 && current > 2) playSound('beep');

        if (--current < 0) {
            clearInterval(interval);
            if (!finalPhase) nextPhase();
            else {
                const bar = createPhaseContainer('游戏结束');
                bar.style.background = 'grey';
            }
        }
    }, 1000);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onload = startGame;