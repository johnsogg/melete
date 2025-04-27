import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <p>Here you can draw stuff.</p>
    <canvas id="melete" tabindex="0"></canvas>
  </div>
`;

const canvas = document.getElementById("melete") as HTMLCanvasElement;

const ctx = canvas.getContext("2d");

if (ctx) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;

  let isDrawing = false;
  let lastX: number;
  let lastY: number;

  function draw(e: MouseEvent) {
    if (!isDrawing) return;
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
  }

  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    // Focus the canvas when the user starts drawing
    canvas.focus();
  });

  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", () => (isDrawing = false));

  // Consider using keydown instead of keypress
  canvas.addEventListener("keydown", (e) => {
    console.log("Key pressed:", e.key);
    if (e.key === "c") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  });

  // Focus the canvas initially
  canvas.focus();
}

const george = canvas.getContext("2d");
if (george) {
  george.fillStyle = "red";
  george.fillRect(50, 50, 100, 100);
}
