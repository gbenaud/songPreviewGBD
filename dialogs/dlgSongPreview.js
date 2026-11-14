/////////////////////////////////////////////////////////////////////////////
// Dialog Song Preview par gb63                                            //
// ----------------------------------------------------------------------- //
// gestion du menu reglage preview                                         //
/////////////////////////////////////////////////////////////////////////////

"use strict";

var sett;
const TABLE_SPEC =  ['StartPercentage', 'TimeFromBegin',  'TimeFromEnd', 'TimePeriod', 'EndPercentage','LengthPercentage'];
const TABLE_LABEL = [_('First Percentage'), _('Time From Begin'), _('Time From End'), _('Time Period'), _('2nd Percentage'), _('Length Percentage')];
var initialized = false;

var pos1= 0;
var pos2= 0;

var lastTime = 0;

//-----------------------------------------------------------------
// fonction attente
//-----------------------------------------------------------------
function sleep(){
    var tm = Date.now();
	var retval = ((tm - lastTime) > 10000);
	if (retval) lastTime = tm;
	return retval;
};

//-----------------------------------------------------------------
//Commit changes
//-----------------------------------------------------------------

function btnOkClick() {

	var UI = getAllUIElements();
	// messageDlg(_(`Nbre tracks to be read=${trackList.length}  << verif `), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
    const posLabelStart = TABLE_LABEL.indexOf(UI.ddnStartSpec.controlClass.value);
    const posLabelEnd = TABLE_LABEL.indexOf(UI.ddnEndSpec.controlClass.value);
    // valeurs a sauvegarder
    sett.setEnablePreview = UI.chkEnablePreview.controlClass.checked;
    sett.setCancelPreview = UI.chkCancelPreview.controlClass.checked;
	sett.setStartSpec   = TABLE_SPEC[posLabelStart]; 
	sett.setEndSpec     = TABLE_SPEC[posLabelEnd];
	sett.setStartValue  = UI.edtStartValue.controlClass.value;
    sett.setEndValue    = UI.edtEndValue.controlClass.value;
	sett.setStartValue2 = '';   
	sett.setEndValue2   = '';   

    // Save the values
    app.setValue('SongPreviewGBD_settings', sett);

	// on ferme la fenetre	
	closeWindow();		

};

//-----------------------------------------------------------------
//close without saving
//-----------------------------------------------------------------
function btnCancelClick() {};

//-----------------------------------------------------------------
//test numerique
//-----------------------------------------------------------------
function IsNumeric(sValue) {
	return!isNaN(sValue);
}

//-----------------------------------------------------------------
//init 
//-----------------------------------------------------------------

