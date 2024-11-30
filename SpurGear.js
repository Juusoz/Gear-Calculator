// Worker Script

// Variables to store the input values
let spurgear_min_teeth;
let spurgear_max_teeth;
let spurgear_max_layers;
let target_gear_ratio;
let best_gears = []; // Array to hold the best gear systems
let calculations = 0; // Counter to track the number of calculations
let systems_found = 0; // Counter for systems found

// This function is called when the worker receives a message from the main thread
self.onmessage = function(msg) {
    // Parse the input values from msg.data
    spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio
    
    // Start the calculation process
    calculateGearSystems();
};

// Function to calculate gear systems layer by layer
function calculateGearSystems() {
    console.log("Starting gear system calculation...");
    
    // Initialize the first layer of gears and gear ratio calculations
    let previous_best_ratio = null;
    let current_gear_system = [];
    let layer = 1;
    
    // Loop through the layers of gears
    for (let layers = 1; layers <= spurgear_max_layers; layers++) {
        console.log(`Processing layer ${layers}...`);
        
        // Layer 1: calculate gear combinations
        let possible_combinations = getGearCombinations();
        console.log(`Possible gear combinations for layer ${layers}:`, possible_combinations);
        
        // If no gear combinations are possible, skip to the next layer
        if (possible_combinations.length === 0) {
            continue;
        }

        // Loop through possible gear combinations and calculate their gear ratios
        for (let combination of possible_combinations) {
            // Calculate gear ratio for the current combination
            let gear_ratio = calculateGearRatio(combination);
            
            // If the gear ratio is within an acceptable range, update best gear systems
            if (Math.abs(gear_ratio - target_gear_ratio) <= Math.abs(previous_best_ratio - target_gear_ratio)) {
                // Update best gear systems
                best_gears.push(combination);
                previous_best_ratio = gear_ratio;
                systems_found++;
                
                // Post message with updated gear systems, ratio, number of gears, and current layer
                self.postMessage([0, combination, gear_ratio, combination.length * 2, layers]);
            }

            // Increment calculation counter
            calculations++;

            // Periodically update the system's progress
            if (calculations % 10000 === 0) {
                self.postMessage([1, systems_found]); // Update progress
            }
        }

        // Calculate the maximum gear ratio for the next layer
        let max_possible_ratio = calculateMaxPossibleRatio(layers);
        
        // If the max possible ratio for this layer is less than the target, skip this layer
        if (max_possible_ratio < target_gear_ratio) {
            console.log(`Layer ${layers} skipped due to insufficient maximum gear ratio.`);
            continue;
        }
    }
    
    // Once all layers are processed, finish the process
    self.postMessage([2]); // Signal that processing is complete
}

// Function to get possible gear combinations for a given layer
function getGearCombinations() {
    let combinations = [];
    
    // Loop through all possible gear sizes within the range
    for (let i = spurgear_min_teeth; i <= spurgear_max_teeth; i++) {
        for (let j = spurgear_min_teeth; j <= spurgear_max_teeth; j++) {
            // Combine gears i and j in this layer, ensuring the gear ratio is reasonable
            combinations.push([i, j]);
        }
    }
    
    return combinations;
}

// Function to calculate the gear ratio between two gears
function calculateGearRatio(combination) {
    let gear1 = combination[0];
    let gear2 = combination[1];
    
    // Gear ratio is the ratio of the teeth count of gear2 to gear1
    return gear2 / gear1;
}

// Function to calculate the maximum possible gear ratio for a given layer
function calculateMaxPossibleRatio(layer) {
    // The maximum ratio for a layer is determined by the maximum number of teeth in the gears
    return spurgear_max_teeth / spurgear_min_teeth;
}
