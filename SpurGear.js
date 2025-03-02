//Optimization 2: 8-25 teeth, 4 layers, 7.52:1: 5 min 8s
//Optimization 3: 8-25 teeth, 4 layers, 7.52:1: 19s

self.onmessage = function (msg) {
	console.log("Worker received message");
    //Parse inputs from the message
    let min_teeth = parseInt(msg.data[0]);  //Minimum teeth for a spur gear
    let max_teeth = parseInt(msg.data[1]);  //Maximum teeth for a spur gear
    let max_layers = parseInt(msg.data[2]); //Maximum number of layers
    let target_gear_ratio = parseFloat(msg.data[3]); // Target gear ratio
	let idealFound = false;
	let noProgressHere = false;

    let calculation_count = 0; //Keep track of how many calculations we've done
	let update_limit = 10000; //Update every x calculations
	
	//Function for posting the new best gear system
	function postNewBestSystem(gear_system, gear_ratio, currentLayer, gear_ratio_deviation){
		self.postMessage([0, gear_system, gear_ratio, gear_system.length * 2, currentLayer, gear_ratio_deviation]); //Reminder to add distance
		console.log("Worker posted message: " + 0 + "\n Gear system: " + gear_system + "\n Gear ratio: " + gear_ratio + "\n Array length: " + gear_system.length * 2 + "\n Current layer: " + currentLayer + "\n Deviation: " + gear_ratio_deviation);
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
	
	var gear_ratio;
	var gear_ratio_best_deviation = Infinity;
	var previous_gear_ratio = Infinity;
	
	function calculateGearRatio(gearSystem, currentLayer){
		
		//Default gear ratio multiplier = 1
		gear_ratio = 1;
		
		//Calculate the gear ratio
		for(let j=0; j < gearSystem.length; j += 2){
			//New layer gear ratio = Previous layer gear ratio * (new second gear / new first gear)
			gear_ratio = gear_ratio * (gearSystem[j+1]/gearSystem[j]);
		}
		
		//The deviation from the target gear ratio
		gear_ratio_deviation = target_gear_ratio - gear_ratio;
		
		//Is the deviation better or equal to the previous best deviation?
		if(Math.abs(gear_ratio_deviation) <= gear_ratio_best_deviation){
			
			//Post result if the new ratio is better.
			postNewBestSystem(gearSystem, gear_ratio, currentLayer, -gear_ratio_deviation);
			
			//Replace the previous best deviation.
			gear_ratio_best_deviation = Math.abs(gear_ratio_deviation);
			
		}
		//Deviation bigger than the previous best deviation, no progress in this direction. || Optimization 3.
		/*if(Math.abs(gear_ratio_deviation) > gear_ratio_best_deviation){			
			noProgressHere = true;
		}*/
		
		//Check if the gear ratio is the same as the target gear ratio
		if(gear_ratio == target_gear_ratio){
			//An ideal has been found, no point in adding in a new layer of gears || Optimization 1.
			idealFound = true;
			console.log("Ideal found");
		}
		
	}
	

	function cycleGears(currentLayer) {
		let complete = false;
		
		//Create a new gear system with minimum values based off of the current layer.
		gearSystem = new Array(currentLayer*2).fill(min_teeth);
		
		//Calculate the first gear ratio of the layer
		calculateGearRatio(gearSystem, currentLayer);
		
		//Cycle the rest of the combinations of the layer
		while(true){
			
			//Check the gears in the combination
			for (let gear = 0; gear < gearSystem.length; gear++) {
				//Check if we went closer to the goal, checked by the gear ratio calculator || Optimization 3.
				if(noProgressHere == false){
					
					//Increase the tooth count of the current gear by 1
					gearSystem[gear]++;
					
					//Check if the current gear is below max teeth. If yes, calculate the gear ratio.
					if (gearSystem[gear] < max_teeth+1) break;
					
					//Check if this is the last gear and if it has max teeth. If yes, stop the function.
					if (gear == gearSystem.length - 1 && gearSystem[gear] == max_teeth+1) {
						console.log("gearSystem has reached the end!");
						complete = true;
						return;
					}
					
					//Neither check was triggered, reset the tooth count of the gear back to minimum and move on to the next gear
					gearSystem[gear] = min_teeth;
					
				}else{
					//Optimization 3 triggered.
					console.log("Optimization 3 triggered.");
					
					//Reset noProgressHere
					noProgressHere = false;
					console.log(gearSystem);
					//Reset the tooth count of the current gear and move on to the next gear
					gearSystem[gear] = min_teeth;					
				}				
			}
			
			//Calculate the gear ratio of the newly made combination
			calculateGearRatio(gearSystem, currentLayer);
			
			//If done looking through layer, stop.
			if(complete == true) break;
		};
	}
	
	//---------------------------------------------------------------------------//
	//-----------------------Start the calculation process-----------------------//
	//---------------------------------------------------------------------------//
	console.log("version 12");
	try {

		//Look through each layer for the optimal gear ratio
		for(let currentLayer = 1; currentLayer <= max_layers; currentLayer++){
			
			//If the ideal has not been found, proceed, else skip layer || Optimization 1
			if(idealFound != true){
			
				//If maximum possible gear ratio in the layer is above or equal to target ratio, proceed, else skip layer || Optimization 2
				if(MaxGearRatio(currentLayer) >= target_gear_ratio){
					console.log("Starting from layer " + currentLayer + " with " + currentLayer*2 + " gears.");
					
					//Cycle through the possibilities
					cycleGears(currentLayer);
					
				}else{
					console.log("Skipped layer " + currentLayer + ", not high enough of a gear ratio.");
				}
			}else{
				console.log("Skipped layer " + currentLayer + ", ideal has been found.");
			}
		}
		
		//Done looking through the layers
		postDone();
		
		} catch (error) {
			console.log(error.message);
		}
		
};