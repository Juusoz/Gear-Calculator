// Global variables
var checked = 0;  // Counter for the number of combinations checked
var next = 0;  // Threshold for sending progress updates

function assert(condition) {
    // Throws an error if the condition is false
    if (!condition) {
        throw "assertion failed";
    }
}

// Event listener for messages received from the main thread
self.onmessage = function (msg) {
    var spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    var spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    var spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    var target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    next = 10000;  // Update the webpage every n calculations

    // Recursive function to explore gear combinations across layers
    function exploreLayer(currentLayer, currentRatio, gears) {
        if (currentLayer > spurgear_max_layers) {
            // If the maximum number of layers is reached, check if the ratio is close to the target
            if (Math.abs(currentRatio - target_gear_ratio) < 0.01) { // Adjust tolerance as needed
                self.postMessage([0, gears, currentRatio, gears.length * 2]); // Send valid result with total gear count
				console.log("Sent a message");
            }
            return;
        }

        for (var teeth1 = spurgear_min_teeth; teeth1 <= spurgear_max_teeth; teeth1++) {    // Cycle gear 1 options
            for (var teeth2 = spurgear_min_teeth; teeth2 <= spurgear_max_teeth; teeth2++) { // Cycle gear 2 options

                var newRatio = currentRatio * (teeth2 / teeth1); // Update cumulative gear ratio

                // Track the gear pair and proceed to the next layer
                exploreLayer(currentLayer + 1, newRatio, gears.concat([[teeth1, teeth2]]));

                checked++;  // Increment the number of combinations checked

                // Send periodic progress updates
                if (checked >= next) {
                    self.postMessage([1, checked]);  // Send progress update
                    next += 10000;
                }
            }
        }
    }

    // Start exploration from the first layer
    exploreLayer(1, 1, []);  // Initial ratio is 1, and no gears selected yet
	console.log("Processing started");

    // Notify the main thread that processing is complete
    self.postMessage([2]);
	console.log("Processing ended");
};
