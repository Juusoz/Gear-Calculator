// Global variables
var checked = 0;  // Counter for the number of combinations checked
var next = 0;  // Threshold for sending progress updates

function assert(condition) {
    if (!condition) {
        throw "assertion failed";
    }
}

self.onmessage = function (msg) {
    var spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    var spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    var spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    var target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio (optional for filtering)

    next = 10000;  // Progress update threshold
    var foundIdeal = false; // Flag to prevent unnecessary exploration

    // Recursive function to explore gear combinations across layers
    function exploreLayer(currentLayer, currentRatio, gears) {
        if (currentLayer > spurgear_max_layers || foundIdeal) {
            // Stop exploration if max layers are reached or ideal solution found
            var totalGears = gears.length * 2; // Two gears per layer
            self.postMessage([0, gears, currentRatio, totalGears, currentLayer - 1]);
			console.log("Sent message");
            return;
        }

        for (var teeth1 = spurgear_min_teeth; teeth1 <= spurgear_max_teeth; teeth1++) {
            for (var teeth2 = spurgear_min_teeth; teeth2 <= spurgear_max_teeth; teeth2++) {
                var newRatio = currentRatio * (teeth2 / teeth1); // Cumulative ratio

                // Check if we hit the target ratio
                if (newRatio === target_gear_ratio) {
                    foundIdeal = true; // Mark as ideal solution found
                    spurgear_max_layers = currentLayer; // Limit further exploration
					console.log("Ideal found");
                }

                // Proceed to the next layer if not yet found
                exploreLayer(currentLayer + 1, newRatio, gears.concat([[teeth1, teeth2]]));

                checked++; // Increment combination counter

                // Send periodic progress updates
                if (checked >= next) {
                    self.postMessage([1, checked]);
                    next += 10000;
                }

                if (foundIdeal) return; // Exit loop early if ideal solution found
            }
        }
    }

    // Start the recursive exploration from the first layer
    exploreLayer(1, 1, []); // Initial ratio is 1, and no gears selected yet
	console.log("Started processing");
					
    // Notify the main thread that processing is complete
    self.postMessage([2]);
};
