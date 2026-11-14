/////////////////////////////////////////////////////////////////////////////
// Dialog Song Preview par gb63                                            //
// ----------------------------------------------------------------------- //
// ajout dans le menu "Lecture" du sous-menu reglage preview               //
/////////////////////////////////////////////////////////////////////////////

actions.songPreview = {
	title: _('Song Preview'),
	hotkeyAble: true,
	icon: 'songPreview',
	disabled: false,  //uitools.notMediaListSelected,
    visible: window.uitools.getCanEdit,
    execute: async function() {
     //   var pl = app.player;
     //   pl.seekMSAsync(pl.trackPositionMS + 10000);
    //        },
    //        disabled: function () {
    //            return window.settings.UI.disablePlayerControls.seek;
    //        }
		// get list of selected songs
	//	 var list = uitools.getSelectedTracklist();
		//var list = PlaylistEntries.getTracklist();
		//var list = app.playlist.getTracklist();  
		//await list.whenLoaded();
    //    var dlg = uitools.openDialog('dlgSongPreview', {
    //        show: true,
    //        modal: true,
    //        notShared: true,
    //        title: _('Song Preview'),
    //        tracks: list
	//	});
	// }
	 	var list = uitools.getSelectedTracklist();
	//	var list = uitools.getTracklist();
	// 	var list = app.playlist.getTracklist();
	//  	 messageDlg(_(`Nbre v tracks to be read= ${list.length} << verif `), 'Error', ['btnOK'], {defaultButton: 'btnOK'} , undefined);
	
        var dlg = uitools.openDialog('dlgSongPreview', {
            show: true,
            modal: true,
            notShared: true,
            title: _('Song Preview'),
            tracks: list
        });
	
	}
	
	
	
}

actions.song_preview = {
	title: _('Song Preview'),
	hotkeyAble: true,
	icon: 'songPreview',
    //       
    category: _actionCategories.playback,
    checkable: true,
    checked: function () {
            return app.player.shufflePlaylist;
        },
	//disabled: false,  //uitools.notMediaListSelected,
	disabled: function () {
            return window.settings.UI.disablePlayerControls.song_preview;
        },
    visible: window.uitools.getCanEdit,
    //execute: async function() {
 
	 	//var list = uitools.getSelectedTracklist();
	
        //uitools.openDialog('dlgSongPreview', {
        //    show: true,
        //    modal: true,
        //    notShared: true,
        //    title: _('Song Preview'),
        //    tracks: list
        //});
    execute: function () {
                uitools.toastMessage.show(_('clic ici songprev '));
                    }

}
//
//    shuffle: {
//        title: function () {
//            return _('Shuffle');
//        },
//        icon: 'shuffle',
//        hotkeyAble: true,
//        category: _actionCategories.playback,
//        checkable: true,
//        checked: function () {
//            return app.player.shufflePlaylist;
//        },
//        disabled: function () {
//            return window.settings.UI.disablePlayerControls.shuffle;
//        },
//        execute: function () {
//            app.player.shufflePlaylist = !app.player.shufflePlaylist;
//            if (app.player.shufflePlaylist)
//                app.player.randomizePlaylistAsync();
//            else {
//                let undolist = app.player.getUndoList(true /* only first*/);
//                if (undolist.count > 0) {
//                    undolist.locked(() => {
//                        if (undolist.getValue(0) == _('Randomize list')) {
//                            uitools.toastMessage.show(_('Shuffle disabled. Reverting to unshuffled list.'));
//                            app.player.undoAsync(1);
//                        }
//                        else
//                            uitools.toastMessage.show(_('Shuffle disabled. Unable to unshuffle due to edits - use \'Undo\' to revert changes to the \'Playing\' list.'));
//                    });
//                }
//            }
//        },
//    },


		
window._menuItems.play.action.submenu.push({
        action: actions.songPreview,
        order: 70,
        grouporder: 20
});