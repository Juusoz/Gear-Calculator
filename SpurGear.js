self.onmessage = function (msg) {
	console.log("Message received");
    //Parse inputs from the message
    let min_teeth = parseInt(msg.data[0]);  //Minimum teeth for a spur gear
    let max_teeth = parseInt(msg.data[1]);  //Maximum teeth for a spur gear
    let max_layers = parseInt(msg.data[2]); //Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio
	let idealFound = false;

    let calculation_count = 0; //Keep track of how many calculations we've done
	let update_limit = 10000; //Update every x calculations
	
	//Function for posting the new best gear system
	function postNewBestSystem(gear_system, gear_ratio, currentLayer, gearRatio_distance){
		self.postMessage([0, gear_system, gear_ratio, gear_system.length * 2, currentLayer]); //Reminder to add distance
		console.log("Posted message: " + 0 + "\n Gear system: " + gear_system + "\n Gear ratio: " + gear_ratio + "\n Array length: " + gear_system.length * 2 + "\n Current layer: " + currentLayer + "\n Gear ratio distance: " + gearRatio_distance);
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
	try {
		console.log("version 11");
		for(let currentLayer = 1; currentLayer <= max_layers; currentLayer++){
			
			if(idealFound != true){										//If the ideal has not been found, proceed, else skip layer
				if(MaxGearRatio(currentLayer) >= target_gear_ratio){	//If max gear ratio is above or equal to target ratio, proceed, else skip layer
					console.log("Starting from layer " + currentLayer + " with " + currentLayer*2 + " gears.");
					
					var goal_gear = currentLayer*2;	//The gear number before starting the next layer
					var gearSystem = [];
					var gearRatio = 1;
					
					for(let current_gear = 0; current_gear < goal_gear; current_gear++){	//Populate the gear system
						gearSystem.push(min_teeth);
					}
					
					while(gearSystem[gearSystem.length-1] < min_teeth){		//While the last value in the gear system is below max tooth count, loop.
					
						gearRatio = 1;	//Reset gear ratio
						for(let i=0; i < gearSystem.length;){	//Calculate the new gear ratio
							gearRatio = gearRatio * (gearSystem[i+1]/gearSystem[i]);
							i += 2;
							//console.log("gear ratio: " + gearRatio + ":1");
						}
						gearRatio_distance = Math.abs(target_gear_ratio - gearRatio); //The distance to the goal ratio, forced positive.
						postNewBestSystem(gearSystem, gearRatio, currentLayer, gearRatio_distance);
						
						console.log(gearSystem);
						
						//Create the next gear system
						gearSystem[0]++;	//Add 1 to the first gear
						if(gearSystem[0] > max_teeth){
							gearSystem[0] = min_teeth;	//Reset first gear
							gearSystem[1]++;			//Add 1 to the next gear
							if(gearSystem[1] > max_teeth){
								gearSystem[1] = min_teeth;	//Reset first gear
								gearSystem[2]++;			//Add 1 to the next gear
								if(gearSystem[2] > max_teeth){
									gearSystem[3] = min_teeth;	//Reset first gear
									gearSystem[3]++;			//Add 1 to the next gear
									if(gearSystem[3] > max_teeth){
										break;
									}
								}
							}
						}
					}
					
				}else{
					console.log("Skipped layer " + currentLayer + ", not high enough of a gear ratio.");
				}
			}else{
				console.log("Skipped layer " + currentLayer + ", ideal has been found.");
			}
		}
		
		postDone();
		
		} catch (error) {
			console.log(error.message);
		}
};
		
	
	
	
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
};*/
