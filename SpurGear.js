// Global variables
var checked = 0;  // Counter for the number of combinations checked
var next = 0;  // Threshold for sending progress updates

function assert(condition) {
    if (!condition) {
        throw "assertion failed";
    }
}

self.onmessage = function (msg) {
    var spurgear_min_teeth = parseInt(msg.data[0]);  // Minimum teeth for a spur gear
    var spurgear_max_teeth = parseInt(msg.data[1]);  // Maximum teeth for a spur gear
    var spurgear_max_layers = parseInt(msg.data[2]); // Maximum number of layers
    var target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio (optional for filtering)
	var IdealFound = false;

    next = 10000;  // Progress update threshold

    // Recursive function to explore gear combinations across layers
    function exploreLayer(currentLayer, currentRatio, gears) {
		
        if (currentLayer > spurgear_max_layers || IdealFound == true) {
            // If maximum layers are reached or ideal solution has been found, send the results
            var totalGears = gears.length * 2; // Two gears per layer
            self.postMessage([0, gears, currentRatio, totalGears, currentLayer - 1]);
			console.log("Sent message");
            return;
        }

        for (var teeth1 = spurgear_min_teeth; teeth1 <= spurgear_max_teeth; teeth1++) {		//Cycle for gear 1
			
            for (var teeth2 = spurgear_min_teeth; teeth2 <= spurgear_max_teeth; teeth2++) {	//Cycle for gear 2
				
                var newRatio = currentRatio * (teeth2 / teeth1); // Cumulative ratio

                if(currentRatio == target_gear_ratio){	// Ideal solution has been found
					IdealFound = true;
					console.log("Ideal found");
				}

                // Track valid combinations for each layer
                exploreLayer(currentLayer + 1, newRatio, gears.concat([[teeth1, teeth2]]));

                checked++;  // Increment the number of combinations checked

                // Send periodic progress updates
                if (checked >= next) {
                    self.postMessage([1, checked]);
                    next += 10000;
                }
            }
        }
    }

    // Start the recursive exploration from the first layer
    exploreLayer(1, 1, []); // Initial ratio is 1, and no gears selected yet
	console.log("Started processing");

    // Notify the main thread that processing is complete
    self.postMessage([2]);
	console.log("Ended processing");
};
