let w = (c.width = window.innerWidth),
  h = (c.height = window.innerHeight),
  ctx = c.getContext("2d"),
  hw = w / 2;
(hh = h / 2),
  (opts = {
    strings: ["Mừng","sinh","nhật","Tú","ngu"],
    charSize: 30,
    charSpacing: 35,
    lineHeight: 40,

    cx: w / 2,
    cy: h / 2,

    phaohoaPrevPoints: 10,
    phaohoaBaseLineWidth: 5,
    phaohoaAddedLineWidth: 8,
    phaohoaSpawnTime: 200,
    phaohoaBaseReachTime: 30,
    phaohoaAddedReachTime: 30,
    phaohoaCircleBaseSize: 20,
    phaohoaCircleAddedSize: 10,
    phaohoaCircleBaseTime: 30,
    phaohoaCircleAddedTime: 30,
    phaohoaCircleFadeBaseTime: 10,
    phaohoaCircleFadeAddedTime: 5,
    phaohoaBaseShards: 5,
    phaohoaAddedShards: 5,
    phaohoaShardPrevPoints: 3,
    phaohoaShardBaseVel: 4,
    phaohoaShardAddedVel: 2,
    phaohoaShardBaseSize: 3,
    phaohoaShardAddedSize: 3,
    gravity: 0.1,
    upFlow: -0.1,
    letterContemplatingWaitTime: 360,
    bongSpawnTime: 20,
    bongBaseInflateTime: 10,
    bongAddedInflateTime: 10,
    bongBaseSize: 20,
    bongAddedSize: 20,
    bongBaseVel: 0.4,
    bongAddedVel: 0.4,
    bongBaseRadian: -(Math.PI / 2 - 0.5),
    bongAddedRadian: -1,
  }),
  (calc = {
    totalWidth:
      opts.charSpacing *
      Math.max(opts.strings[0].length, opts.strings[1].length),
  }),
  (Tau = Math.PI * 2),
  (TauQuarter = Tau / 4),
  (letters = []);

ctx.font = opts.charSize + "px Verdana";

