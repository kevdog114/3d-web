console.log("Hello world");

// Get a reference to the canvas from the web page
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

var camera = {
    z: 500
};

var canvas_dimensions = {
    height: 500,
    width: 500
}

/* define some objects to draw
   For the 'faces', the format is an array of points, where each point follows this format:
        [ x, y, z ]

   Note - the last point is always the same as the first point, which allows the shape to 'complete',
   otherwise it would not be a closed shape

   // The z, width, and height are used to calculate the location of the shape, and the perspective.
*/

var objects = [{
    z: -200,
    width: -100,
    height: 100,
    faces: [
        
        // Define the cube shape ( technically you'd need 6 faces for a cube, but since we are only drawing
        // the outlines of each face, we don't need the two ends)
        [[0, 0, 0], [200, 0, 0], [200, 200, 0], [0, 200, 0], [0, 0, 0]],
        [ [ 0, 0, 200 ], [ 200, 0, 200 ], [ 200, 200, 200 ], [ 0, 200, 200 ], [ 0, 0, 200 ] ],
        [ [ 0, 0, 0 ], [ 0, 0, 200 ], [ 0, 200, 200 ], [ 0, 200, 0 ], [ 0, 0, 0 ] ],
        [ [ 200, 0, 0 ], [ 200, 0, 200 ], [ 200, 200, 200 ], [ 200, 200, 0 ], [ 200, 0, 0 ] ],

        // draw the pyramid at the bottom of the cube
        [ [ 50, 200, 50 ], [ 150, 200, 50 ], [ 100, 250, 100 ], [ 50, 200, 50 ] ],
        [ [ 50, 200, 150 ], [ 150, 200, 150 ], [ 100, 250, 100 ], [ 50, 200, 150 ] ],
        [ [ 50, 200, 50 ], [ 50, 200, 150 ], [ 100, 250, 100 ], [ 50, 200, 50 ] ],
        [ [ 150, 200, 50 ], [ 150, 200, 150 ], [ 100, 250, 100 ], [ 150, 200, 150 ] ],
    ]
},
{
    z: -1500,
    width: 100,
    height: -200,
    faces: [
        // cube
        [ [0, 0, 0], [200, 0, 0], [200, 200, 0], [0, 200, 0], [0, 0, 0]],
        [ [ 0, 0, 200 ], [ 200, 0, 200 ], [ 200, 200, 200 ], [ 0, 200, 200 ], [ 0, 0, 200 ] ],
        [ [ 0, 0, 0 ], [ 0, 0, 200 ], [ 0, 200, 200 ], [ 0, 200, 0 ], [ 0, 0, 0 ] ],
        [ [ 200, 0, 0 ], [ 200, 0, 200 ], [ 200, 200, 200 ], [ 200, 200, 0 ], [ 200, 0, 0 ] ]
    ]
},
{
    z: -2500,
    width: 1000,
    height: -600,
    faces: [
        // cube
        [ [0, 0, 0], [200, 0, 0], [200, 200, 0], [0, 200, 0], [0, 0, 0]],
        [ [ 0, 0, 200 ], [ 200, 0, 200 ], [ 200, 200, 200 ], [ 0, 200, 200 ], [ 0, 0, 200 ] ],
        [ [ 0, 0, 0 ], [ 0, 0, 200 ], [ 0, 200, 200 ], [ 0, 200, 0 ], [ 0, 0, 0 ] ],
        [ [ 200, 0, 0 ], [ 200, 0, 200 ], [ 200, 200, 200 ], [ 200, 200, 0 ], [ 200, 0, 0 ] ]
    ]
},
{
    z: -1000,
    width: 800,
    height: 300,
    faces: [
        // cube with a pyramid (copy of the first one, just moved to a different location)
        [[0, 0, 0], [200, 0, 0], [200, 200, 0], [0, 200, 0], [0, 0, 0]],
        [ [ 0, 0, 200 ], [ 200, 0, 200 ], [ 200, 200, 200 ], [ 0, 200, 200 ], [ 0, 0, 200 ] ],
        [ [ 0, 0, 0 ], [ 0, 0, 200 ], [ 0, 200, 200 ], [ 0, 200, 0 ], [ 0, 0, 0 ] ],
        [ [ 200, 0, 0 ], [ 200, 0, 200 ], [ 200, 200, 200 ], [ 200, 200, 0 ], [ 200, 0, 0 ] ],

        [ [ 50, 200, 50 ], [ 150, 200, 50 ], [ 100, 250, 100 ], [ 50, 200, 50 ] ],
        [ [ 50, 200, 150 ], [ 150, 200, 150 ], [ 100, 250, 100 ], [ 50, 200, 150 ] ],
        [ [ 50, 200, 50 ], [ 50, 200, 150 ], [ 100, 250, 100 ], [ 50, 200, 50 ] ],
        [ [ 150, 200, 50 ], [ 150, 200, 150 ], [ 100, 250, 100 ], [ 150, 200, 150 ] ],
    ]
},
];

function scale_3d(object, vertex_z, offset) {

    return camera.z * (offset / (camera.z - object.z + vertex_z));
}

function updateCanvas(scroll_y, frame, direction) {

    ctx.clearRect(0, 0, canvas_dimensions.width, canvas_dimensions.height);

    // draw informational text in upper-left hand corner
    ctx.font = "14px Arial";
    ctx.fillText("Frame: " + frame, 0, 20);
    ctx.fillText("Offset: " + scroll_y, 0, 35);
    ctx.fillText("Direction: " + (direction ? "Up" : "Down"), 0, 50);


    // draw each object
    objects.forEach(object => {
        ctx.beginPath();
        object.faces.forEach(face => {

            // draw each face of the object
    
            // loop through each point in the face, and draw a line connecting them
            for (var i = 0; i < face.length; i++) {
                var vertex = face[i];
                
                // get the x, y, and z from the object's definition
                // For the x and y, adjust them to center their coordinates, so we are looking
                // straight on to them, by default.
                var x = vertex[0] - object.width / 2;
                var y = vertex[1] - object.height / 2 + scroll_y;
                var z = vertex[2];
    
                // Calculate the scaled x and y coordinates by using the z-offset.
                var scaled_x = scale_3d(object, z, x) + (canvas_dimensions.width / 2);
                var scaled_y = scale_3d(object, z, y) + (canvas_dimensions.height / 2);
    
                // if this is the first point in the face, then just move to it. Otherwise
                // draw a line from the previous point to the current point
                if (i == 0)
                    ctx.moveTo(scaled_x, scaled_y);
                else {
                    ctx.lineTo(scaled_x, scaled_y);
    
                    ctx.stroke();
                }
            }
        });
    });
}



var scroll_y = -600; // allows for moving the scene up and down
var multiplier = 1; // controls the direction of the scrolling;

var frame = 0; // informational purposes only

// main program loop
setInterval(function() {

    // switch between scrolling up and down
    if(scroll_y > 600)
        multiplier = -1;
    else if(scroll_y < -1000)
        multiplier = 1;

    // draws a frame of the animation
    updateCanvas(scroll_y += (multiplier * 1.75), frame++, multiplier == -1);
}, 10);
