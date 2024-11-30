onmessage = function(msg) {
    // Parsing input data
    const spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    const spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    const spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    const target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio
    
    // Variables to store best gear system and its ratio
    let best_ratio = Number.MAX_VALUE;
    let best_system = null;
    let calculatedSystems = 0;
    let gearCount = 0;

    // Function to calculate gear ratio
    function calculateGearRatio(gear1, gear2) {
        return gear2 / gear1;
    }

    // Function to calculate maximum possible gear ratio for a layer
    function calculateMaxPossibleRatio(layer) {
        let maxRatio = 1; // Start with a minimum ratio of 1 (next gear is the same size)
        for (let i = 0; i < layer.length; i++) {
            let gear1 = layer[i][0];
            let gear2 = layer[i][1];
            let ratio = calculateGearRatio(gear1, gear2);
            maxRatio *= ratio;
        }
        return maxRatio;
    }

    // Recursive function to generate all possible gear systems layer by layer
    function generateGearSystems(currentLayer, previousGear = 0, layerIndex = 1) {
        // Terminate if layers exceed max layers
        if (layerIndex > spurgear_max_layers) {
            postMessage([2]);  // Process finished
            return;
        }

        let layerSystems = [];
        let maxPossibleRatio = calculateMaxPossibleRatio(currentLayer);
        
        // Skip this layer if the max possible ratio is below the target
        if (maxPossibleRatio < target_gear_ratio) {
            return;  // This layer doesn't contribute to a valid system
        }

        // Generate all combinations of spur gears for the current layer
        for (let i = spurgear_min_teeth; i <= spurgear_max_teeth; i++) {
            for (let j = i + 1; j <= spurgear_max_teeth; j++) {
                let gearPair = [i, j];
                currentLayer.push(gearPair);  // Add the current pair to the layer

                // Calculate the gear ratio for the current pair
                let currentGearRatio = calculateGearRatio(gearPair[0], gearPair[1]);
                let currentSystemRatio = previousGear * currentGearRatio;

                // Check if the current ratio is closer to the target and record the system
                if (Math.abs(currentSystemRatio - target_gear_ratio) < Math.abs(best_ratio - target_gear_ratio)) {
                    best_ratio = currentSystemRatio;
                    best_system = [...currentLayer];
                    gearCount = currentLayer.length * 2; // 2 gears per layer
                    postMessage([0, currentLayer, currentSystemRatio, gearCount, layerIndex]); // Send results back
                }

                // If we're in the last layer, we should stop (we're calculating 2 layers)
                if (layerIndex === spurgear_max_layers || currentSystemRatio >= target_gear_ratio) {
                    calculatedSystems++;
                    // Update progress every 10,000 systems
                    if (calculatedSystems % 10000 === 0) {
                        postMessage([1, calculatedSystems]);
                    }
                }
                
                // Continue generating the next layer if not finished
                if (currentSystemRatio < target_gear_ratio) {
                    generateGearSystems([...currentLayer], currentSystemRatio, layerIndex + 1);
                }
                
                currentLayer.pop(); // Remove the last gear pair for the next iteration
            }
        }
    }

    // Initial call to generate gear systems from the first layer
    generateGearSystems([], 1);

    // If we reach here, the calculation is complete
    postMessage([2]); // Finish processing
};
