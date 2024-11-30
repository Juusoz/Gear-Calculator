self.onmessage = function(msg) {
    // Extracting input values from the message
    let spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    let spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    let spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    // Some debugging logs to track the input values
    console.log('Starting gear system calculation...');
    console.log('Min Teeth: ', spurgear_min_teeth);
    console.log('Max Teeth: ', spurgear_max_teeth);
    console.log('Max Layers: ', spurgear_max_layers);
    console.log('Target Gear Ratio: ', target_gear_ratio);

    // Initial variables
    let best_gear_systems = [];
    let total_calculated = 0;

    // Helper function to calculate the gear ratio of two gears
    function calculate_gear_ratio(teeth_1, teeth_2) {
        return teeth_1 / teeth_2;
    }

    // Function to calculate all possible gear systems layer by layer
    function calculate_layer(layer_number, previous_gear_teeth = null, previous_gear_ratio = 1) {
        let possible_gear_systems = [];

        let max_possible_ratio = Math.pow(spurgear_max_teeth / spurgear_min_teeth, layer_number);

        // If the maximum possible ratio for this layer is below the target, skip this layer
        if (max_possible_ratio < target_gear_ratio) {
            console.log(`Skipping layer ${layer_number}, max possible ratio ${max_possible_ratio} < target ${target_gear_ratio}`);
            return [];
        }

        console.log(`Calculating layer ${layer_number}, max possible ratio: ${max_possible_ratio}`);

        // Generate all possible gear combinations for the layer
        for (let teeth_1 = spurgear_min_teeth; teeth_1 <= spurgear_max_teeth; teeth_1++) {
            for (let teeth_2 = spurgear_min_teeth; teeth_2 <= spurgear_max_teeth; teeth_2++) {
                let gear_ratio = calculate_gear_ratio(teeth_1, teeth_2);
                if (Math.abs(gear_ratio - target_gear_ratio) <= Math.abs(previous_gear_ratio - target_gear_ratio)) {
                    let new_gear_system = {
                        gears: [teeth_1, teeth_2],
                        ratio: gear_ratio
                    };
                    possible_gear_systems.push(new_gear_system);
                }

                // Debugging output
                console.log(`Layer ${layer_number}: Checking combination (${teeth_1}, ${teeth_2}) - Ratio: ${gear_ratio}`);
            }
        }

        return possible_gear_systems;
    }

    // Iterate over layers from 1 to spurgear_max_layers
    for (let layer_number = 1; layer_number <= spurgear_max_layers; layer_number++) {
        console.log(`\n\nCalculating for Layer ${layer_number}`);

        // If we are at the first layer, calculate gear combinations
        let layer_systems = calculate_layer(layer_number);

        if (layer_systems.length === 0) {
            console.log(`No valid gear combinations for layer ${layer_number}, skipping further layers.`);
            break;  // No need to calculate further layers if no valid combinations are found
        }

        // For each valid system found, update the best_gear_systems
        for (let system of layer_systems) {
            total_calculated++;
            console.log(`Found gear system for layer ${layer_number}: ${system.gears.join(", ")} - Ratio: ${system.ratio}`);

            // Update the best gear system if it's closer to the target ratio
            if (best_gear_systems.length === 0 || Math.abs(system.ratio - target_gear_ratio) < Math.abs(best_gear_systems[0].ratio - target_gear_ratio)) {
                best_gear_systems = [system];  // Found a better gear system
                self.postMessage([0, system.gears, system.ratio, layer_number * 2, layer_number]);
            }
        }

        // Every 10,000 calculations, or when done, update output
        if (total_calculated % 10000 === 0 || layer_number === spurgear_max_layers) {
            self.postMessage([1, total_calculated]); // Send progress update
        }
    }

    // After the loop, finish the process
    self.postMessage([2]); // Mark the process as finished
    console.log('Processing complete.');
};
