// Global variables
var ratioFunction = "";  // Placeholder for a ratio function, currently unused.
var toRad = Math.PI / 180;  // Conversion factor from degrees to radians.
var checked = 0;  // Counter for the number of combinations checked.
var next = 0;  // Threshold for sending progress updates.

function assert(condition) {
    // Throws an error if the condition is false.
    if (!condition) {
        throw "assertion failed";
    }
}

// Event listener for messages received from the main thread
self.onmessage = function (msg) {
    next = 10000;  // Set the initial threshold for progress updates.

    // Loop through all possible combinations of sun, planet, ring, and planet count values.
    for (var s = parseInt(msg.data[0]); s <= parseInt(msg.data[1]); s++) {  // Sun gear teeth range
        for (var p = parseInt(msg.data[2]); p <= parseInt(msg.data[3]); p++) {  // Planet gear teeth range
            for (var r = parseInt(msg.data[4]); r <= parseInt(msg.data[5]); r++) {  // Ring gear teeth range
                for (var pn = parseInt(msg.data[6]); pn <= parseInt(msg.data[7]); pn++) {  // Number of planets range

                    try {
                        // Basic planetary gear constraint: Ring teeth = 2 * Planet teeth + Sun teeth.
                        assert(r == 2 * p + s);

                        // Ensure planets are evenly spaced: Sum of Sun and Ring teeth must be divisible by the number of planets.
                        assert((s + r) % pn == 0);

                        // Prevent planet gears from intersecting by ensuring adequate spacing.
                        var dist = s / 2 + p / 2;  // Calculate the distance from the sun gear center to the planet center.
                        assert(p + 2 < Math.sqrt(
                            (dist * Math.sin(360 / pn * toRad)) ** 2 + 
                            (dist - dist * Math.cos(360 / pn * toRad)) ** 2
                        ));

                        // Send valid gear combination to the main thread.
                        self.postMessage([0, s, p, r, pn]);
                    } catch (a) {
                        // Only handle "assertion failed" errors; rethrow any other exceptions.
                        if (a != "assertion failed") {
                            throw a;
                        }
                    }

                    checked++;  // Increment the checked combinations counter.

                    // Periodically send progress updates to the main thread.
                    if (checked >= next) {
                        self.postMessage([1, checked]);  // Send progress update.
                        next += 10000;  // Update the threshold for the next progress report.
                    }
                }
            }
        }
    }

    // Notify the main thread that processing is complete.
    self.postMessage([2]);
}
