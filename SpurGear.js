// Worker script: gear_calculator_worker.js

self.onmessage = function(msg) {
    // Extracting inputs from the message data
    let spurgear_min_teeth = parseInt(msg.data[0]);
    let spurgear_max_teeth = parseInt(msg.data[1]);
    let spurgear_max_layers = parseInt(msg.data[2]);
    let target_gear_ratio = parseFloat(msg.data[3]);

    // Initialize output variables
    let allGearSystems = [];  // To hold all possible gear systems
    let totalCalculatedSystems = 0;
    let processFinished = false;

    // Console log for debugging
    console.log(`Starting gear system calculation...`);
    console.log(`Min Teeth: ${spurgear_min_teeth}, Max Teeth: ${spurgear_max_teeth}`);
    console.log(`Max Layers: ${spurgear_max_layers}, Target Gear Ratio: ${target_gear_ratio}`);

    // Function to calculate gear ratio between two gears
    function calculateGearRatio(gear1, gear2) {
        return gear2 / gear1;
    }

    // Function to try a combination of gears and calculate if it meets the target gear ratio
    function testGearCombination(gearCombination) {
        let currentRatio = 1;
        let toothCounts = [];
        
        // Calculate the gear ratio across all layers
        for (let i = 0; i < gearCombination.length - 1; i++) {
            let ratio = calculateGearRatio(gearCombination[i], gearCombination[i + 1]);
            currentRatio *= ratio;
            toothCounts.push(gearCombination[i]);
        }
        
        // Include the last gear
        toothCounts.push(gearCombination[gearCombination.length - 1]);

        // Check if the ratio matches the target
        if (Math.abs(currentRatio - target_gear_ratio) < 0.01) {
            // If the ratio is close enough, we consider it a valid system
            return { toothCounts, currentRatio };
        }

        return null;
    }

    // Function to generate combinations of gears layer by layer
    function generateGearSystems(layer, currentSystem) {
        // If we reached the maximum layers, stop the calculation
        if (layer > spurgear_max_layers || processFinished) {
            return;
        }

        // Loop through all teeth counts for the next gear in the layer
        for (let teeth = spurgear_min_teeth; teeth <= spurgear_max_teeth; teeth++) {
            let newSystem = [...currentSystem, teeth];

            // Test the current gear combination
            let result = testGearCombination(newSystem);

            // If result is valid (i.e., meets target ratio), add it to the results
            if (result) {
                allGearSystems.push({
                    toothCounts: result.toothCounts,
                    gearRatio: result.currentRatio,
                    numGears: result.toothCounts.length,
                    currentLayer: layer
                });
                totalCalculatedSystems++;

                console.log(`Valid gear system found: ${result.toothCounts}, Ratio: ${result.currentRatio}`);
                // If we have found a valid gear system, stop further calculations
                processFinished = true;
                break;
            } else {
                // Continue to next layer
                generateGearSystems(layer + 1, newSystem);
            }

            // If the ideal system is found, break out of the loop
            if (processFinished) break;
        }
    }

    // Start the gear system generation from the first layer (empty system)
    generateGearSystems(1, []);

    // After the process is done, send the results back
    if (processFinished) {
        console.log(`Ideal gear system found. Sending results...`);
        self.postMessage([0, allGearSystems, totalCalculatedSystems]);
    } else {
        // If no ideal system is found, send all calculated systems
        console.log(`Process finished, sending results...`);
        self.postMessage([1, totalCalculatedSystems]);
    }
    
    // Final output after process is complete
    self.postMessage([2, 'Process finished']);
};
