// This is the worker script that calculates spur gear systems based on input parameters

// Helper function to calculate the maximum gear ratio for a given layer
function maxGearRatio(minTeeth, maxTeeth) {
    return maxTeeth / minTeeth;
}

// Main function that runs the gear system calculations
onmessage = function(msg) {
    // Parsing the input data
    let spurgear_min_teeth = parseInt(msg.data[0]); // Minimum teeth for a spur gear
    let spurgear_max_teeth = parseInt(msg.data[1]); // Maximum teeth for a spur gear
    let spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    // Initializing variables for tracking calculations
    let gearSystems = [];
    let totalCalculations = 0;
    let spurgear_checked = 0;
    let foundIdeal = false;

    // Function to generate all possible gear pairs for the current layer
    function generateGearPairs(minTeeth, maxTeeth) {
        let pairs = [];
        for (let i = minTeeth; i <= maxTeeth; i++) {
            for (let j = minTeeth; j <= maxTeeth; j++) {
                pairs.push([i, j]); // Each pair represents a possible gear system in the current layer
            }
        }
        return pairs;
    }

    // Recursive function to explore all gear systems layer by layer
    function exploreLayer(currentLayer, currentGearSystem, currentGearRatio) {
        // Base case: if we reach the maximum number of layers, stop
        if (currentLayer > spurgear_max_layers) {
            return;
        }

        // Generate possible gear pairs for the current layer
        let gearPairs = generateGearPairs(spurgear_min_teeth, spurgear_max_teeth);
        let maxPossibleRatio = maxGearRatio(spurgear_min_teeth, spurgear_max_teeth);
        console.log(`Exploring layer ${currentLayer} with max ratio ${maxPossibleRatio}`);

        // If the max possible ratio is below the target, skip this layer
        if (maxPossibleRatio < target_gear_ratio && !foundIdeal) {
            return;
        }

        // Loop through each possible gear pair and calculate the system
        gearPairs.forEach(pair => {
            totalCalculations++;
            spurgear_checked++;

            // Calculate new gear ratio for this pair
            let newGearRatio = currentGearRatio * (pair[1] / pair[0]);

            // Check if this gear ratio is close enough to the target
            if (Math.abs(newGearRatio - target_gear_ratio) <= 0.01) {
                foundIdeal = true;
            }

            // Add this pair to the current gear system
            let newGearSystem = [...currentGearSystem, pair];
            let totalGearCount = newGearSystem.length * 2; // Two gears per layer

            // Post message with the current gear system and ratio
            postMessage([0, newGearSystem, newGearRatio, totalGearCount, currentLayer]);

            // If the gear ratio is sufficiently close to the target, we stop exploring further layers
            if (foundIdeal) {
                return;
            }

            // Otherwise, continue exploring the next layer
            exploreLayer(currentLayer + 1, newGearSystem, newGearRatio);
        });

        // After every 10,000 calculations, update progress
        if (totalCalculations % 10000 === 0) {
            postMessage([1, spurgear_checked]); // Send progress update
        }
    }

    // Start calculating from the first layer
    exploreLayer(1, [], 1);

    // When done calculating, signal that the process is finished
    postMessage([2]);
};

