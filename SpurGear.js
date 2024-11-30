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
    var target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    next = 10000;  // Progress update threshold
    var foundIdeal = false; // Flag to prevent unnecessary exploration

    function exploreCombination(layers) {
        console.log(`Exploring with ${layers.length} layers`);

        for (var teeth1 = spurgear_min_teeth; teeth1 <= spurgear_max_teeth; teeth1++) {
            for (var teeth2 = spurgear_min_teeth; teeth2 <= spurgear_max_teeth; teeth2++) {
                var newLayer = [teeth1, teeth2];
                var newRatio = layers.reduce((acc, pair) => acc * (pair[1] / pair[0]), teeth2 / teeth1); // Cumulative ratio

                var newLayers = layers.concat([newLayer]);

                if (newRatio === target_gear_ratio) {
                    foundIdeal = true;
                    self.postMessage([0, newLayers, newRatio, newLayers.length * 2, newLayers.length]);
                    console.log("Ideal solution found:", newLayers, "Ratio:", newRatio);
                    return; // Exit early if ideal solution is found
                }

                checked++;
                if (checked >= next) {
                    self.postMessage([1, checked]);
                    next += 10000;
                }

                if (newLayers.length < spurgear_max_layers) {
                    exploreCombination(newLayers); // Continue exploring deeper layers
                }

                if (foundIdeal) return; // Exit loops if the solution is found
            }
        }
    }

    for (var layers = 1; layers <= spurgear_max_layers; layers++) {
        if (foundIdeal) break; // Stop adding layers if solution is already found
        exploreCombination([]); // Start exploring with no initial layers
    }

    console.log("Processing complete");
    self.postMessage([2]); // Notify main thread that processing is complete
};
