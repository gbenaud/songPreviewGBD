/////////////////////////////////////////////////////////////////////////////
// Dialog Song Preview par gb63                                            //
// ----------------------------------------------------------------------- //
// ajout dans le menu "Lecture" du sous-menu reglage preview               //
/////////////////////////////////////////////////////////////////////////////

window.songPreviewGBDUpdatePlayerButtonIcons = function () {
	var settings = app.getValue('SongPreviewGBD_settings', {
		setEnablePreview: false,
		setDisplayPreview: true
	});
	var iconName = settings.setEnablePreview ? 'radio_button_partial' : 'radio_button_checked';
	var buttons = document.querySelectorAll('[data-id="songPreviewGBDButton"]');

	for (let i = 0; i < buttons.length; i++) {
		let control = buttons[i].controlClass;
		buttons[i].style.display = settings.setDisplayPreview === false ? 'none' : '';
		if (!control || !control.buttonDiv || control.songPreviewGBDIcon === iconName)
			continue;

		control.songPreviewGBDIcon = iconName;
		loadIconFast(iconName, function (icon) {
			if (control.songPreviewGBDIcon === iconName)
				setIconFast(control.buttonDiv, icon);
		});
	}
};

actions.songPreview = {
	title: _('Song Preview'),
	hotkeyAble: true,
	icon: 'songPreview',
	disabled: false,  //uitools.notMediaListSelected,
    visible: window.uitools.getCanEdit,
    execute: async function() {

	 	var list = uitools.getSelectedTracklist();
	
        var dlg = uitools.openDialog('dlgSongPreview', {
            show: true,
            modal: true,
            notShared: true,
            title: _('Song Preview'),
            tracks: list
        }, function () {
			window.songPreviewGBDUpdatePlayerButtonIcons();
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
	disabled: function () {
            return window.settings.UI.disablePlayerControls.song_preview;
        },
    visible: window.uitools.getCanEdit,
    execute: function () {
                uitools.toastMessage.show(_('clic ici songprev '));
                    }

}

		
window._menuItems.play.action.submenu.push({
        action: actions.songPreview,
        order: 70,
        grouporder: 20
});