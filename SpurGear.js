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

    function exploreLayerByLayer() {
        for (var currentLayer = 1; currentLayer <= spurgear_max_layers; currentLayer++) {
            console.log(`Exploring layer ${currentLayer}`);
            
            function exploreLayer(currentLayer, currentRatio, gears) {
                if (currentLayer > spurgear_max_layers || foundIdeal) {
                    return;
                }

                for (var teeth1 = spurgear_min_teeth; teeth1 <= spurgear_max_teeth; teeth1++) {
                    for (var teeth2 = spurgear_min_teeth; teeth2 <= spurgear_max_teeth; teeth2++) {
                        var newRatio = currentRatio * (teeth2 / teeth1); // Cumulative ratio

                        if (newRatio === target_gear_ratio) {
                            foundIdeal = true;  // Mark as ideal solution found
                            spurgear_max_layers = currentLayer;  // Stop further exploration
                            var totalGears = gears.length * 2 + 2; // Each layer adds 2 gears
                            self.postMessage([0, gears.concat([[teeth1, teeth2]]), newRatio, totalGears, currentLayer]);
                            console.log("Ideal solution found:", gears.concat([[teeth1, teeth2]]));
                            return;
                        }

                        if (currentLayer < spurgear_max_layers && !foundIdeal) {
                            exploreLayer(currentLayer + 1, newRatio, gears.concat([[teeth1, teeth2]]));
                        }

                        checked++;  // Increment combination counter
                        if (checked >= next) {
                            self.postMessage([1, checked]);  // Send progress update
                            next += 10000;
                        }

                        if (foundIdeal) return;  // Stop processing if ideal solution is found
                    }
                }
            }

            exploreLayer(1, 1, []);  // Start from the first layer with an initial ratio of 1

            if (foundIdeal) break;  // Stop after finding a solution
        }
    }

    exploreLayerByLayer();  // Begin the layer-by-layer exploration
    console.log("Started processing");

    // Notify the main thread that processing is complete
    self.postMessage([2]);
    console.log("Processing complete");
};