function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;

  this.dx = -ctx.measureText(char).width / 2;
  this.dy = +opts.charSize / 2;

  this.phaohoaDy = this.y - hh;

  var hue = (x / calc.totalWidth) * 360;

  this.color = "hsl(hue,80%,50%)".replace("hue", hue);
  this.lightAlphaColor = "hsla(hue,80%,light%,alp)".replace("hue", hue);
  this.lightColor = "hsl(hue,80%,light%)".replace("hue", hue);
  this.alphaColor = "hsla(hue,80%,50%,alp)".replace("hue", hue);

  this.reset();
}
Letter.prototype.reset = function () {
  this.phase = "phaohoa";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.phaohoaSpawnTime * Math.random()) | 0;
  this.reachTime =
    (opts.phaohoaBaseReachTime + opts.phaohoaAddedReachTime * Math.random()) |
    0;
  this.lineWidth =
    opts.phaohoaBaseLineWidth + opts.phaohoaAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
};
Letter.prototype.step = function () {
  if (this.phase === "phaohoa") {
    if (!this.spawned) {
      ++this.tick;
      if (this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;

      var linearProportion = this.tick / this.reachTime,
        armonicProportion = Math.sin(linearProportion * TauQuarter),
        x = linearProportion * this.x,
        y = hh + armonicProportion * this.phaohoaDy;

      if (this.prevPoints.length > opts.phaohoaPrevPoints)
        this.prevPoints.shift();

      this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

      var lineWidthProportion = 1 / (this.prevPoints.length - 1);

      for (var i = 1; i < this.prevPoints.length; ++i) {
        var point = this.prevPoints[i],
          point2 = this.prevPoints[i - 1];

        ctx.strokeStyle = this.alphaColor.replace(
          "alp",
          i / this.prevPoints.length
        );
        ctx.lineWidth = point[2] * lineWidthProportion * i;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }

      if (this.tick >= this.reachTime) {
        this.phase = "contemplate";

        this.circleFinalSize =
          opts.phaohoaCircleBaseSize +
          opts.phaohoaCircleAddedSize * Math.random();
        this.circleCompleteTime =
          (opts.phaohoaCircleBaseTime +
            opts.phaohoaCircleAddedTime * Math.random()) |
          0;
        this.circleCreating = true;
        this.circleFading = false;

        this.circleFadeTime =
          (opts.phaohoaCircleFadeBaseTime +
            opts.phaohoaCircleFadeAddedTime * Math.random()) |
          0;
        this.tick = 0;
        this.tick2 = 0;

        this.shards = [];

        var shardCount =
            (opts.phaohoaBaseShards +
              opts.phaohoaAddedShards * Math.random()) |
            0,
          angle = Tau / shardCount,
          cos = Math.cos(angle),
          sin = Math.sin(angle),
          x = 1,
          y = 0;

        for (var i = 0; i < shardCount; ++i) {
          var x1 = x;
          x = x * cos - y * sin;
          y = y * cos + x1 * sin;

          this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
        }
      }
    }
  } else if (this.phase === "contemplate") {
    ++this.tick;

    if (this.circleCreating) {
      ++this.tick2;
      var proportion = this.tick2 / this.circleCompleteTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 50 + 50 * proportion)
        .replace("alp", proportion);
      ctx.beginPath();
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 > this.circleCompleteTime) {
        this.tick2 = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if (this.circleFading) {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      ++this.tick2;
      var proportion = this.tick2 / this.circleFadeTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 100)
        .replace("alp", 1 - armonic);
      ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
    }

    for (var i = 0; i < this.shards.length; ++i) {
      this.shards[i].step();

      if (!this.shards[i].alive) {
        this.shards.splice(i, 1);
        --i;
      }
    }

    if (this.tick > opts.letterContemplatingWaitTime) {
      this.phase = "bong";

      this.tick = 0;
      this.spawning = true;
      this.spawnTime = (opts.bongSpawnTime * Math.random()) | 0;
      this.inflating = false;
      this.inflateTime =
        (opts.bongBaseInflateTime +
          opts.bongAddedInflateTime * Math.random()) |
        0;
      this.size =
        (opts.bongBaseSize + opts.bongAddedSize * Math.random()) | 0;

      var rad =
          opts.bongBaseRadian + opts.bongAddedRadian * Math.random(),
        vel = opts.bongBaseVel + opts.bongAddedVel * Math.random();

      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
    }
  } else if (this.phase === "bong") {
    ctx.strokeStyle = this.lightColor.replace("light", 80);

    if (this.spawning) {
      ++this.tick;
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.spawnTime) {
        this.tick = 0;
        this.spawning = false;
        this.inflating = true;
      }
    } else if (this.inflating) {
      ++this.tick;

      var proportion = this.tick / this.inflateTime,
        x = (this.cx = this.x),
        y = (this.cy = this.y - this.size * proportion);

      ctx.fillStyle = this.alphaColor.replace("alp", proportion);
      ctx.beginPath();
      generatebongPath(x, y, this.size * proportion);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, this.y);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.inflateTime) {
        this.tick = 0;
        this.inflating = false;
      }
    } else {
      this.cx += this.vx;
      this.cy += this.vy += opts.upFlow;

      ctx.fillStyle = this.color;
      ctx.beginPath();
      generatebongPath(this.cx, this.cy, this.size);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx, this.cy + this.size);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

      if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw)
        this.phase = "done";
    }
  }
};
function Shard(x, y, vx, vy, color) {
  var vel =
    opts.phaohoaShardBaseVel + opts.phaohoaShardAddedVel * Math.random();

  this.vx = vx * vel;
  this.vy = vy * vel;

  this.x = x;
  this.y = y;

  this.prevPoints = [[x, y]];
  this.color = color;

  this.alive = true;

  this.size =
    opts.phaohoaShardBaseSize + opts.phaohoaShardAddedSize * Math.random();
}
Shard.prototype.step = function () {
  this.x += this.vx;
  this.y += this.vy += opts.gravity;

  if (this.prevPoints.length > opts.phaohoaShardPrevPoints)
    this.prevPoints.shift();

  this.prevPoints.push([this.x, this.y]);

  var lineWidthProportion = this.size / this.prevPoints.length;

  for (var k = 0; k < this.prevPoints.length - 1; ++k) {
    var point = this.prevPoints[k],
      point2 = this.prevPoints[k + 1];

    ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
    ctx.lineWidth = k * lineWidthProportion;
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.stroke();
  }

  if (this.prevPoints[0][1] > hh) this.alive = false;
};
function generatebongPath(x, y, size) {
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x - size / 2,
    y - size / 2,
    x - size / 4,
    y - size,
    x,
    y - size
  );
  ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
}

function anim() {
  window.requestAnimationFrame(anim);

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);

  ctx.translate(hw, hh);

  var done = true;
  for (var l = 0; l < letters.length; ++l) {
    letters[l].step();
    if (letters[l].phase !== "done") done = false;
  }

  ctx.translate(-hw, -hh);

  if (done) for (var l = 0; l < letters.length; ++l) letters[l].reset();
}

for (let i = 0; i < opts.strings.length; ++i) {
  for (var j = 0; j < opts.strings[i].length; ++j) {
    letters.push(
      new Letter(
        opts.strings[i][j],
        j * opts.charSpacing +
          opts.charSpacing / 2 -
          (opts.strings[i].length * opts.charSize) / 2,
        i * opts.lineHeight +
          opts.lineHeight / 2 -
          (opts.strings.length * opts.lineHeight) / 2
      )
    );
  }
}

anim();

window.addEventListener("resize", function () {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;

  hw = w / 2;
  hh = h / 2;

  ctx.font = opts.charSize + "px Verdana";
});
