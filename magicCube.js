window.onload = setup;
function setup() {
    "use strict";

    /** @type {HTMLCanvasElement} */
    let observerCanvas = document.getElementById("observerCanvas");
    /** @type {HTMLCanvasElement} */
    let cameraCanvas = document.getElementById("cameraCanvas");

    let slider1 = document.getElementById('slider1');
    slider1.value = 100;
    let slider2 = document.getElementById('slider2');
    slider2.value = 100;

    //国际标准魔方颜色
    const cubeColor = [
        "red", "blue",  "white",
        "orange", "green", "yellow"
    ];


    function draw() {
        if (observerCanvas.getContext)  //确保canvas可用
        {
            let observerContext = observerCanvas.getContext("2d");
            let cameraContext = cameraCanvas.getContext("2d");
            let context = cameraContext; // default to drawing in the camera window

            //重设属性达到清屏效果
            observerCanvas.width = observerCanvas.width;
            cameraCanvas.width = cameraCanvas.width;

            //保证能够720度旋转
            var viewAngle = (slider2.value) * 0.02 * Math.PI;
            var viewAngle1 = (slider1.value) * 0.02 * Math.PI;

            function moveToTx(loc, Tx) {
                var res = vec3.create();
                vec3.transformMat4(res, loc, Tx);
                context.moveTo(res[0], res[1]);
            }

            function lineToTx(loc, Tx) {
                var res = vec3.create();
                vec3.transformMat4(res, loc, Tx);
                context.lineTo(res[0], res[1]);
            }

            function drawCamera(color, TxU, scale) {
                var Tx = mat4.clone(TxU);
                mat4.scale(Tx, Tx, [scale, scale, scale]);
                context.beginPath();
                context.strokeStyle = color;
                // Twelve edges of a cropped pyramid
                moveToTx([-3, -3, -2], Tx); lineToTx([3, -3, -2], Tx);
                lineToTx([3, 3, -2], Tx); lineToTx([-3, 3, -2], Tx);
                moveToTx([3, -3, -2], Tx); lineToTx([2, -2, 0], Tx);
                lineToTx([2, 2, 0], Tx); lineToTx([3, 3, -2], Tx);
                moveToTx([2, -2, 0], Tx); lineToTx([-2, -2, 0], Tx);
                lineToTx([-2, 2, 0], Tx); lineToTx([2, 2, 0], Tx);
                moveToTx([-2, -2, 0], Tx); lineToTx([-3, -3, -2], Tx);
                lineToTx([-3, 3, -2], Tx); lineToTx([-2, 2, 0], Tx);
                context.stroke();
            }

            function drawUVWAxes(color, TxU, scale) {
                var Tx = mat4.clone(TxU);
                mat4.scale(Tx, Tx, [scale, scale, scale]);

                context.strokeStyle = color;
                context.beginPath();
                // Axes
                moveToTx([1.2, 0, 0], Tx); lineToTx([0, 0, 0], Tx); lineToTx([0, 1.2, 0], Tx);
                moveToTx([0, 0, 0], Tx); lineToTx([0, 0, 1.2], Tx);
                // Arrowheads
                moveToTx([1.1, .05, 0], Tx); lineToTx([1.2, 0, 0], Tx); lineToTx([1.1, -.05, 0], Tx);
                moveToTx([.05, 1.1, 0], Tx); lineToTx([0, 1.2, 0], Tx); lineToTx([-.05, 1.1, 0], Tx);
                moveToTx([.05, 0, 1.1], Tx); lineToTx([0, 0, 1.2], Tx); lineToTx([-.05, 0, 1.1], Tx);
                // U-label
                moveToTx([1.3, .05, 0], Tx); lineToTx([1.3, -.035, 0], Tx); lineToTx([1.35, -.05, 0], Tx);
                lineToTx([1.4, -.035, 0], Tx); lineToTx([1.4, .05, 0], Tx);
                // V-label
                moveToTx([-.05, 1.4, 0], Tx); lineToTx([0, 1.3, 0], Tx); lineToTx([.05, 1.4, 0], Tx);
                // W-label
                moveToTx([-.1, 0, 1.3], Tx); lineToTx([-.05, 0, 1.4], Tx); lineToTx([-0, 0, 1.3], Tx);
                lineToTx([.05, 0, 1.4], Tx); lineToTx([.1, 0, 1.3], Tx);

                context.stroke();
            }

            function draw2DAxes(color, Tx) {
                context.strokeStyle = color;
                context.beginPath();
                // Axes
                moveToTx([120, 0, 0], Tx); lineToTx([0, 0, 0], Tx); lineToTx([0, 120, 0], Tx);
                // Arrowheads
                moveToTx([110, 5, 0], Tx); lineToTx([120, 0, 0], Tx); lineToTx([110, -5, 0], Tx);
                moveToTx([5, 110, 0], Tx); lineToTx([0, 120, 0], Tx); lineToTx([-5, 110, 0], Tx);
                // X-label
                moveToTx([130, 0, 0], Tx); lineToTx([140, 10, 0], Tx);
                moveToTx([130, 10, 0], Tx); lineToTx([140, 0, 0], Tx);
                // Y-label
                moveToTx([0, 128, 0], Tx); lineToTx([5, 133, 0], Tx); lineToTx([10, 128, 0], Tx);
                moveToTx([5, 133, 0], Tx); lineToTx([5, 140, 0], Tx);
                context.stroke();
            }

            function bezir(p1, c1, c2, p2, th) {
                return [
                    p1[0] * Math.pow(1 - th, 3) + c1[0] * 3 * th * Math.pow(1 - th, 2)
                    + c2[0] * 3 * Math.pow(th, 2) * (1 - th) + p2[0] * Math.pow(th, 3),
                    p1[1] * Math.pow(1 - th, 3) + c1[1] * 3 * th * Math.pow(1 - th, 2)
                    + c2[1] * 3 * Math.pow(th, 2) * (1 - th) + p2[1] * Math.pow(th, 3),
                    p1[2] * Math.pow(1 - th, 3) + c1[2] * 3 * th * Math.pow(1 - th, 2)
                    + c2[2] * 3 * Math.pow(th, 2) * (1 - th) + p2[2] * Math.pow(th, 3)
                ];
            }

            function drawBezir(p1, c1, c2, p2, Tx) {
                let esp = 1 / 1000;
                for (let index = 0; index <= 1; index += esp) {
                    lineToTx(bezir(p1, c1, c2, p2, index), Tx);
                }
            }

            //画一个四角为loc[i]的color色正方形
            function drawRec(loc, color, Tx) {
                context.strokeStyle = "black";
                context.fillStyle = color;
                context.beginPath();

                let disX = vec3.create();
                vec3.subtract(disX, loc[1], loc[0]);
                let disY = vec3.create();
                vec3.subtract(disY, loc[2], loc[0]);

                let x = vec3.clone(disX);
                vec3.scale(x, x, 1 / 4);

                let y = vec3.clone(disY);
                vec3.scale(y, y, 1 / 4);

                let pos0 = vec3.clone(loc[0]);
                vec3.add(pos0, pos0, x);

                let pos1 = vec3.clone(loc[1]);
                vec3.subtract(pos1, pos1, x);

                let pos2 = vec3.clone(loc[0]);
                vec3.add(pos2, pos2, y);

                let pos3 = vec3.clone(loc[2]);
                vec3.subtract(pos3, pos3, y);

                let pos4 = vec3.clone(loc[2]);
                vec3.add(pos4, pos4, x);

                let pos5 = vec3.clone(loc[3]);
                vec3.subtract(pos5, pos5, x);

                let pos6 = vec3.clone(loc[1]);
                vec3.add(pos6, pos6, y);

                let pos7 = vec3.clone(loc[3]);
                vec3.subtract(pos7, pos7, y);

                moveToTx(pos0, Tx);
                drawBezir(pos0, loc[0], loc[0], pos2, Tx);
                lineToTx(pos3, Tx);
                drawBezir(pos3, loc[2], loc[2], pos4, Tx);
                lineToTx(pos5, Tx);
                drawBezir(pos5, loc[3], loc[3], pos7, Tx);
                lineToTx(pos6, Tx);
                drawBezir(pos6, loc[1], loc[1], pos1, Tx);
                context.closePath();

                // moveToTx(loc[0], Tx);
                // lineToTx(loc[1], Tx);
                // lineToTx(loc[3], Tx);
                // lineToTx(loc[2], Tx);
                context.closePath();
                context.fill();
                context.stroke();
            }

            //画一个四角为loci的魔方的面
            function drawSide(loc, color, Tx) {
                context.strokeStyle = "black";
                context.fillStyle = cubeColor[color[0]];

                let disX = vec3.create();
                vec3.subtract(disX, loc[1], loc[0]);
                let disY = vec3.create();
                vec3.subtract(disY, loc[2], loc[0]);

                let x = vec3.clone(disX);
                vec3.scale(x, x, 1 / 3);

                let y = vec3.clone(disY);
                vec3.scale(y, y, 1 / 3);

                for (let i = 0; i < 9; i++) {
                    let tmp0 = vec3.clone(loc[0]);
                    let tmp1 = vec3.clone(x);
                    vec3.scale(tmp1, tmp1, i % 3);
                    vec3.add(tmp0, tmp0, tmp1);
                    let tmp2 = vec3.clone(y);
                    vec3.scale(tmp2, tmp2, Math.floor(i / 3));
                    vec3.add(tmp0, tmp0, tmp2);

                    let tmp3 = vec3.clone(tmp0);
                    vec3.add(tmp3, tmp3, x);

                    let tmp4 = vec3.clone(tmp0);
                    vec3.add(tmp4, tmp4, y);

                    let tmp5 = vec3.clone(tmp3);
                    vec3.add(tmp5, tmp5, y);

                    drawRec([tmp0, tmp3, tmp4, tmp5], cubeColor[color[i]], Tx);
                }
            }

            //在此处画一个魔方
            function drawCube(state, Tx) {
                context.strokeStyle = "black";
                context.beginPath();

                let loc = [
                    [-75, 75, 75], [-75, -75, 75], [75, 75, 75], [75, -75, 75],
                    [-75, 75, -75], [-75, -75, -75], [75, 75, -75], [75, -75, -75]
                ];

                let pos = [
                    [0, 2, 1, 3], [2, 6, 3, 7], [4, 6, 0, 2],
                    [6, 4, 7, 5], [4, 0, 5, 1], [3, 1, 7, 5]
                ];

                let getLoc = (i) => [loc[pos[i][0]], loc[pos[i][1]],
                loc[pos[i][2]], loc[pos[i][3]]];

                //z-buffer处理深度渲染
                let min = [0, -1];
                for (let i = 0; i < 8; i++) {
                    let tmp = [loc[i][0], loc[i][1], loc[i][2]];
                    vec3.transformMat4(tmp, tmp, Tx);
                    if (min[1] < tmp[2]) {
                        min[0] = i;
                        min[1] = tmp[2];
                    }
                }

                for (let i = 0; i < 6; i++) {
                    if (pos[i].indexOf(min[0]) == -1)
                        drawSide(getLoc(i), state[i], Tx);
                }
            }

            var CameraCurve = function (angle) {
                var distance = 120.0;
                var eye = vec3.create();
                eye[0] = distance * Math.sin(viewAngle);
                eye[1] = 100;
                eye[2] = distance * Math.cos(viewAngle);
                return [eye[0], eye[1], eye[2]];
            }

            var ViewCurve = function (angle) {
                var distance = 500.0;
                var eye = vec3.create();
                eye[0] = 500;
                eye[1] = distance * Math.sin(viewAngle1);
                eye[2] = distance * Math.cos(viewAngle1);
                return [eye[0], eye[1], eye[2]];
            }

            let cubeOperate = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [8, 5, 2]
            ];

            let getState = (i, state) => [
                state[cubeOperate[i][0]], state[cubeOperate[i][1]], state[cubeOperate[i][2]]
            ];

            function cubeL(state) {
                let side = [0, 2, 3, 5];
                let side2 = [2, 3, 5, 0];
                // let tmp = [];
                // for (let index = 0; index < side.length; index++) {
                //     tmp.push(getState(side[index] > 2 ? 5 : 3, state[side[index]]));
                // }
                let tmp = [
                    getState(3, state[0]),
                    getState(3, state[2]),
                    getState(5, state[3]),
                    getState(5, state[5])
                ]

                for (let i = 0; i < 4; i++) {
                    for (let j = 0; j < 3; j++) {
                        state[side2[i]][cubeOperate[side2[i] > 2 ? 5 : 3][j]] = tmp[i][j];
                    }
                }
            }

            var eyeCamera = CameraCurve(viewAngle);
            var targetCamera = vec3.fromValues(0, 0, 0); // Aim at the origin of the world coords
            var upCamera = vec3.fromValues(0, 100, 0); // Y-axis of world coords to be vertical
            var TlookAtCamera = mat4.create();
            mat4.lookAt(TlookAtCamera, eyeCamera, targetCamera, upCamera);

            var eyeObserver = ViewCurve(viewAngle1);
            var targetObserver = vec3.fromValues(0, 50, 0); // Observer still looks at origin
            var upObserver = vec3.fromValues(0, 1, 0); // Y-axis of world coords to be vertical
            var TlookAtObserver = mat4.create();
            mat4.lookAt(TlookAtObserver, eyeObserver, targetObserver, upObserver);

            var Tviewport = mat4.create();
            mat4.fromTranslation(Tviewport, [200, 300, 0]);  // Move the center of the
            mat4.scale(Tviewport, Tviewport, [100, -100, 1]); // Flip the Y-axis,

            context = cameraContext;

            var TprojectionCamera = mat4.create();
            mat4.ortho(TprojectionCamera, -100, 100, -100, 100, -1, 1);

            var TprojectionObserver = mat4.create();
            mat4.ortho(TprojectionObserver, -120, 120, -120, 120, -1, 1);

            var tVP_PROJ_VIEW_Camera = mat4.create();
            mat4.multiply(tVP_PROJ_VIEW_Camera, Tviewport, TprojectionCamera);
            mat4.multiply(tVP_PROJ_VIEW_Camera, tVP_PROJ_VIEW_Camera, TlookAtCamera);
            var tVP_PROJ_VIEW_Observer = mat4.create();
            mat4.multiply(tVP_PROJ_VIEW_Observer, Tviewport, TprojectionObserver);
            mat4.multiply(tVP_PROJ_VIEW_Observer, tVP_PROJ_VIEW_Observer, TlookAtObserver);

            var tVP_PROJ_VIEW_MOD2_Observer = mat4.create();
            mat4.translate(tVP_PROJ_VIEW_MOD2_Observer, tVP_PROJ_VIEW_Observer, eyeCamera);
            var TlookFromCamera = mat4.create();
            mat4.invert(TlookFromCamera, TlookAtCamera);
            mat4.multiply(tVP_PROJ_VIEW_MOD2_Observer, tVP_PROJ_VIEW_MOD2_Observer, TlookFromCamera);


            let cubeState = [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [2, 2, 2, 2, 2, 2, 2, 2],
                [3, 3, 3, 3, 3, 3, 3, 3],
                [4, 4, 4, 4, 4, 4, 4, 4],
                [5, 5, 5, 5, 5, 5, 5, 5]
            ];

            context = cameraContext;
            draw2DAxes("black", mat4.create());
            drawCube(cubeState, tVP_PROJ_VIEW_Camera);
            
            context = observerContext;
            drawCube(cubeState, tVP_PROJ_VIEW_Observer);
            drawCamera("purple", tVP_PROJ_VIEW_MOD2_Observer, 10.0);
            drawUVWAxes("purple", tVP_PROJ_VIEW_MOD2_Observer, 100.0);
        }
    }

    slider1.addEventListener("input", draw);
    slider2.addEventListener("input", draw);
    draw();
}
window.onload = setup;
