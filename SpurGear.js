onmessage = function (msg) {
    // Parsing input data from message
    let spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    let spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    let spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    // Track best solution found so far
    let best_ratio = Number.POSITIVE_INFINITY;
    let best_configuration = null;
    let gear_systems_count = 0;

    // Helper function to calculate the gear ratio for a given system
    function calculate_gear_ratio(tooth_counts) {
        let total_ratio = 1;
        for (let i = 0; i < tooth_counts.length - 1; i++) {
            total_ratio *= tooth_counts[i + 1] / tooth_counts[i];
        }
        return total_ratio;
    }

    // Process each layer and gear combinations
    function process_layer(current_layer, previous_layer_tooth_counts, current_max_teeth) {
        let systems_in_layer = 0;
        let max_possible_ratio = 1;
        
        // Calculate max possible gear ratio for the current layer
        if (current_layer > 1) {
            max_possible_ratio = Math.pow(spurgear_max_teeth / spurgear_min_teeth, current_layer - 1);
        }

        // Skip this layer if the max possible ratio is below the target gear ratio
        if (max_possible_ratio < target_gear_ratio) {
            return 0;
        }

        // Iterate through all gear combinations for the current layer
        for (let gear1 = spurgear_min_teeth; gear1 <= current_max_teeth; gear1++) {
            for (let gear2 = spurgear_min_teeth; gear2 <= current_max_teeth; gear2++) {
                // Gear pair (gear1 and gear2)
                let current_gear_system = previous_layer_tooth_counts.concat([gear1, gear2]);
                let current_ratio = calculate_gear_ratio(current_gear_system);

                // Check if the current system is closer to the target ratio than the previous best
                if (Math.abs(current_ratio - target_gear_ratio) < Math.abs(best_ratio - target_gear_ratio)) {
                    best_ratio = current_ratio;
                    best_configuration = current_gear_system.slice();
                    postMessage([0, best_configuration, best_ratio, best_configuration.length, current_layer]);
                }

                systems_in_layer++;

                // Output after every 10000 systems calculated
                if (systems_in_layer % 10000 === 0) {
                    postMessage([1, systems_in_layer]);
                }
            }
        }

        return systems_in_layer;
    }

    // Start processing gears layer by layer
    let total_systems_calculated = 0;

    // Iterate over layers, starting from 2 gears
    for (let current_layer = 1; current_layer <= spurgear_max_layers; current_layer++) {
        let systems_in_current_layer = 0;
        let max_teeth_for_layer = spurgear_max_teeth;

        // Only proceed with layers if they could potentially produce a valid result
        systems_in_current_layer = process_layer(current_layer, [], max_teeth_for_layer);

        total_systems_calculated += systems_in_current_layer;

        // If we've found a solution with just 2 layers, break early
        if (current_layer == 2 && best_configuration != null) {
            break;
        }
    }

    // Output finished process message
    postMessage([2]);
};
