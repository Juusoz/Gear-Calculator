self.onmessage = function(msg) {
    // Step 1: Initialize the variables from the input data
    let spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    let spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    let spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    let bestGearSystems = [];  // Array to store the best gear systems
    let totalCalculations = 0; // Track the total number of calculations
    let currentLayer = 1;  // Start with layer 1
    let completedCalculations = 0; // Track completed calculations for progress update

    // Debugging log
    console.log('Starting calculation for gear systems');
    
    // Step 2: Calculate the gear systems layer by layer
    function calculateLayer(previousGearRatio, layer) {
        let gearSystemsForThisLayer = [];
        let maxPossibleGearRatio = calculateMaxPossibleGearRatio(previousGearRatio, layer);
        
        // If the max possible gear ratio is less than the target, we can skip this layer
        if (maxPossibleGearRatio < target_gear_ratio) {
            console.log(`Skipping layer ${layer} as max possible ratio is below target.`);
            return;
        }

        // Calculate the spur gear combinations for this layer
        for (let i = spurgear_min_teeth; i <= spurgear_max_teeth; i++) {
            for (let j = spurgear_min_teeth; j <= spurgear_max_teeth; j++) {
                // Calculate the gear ratio for this combination
                let gearRatio = i / j;
                let newGearSystem = {
                    teeth: [i, j],
                    ratio: gearRatio,
                    layer: layer
                };

                // Check if the current system is as close to the target as possible
                if (isBetterMatch(target_gear_ratio, newGearSystem.ratio, bestGearSystems)) {
                    bestGearSystems.push(newGearSystem);
                    console.log(`New best gear system at layer ${layer}: [${i}, ${j}] with ratio ${gearRatio}`);
                }

                // Add to the layer's gear systems
                gearSystemsForThisLayer.push(newGearSystem);
                totalCalculations++;

                // Check if we need to update the progress
                completedCalculations++;
                if (completedCalculations % 10000 === 0) {
                    self.postMessage([1, bestGearSystems.length]);
                    console.log(`Processed ${completedCalculations} calculations.`);
                }
            }
        }

        return gearSystemsForThisLayer;
    }

    // Step 3: Function to check if a new system is better than the previous best
    function isBetterMatch(target, currentRatio, currentBestSystems) {
        // Check if the current ratio is closer to the target ratio than the previous best
        let bestRatioDifference = Math.abs(target - currentBestSystems.reduce((acc, system) => acc + system.ratio, 0) / currentBestSystems.length || 1);
        let currentDifference = Math.abs(target - currentRatio);
        return currentDifference <= bestRatioDifference;
    }

    // Step 4: Function to calculate the maximum possible gear ratio for the given layer
    function calculateMaxPossibleGearRatio(previousGearRatio, layer) {
        // Assuming max possible gear ratio for this layer is the ratio of max teeth to min teeth
        return spurgear_max_teeth / spurgear_min_teeth;
    }

    // Step 5: Start the recursive process to build the gear system layer by layer
    function processGearSystems(previousGearRatio = 1, layer = 1) {
        if (layer > spurgear_max_layers) {
            console.log('Reached maximum number of layers. Stopping.');
            self.postMessage([2]);
            return;  // Stop if the max layers have been reached
        }

        // Calculate the systems for the current layer
        console.log(`Processing layer ${layer}...`);
        let systemsAtLayer = calculateLayer(previousGearRatio, layer);

        // If we find any valid systems at this layer, calculate the next layer
        systemsAtLayer.forEach(system => {
            // Calculate the new gear ratio for the next layer
            let newGearRatio = system.ratio * previousGearRatio;

            // If the new ratio is too far from the target, don't continue
            if (Math.abs(newGearRatio - target_gear_ratio) < Math.abs(previousGearRatio - target_gear_ratio)) {
                // Continue to next layer
                processGearSystems(newGearRatio, layer + 1);
            }
        });
    }

    // Step 6: Start the recursive gear system calculation
    processGearSystems();

    // Final message when processing is done
    self.postMessage([2]);
    console.log('Processing finished.');
};
