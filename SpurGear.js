	/*The inputs are:

	The outputs are:
	self.postMessage([0, <tooth counts of each gear in the system>, <gear ratio>, <number of gears (2x current layer)>, <current layer>]);
	self.postMessage([1, <number of calculated gear systems>])
	self.postMessage([2]) (Meaning process is finished)

	The goals:
	1. The goal is to calculate all the possible spur gear systems layer by layer. The layers have 2 gears, and the first gear of the layer is joined to the last gear of the previous layer, so it has the same gear ratio. So gear 3 is connected to gear 2, and gear 5 is connected to gear 4.
	2. Gear systems are to be outputted only if they are just as close or closer to the target as the previous best.
	3. Once every 10000 calculations, or when done processing, update output 1.
	4. Once processing is done, do self.postMessage([2]).

	Optimizations:
	1. Do not start calculating the next layer for no reason. For example, layer 3 must never be calculated if an ideal solution exists in just 2 layers.
	2. Calculate the maximum possible gear ratio of the spur gears in the system at the start of each layer. If the maximum possible gear ratio for that layer is below the target gear ratio, the layer can be skipped. The equation for this is (max_teeth / min_teeth) ^ current_layers

	Rules:
	1. Have console logs for debugging at each important point. Comment things clearly.
	2. Do not stop calculating mid-layer. There might be other alternatives in that layer.
	3. The ideal gear ratio can be extremely specific, like 43.5749:1, so do not add anything that might toss out the closest possibility. The perfect gear ratio might not exist with current limits.
	4. Every time a new layer is added, the layers have to be gone through again. For example, calculating the possible gear ratios with 4 layers requires us to calculating every possible combination in layers 1, 2, 3 and 4, or the possible configuration of all 8 gears.
	5. New best gear systems need to be outputted as soon as they have been calculated.*/

self.onmessage = function(msg) {
	
    //Parse inputs from the message
    let min_teeth = parseInt(msg.data[0]);  //Minimum teeth for a spur gear
    let max_teeth = parseInt(msg.data[1]);  //Maximum teeth for a spur gear
    let max_layers = parseInt(msg.data[2]); //Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio
	let idealFound = false;

    let calculation_count = 0; //Keep track of how many calculations we've done
	let update_limit = 10000; //Update every x calculations
	
	//Function for posting the new best gear system
	function postNewBestSystem(){
		self.postMessage([0, gear_system, gear_ratio, gear_system.length * 2, currentLayer]);
	}
	
	//Function for posting an update on the progress
	function postUpdate(){
		self.postMessage([1, total_calculations]);
	}
	
	//Function for finishing up
	function postDone(){
		self.postMessage([2]);
	}
	
	//Function for calculating current max gear ratio
	function MaxGearRatio(currentLayer){
		return Math.pow((max_teeth / min_teeth), currentLayer);
	}
	
	//---------------------------------------------------------------------------//
	//-----------------------Start the calculation process-----------------------//
	//---------------------------------------------------------------------------//
	console.log("version 1");
	for(let currentLayer = 1; currentLayer <= max_layers; currentLayer++){
		
		if(idealFound != true){										//If the ideal has not been found, proceed, else skip layer
			if(MaxGearRatio(currentLayer) >= target_gear_ratio){	//If max gear ratio is above or equal to target ratio, proceed, else skip layer
				console.log("Starting from layer " + currentLayer + " with " + currentLayer*2 + " gears.");
			
				for(let gearTeeth = min_teeth; gearTeeth <= max_teeth; gearTeeth++){
					
				}
				
			}else{
				console.log("Skipped layer " + currentLayer + ", not high enough of a gear ratio.");
			}
		}else{
			console.log("Skipped layer " + currentLayer + ", ideal has been found.");
		}
	}
}
		
	
	postDone();
	
	
	/*
	


        // Loop over all possible gear combinations in this layer
        for (let gear1 = min_teeth; gear1 <= max_teeth; gear1++) {
            for (let gear2 = min_teeth; gear2 <= max_teeth; gear2++) {
                let newGearRatio = calculateGearRatio(previousLayerTeeth, gear1) * calculateGearRatio(gear1, gear2);

                // Check if this combination gets closer to the target gear ratio
                if (Math.abs(newGearRatio - target_gear_ratio) < Math.abs(best_gear_ratio - target_gear_ratio)) {
                    best_gear_ratio = newGearRatio;
                    best_gear_systems.push([gear1, gear2]); // Add new gear system to the best systems
                }

                // Update the calculation count
                calculation_count++;
                total_calculations++;

                // Output progress every 10,000 calculations
                if (calculation_count >= 10000) {
                    console.log(`Processed ${total_calculations} combinations so far.`);
                    calculation_count = 0; // Reset calculation count
                }
            }
        }

        // After processing, recursively calculate the next layer
        calculateLayer(currentLayer + 1, gear2, newGearRatio);
    }

    // Start the process with layer 1
    calculateLayer(1, min_teeth, 1);
};
