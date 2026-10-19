/* 贪吃蛇 - 纯原生实现，无任何外部依赖 */
(function () {
  'use strict';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var lengthEl = document.getElementById('length');
  var overlay = document.getElementById('overlay');
  var overlayTitle = document.getElementById('overlay-title');
  var overlayText = document.getElementById('overlay-text');
  var startBtn = document.getElementById('start-btn');
  var pauseBtn = document.getElementById('pause-btn');

  var COLS = 20;
  var ROWS = 20;
  var BASE_TICK = 150;
  var MIN_TICK = 72;
  var TICK_STEP = 4.5;
  var BEST_KEY = 'snake-best-score';

  var state = {
    snake: [],
    dir: { x: 1, y: 0 },
    queue: [],
    food: { x: 0, y: 0 },
    score: 0,
    status: 'idle',
    tick: BASE_TICK,
    acc: 0,
    lastTime: 0,
    cell: 26,
    size: 520,
    flash: 0
  };

  /* ---------- 最高分 ---------- */
  function readBest() {
    try {
      var v = parseInt(window.localStorage.getItem(BEST_KEY), 10);
      return isNaN(v) ? 0 : v;
    } catch (e) {
      return 0;
    }
  }

  function saveBest(v) {
    try {
      window.localStorage.setItem(BEST_KEY, String(v));
    } catch (e) { /* 隐私模式下忽略 */ }
  }

  /* ---------- 初始化一局 ---------- */
  function reset() {
    state.snake = [
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 }
    ];
    state.dir = { x: 1, y: 0 };
    state.queue = [];
    state.score = 0;
    state.tick = BASE_TICK;
    state.acc = 0;
    state.flash = 0;
    placeFood();
    updateHud();
  }

  function placeFood() {
    var occupied = {};
    for (var i = 0; i < state.snake.length; i++) {
      occupied[state.snake[i].x + ',' + state.snake[i].y] = true;
    }
    var free = [];
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if (!occupied[x + ',' + y]) free.push({ x: x, y: y });
      }
    }
    state.food = free.length ? free[Math.floor(Math.random() * free.length)] : { x: 0, y: 0 };
  }

  function updateHud() {
    scoreEl.textContent = String(state.score);
    bestEl.textContent = String(readBest());
    lengthEl.textContent = String(state.snake.length);
  }

  /* ---------- 状态切换 ---------- */
  function showOverlay(title, text, btnLabel) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = btnLabel;
    overlay.hidden = false;
  }

  function hideOverlay() {
    overlay.hidden = true;
  }

  function startGame() {
    if (state.status === 'over' || state.status === 'idle') {
      reset();
    }
    state.status = 'running';
    state.lastTime = 0;
    hideOverlay();
  }

  function togglePause() {
    if (state.status === 'running') {
      state.status = 'paused';
      showOverlay('已暂停', '按空格键或点下方按钮继续游戏', '继续游戏');
    } else if (state.status === 'paused') {
      state.status = 'running';
      state.lastTime = 0;
      hideOverlay();
    }
  }

  function gameOver() {
    state.status = 'over';
    var best = readBest();
    var isNew = state.score > best;
    if (isNew) saveBest(state.score);
    updateHud();
    showOverlay(
      isNew ? '新纪录！' : '游戏结束',
      '本局得分 ' + state.score + ' 分 · 长度 ' + state.snake.length + ' 节',
      '再来一局'
    );
  }

  /* ---------- 方向 ---------- */
  function pushDir(nx, ny) {
    if (state.status === 'over' || state.status === 'paused') return;
    if (state.status === 'idle') startGame();

    var ref = state.queue.length ? state.queue[state.queue.length - 1] : state.dir;
    if (ref.x === -nx && ref.y === -ny) return;
    if (ref.x === nx && ref.y === ny) return;
    if (state.queue.length < 2) state.queue.push({ x: nx, y: ny });
  }

  var DIR_MAP = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  };

  /* ---------- 单步推进 ---------- */
  function step() {
    if (state.queue.length) {
      var next = state.queue.shift();
      state.dir = next;
    }

    var head = state.snake[0];
    var nx = head.x + state.dir.x;
    var ny = head.y + state.dir.y;

    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
      gameOver();
      return;
    }

    for (var i = 0; i < state.snake.length - 1; i++) {
      if (state.snake[i].x === nx && state.snake[i].y === ny) {
        gameOver();
        return;
      }
    }

    state.snake.unshift({ x: nx, y: ny });

    if (nx === state.food.x && ny === state.food.y) {
      state.score += 10;
      state.tick = Math.max(MIN_TICK, BASE_TICK - state.score * TICK_STEP * 0.1);
      state.flash = 1;
      placeFood();
      updateHud();
    } else {
      state.snake.pop();
    }
  }

  /* ---------- 渲染 ---------- */
  function roundRect(x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawGrid(cell) {
    ctx.save();
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.055)';
    ctx.lineWidth = 1;
    for (var i = 1; i < COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, ROWS * cell);
      ctx.stroke();
    }
    for (var j = 1; j < ROWS; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * cell);
      ctx.lineTo(COLS * cell, j * cell);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFood(cell, t) {
    var fx = state.food.x * cell + cell / 2;
    var fy = state.food.y * cell + cell / 2;
    var pulse = 1 + Math.sin(t / 260) * 0.14;
    var r = cell * 0.31 * pulse;

    ctx.save();
    ctx.shadowColor = 'rgba(255, 45, 149, 0.9)';
    ctx.shadowBlur = cell * 0.9;
    ctx.fillStyle = '#ff2d95';
    ctx.beginPath();
    ctx.arc(fx, fy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(fx - r * 0.28, fy - r * 0.3, r * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSnake(cell) {
    var len = state.snake.length;

    for (var i = len - 1; i >= 0; i--) {
      var seg = state.snake[i];
      var k = len > 1 ? i / (len - 1) : 0;
      var pad = cell * 0.055;
      var x = seg.x * cell + pad;
      var y = seg.y * cell + pad;
      var s = cell - pad * 2;

      var green = Math.round(255 - k * 130);
      var alpha = 1 - k * 0.42;

      ctx.save();
      if (i === 0) {
        ctx.shadowColor = 'rgba(57, 255, 20, 0.85)';
        ctx.shadowBlur = cell * 0.75;
        ctx.fillStyle = '#8dff6a';
      } else {
        ctx.shadowColor = 'rgba(57, 255, 20, 0.28)';
        ctx.shadowBlur = cell * 0.3;
        ctx.fillStyle = 'rgba(57, ' + green + ', 60, ' + alpha + ')';
      }
      roundRect(x, y, s, s, cell * 0.26);
      ctx.fill();
      ctx.restore();

      if (i === 0) {
        drawEyes(seg, cell);
      }
    }
  }

  function drawEyes(seg, cell) {
    var cx = seg.x * cell + cell / 2;
    var cy = seg.y * cell + cell / 2;
    var d = state.dir;
    var off = cell * 0.17;
    var eyeR = cell * 0.075;
    var side = cell * 0.15;

    var ex = cx + d.x * off;
    var ey = cy + d.y * off;
    var px = d.x === 0 ? side : 0;
    var py = d.y === 0 ? side : 0;

    ctx.save();
    ctx.fillStyle = '#04140a';
    ctx.beginPath();
    ctx.arc(ex + px, ey + py, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex - px, ey - py, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw(t) {
    var size = state.size;
    var cell = state.cell;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#04060a';
    ctx.fillRect(0, 0, size, size);

    drawGrid(cell);
    drawFood(cell, t);
    drawSnake(cell);

    if (state.flash > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(57, 255, 20, ' + state.flash * 0.1 + ')';
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
      state.flash = Math.max(0, state.flash - 0.08);
    }
  }

  /* ---------- 主循环 ---------- */
  function loop(ts) {
    window.requestAnimationFrame(loop);

    if (!state.lastTime) state.lastTime = ts;
    var dt = Math.min(ts - state.lastTime, 120);
    state.lastTime = ts;

    if (state.status === 'running') {
      state.acc += dt;
      var guard = 0;
      while (state.acc >= state.tick && guard < 4) {
        state.acc -= state.tick;
        guard++;
        step();
        if (state.status !== 'running') break;
      }
    }

    draw(ts);
  }

  /* ---------- 尺寸自适应 ---------- */
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var size = Math.round(rect.width) || 320;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    state.size = size;
    state.cell = size / COLS;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(performance.now());
  }

  /* ---------- 键盘 ---------- */
  var KEY_MAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right'
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (state.status === 'idle' || state.status === 'over') {
        startGame();
      } else {
        togglePause();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (state.status === 'over' || state.status === 'idle') startGame();
      return;
    }

    var name = KEY_MAP[e.key];
    if (!name) return;
    e.preventDefault();
    var v = DIR_MAP[name];
    pushDir(v[0], v[1]);
  });

  /* ---------- 屏幕方向键 ---------- */
  var dirButtons = document.querySelectorAll('.dpad-btn[data-dir]');
  Array.prototype.forEach.call(dirButtons, function (btn) {
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var v = DIR_MAP[btn.getAttribute('data-dir')];
      if (!v) return;
      pushDir(v[0], v[1]);
      btn.classList.add('is-pressed');
      window.setTimeout(function () { btn.classList.remove('is-pressed'); }, 120);
    });
  });

  pauseBtn.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (state.status === 'idle' || state.status === 'over') {
      startGame();
    } else {
      togglePause();
    }
  });

  startBtn.addEventListener('click', function () {
    if (state.status === 'paused') {
      togglePause();
    } else {
      startGame();
    }
  });

  /* ---------- 触屏滑动 ---------- */
  var touchStart = null;

  canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  canvas.addEventListener('touchmove', function (e) {
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', function (e) {
    if (!touchStart) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStart.x;
    var dy = t.clientY - touchStart.y;
    touchStart = null;

    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
      if (state.status === 'idle' || state.status === 'over') startGame();
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      pushDir(dx > 0 ? 1 : -1, 0);
    } else {
      pushDir(0, dy > 0 ? 1 : -1);
    }
  }, { passive: true });

  /* ---------- 切到后台自动暂停 ---------- */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state.status === 'running') togglePause();
  });

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function () {
    window.setTimeout(resize, 220);
  });

  /* ---------- 启动 ---------- */
  reset();
  resize();
  bestEl.textContent = String(readBest());
  showOverlay('准备开始', '按方向键 / WASD 开始，手机请点下方按钮', '开始游戏');
  window.requestAnimationFrame(loop);
})();
