class Node {
    static nodeSize = 30;

    constructor(value, x, y) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.queue = [];
    }

    draw(ctx) {
        let changed = false;
        if (this.queue.length > 0) {
            changed = true;
            const { x, y } = this.queue.shift();
            this.x = x;
            this.y = y;
        }

        const left = this.x - Node.nodeSize / 2;
        const top = this.y - Node.nodeSize / 2;
        ctx.fillStyle = "#006600";
        ctx.fillRect(left, top, Node.nodeSize, Node.nodeSize);

        ctx.fillStyle = "#ccffcc"
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.value, this.x, this.y + 8);

        return changed;
    }

    endPosition() {
        if (this.queue.length > 0) {
            return this.queue[this.queue.length - 1];
        } else {
            return { x: this.x, y: this.y };
        }
    }

    moveTo(newx, newy, frameCount = 20) {
        const { x, y } = this.endPosition();
        for (let i = 1; i <= frameCount; ++i) {
            const t = i / frameCount;
            this.queue.push({
                x: linear(x, newx, t),
                y: linear(y, newy, t)
            });
        }
    }

    moveBy(dx, dy, frameCount = 20) {
        const { x, y } = this.endPosition();
        this.moveTo(x + dx, y + dy, frameCount);
    }
}
