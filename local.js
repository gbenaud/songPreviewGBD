/////////////////////////////////////////////////////////////////////////////
// Dialog Song Preview par gb63                                            //
// ----------------------------------------------------------------------- //
// ajout sur la barre d'outil  du sous-menu reglage preview                //
/////////////////////////////////////////////////////////////////////////////

(function () {
    window.uitools.addToolButton('righttoolbuttons', 'songPreview' /* icon */ , function () {
		// get list of selected songs
		var list = uitools.getSelectedTracklist();
		// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
		//var list = app.playlist.getTracklist();  
		//await list.whenLoaded();
	 	
        var dlg = uitools.openDialog('dlgSongPreview', {
            show: true,
            modal: true,
            notShared: true,
            title: _('Song Preview'),
            tracks: list
        });
	
    }, 'Song Preview');
})();