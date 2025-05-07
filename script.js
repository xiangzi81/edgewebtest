let interval;
function startSession() {
  const minutes = parseInt(document.getElementById("duration").value);
  const totalSeconds = minutes * 60;
  const startTime = Date.now();

  const phases = [
    { time: 0, message: "开始热身…" },
    { time: 0.2, message: "保持边缘，集中注意力。" },
    { time: 0.5, message: "放慢一点，不要射。" },
    { time: 0.8, message: "差不多了，坚持住！" },
    { time: 1.0, message: "现在可以释放了（或按指令）" },
  ];

  clearInterval(interval);
  interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = totalSeconds - elapsed;

    if (remaining <= 0) {
      clearInterval(interval);
      document.getElementById("timer").textContent = "00:00";
      document.getElementById("message").textContent = "结束！干得不错。";
      return;
    }

    // 更新计时器
    const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
    const secs = String(remaining % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${mins}:${secs}`;

    // 更新提示
    const progress = (elapsed / totalSeconds).toFixed(2);
    for (let i = phases.length - 1; i >= 0; i--) {
      if (progress >= phases[i].time) {
        document.getElementById("message").textContent = phases[i].message;
        break;
      }
    }
  }, 1000);
}
