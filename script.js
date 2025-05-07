const correctPassword = "00000000";
let audioContextInitialized = false;

// 预设音频时长（秒），手动设置
const soundDurations = {
  releaseSound1: 5,
  releaseSound2: 10,
  releaseSound3: 15,
  releaseSound4: 20,
  releaseSound5: 25
};

// 音频元素数组
const releaseSounds = [
  document.getElementById("releaseSound1"),
  document.getElementById("releaseSound2"),
  document.getElementById("releaseSound3"),
  document.getElementById("releaseSound4"),
  document.getElementById("releaseSound5"),
];

function checkPassword() {
  const input = document.getElementById("passwordInput").value;
  const errorText = document.getElementById("auth-error");
  if (input === correctPassword) {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("main-container").classList.remove("hidden");
    initializeAudioContext();
  } else {
    errorText.textContent = "密码错误，请重试。";
  }
}

function initializeAudioContext() {
  if (!audioContextInitialized) {
    releaseSounds.forEach(sound => sound.load());
    audioContextInitialized = true;
  }
}

function playReleaseSound() {
  // 停止所有音频播放
  releaseSounds.forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });

  // 随机选择一个音频
  const randomIndex = Math.floor(Math.random() * releaseSounds.length);
  const selectedSound = releaseSounds[randomIndex];
  const soundId = selectedSound.id;
  const duration = soundDurations[soundId]; // 获取预设时长

  // 更新 releaseDuration 为预设时长 + 1秒
  releaseDuration = duration + 1;

  // 播放选中的音频
  selectedSound.play().catch(error => {
    console.error("释放音效播放失败:", error);
  });
}

let totalDuration, chanceTrigger, chanceAllow, releaseDuration;
let startTime;
let mode = 'green';
let bar, status, countdown;
let interval;
let inReleasePhase = false;
let phaseCount = 0;
let isFirstPhase = true;

const greenMessages = {
  early: ['慢慢撸，现在只是热身', '抓住你的鸡巴，从上到下撸动它'],
  mid: ['继续保持，别太快', '平稳前进'],
  late: ['坚持住，准备高潮', '深呼吸，保持冷静']
};

const redMessages = {
  early: ['暂停触碰，深呼吸'],
  mid: ['保持冷静，等待信号'],
  late: ['放松身体，控制自己']
};

function startGame() {
  totalDuration = parseInt(document.getElementById("totalTime").value) * 60 * 1000;
  chanceTrigger = parseInt(document.getElementById("chanceTrigger").value);
  chanceAllow = parseInt(document.getElementById("chanceAllow").value);
  // releaseDuration 不再从输入框获取，将由 playReleaseSound 动态设置

  bar = document.getElementById("bar");
  status = document.getElementById("status");
  countdown = document.getElementById("countdown");

  document.querySelector('.settings').classList.add('hidden');
  startTime = Date.now();

  status.innerText = "准备开始...";
  phaseCount = 0;
  isFirstPhase = true;
  nextPhase();
}

function getPhaseProgress() {
  const elapsed = Date.now() - startTime;
  return elapsed / totalDuration;
}

function getRandomMessage(mode) {
  const progress = getPhaseProgress();
  const messages = mode === 'green' ? greenMessages : redMessages;
  const phase = progress <= 0.3 ? 'early' : progress <= 0.8 ? 'mid' : 'late';
  const msgList = messages[phase];
  return msgList[Math.floor(Math.random() * msgList.length)];
}

function nextPhase() {
  if (interval) clearInterval(interval);

  const now = Date.now();
  const elapsed = now - startTime;
  const progress = elapsed / totalDuration;

  if (progress > 1 && mode === 'green') {
    if (Math.random() < chanceTrigger / 100) {
      inReleasePhase = true;
      const allow = Math.random() < chanceAllow / 100;
      if (allow) {
        status.innerText = '你可以释放了！';
        playReleaseSound(); // 随机播放音频并设置 releaseDuration
      } else {
        status.innerText = '不太走运，不能释放';
      }
      startCountdown(releaseDuration, true);
      return;
    }
  }

  if (!isFirstPhase) {
    mode = mode === 'green' ? 'red' : 'green';
  }
  isFirstPhase = false;

  bar.style.background = mode === 'green' ? 'green' : 'red';
  status.innerText = getRandomMessage(mode);

  phaseCount++;
  const duration = getPhaseDuration();
  startCountdown(duration, false);
}

function getPhaseDuration() {
  const progress = getPhaseProgress();
  const phase = progress <= 0.3 ? 'early' : progress <= 0.8 ? 'mid' : 'late';
  const remainRatio = 1 - progress;

  const phaseDurations = {
    early: {
      green: { min: 40, max: 50 },
      red: { min: 20, max: 30 }
    },
    mid: {
      green: { min: 30, max: 40 },
      red: { min: 15, max: 25 }
    },
    late: {
      green: { min: 20, max: 30 },
      red: { min: 10, max: 20 }
    }
  };

  const durationRange = phaseDurations[phase][mode];

  if (phaseCount > 3) {
    const baseMin = durationRange.min * remainRatio;
    const baseMax = durationRange.max * remainRatio;
    const min = Math.max(5, Math.floor(baseMin));
    const max = Math.max(min, Math.floor(baseMax));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return Math.floor(Math.random() * (durationRange.max - durationRange.min + 1)) + durationRange.min;
}

function startCountdown(seconds, isFinal = false) {
  let current = seconds;
  countdown.innerText = current + " 秒";
  bar.style.width = '100%';

  const start = Date.now();
  const duration = seconds * 1000;

  interval = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = 1 - elapsed / duration;
    bar.style.width = (progress * 100) + "%";
    countdown.innerText = Math.ceil(current) + " 秒";

    current -= 1 / 60;

    if (progress <= 0) {
      clearInterval(interval);
      bar.style.width = '0%';
      if (isFinal) {
        status.innerText += "\n游戏结束。";
        releaseSounds.forEach(sound => {
          sound.pause();
          sound.currentTime = 0;
        });
      } else {
        nextPhase();
      }
    }
  }, 1000 / 60);
}
