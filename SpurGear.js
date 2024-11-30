self.onmessage = function (msg) {
    // Parse the input data
    let spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    let spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    let spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    let best_ratio_diff = Infinity; // To track the closest ratio
    let best_gear_system = null; // To track the best gear system found so far
    let total_calculated = 0; // To count the number of calculated gear systems
    let gear_systems = []; // To store valid gear systems as we calculate them

    // Helper function to calculate gear ratio for a given pair of gears
    function calculateGearRatio(gear1, gear2) {
        return gear1 / gear2;
    }

    // Helper function to calculate the max possible gear ratio for a given layer
    function calculateMaxLayerRatio(layer) {
        let max_ratio = 1; // Start with the minimum ratio, 1:1
        layer.forEach((gear_pair) => {
            let ratio = calculateGearRatio(gear_pair[0], gear_pair[1]);
            if (ratio > max_ratio) {
                max_ratio = ratio;
            }
        });
        return max_ratio;
    }

    // Function to calculate gear systems layer by layer
    function calculateGearSystems(layer, current_layer) {
        // Base case: if the number of layers exceeds max, stop.
        if (current_layer > spurgear_max_layers) {
            return;
        }

        // Try adding every possible pair of gears to the current layer
        for (let gear1 = spurgear_min_teeth; gear1 <= spurgear_max_teeth; gear1++) {
            for (let gear2 = spurgear_min_teeth; gear2 <= spurgear_max_teeth; gear2++) {
                // Calculate gear ratio
                let ratio = calculateGearRatio(gear1, gear2);
                if (Math.abs(ratio - target_gear_ratio) < best_ratio_diff) {
                    best_ratio_diff = Math.abs(ratio - target_gear_ratio);
                    best_gear_system = [...layer, [gear1, gear2]];
                    postMessage([0, best_gear_system, ratio, best_gear_system.length * 2, current_layer]);
                }

                // If the current gear pair meets the ratio, move on to the next layer
                let new_layer = [...layer, [gear1, gear2]];
                let max_possible_ratio = calculateMaxLayerRatio(new_layer);
                if (max_possible_ratio >= target_gear_ratio) {
                    total_calculated++;
                    calculateGearSystems(new_layer, current_layer + 1);
                }
            }
        }
    }

    // Start calculating gear systems from layer 1
    calculateGearSystems([], 1);

    // Send the number of calculated systems after every 10000 iterations
    if (total_calculated % 10000 === 0 || current_layer > spurgear_max_layers) {
        postMessage([1, total_calculated]);
    }

    // Finish processing
    postMessage([2]);
};
