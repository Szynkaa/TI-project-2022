const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");

let animationStop = false;
let moves;
const nodes = [];
const worker = new Worker("sort.js");

worker.addEventListener('message', function (e) {
    if (e.data === 'unknown') {
        console.log("Error from webworker, shouldn't occur");
        return;
    }

    animationStop = true;
    const offset = 30 + (12 - e.data.array.length) * 20;
    nodes.length = 0;
    for (let i = 0; i < e.data.array.length; ++i) {
        nodes.push(new Node(e.data.array[i], offset + (Node.nodeSize + 10) * i, 70));
    }
    moves = e.data.moves;

    drawAll();
}, false);

function finishLoading() {
    sortOrNChange();
    if (sessionStorage.getItem("api key")) {
        document.getElementById("saving").style.display = "block";
    }
}

function sortOrNChange() {
    const sortSelect = document.getElementById("sortType");
    const header = document.getElementById("forCanvas").firstElementChild;
    console.log(sortSelect.selectedIndex);
    console.log(sortSelect.options);
    console.log(sortSelect.options[0]);
    header.innerHTML = "Sortowanie " + sortSelect.options[sortSelect.selectedIndex].innerText;
    const n = document.getElementById("n").value;
    worker.postMessage({ sortName: sortSelect.value, n: n });
}

function start() {
    animationStop = false;
    animate();
}

function stop() {
    animationStop = true;
}

function linear(begin, end, t) {
    return begin + (end - begin) * t;
}

function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let changed = false;
    for (let i = 0; i < nodes.length; ++i) {
        if (nodes[i].draw(ctx)) {
            changed = true;
        }
    }
    return changed;
}

function animate() {
    const changed = drawAll();

    if (animationStop || !changed && moves.length == 0) {
        return;
    }

    if (!changed && moves.length > 0) {
        const { i, j, swapped } = moves.shift();

        nodes[i].moveBy(0, -40);
        nodes[j].moveBy(0, +40);
        if (swapped) {
            const diff = nodes[j].x - nodes[i].x;
            nodes[i].moveBy(diff, 0);
            nodes[j].moveBy(-diff, 0);
        }
        nodes[i].moveBy(0, +40);
        nodes[j].moveBy(0, -40);
        if (swapped) [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
    }

    requestAnimationFrame(animate);
}
