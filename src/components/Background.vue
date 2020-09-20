<template>
  <div class="background" ref="background">
    <canvas id="background-lines" ref="canvas"></canvas>
  </div>
</template>

<script>
import Painter from "@/lib/painter";
export default {
  name: "BackgroundLines",
  props: ['color'],
  data() {
    return {
      painter: undefined,
      lines: [],
      timer: 0
    };
  },
  methods: {
    random(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    paint() {
      this.lines.forEach(line => {
        this.incCoords(line);
        this.painter.setStroke(this.color, 2);

        if (line.type == "line") {
          this.painter.makePath([line.x1, line.y1, line.x2, line.y2]);
        } else if(line.type == "circle") {
          this.painter.setStroke(this.color, 2);
          this.painter.setFill(this.color);
          this.painter.makeCircle(line.x1, line.y1, 30);
        } else if(line.type == "hash") {
          let dirx = this.random(0,1) ? 1 : -1;
			    let diry = this.random(0,1) ? 1 : -1;

			    let offset = this.random(0,200)
          this.painter.makePath([line.x1, line.y2, line.x1 + (dirx * offset),  line.y1 + (diry * offset)])
        }
      });
    },
    toRgba(color) {
      return `rgba(${color.r}, ${color.g}, ${color.b}, .1`;
    },
    incCoords(line) {
      let amt = line.line ? 15: 20;
      line.x1 = this.clamp(line.x1 + this.random(-amt, amt), 0, this.width);
      line.x2 = this.clamp(line.x2 + this.random(-amt, amt), 0, this.width);
      line.y1 = this.clamp(line.y1 + this.random(-amt, amt), 0, this.height);
      line.y2 = this.clamp(line.y2 + this.random(-amt, amt), 0, this.height);
    },
   
    clamp(value, l, h) {
      return Math.max(l, Math.min(h, value));
    },
    randomColor() {
      return {
        r: this.random(0, 255),
        g: this.random(0, 255),
        b: this.random(0, 255)
      };
    },
    addLine(line) {
      this.lines.push({
        color: this.randomColor(),
        x1: this.random(0, this.width),
        x2: this.random(0, this.width),
        y1: this.random(0, this.height),
        y2: this.random(0, this.height),
        type: line
      });
    }
  },
  mounted() {
    let width = (this.width = this.$refs.background.offsetWidth);
    let height = (this.height = this.$refs.background.offsetHeight);

    this.painter = new Painter(this.$refs.canvas, width, height);
    let type = ["line", "circle", "hash"][this.random(0, 3)]
    this.addLine(type);
    console.log(type)
    // this.addLine(line);
    // this.addLine(line);
    // this.addLine(line);
    //tahis.addLine();
    let start = Date.now();
    // while (Date.now() - 251 < start) {
    //   this.paint();
    // }

    setInterval(this.paint, 100)
  },
  destroyed() {
    cancelInterval(this.timer);
  }
};
</script>

<style>
.background {
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: -2;
}

#background-lines {
  width: 100%;
  height: 100%;
}
</style>