function init(params) {

    var dialogRoot = qid('dlgSongPreview');
	this.title = params.title;
	trackList = params.tracks;
    
	// recup valeur sauvegardees - ou valeur / defaut
	sett = app.getValue('SongPreviewGBD_settings',{
		setEnablePreview : false,     // Enable Preview 
		setCancelPreview : true,     // Cancel Preview on update 
		setStartSpec     : 'StartPercentage',
		setEndSpec       : 'TimePeriod',
		setStartValue    : 10,
		setEndValue      : 20,
		setStartValue2   : '',
		setEndValue2     : ''		
	});
	
	var ddnEndItems = ''; //  'Start Percentage,Time From Begin , Time From End , Time Period'  
    var ddnStartItems = '';
	//ddnEndItems = tablLibel.join(',');
	ddnStartItems = TABLE_LABEL[0] + ',' + TABLE_LABEL[1] +',' + TABLE_LABEL[2];
    ddnEndItems = TABLE_LABEL[2] + ',' + TABLE_LABEL[3] +',' + TABLE_LABEL[4] +',' + TABLE_LABEL[5];

	// recupere liste de lecture
	trackList = app.player.getTracklist(); 

	// ne marche pas		
	if(trackList.length == 0){
		messageDlg(_('Select tracks to be read'), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
 	 // messageDlg(_(`Nbre tracks to be read= ${trackList.length} << verif `), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
		return;
	};

	// recupere tt les elements du menu
	var UI = getAllUIElements();

    // alimenter les valeurs des Drop Down
    UI.ddnStartSpec.controlClass.items = ddnStartItems;
    UI.ddnEndSpec.controlClass.items = ddnEndItems;
	
    // selon valeur du ddown on affiche % ou seconde
    // pour les unités de départ	
    pos1= TABLE_SPEC.indexOf(sett.setStartSpec); 
	UI.ddnStartSpec.controlClass.value = TABLE_LABEL[pos1];
	if (pos1 == 0){
		UI.lblStartUnit.textContent = '%';   
	 }else 
	 {	UI.lblStartUnit.textContent = _('seconds');
	};
	
	// ... pour les unités de fin
    pos2= TABLE_SPEC.indexOf(sett.setEndSpec); 
	UI.ddnEndSpec.controlClass.value = TABLE_LABEL[pos2];	
	if (pos2 == 0 || pos2 == 4 || pos2 == 5){
		UI.lblEndUnit.textContent = '%';
	}else 
	{	UI.lblEndUnit.textContent = _('seconds');
	};	

	//alimenter les valeurs debut fin avec sauvegarde
	UI.edtStartValue.controlClass.value = sett.setStartValue;
	UI.edtEndValue.controlClass.value = sett.setEndValue;

    // alimente les bouton "enable preview" et "cancel on update"
    UI.chkEnablePreview.controlClass.checked = sett.setEnablePreview;
    UI.chkCancelPreview.controlClass.checked = sett.setCancelPreview;
    
	UI.chkCancelPreview.controlClass.disabled = true;
	UI.chkCancelPreview.controlClass.text = 'checkbox not yet implemented ';
    UI.chkCancelPreview.style.visibility = "hidden";
	
	
    // alim exemple à l'ouverture
	showsample();		
	
	//---------------------------------------
    // click sur chbox Enable
	//---------------------------------------
    window.localListen(UI.chkEnablePreview, 'click', function () {
      // ne declenche rien sur cet ecran
	});

	//---------------------------------------
    // click sur chbox Cancel
	//---------------------------------------
    window.localListen(UI.chkCancelPreview, 'click', function () {
	// ne declenche rien sur cet ecran
	});
	

	//---------------------------------------
    // changement sur Drop down   Start
	//---------------------------------------
    window.localListen(UI.ddnStartSpec, 'change', function () {

    // changement des unités
    pos1= TABLE_LABEL.indexOf(UI.ddnStartSpec.controlClass.value); 
	pos1 == 0 ? UI.lblStartUnit.textContent = '%' : UI.lblStartUnit.textContent = _('seconds');
	
	// remet les champs aux valeurs par defaut 
	switch (pos1) {
		case 0:                                        				// Song %
		   UI.edtStartValue.controlClass.value = 10;  				// 10%
        //   UI.ddnEndSpec.controlClass.value = tablLibel[3]; 		// time period
		//   UI.edtEndValue.controlClass.value = 20;		   		//  + 20 sec
           break;
		case 1:														// temps debut
		   UI.edtStartValue.controlClass.value = 10;  				// 10s du debut
		//   UI.ddnEndSpec.controlClass.value = tablLibel[3];  		// time period
		//   UI.edtEndValue.controlClass.value = 20;  				// +20 sec
           break;
		case 2:														// temps fin
	       UI.edtStartValue.controlClass.value = 60;  				// 30s de fin
		//   UI.ddnEndSpec.controlClass.value = tablLibel[3];  		// time period
		//   UI.edtEndValue.controlClass.value = 30;  				// +20 sec
           break;
	}; 
	

	   showsample();	
	});

	//---------------------------------------
    // changement sur Drop down   End
	//---------------------------------------

    //window.localListen(qid('ddnEndSpec'), 'change', function () {
    window.localListen(UI.ddnEndSpec, 'change', function () {
		
    // changement des unités
	pos1= TABLE_LABEL.indexOf(UI.ddnStartSpec.controlClass.value); 
    pos2= TABLE_LABEL.indexOf(UI.ddnEndSpec.controlClass.value); 
	if (pos2 == 0 || pos2 == 4 || pos2 == 5){
		UI.lblEndUnit.textContent = '%';
	}else 
	{	UI.lblEndUnit.textContent = _('seconds');
	};	
	// remet les champs aux valeurx par defaut 
	//  ['First Percentage', 'Time From Begin', 'Time From End', 'Time Period', '2nd Percentage', 'Length Percentage'];
	switch (pos1) {
		case 0:                                        				// Song 1st %
		   if (pos2 == 2){UI.edtEndValue.controlClass.value = 0};   //1st % +10'       'Time From End'
		   if (pos2 == 3){UI.edtEndValue.controlClass.value = 20};  //1st % +20s       'Time Period'    
		   if (pos2 == 4){UI.edtEndValue.controlClass.value = 100}; //1st % <-> 100%   '2nd Percentage' on met à 100%
		   if (pos2 == 5){UI.edtEndValue.controlClass.value = 100 - UI.edtStartValue.controlClass.value};  // 'Length Percentage'
           break;
		case 1:														// temps debut
		   if (pos2 == 2){UI.edtEndValue.controlClass.value = 0};  
		   if (pos2 == 3){UI.edtEndValue.controlClass.value = UI.edtStartValue.controlClass.value + 10}; //    20s de +que  debut 
		   if (pos2 == 4){UI.edtEndValue.controlClass.value = 100}; // temps debut + 10%
		   if (pos2 == 5){UI.edtEndValue.controlClass.value = 10}; // temps debut + 10%
           break;
		case 2:														// temps fin
		   if (pos2 == 2){UI.edtEndValue.controlClass.value = 10}; // temps fin + 10s
		   if (pos2 == 3){UI.edtEndValue.controlClass.value = 10}; // temps fin + 10%
		   if (pos2 == 4){UI.edtEndValue.controlClass.value = 100}; // temps fin + 10%
		   if (pos2 == 5){UI.edtEndValue.controlClass.value = 10}; // temps fin + 10%
           break;
	}; 
	
	   showsample();	
	});

	//---------------------------------------
    // changement sur 1ere valeur
	//---------------------------------------
    //window.localListen(qid('edtStartValue'), 'change', function () {
    window.localListen(UI.edtStartValue, 'change', function () {

    let err1 =false;
    let val1=UI.edtStartValue.controlClass.value; 
	// controle valeur
	
	
 	if (Math.sign(val1) < 0){
		 err1 =true;
		 UI.edtStartValue.controlClass.value = 0;
	     messageDlg(_('The value must be >= 0'), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
		};   
		
    // si on est en %	
	if (pos1 == 0){
	    if (!IsNumeric(val1)){
		 err1 =true;
		 UI.edtStartValue.controlClass.value = 0;
	     messageDlg(_('The value must be numeric'), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);		
		};

       //if (parseFloat(val1) <= -1)		
 		if (!err1 && Math.max(val1,0) == 0){
		 err1 =true;
		 UI.edtStartValue.controlClass.value = 0;
	     messageDlg(_('The value must be >= 0'), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
		};   
		
		if (!err1 && val1 >= 100 ){
		 err1 =true;
		 UI.edtStartValue.controlClass.value = 99;
	     messageDlg(_('The value must be < 100%'), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
		};

    };

 
	   showsample();
	});

	//---------------------------------------
    // changement sur 2eme valeur
	//---------------------------------------
    window.localListen(UI.edtEndValue, 'change', function () {

    let err1 =false;
    let val1=UI.edtEndValue.controlClass.value; 
	// controle valeur
    // si on est en %	
	if (pos2 == 0 || pos2 == 4 || pos2 == 5){
	    if (!IsNumeric(val1)){
		 err1 =true;
		 UI.edtEndValue.controlClass.value = 0;
	     messageDlg(_('The value must be numeric'), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);		
		};
		
 		if (!err1 &&  parseFloat(val1) <= -1){
		 err1 =true;
		 UI.edtEndValue.controlClass.value = 0;
	     messageDlg(_('The value must be >= 0'), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
		};   
		
		if (!err1 && val1 > 100 ){
		 err1 =true;
		 UI.edtEndValue.controlClass.value = 100;
	     messageDlg(_('The value must be <= 100%'), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
		};

    };

	   showsample();	   
	});


	//---------------------------------------
	// click on btn OK
	//---------------------------------------

    app.listen(qeid(dialogRoot, 'btnOK'), 'click', function () {
		btnOkClick();
    });


};

//-----------------------------------------------------------------
// Affichage de la ligne example selectionné
//    TODO : replace with multislider ?
//-----------------------------------------------------------------
function showsample() {
	var UI = getAllUIElements();
    UI.sample.textContent = '';
	texte1 ='';
	texte2 ='';
	texte3 ='';
	
    //			...1...2...3...4...5...6...7...8...9...0  100%
	//			..+..*..+..1..+..*..+..2..+..*..+..3..20  3mn20= 200s

    var posXS = 0;  // start : position du 1er car X
    var posXE = 0;  // end : position du dernier car X

    pos1= TABLE_LABEL.indexOf(UI.ddnStartSpec.controlClass.value); // valeurs saisies des dropdown
    pos2= TABLE_LABEL.indexOf(UI.ddnEndSpec.controlClass.value); 
   // 'Start Percentage', 'Time From Begin', 'Time From End', 'Time Period', 'End Percentage', 'Length Percentage'

 	switch (pos1) {
		case 0:																				//%
		   posXS = (40 * UI.edtStartValue.controlClass.value /100) -1 ;    // on est en Start %
           break;
		case 1:																				// temps debut
		   posXS = (40 * UI.edtStartValue.controlClass.value /200) -1 ;     // on est en secondes
           break;
		case 2:																				// temps de fin
		   posXS = 40 - (40 * UI.edtStartValue.controlClass.value /200)  ;     // on est en secondes
           break;
		default:
		   posXS = 0;
	   }; 


 	switch (pos2) {
		case 2:																				//time from end
		   posXE = 40 - (40 * UI.edtEndValue.controlClass.value /200) ;
           break;
		case 3:																				// temps period
		   posXE = posXS  + (40 * UI.edtEndValue.controlClass.value /200) ;
           break;
		case 4:																				// End %
		   posXE = (40 * UI.edtEndValue.controlClass.value /100) ;    
           break;
		case 5:																				// Length %
		   posXE = posXS + 1+ (40 * UI.edtEndValue.controlClass.value /100) ;    
           break;
		default:
		   posXE = 100;
	   }; 

   UI.sample.textContent = UI.sample.textContent.concat(texte1.padStart( posXS, '.'), texte2.padStart((posXE - posXS), 'X'), texte3.padStart(40-posXE, '.'));

};