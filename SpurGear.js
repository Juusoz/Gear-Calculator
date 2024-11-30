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
            if (gears.length > 0) {
                var totalGears = gears.length * 2; // Two gears per layer
                self.postMessage([0, gears, currentRatio, totalGears, currentLayer - 1]);
                console.log("Sent result message");
            }
            return;
        }

        // Loop through all gear combinations for this layer
        for (var teeth1 = spurgear_min_teeth; teeth1 <= spurgear_max_teeth; teeth1++) {
            for (var teeth2 = spurgear_min_teeth; teeth2 <= spurgear_max_teeth; teeth2++) {
                var newRatio = currentRatio * (teeth2 / teeth1); // Calculate cumulative ratio

                if (newRatio === target_gear_ratio) {
                    // If target ratio is reached, send ideal result
                    foundIdeal = true; // Mark as ideal solution found
                    spurgear_max_layers = currentLayer; // Stop further exploration beyond this layer
                    console.log("Ideal solution found");
                }

                // Proceed to the next layer
                exploreLayer(currentLayer + 1, newRatio, gears.concat([[teeth1, teeth2]]));

                checked++; // Increment the combination counter

                // Send periodic progress updates
                if (checked >= next) {
                    self.postMessage([1, checked]);
                    next += 10000;
                }

                if (foundIdeal) return; // Exit loop early if ideal solution found
            }
        }
    }

    // Explore each layer progressively, only increasing layers when all combinations are exhausted
    for (var layer = 1; layer <= spurgear_max_layers; layer++) {
        console.log(`Exploring layer ${layer}`);
        exploreLayer(1, 1, []); // Start from the first layer with an initial ratio of 1
        if (foundIdeal) break; // Stop further exploration if ideal solution is found
    }

    console.log("Processing complete");
    self.postMessage([2]); // Notify that processing is complete
};
