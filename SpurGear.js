// Global variables
var checked = 0;  // Counter for the number of combinations checked
var next = 0;  // Threshold for sending progress updates
var foundIdeal = false; // Flag to prevent unnecessary exploration

function assert(condition) {
    if (!condition) {
        throw "assertion failed";
    }
}

self.onmessage = function (msg) {
    var spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    var spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    var spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    var target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    next = 10000;  // Progress update threshold

    function exploreCombination(layers, currentLayer, currentRatio) {
		if (foundIdeal) return;

		// If we reached the exact number of layers allowed, stop recursion.
		if (currentLayer > spurgear_max_layers) return;

		for (var teeth1 = spurgear_min_teeth; teeth1 <= spurgear_max_teeth; teeth1++) {
			for (var teeth2 = spurgear_min_teeth; teeth2 <= spurgear_max_teeth; teeth2++) {
				var newLayer = [teeth1, teeth2];
				var newRatio = currentRatio * (teeth2 / teeth1);

				if (newRatio === target_gear_ratio) {
					foundIdeal = true;
					self.postMessage([0, layers.concat([newLayer]), newRatio, (layers.length + 1) * 2, currentLayer]);
					console.log("Ideal solution found:", layers.concat([newLayer]), "Ratio:", newRatio);
					return;
				}

				checked++;
				if (checked >= next) {
					self.postMessage([1, checked]);
					next += 10000;
				}

				// Recursively explore deeper layers starting from current layer depth
				exploreCombination(layers.concat([newLayer]), currentLayer + 1, newRatio);

				if (foundIdeal) return;
			}
		}
	}

	// Start the exploration for each depth, sequentially ensuring all combinations per depth
	for (var initialLayerDepth = 1; initialLayerDepth <= spurgear_max_layers; initialLayerDepth++) {
		if (foundIdeal) break; // Stop all exploration if the solution is found
		exploreCombination([], 1, 1); // Start fresh exploration from depth 1, at every new depth tier
	}

    console.log("Processing complete");
    self.postMessage([2]); // Notify main thread that processing is complete
};
