import tinycolor from "tinycolor2"

export default class Painter {

    constructor(canvas, w, h) {
        this.canvas = canvas;
        this.w = w;
        this.h = h;
        this.ctx = this.canvas.getContext("2d")
        this.history = []

        this.commitHistory = 0;

        this._setupCanvas();
        this.setFill()
        this.setStroke("#000", 3)
    }

    _setupCanvas() {
        this.canvas.width = this.w;
        this.canvas.height = this.h;

        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;


        this.buffer = document.createElement('canvas');
        this.buffer.width = this.canvas.width;
        this.buffer.height = this.canvas.height;
        this.bufferCtx = this.buffer.getContext("2d")
        this.updateSnapshot()
    }

    clear(color) {
        color = color || "#fff"
        let oldColor = this.fill;
        this.setFill(color)

        this.makeRect(0, 0, this.w, this.h)

        this.setFill(oldColor)
    }

    reset(color) {
        this.clear(color);
        this.history = [];
        this.updateSnapshot();
    }

    last() {
        this.ctx.drawImage(this.buffer, 0, 0)
    }

    updateSnapshot() {
        this.bufferCtx.drawImage(this.canvas, 0, 0)
    }

    requestPointerLock() {
        //  this.canvas.requestPointerLock()
    }

    releasePointerLock() {
        //  document.exitPointerLock();
    }

    commit() {
        this.updateSnapshot()
        let canvas = document.createElement("canvas")
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        canvas.getContext('2d').drawImage(this.canvas, 0, 0)
        this.history.push(canvas)
        this.commitHistory = this.history.length;
    }

    undo() {
        console.log(this.commitHistory, this.history.length)

        if (this.history.length == this.commitHistory) {
            this.history.pop()
        }
        if (this.history.length == 0) {
            this.clear();
            this.history.pop()
        } else {
            this.ctx.drawImage(this.history.pop(), 0, 0)
        }
        this.updateSnapshot()
    }

    getImageData() {
        return this.ctx.getImageData(0, 0, this.w, this.h).data
    }

    setImageData(data) {
        let imgdata = new ImageData(new Uint8ClampedArray(data), this.w, this.h)
        this.ctx.putImageData(imgdata, 0, 0)
    }

    setFill(color) {
        this.fill = color
        if (color)
            this.ctx.fillStyle = color
    }

    setStroke(color, size) {
        this.stroke = color;
        this.size = size;

        if (color) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = size || this.ctx.linewidth;
            this.ctx.lineCap = "round"
        }
    }

    getCtx() {
        return this.ctx
    }

    makeRect(x, y, h, w) {
        if (this.fill) {
            this.ctx.fillRect(x, y, h, w);
        } else {
            this.ctx.rect(x, y, h, w)
        }
    }

    makeCircle(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        this.ctx.stroke();

        if (this.fill) {
            this.ctx.fill();
        }
    }

    floodFill(x, y, color, outline) {
        let currentColor = this.getColor(this.getImageData(), x, y)
        color = tinycolor(color || this.stroke).toRgb();
        color.a *= 255
        this._floodFillScan(x, y, color, currentColor, outline)
    }

    _floodFillScan(startX, startY, color, oldColor, outline) {
        if (this.compareColor(color, oldColor)) return;

        let checkAbove = true, checkBelow = true, stack = [], out = [];
        let canvas = [...this.getImageData()]
        let draw = [...canvas]
        stack.push([startX, startY]);

        while (stack.length > 0) {
            let point = stack.shift();
            let x = point[0];
            let y = point[1];

            checkAbove = true;
            checkBelow = true;

            while (this.compareColor(this.getColor(canvas, x, y), oldColor) && x >= 0) x--;
            x++;
            if (outline) {
                this.setColor(draw, x, y, color)
                this.setColor(draw, x + 1, y, color)
                this.setColor(draw, x + 2, y, color)
            }
            while (this.compareColor(this.getColor(canvas, x, y), oldColor) && x < this.w) {
                this.setColor(canvas, x, y, color)
                x++;

                if (y - 1 >= 0 && this.compareColor(this.getColor(canvas, x, y - 1), oldColor)) {
                    if (checkAbove) {
                        stack.push([x, y - 1])
                        checkAbove = false;
                    }
                } else {
                    checkAbove = true;
                }

                if (y + 1 < this.h && this.compareColor(this.getColor(canvas, x, y + 1), oldColor)) {
                    if (checkBelow) {
                        stack.push([x, y + 1])
                        checkBelow = false
                    }
                } else {
                    checkBelow = true
                }

            }
            if (outline) {
                this.setColor(draw, x - 1, y, color)
                this.setColor(draw, x - 2, y, color)
                this.setColor(draw, x - 3, y, color)
            }
        }

        this.setImageData(outline ? draw : canvas)

    }

    setPixel(x, y) {
        this.setColor(this.snapshot, x, y, this.stroke)
    }

    makePath(points) {
        points = [...points]
        this.ctx.beginPath();
        this.ctx.moveTo(points.shift(), points.shift());

        while (points.length > 0) {
            this.ctx.lineTo(points.shift(), points.shift())
        }

        this.ctx.stroke();

        if (this.fill) {
            this.ctx.fill();
        }
    }

    setColor(data, x, y, color) {
        let start = y * (this.w * 4) + x * 4
        data[start] = color.r;
        data[start + 1] = color.g;
        data[start + 2] = color.b;
        data[start + 3] = color.a;
    }

    compareColor(c1, c2) {
        return c1.r == c2.r && c1.g == c2.g && c1.b == c2.b && c1.a == c2.a
    }

    getColor(data, x, y) {
        let start = y * (this.w * 4) + x * 4
        let rgba = {
            r: data[start],
            g: data[start + 1],
            b: data[start + 2],
            a: data[start + 3]
        }
        return rgba
    }

    // _decompress(data) {
    //     return decompress(data, this.w * this.h * 4)
    // }


}