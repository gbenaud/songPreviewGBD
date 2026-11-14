/**
Adds preview to player-pause button. modif GB from "pulsing pause script"
*/
Player.prototype.override({
    initialize: function ($super, elem, params) {
        $super(elem, params);
        this.pp = { // for variables needed for this script
            player: app.player //,

        };
        var pp = this.pp;


		// temps de depart et de fin	
	    var starttime1 = 0;		// en milliseconde
	    var endtime1 = 0;		
	    var starttime2 = 0;		// en milliseconde
	    var endtime2 = 0;	
		
        this.pp.update = function () {
       
	    //  v2 supprimer ?
		//if (!pp || !pp.playerBtn)
        //     return;
		if ( !pp)
             return;
		 
        // tm : position de lecture sur la piste
		// tlg : longueur de la piste
        var tm = pp.player.trackPositionMS;   // Gets current track playback position, in ms. For setting position use seekMSAsync.
	    var tlg = pp.player.trackLengthMS;  //   Gets current track length, in ms.
			 
		// recup valeurs sauvegarees
		var sett = app.getValue('SongPreviewGBD_settings',{
		setEnablePreview : false,     // Enable Preview 
		setCancelPreview : true,     // Cancel Preview on update 
		setStartSpec     : 'StartPercentage',
		setEndSpec       : 'TimePeriod',
		setStartValue    : 10,
		setEndValue      : 20,
		setStartValue2   : '',
		setEndValue2     : ''		
	        });			 
			 
			 
		// si on a valide preview
        if (sett.setEnablePreview) {

            //['StartPercentage', 'TimeFromBegin',  'TimeFromEnd', 'TimePeriod', 'EndPercentage','LengthPercentage'];
			// determine le temps de depart
			if (sett.setStartSpec === 'StartPercentage'){starttime1 = tlg * sett.setStartValue /100 };  // start = longueur * % choisi
			if (sett.setStartSpec === 'TimeFromBegin' ) {starttime1 = sett.setStartValue * 1000};      // start = valeur choisie 
			if (sett.setStartSpec === 'TimeFromEnd' ){starttime1 =  tlg - (sett.setStartValue * 1000)};  // start = longueur - valeur choisie
			//  gere les dépassements , Exemple :
			// tlg=5mn  TimeFromBegin 10 mn => starttime1 >  tlg
			// tlg=5mn  TimeFromEnd 10 mn => starttime1 <0
			if (starttime1 < 0){starttime1 =0 };
			if (starttime1 >= tlg){starttime1 = 0 };

			// determine la fin de lecture
			//if (sett.setEndSpec === 'TimeFromBegin' ) {endtime1 = sett.setEndValue * 1000};  			// end = valeur choisie 
			if (sett.setEndSpec === 'TimeFromEnd' )  {endtime1 =  tlg - (sett.setEndValue * 1000)};		// end = longueur - valeur choisie
			if (sett.setEndSpec === 'TimePeriod'){endtime1 = starttime1 +(sett.setEndValue * 1000)};	// end = start + valeur choisie
            if (sett.setEndSpec ===	'EndPercentage'){endtime1 = tlg * sett.setEndValue /100 };	  		// end = longueur * % choisi	   
            if (sett.setEndSpec ===	'LengthPercentage'){endtime1 = starttime1 + (tlg * sett.setEndValue /100) };// end = start + (longueur * % choisi)	   

			//  gere les dépassements
			if (endtime1 > tlg){endtime1 = tlg };  					// end = longueur  
			if (endtime1 <= starttime1){endtime1 = tlg };           // fin av debut : fin = longueur
			if (endtime1 <= 0){endtime1 = tlg };  			        // doublon avec condition precedente
			   
			// si position de lecture < début choisi : on saute au début choisi  
            if (tm < starttime1) {
		 		pp.player.seekMSAsync(starttime1); // Seek to the given time, asynchronously.
               };

			// si position de lecture > fin choisie : on saute au suivant
			if (tm > endtime1) {
		 		pp.player.nextAsync();; // Play next file in nowplaying list.
               };				
			   
			}

            // v2
            this.requestTimeout(function () {
                if (pp.currState === 'play') {
                   this.requestFrameMM(pp.update, 'SongPreviewGBDFrame');
                }
            }.bind(this), 20, 'SongPreviewGBDTimeout', true);
        }.bind(this);
    },
});

// action sur le bouton pause
window.playerControlsHandlers.pause.override({
	// fonction init 
    init: function ($super, el, playerCtrl) {
        $super(el, playerCtrl);
        el.controlClass.addToContextMenu(function () {
            var buttonMenuAct;
			
		// recup valeurs sauvegarees
		var sett = app.getValue('SongPreviewGBD_settings',{
		setEnablePreview : false,     // Enable Preview 
		setCancelPreview : true,     // Cancel Preview on update 
		setStartSpec     : 'StartPercentage',
		setEndSpec       : 'TimePeriod',
		setStartValue    : 10,
		setEndValue      : 20,
		setStartValue2   : '',
		setEndValue2     : ''		
	        });										
			
 		// v2 si preview active
            if (sett.setEnablePreview) {
                buttonMenuAct = {
                    action: {
                        title: 'Disable preview button',
                        execute: function () {
	
							sett.setEnablePreview = false;
							// Save the values
							app.setValue('SongPreviewGBD_settings', sett);
							
                        }
						
                    },
                    order: 10,
                    grouporder: -10
                }
            } else {
                buttonMenuAct = {
                    action: {
                        title: 'Enable preview',
                        execute: function () {
 							
							sett.setEnablePreview = true;
							// Save the values
							app.setValue('SongPreviewGBD_settings', sett);		
							
                            if (playerCtrl.pp.currState === 'play') {
                                playerCtrl.pp.update();
                            };
                        }
                    },
                    order: 10,
                    grouporder: -10 // to be separated first
                }
            }
			
            return [buttonMenuAct];
        });
    },

    // on playback : I don't undrstand why this code 
    onPlaybackState: function ($super, el, playerCtrl, state) {
        $super(el, playerCtrl, state);
        if (!playerCtrl.pp)
            return;
        switch (state) {
            case 'unpause':
            case 'play':
                if (playerCtrl.pp.currState !== 'play') {
                    playerCtrl.pp.currState = 'play';

                        playerCtrl.pp.update();
                }
                break;
            case 'stop':
                playerCtrl.pp.currState = state;
                break;
            case 'pause':
                playerCtrl.pp.currState = state;
                break;
        }
    }
});
