/**
Adds preview controls to the player.
*/
function getPreviewSettings() {
    return app.getValue('SongPreviewGBD_settings', {
        setEnablePreview: false,
        setDisplayPreview: true,
        setCancelPreview: true,
        setStartSpec: 'StartPercentage',
        setEndSpec: 'TimePeriod',
        setStartValue: 10,
        setEndValue: 20,
        setStartValue2: '',
        setEndValue2: ''
    });
}

function setSongPreviewEnabled(playerCtrl, enabled) {
    var settings = getPreviewSettings();
    settings.setEnablePreview = enabled;
    app.setValue('SongPreviewGBD_settings', settings);
    window.songPreviewGBDUpdatePlayerButtonIcons();

    if (enabled && playerCtrl.pp && playerCtrl.pp.currState === 'play')
        playerCtrl.pp.update();
}

function getPreviewStartTime(trackLength, settings) {
    var startTime = 0;

    switch (settings.setStartSpec) {
        case 'StartPercentage':
            startTime = trackLength * settings.setStartValue / 100;
            break;
        case 'TimeFromBegin':
            startTime = settings.setStartValue * 1000;
            break;
        case 'TimeFromEnd':
            startTime = trackLength - settings.setStartValue * 1000;
            break;
    }

    if (startTime < 0 || startTime >= trackLength)
        return 0;
    return startTime;
}

function getPreviewEndTime(trackLength, startTime, settings) {
    var endTime = 0;

    switch (settings.setEndSpec) {
        case 'TimeFromEnd':
            endTime = trackLength - settings.setEndValue * 1000;
            break;
        case 'TimePeriod':
            endTime = startTime + settings.setEndValue * 1000;
            break;
        case 'EndPercentage':
            endTime = trackLength * settings.setEndValue / 100;
            break;
        case 'LengthPercentage':
            endTime = startTime + trackLength * settings.setEndValue / 100;
            break;
    }

    if (endTime > trackLength || endTime <= startTime || endTime <= 0)
        return trackLength;
    return endTime;
}

function updatePreviewPosition(player) {
    var settings = getPreviewSettings();
    if (!settings.setEnablePreview)
        return;

    var position = player.trackPositionMS;
    var trackLength = player.trackLengthMS;
    var startTime = getPreviewStartTime(trackLength, settings);
    var endTime = getPreviewEndTime(trackLength, startTime, settings);

    if (position < startTime)
        player.seekMSAsync(startTime);
    if (position > endTime)
        player.nextAsync();
}

function addPreviewButton(playerCtrl, rightButtons) {
    if (rightButtons.querySelector('[data-id="songPreviewGBDButton"]'))
        return;

    var previewSettings = getPreviewSettings();
    var previewIcon = previewSettings.setEnablePreview ? 'radio_button_partial' : 'radio_button_checked';
    var previewButton = uitools.addToolButton(
        rightButtons,
        previewIcon,
        function (event) {
            event.stopPropagation();
            var settings = getPreviewSettings();
            setSongPreviewEnabled(playerCtrl, !settings.setEnablePreview);
        },
        _('Song Preview')
    );

    previewButton.setAttribute('data-id', 'songPreviewGBDButton');
    previewButton.classList.add('playerButton', 'playerSmallButton');
    previewButton.controlClass.songPreviewGBDIcon = previewIcon;
    previewButton.style.display = previewSettings.setDisplayPreview === false ? 'none' : '';
    previewButton.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        event.stopPropagation();

        uitools.openDialog('dlgSongPreview', {
            show: true,
            modal: true,
            notShared: true,
            title: _('Song Preview'),
            tracks: uitools.getSelectedTracklist()
        }, function () {
            window.songPreviewGBDUpdatePlayerButtonIcons();
        });
    });

    var volumeButton = rightButtons.querySelector('[data-player-control="volume"]');
    if (volumeButton)
        rightButtons.insertBefore(previewButton, volumeButton);
    else
        rightButtons.appendChild(previewButton);
}

function getPreviewToggleMenuAction(playerCtrl, enabled) {
    return {
        action: {
            title: enabled ? 'Disable preview button' : 'Enable preview',
            execute: function () {
                setSongPreviewEnabled(playerCtrl, !enabled);
            }
        },
        order: 10,
        grouporder: -10
    };
}

Player.prototype.override({
    initialize: function ($super, elem, params) {
        $super(elem, params);

        var playerCtrl = this;
        var rightButtons = elem.querySelector('[data-id="playerRightButtons"]');
        if (rightButtons)
            addPreviewButton(playerCtrl, rightButtons);

        var pp = {
            player: app.player
        };
        this.pp = pp;
        pp.update = function () {
            updatePreviewPosition(pp.player);

            this.requestTimeout(function () {
                if (pp.currState === 'play')
                    this.requestFrameMM(pp.update, 'SongPreviewGBDFrame');
            }.bind(this), 20, 'SongPreviewGBDTimeout', true);
        }.bind(this);
    }
});

window.playerControlsHandlers.pause.override({
    init: function ($super, el, playerCtrl) {
        $super(el, playerCtrl);
        el.controlClass.addToContextMenu(function () {
            var settings = getPreviewSettings();
            return [getPreviewToggleMenuAction(playerCtrl, settings.setEnablePreview)];
        });
    },

    onPlaybackState: function ($super, el, playerCtrl, state) {
        $super(el, playerCtrl, state);
        if (!playerCtrl.pp)
            return;

        if (state === 'unpause' || state === 'play') {
            if (playerCtrl.pp.currState !== 'play') {
                playerCtrl.pp.currState = 'play';
                playerCtrl.pp.update();
            }
        } else if (state === 'stop' || state === 'pause') {
            playerCtrl.pp.currState = state;
        }
    }
});
