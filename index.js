const canvas = document.getElementById("background"),
    ctx = canvas.getContext("2d"),
    aliveColor = "#CC9999",
    deadColor = "black";

let lastTime = Date.now(),
    fps = 60,
    frameTime = 1000 / fps;

let isPaused = false;
let cells = null;
const updateFrequency = 20;
const cellSize = 20;

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

function drawGrid(ctx, width, height, cellSize) {
    ctx.strokeStyle = "#282828";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y <= height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// creates [][] of cells with x, y and alive attributes
function initCells(width, height, cellSize) {
    let cells = [];
    for (let x = 0; x <= width; x += cellSize) {
        cells.push([]);
        for (let y = 0; y <= height; y += cellSize) {
            cells[cells.length - 1].push({ x: x, y: y, alive: false });
        }
    }
    return cells;
}

function fillCell(ctx, cell, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cell.x + 1, cell.y + 1, cellSize - 2, cellSize - 2);
}

function randomize(cells) {
    for (let column of cells) {
        for (let cell of column) {
            cell.alive = Math.random() > 0.7;
        }
    }
}

function clear(cells) {
    for (let column of cells) {
        for (let cell of column) {
            cell.alive = false;
        }
    }
}

function fillAliveCells(ctx, cells) {
    for (let column of cells) {
        for (let cell of column) {
            fillCell(ctx, cell, cell.alive ? aliveColor : deadColor);
        }
    }
}

function panicOnLastundef(msg, x, y, cells, cell) {
    if (cells.length > 0 && cells[cells.length - 1] === undefined) {
        fillCell(ctx, cell, "red");
        console.error(msg, x, y, cells);
    }
}

function getNeighbours(x, y, cells) {
    let n = [];

    if (x >= 1) {
        if (y >= 1) {
            n.push(cells[x - 1][y - 1]);
        }
        if (y < cells[x - 1].length - 1) {
            // Correct boundary check
            n.push(cells[x - 1][y + 1]);
        }
        n.push(cells[x - 1][y]);
    }

    if (x < cells.length - 1) {
        // Correct boundary check
        if (y >= 1) {
            n.push(cells[x + 1][y - 1]);
        }
        if (y < cells[x + 1].length - 1) {
            // Correct boundary check
            n.push(cells[x + 1][y + 1]);
        }
        n.push(cells[x + 1][y]);
    }

    if (y >= 1) {
        n.push(cells[x][y - 1]);
    }
    if (y < cells[x].length - 1) {
        // Correct boundary check
        n.push(cells[x][y + 1]);
    }

    return n;
}

function applyGameRules(cells) {
    let nextCells = [];
    for (let i = 0; i < cells.length; i++) {
        let next = [];
        for (let j = 0; j < cells[i].length; j++) {
            let neighbours = getNeighbours(i, j, cells);
            let aliveN = neighbours.filter((n) => n.alive).length;

            // Any alive cell...
            if (cells[i][j].alive) {
                // with fewer than two live neighbours dies, as if by underpopulation.
                // with more than three live neighbours dies, as if by overpopulation.
                if (aliveN < 2 || aliveN > 3) {
                    next.push({
                        alive: false,
                        x: cells[i][j].x,
                        y: cells[i][j].y,
                    });
                    continue;
                }

                // with two or three live neighbours lives on to the next generation.
                next.push({ alive: true, x: cells[i][j].x, y: cells[i][j].y });
            } else {
                //Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                if (aliveN === 3) {
                    next.push({
                        alive: true,
                        x: cells[i][j].x,
                        y: cells[i][j].y,
                    });
                    continue;
                }

                next.push({
                    alive: false,
                    x: cells[i][j].x,
                    y: cells[i][j].y,
                });
            }
        }
        nextCells.push(next);
    }

    return nextCells;
}

async function update(i, ctx, cells, lastTime) {
    let now = Date.now();
    let delta = lastTime - now;

    if (i % updateFrequency === 0) {
        cells = applyGameRules(cells);
        fillAliveCells(ctx, cells);
    }

    wait = Math.max(0, frameTime - (Date.now() - lastTime));
    lastTime = now;
    await sleep(wait);
    return [cells, lastTime];
}

async function startApplication() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    drawGrid(ctx, canvas.width, canvas.height, cellSize);
    cells = initCells(canvas.width, canvas.height, cellSize);
    let i = 0;

    randomize(cells);

    while (true) {
        if (isPaused) {
            await sleep(1);
            continue;
        }
        [cells, lastTime] = await update(++i, ctx, cells, lastTime);
    }
}

function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
}

window.addEventListener("load", () => {
    startApplication();
});

document.querySelector("#start").addEventListener("click", () => {
    lastTime = Date.now();
    isPaused = false;
});

document.querySelector("#stop").addEventListener("click", () => {
    isPaused = true;
});

document.querySelector("#randomize").addEventListener("click", async () => {
    randomize(cells);
    if (isPaused) {
        await update(updateFrequency, ctx, cells, lastTime);
    }
});

document.querySelector("#clear").addEventListener("click", async () => {
    clear(cells);
    if (isPaused) {
        await update(updateFrequency, ctx, cells, lastTime);
    }
});

// Event listener for mouse click
canvas.addEventListener("click", (event) => {
    const mousePos = getMousePos(canvas, event);

    for (let column of cells) {
        for (let cell of column) {
            if (
                mousePos.x >= cell.x &&
                mousePos.x <= cell.x + cellSize &&
                mousePos.y >= cell.y &&
                mousePos.y <= cell.y + cellSize
            ) {
                cell.alive = !cell.alive;
                fillCell(ctx, cell, cell.alive ? aliveColor : deadColor);
            }
        }
    }
});
