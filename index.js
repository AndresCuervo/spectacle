/* p5, tracking */

tracking.ColorTracker.registerColor('blue', function(r, g, b) {
    if (r < 50 && g > 50 && b < 200) {
        return true;
    }
    return false;
});

let colors = ['magenta', 'blue']
let tracker = new tracking.ColorTracker(colors)

let data = {}
let gui = new dat.GUI();

//let canvas = document.getElementById('canvas')
// let context = canvas.getContext('2d')

let video = document.querySelector('#myVideo')

let flip = false;
// Doesn't actually flip the video stream, promise doesn't resolve?
document.getElementById('flip-button').onclick = function() {
    flip = !flip;
    // alert(flip)
    window.stream.applyConstraints({
        video: {
            facingMode: (flip? "user" : "environment")
        }
    })
};

// In order to get back camera we have to override the default tracker video stream
let constraints = {
    audio: false,
    video: { facingMode: (flip? "user" : "environment") } };

tracking.track('#myVideo', tracker, { camera : constraints.video })

// var constraints = window.constraints = {
//   audio: false,
//   video: true // { facingMode: { exact: "environment" } }
// };

function handleSuccess(stream) {
    let videoTracks = stream.getVideoTracks();
    console.log(videoTracks)
    console.log('Got stream with constraints:', constraints);
    // alert('Using video device: ' + videoTracks[0].label + videoTracks[0].readyState);
    stream.oninactive = function() {
        console.log('Stream inactive');
    };
    window.stream = stream; // make variable available to browser console
    // alert('Using video device: ' + videoTracks[0].label)
    video.srcObject = stream;
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess);

let state, pg, canvas, cString

// Resize the canvas to the video size when stream starts
video.addEventListener('loadeddata', e => {
    //alert(video.getBoundingClientRect().height)
    //alert(video.srcObject.getVideoTracks().length)
    window.stream = video.srcObject.getVideoTracks()[0]
    //window.stream.applyConstraints({video : {facingMode: "environment"}})
    //video.srcObject = stream
    //console.log(video.getBoundingClientRect())
    canvasToVideoSize()
})

let textDimensions = {
    x: 30,
    y: 30,
    width: 300,
    height: 60
}

function canvasToVideoSize() {
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    // canvas.position(x, y);

    let dimensions = video.getBoundingClientRect()
    canvas.size(dimensions.width, dimensions.height)
}

function setup() {
    // canvas = createCanvas(window.screen.width, window.screen.height)
    let dimensions = video.getBoundingClientRect()
    canvas = createCanvas(dimensions.width, dimensions.height)

    // Move the canvas so it's inside our <div id="sketch-holder">.
    canvas.parent('sketch-holder')

    background(255, 0, 200)

    state = {
        r: 0,
        sw: 3
    }


    gui.add(state, "sw", 0, 10);

    pg = createGraphics(100, 100)
    pg.position.x -= 9999

    cString = colors.join(' or ')


    // pg.clear();
    // pg.noFill();
    // pg.stroke(255);
    // ellipse(40, 40, 40, 40)
    canvasToVideoSize()
}

function draw() {
    clear()
    if (flip) {
        return
    }
    // fill(255);
    // noStroke();
    // ellipse(mouseX, mouseY, 60, 60);

    pg.background(51);
    pg.noFill();
    pg.stroke(255);
    // pg.ellipse(mouseX-pg.width/2, mouseY-pg.height/2, 60, 60);
    let r = Math.sin(performance.now() / 1000)
    pg.ellipse(pg.width / 4, pg.height / 4, r * pg.width / 2, r * pg.height /2);
    // image(pg, 0, 0);

    //Draw the offscreen buffer to the screen with image()
    // image(pg, state.r * 30, 75);

    if (data.length) {
        textFont('Helvetica', 11)

        data.forEach(data => {
            noFill()
            strokeWeight(state.sw)
            stroke('magenta')
            rect(data.x, data.y, data.width, data.height)

            fill('white')
            noStroke()
            text(`x: ${data.x} px`, data.x + data.width + 5, data.y + 11, 11, 70)
            let imageX = data.x + data.width / 2 - pg.width/ 2
            let imageY = data.y + data.height/ 2 - pg.height/ 2
            image(pg, imageX, imageY);
        })
    } else {
        textFont('Helvetica', 20)

        fill('white')
        noStroke()
        rect(textDimensions.x, textDimensions.y, textDimensions.width, textDimensions.height)

        fill('black')
        text(`No ${cString} in frame, womp womp.`, textDimensions.x, textDimensions.y, textDimensions.width, textDimensions.height)
    }
}


tracker.on('track', function(e) {
    data = e.data
})

function windowResized() {
    canvasToVideoSize();
}
