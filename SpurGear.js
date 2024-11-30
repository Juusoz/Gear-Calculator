self.onmessage = function(msg) {
    // Input data
    const spurgear_min_teeth = parseInt(msg.data[0]);
    const spurgear_max_teeth = parseInt(msg.data[1]);
    const spurgear_max_layers = parseInt(msg.data[2]);
    const target_gear_ratio = parseFloat(msg.data[3]);

    // Initialize variables for tracking gear systems
    let bestSystems = [];
    let bestGearRatioDiff = Infinity; // A very large value to track the closest gear ratio
    let totalCalculatedSystems = 0;

    // Function to calculate the gear ratio of a system of gears
    function calculateGearRatio(gearTeethCounts) {
        let ratio = 1;
        for (let i = 1; i < gearTeethCounts.length; i++) {
            ratio *= gearTeethCounts[i] / gearTeethCounts[i - 1];
        }
        return ratio;
    }

    // Function to check if the gear system is closer to the target than the best
    function isCloserToTarget(gearRatio) {
        return Math.abs(gearRatio - target_gear_ratio) < bestGearRatioDiff;
    }

    // Function to generate gear systems for a given number of layers
    function generateGearSystems(currentLayer, gearTeethCounts) {
        if (currentLayer > spurgear_max_layers) return;

        let maxGearRatioForCurrentLayer = 1;
        for (let i = 0; i < currentLayer * 2; i++) {
            maxGearRatioForCurrentLayer *= spurgear_max_teeth / spurgear_min_teeth;
        }

        // If the max possible ratio for the current layer is less than the target, skip this layer
        if (maxGearRatioForCurrentLayer < target_gear_ratio) {
            return;
        }

        // Loop through all possible gear teeth combinations for this layer
        for (let i = spurgear_min_teeth; i <= spurgear_max_teeth; i++) {
            for (let j = spurgear_min_teeth; j <= spurgear_max_teeth; j++) {
                // Update the gear system with the new gears for the current layer
                gearTeethCounts.push(i, j);
                
                // Calculate the gear ratio for this new system
                let gearRatio = calculateGearRatio(gearTeethCounts);
                
                // Check if this gear system is closer to the target gear ratio
                if (isCloserToTarget(gearRatio)) {
                    // If so, update the best systems
                    bestGearRatioDiff = Math.abs(gearRatio - target_gear_ratio);
                    bestSystems.push({
                        gears: gearTeethCounts.slice(),
                        gearRatio: gearRatio,
                        layers: currentLayer
                    });

                    // Output the current system
                    self.postMessage([0, gearTeethCounts, gearRatio, currentLayer * 2, currentLayer]);

                    // Update the number of calculated systems and output progress
                    totalCalculatedSystems++;
                    if (totalCalculatedSystems % 10000 === 0) {
                        self.postMessage([1, totalCalculatedSystems]);
                    }
                }

                // If the current system reaches the target gear ratio exactly, we don't need to calculate further for this layer
                if (gearRatio === target_gear_ratio) {
                    return;
                }

                // Recursively calculate the next layer
                generateGearSystems(currentLayer + 1, gearTeethCounts);
                
                // Backtrack by removing the last two gears
                gearTeethCounts.pop();
                gearTeethCounts.pop();
            }
        }
    }

    // Start generating gear systems from the first layer
    generateGearSystems(1, []);

    // Once all calculations are done, post the finished signal
    self.postMessage([2]);
};
