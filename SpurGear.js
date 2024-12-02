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
		console.log("version 21");
		
		var gearSystem = [];
		var gearRatio;
		var oldBest_gearRatio = Infinity;
		var goal_gear = 2;
		
		for(let currentLayer = 1; currentLayer <= max_layers; currentLayer++){
			
			if(idealFound != true){										//If the ideal has not been found, proceed, else skip layer
				if(MaxGearRatio(currentLayer) >= target_gear_ratio){	//If max gear ratio is above or equal to target ratio, proceed, else skip layer
					console.log("Starting from layer " + currentLayer + " with " + currentLayer*2 + " gears.");
					
					gearSystem = [];		//Reset gear system
					goal_gear = currentLayer*2;	//The gear number before starting the next layer
					
					for(let current_gear = 0; current_gear < goal_gear; current_gear++){	//Populate the gear system
						gearSystem.push(min_teeth);
					}
					
					//Cycle through the possibilities
					for (let i = 0; i < gearSystem.length; i++) {
						gearSystem[i]++;
						
						//Tooth count is below or equal to the limit
						if (gearSystem[i] <= max_teeth) {
							
							gearRatio = 1;	//Reset gear ratio
							for(let j=0; j < gearSystem.length; j += 2){	//Calculate the new gear ratio
								gearRatio = gearRatio * (gearSystem[j+1]/gearSystem[j]);;
								//console.log("gear ratio: " + gearRatio + ":1");
							}
							
							gearRatio_distance = Math.abs(target_gear_ratio - gearRatio); //The distance to the goal ratio, forced positive.
							if(gearRatio_distance <= oldBest_gearRatio){
								postNewBestSystem(gearSystem, gearRatio, currentLayer, gearRatio_distance);	//Only post if the new ratio is better.
								oldBest_gearRatio = gearRatio_distance;
							}
							
							if(gearRatio == target_gear_ratio){
								idealFound = true;
								console.log("Ideal found");
							}
							
							console.log(gearSystem);
							break;
						}
						
						gearSystem[i] = min_teeth;
						
						//The layer has reached the end
						if (i === gearSystem.length - 1 && gearSystem[i] == max_teeth) {
							nextLayer = true;
						}
					}

						/*for(let gearCycler = 0; true; gearCycler++){		//Stop the update cycle once a gear has been updated.						
						
							if(gearSystem[gearCycler] > max_teeth){
								gearSystem[gearCycler] = min_teeth;	//Reset first gear
								gearSystem[gearCycler+1]++;			//Increase the value of the next gear by one
								console.log("Added 1 to gear " + gearCycler+1 + ", new value " + gearSystem[gearCycler+1]);
								break;								//Still got more to go
							}
							
							if(gearCycler[gearSystem.length-1] == max_teeth && gearUpdated == false){
								finalGear_achieved = true;				
								break;								//Final gear is at max and still no updates
							}
							
						}
						if(finalGear_achieved == true){
							break;
						}*/
					
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
