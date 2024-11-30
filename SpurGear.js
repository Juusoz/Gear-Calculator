// Worker Code
onmessage = function(msg) {
    // Get the input data from the main thread
    let spurgear_min_teeth = parseInt(msg.data[0]);
    let spurgear_max_teeth = parseInt(msg.data[1]);
    let spurgear_max_layers = parseInt(msg.data[2]);
    let target_gear_ratio = parseFloat(msg.data[3]);

    let gearSystems = []; // Holds all gear systems
    let totalSystems = 0;
    let layers = [];
    
    // Helper function to calculate the gear ratio for two gears
    function calculateGearRatio(gear1, gear2) {
        return gear2 / gear1; // Gear ratio is ratio of larger gear to smaller gear
    }

    // Check if the layer's max possible ratio is below the target and return false if it is
    function canSkipLayer(layerIndex, previousGearRatio) {
        // Calculate the maximum possible ratio for this layer
        let maxPossibleRatio = spurgear_max_teeth / spurgear_min_teeth;
        return (previousGearRatio * maxPossibleRatio < target_gear_ratio);
    }

    // Generate gear combinations for a given layer (two gears per layer)
    function generateGearCombinations(layerIndex, previousGearRatio) {
        let combinations = [];
        
        for (let gear1 = spurgear_min_teeth; gear1 <= spurgear_max_teeth; gear1++) {
            for (let gear2 = spurgear_min_teeth; gear2 <= spurgear_max_teeth; gear2++) {
                let ratio = calculateGearRatio(gear1, gear2);
                // If this combination brings us closer to the target ratio, add it
                if (Math.abs(previousGearRatio * ratio - target_gear_ratio) < Math.abs(previousGearRatio - target_gear_ratio)) {
                    combinations.push([gear1, gear2, ratio]);
                }
            }
        }

        return combinations;
    }

    // Main calculation loop
    function calculateAllSystems() {
        let currentLayer = 1;
        let previousGearRatio = 1; // Initial ratio for the first layer
        
        while (currentLayer <= spurgear_max_layers) {
            if (canSkipLayer(currentLayer, previousGearRatio)) {
                // Skip this layer as it cannot help reach the target ratio
                currentLayer++;
                continue;
            }
            
            // Generate gear combinations for this layer
            let layerCombinations = generateGearCombinations(currentLayer, previousGearRatio);
            totalSystems += layerCombinations.length;

            // Process all generated gear combinations for this layer
            layerCombinations.forEach(combination => {
                let system = [...layers];
                system.push(combination);
                let gearCount = system.length * 2; // Two gears per layer

                // Calculate the gear ratio for the system
                let systemRatio = system.reduce((acc, pair) => acc * pair[2], 1);

                // Post a message with the current system
                postMessage([0, system, systemRatio, gearCount, currentLayer]);
            });

            // Update progress every 10,000 systems calculated
            if (totalSystems % 10000 === 0) {
                postMessage([1, totalSystems]);
            }

            currentLayer++;
        }

        // Calculation finished
        postMessage([2]);
    }

    // Start calculating all the systems
    calculateAllSystems();
};
