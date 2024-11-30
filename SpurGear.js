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
        if (foundIdeal) return; // Stop further exploration if an ideal solution is found

        console.log(`Exploring layer ${currentLayer} with ratio ${currentRatio}`);

        for (var teeth1 = spurgear_min_teeth; teeth1 <= spurgear_max_teeth; teeth1++) {
            for (var teeth2 = spurgear_min_teeth; teeth2 <= spurgear_max_teeth; teeth2++) {
                var newLayer = [teeth1, teeth2];
                var newRatio = currentRatio * (teeth2 / teeth1);

                if (newRatio === target_gear_ratio) {
                    foundIdeal = true; // Mark solution as found
                    self.postMessage([0, layers.concat([newLayer]), newRatio, (layers.length + 1) * 2, currentLayer]);
                    console.log("Ideal solution found:", layers.concat([newLayer]), "Ratio:", newRatio);
                    return; // Stop further exploration
                }

                checked++;
                if (checked >= next) {
                    self.postMessage([1, checked]);
                    next += 10000;
                }

                // Continue exploring if under max layers
                if (currentLayer < spurgear_max_layers) {
                    exploreCombination(layers.concat([newLayer]), currentLayer + 1, newRatio);
                }

                if (foundIdeal) return; // Stop recursion if solution found
            }
        }
    }

    for (var initialLayer = 1; initialLayer <= spurgear_max_layers; initialLayer++) {
        if (foundIdeal) break; // Stop exploring layers if solution found
        exploreCombination([], initialLayer, 1); // Start exploration from initial ratio of 1
    }

    console.log("Processing complete");
    self.postMessage([2]); // Notify main thread that processing is complete
};
