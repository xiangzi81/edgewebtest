function startCountdown(seconds, isFinal = false) {
  let current = seconds;
  countdown.innerText = current + " 秒";
  bar.style.width = '100%';

  const start = Date.now();
  const duration = seconds * 1000; // 转换为毫秒

  interval = setInterval(() => {
    const elapsed = Date.now() - start;
    const progress = 1 - elapsed / duration; // 从 1 到 0 的线性进度
    bar.style.width = (progress * 100) + "%";
    countdown.innerText = Math.ceil(current) + " 秒";

    current -= 1 / 60; // 每 1/60 秒更新一次，模拟 60fps 动画

    if (progress <= 0) {
      clearInterval(interval);
      bar.style.width = '0%'; // 确保最终宽度为 0
      if (isFinal) {
        status.innerText += "\n游戏结束。";
      } else {
        nextPhase();
      }
    }
  }, 1000 / 60); // 每 16.67ms 更新一次，模拟 60fps
}
