// Worker Script
self.onmessage = function(msg) {
    // Input parameters from the main thread
    let spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    let spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    let spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio

    // Data structure to hold results
    let gearSystems = [];
    let systemCount = 0;

    // Function to calculate the gear ratio between two gears
    function calculateGearRatio(gear1, gear2) {
        return gear2 / gear1;
    }

    // Function to calculate maximum possible gear ratio for a layer
    function calculateMaxGearRatio(layer) {
        // Max ratio for each layer is calculated based on the number of teeth of the gears in the layer
        let maxGear1Teeth = spurgear_max_teeth;
        let maxGear2Teeth = spurgear_max_teeth;
        return calculateGearRatio(maxGear1Teeth, maxGear2Teeth);
    }

    // Main calculation logic
    function calculateGearSystem(currentLayer) {
        // This function generates gear systems for a specific layer.
        let maxRatio = calculateMaxGearRatio(currentLayer);
        console.log(`Max gear ratio for layer ${currentLayer}: ${maxRatio}`);

        // If max gear ratio of the layer is below the target, skip this layer
        if (maxRatio < target_gear_ratio) {
            console.log(`Skipping layer ${currentLayer} as max ratio is below target`);
            return false;
        }

        let systemsInLayer = [];
        
        // Loop through all gear combinations for the current layer
        for (let gear1Teeth = spurgear_min_teeth; gear1Teeth <= spurgear_max_teeth; gear1Teeth++) {
            for (let gear2Teeth = spurgear_min_teeth; gear2Teeth <= spurgear_max_teeth; gear2Teeth++) {
                let ratio = calculateGearRatio(gear1Teeth, gear2Teeth);
                // Add gear system if the ratio is close to the target (don't filter out too much)
                if (ratio <= target_gear_ratio * 1.05 && ratio >= target_gear_ratio * 0.95) {
                    systemsInLayer.push({ gear1Teeth, gear2Teeth, ratio });
                }
            }
        }

        // If no systems found in this layer, skip it
        if (systemsInLayer.length === 0) {
            console.log(`No valid systems found for layer ${currentLayer}`);
            return false;
        }

        // Add the systems from this layer to the overall gear systems
        gearSystems.push(systemsInLayer);
        systemCount++;
        return true;
    }

    // Loop through each layer, from layer 1 to spurgear_max_layers
    for (let layer = 1; layer <= spurgear_max_layers; layer++) {
        console.log(`Processing layer ${layer}`);
        
        // If we've already found the ideal system, we skip subsequent layers
        if (gearSystems.length > 0 && gearSystems[gearSystems.length - 1].some(system => system.ratio === target_gear_ratio)) {
            console.log(`Ideal system found, skipping layer ${layer}`);
            break;
        }

        // Try to calculate the gear systems for the current layer
        let layerProcessed = calculateGearSystem(layer);

        // If no systems were found for the current layer, stop early
        if (!layerProcessed) {
            break;
        }
    }

    // Output all gear systems found
    console.log('Total number of calculated gear systems:', systemCount);
    for (let i = 0; i < gearSystems.length; i++) {
        let layerSystems = gearSystems[i];
        console.log(`Layer ${i + 1}:`);
        for (let system of layerSystems) {
            console.log(`Gear 1: ${system.gear1Teeth} teeth, Gear 2: ${system.gear2Teeth} teeth, Gear Ratio: ${system.ratio}`);
        }
    }

    // Final output signals
    self.postMessage([0, gearSystems, target_gear_ratio, systemCount, 'last layer']); // Placeholder for more detailed layer-specific outputs
    self.postMessage([1, systemCount]); // Number of calculated systems
    self.postMessage([2]); // Process finished
};
