self.onmessage = function(msg) {
    // Parse inputs from the message
    let spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    let spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    let spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    let best_gear_systems = []; // To store the best gear systems
    let best_gear_ratio = Infinity; // To track the closest gear ratio

    let calculation_count = 0; // To keep track of how many calculations we've done
    let total_calculations = 0; // Total number of possible configurations

    // Function to calculate the gear ratio between two gears
    function calculateGearRatio(teeth1, teeth2) {
        return teeth2 / teeth1;
    }

    // Recursive function to calculate gear systems layer by layer
    function calculateLayer(currentLayer, previousLayerTeeth, currentGearRatio) {
        if (currentLayer > spurgear_max_layers) {
            return; // Stop if we exceed the maximum layers
        }

        let maxPossibleRatioForLayer = Math.pow(spurgear_max_teeth / spurgear_min_teeth, currentLayer);
        
        // If max possible ratio is less than the target, skip this layer
        if (maxPossibleRatioForLayer < target_gear_ratio) {
            console.log(`Skipping layer ${currentLayer} as it cannot reach the target ratio.`);
            return;
        }

        let newBestSystemsFound = false;

        // Loop over all possible gear combinations in this layer
        for (let gear1 = spurgear_min_teeth; gear1 <= spurgear_max_teeth; gear1++) {
            for (let gear2 = spurgear_min_teeth; gear2 <= spurgear_max_teeth; gear2++) {
                let newGearRatio = calculateGearRatio(previousLayerTeeth, gear1) * calculateGearRatio(gear1, gear2);

                // Check if this combination gets closer to the target gear ratio
                if (Math.abs(newGearRatio - target_gear_ratio) < Math.abs(best_gear_ratio - target_gear_ratio)) {
                    best_gear_ratio = newGearRatio;
                    best_gear_systems.push([gear1, gear2]); // Add new gear system to the best systems
                    newBestSystemsFound = true;
                }

                // Update the calculation count
                calculation_count++;
                total_calculations++;

                // Output progress every 10,000 calculations
                if (calculation_count >= 10000) {
                    console.log(`Processed ${total_calculations} combinations so far.`);
                    self.postMessage([1, total_calculations]);
                    calculation_count = 0; // Reset calculation count
                }
            }
        }

        // Recursively calculate the next layer if there were any new best systems found
        if (newBestSystemsFound) {
            self.postMessage([0, best_gear_systems, best_gear_ratio, best_gear_systems.length * 2, currentLayer]);
        }

        // After processing, recursively calculate the next layer
        calculateLayer(currentLayer + 1, gear2, newGearRatio);
    }

    // Start the process with layer 1
    calculateLayer(1, spurgear_min_teeth, 1);

    // When finished, notify that the process is complete
    self.postMessage([2]);
};
