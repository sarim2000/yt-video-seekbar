// Global segments array
var segments = [
    { time: 0, label: 'Intro' },
    { time: 60, label: 'Chapter 1' }
    // Add more segments as needed
];

// Initialize VideoJS player
var player = videojs('my-video', {
    controls: true,
    fluid: true,
    html5: {
        vhs: {
            overrideNative: true
        }
    }
}, function () {
    this.src({
        src: 'https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd',
        type: 'application/dash+xml',
        keySystems: {
            'com.widevine.alpha': 'https://cwip-shaka-proxy.appspot.com/no_auth'
        }
    });

    var progressHolder = this.controlBar.progressControl.el();
    var tooltip = createTooltip();
    progressHolder.appendChild(tooltip);

    this.on('loadedmetadata', () => addMarkers(segments, this));

    setupTooltipEvents(progressHolder, tooltip, this);
});

// Creates a tooltip element
function createTooltip() {
    var tooltip = document.createElement('div');
    tooltip.className = 'segment-tooltip';
    return tooltip;
}

// Adds markers to the progress bar
function addMarkers(segments, player) {
    segments.forEach(segment => {
        var marker = createMarker(segment, player);
        player.controlBar.progressControl.el().appendChild(marker);
    });
}

// Creates a marker element
function createMarker(segment, player) {
    var marker = document.createElement('div');
    marker.className = 'segment-marker';
    var positionPercent = (segment.time / player.duration()) * 100;
    marker.style.left = positionPercent + '%';

    var tooltip = document.createElement('span');
    tooltip.className = 'segment-tooltip';
    tooltip.textContent = segment.label;
    marker.appendChild(tooltip);

    marker.onclick = () => player.currentTime(segment.time);
    return marker;
}

// Sets up tooltip events
function setupTooltipEvents(progressHolder, tooltip, player) {
    progressHolder.addEventListener('mousemove', e => {
        var rect = progressHolder.getBoundingClientRect();
        var percent = (e.pageX - rect.left) / rect.width;
        var time = percent * player.duration();
        var nearestSegment = findNearestSegment(time, segments, player);

        if (nearestSegment) {
            tooltip.textContent = nearestSegment.label;
            tooltip.style.left = (percent * rect.width - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = 1;
        } else {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = 0;
        }
    });

    progressHolder.addEventListener('mouseout', () => {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = 0;
    });
}

// Finds the nearest segment based on current time
function findNearestSegment(time, segments, player) {
    return segments.find((segment, index) => {
        let end = index < segments.length - 1 ? segments[index + 1].time : player.duration();
        return time >= segment.time && time < end;
    });
}

// Event listener for adding a new segment
document.getElementById('add-segment').addEventListener('click', () => {
    var time = parseInt(document.getElementById('segment-time').value);
    var label = document.getElementById('segment-label').value;
    if (time && label) {
        segments.push({ time, label });
        addMarkers([segments[segments.length - 1]], player);
        updateSegmentList(segments);
    }
});

// Event listener for jumping to a selected segment
document.getElementById('jump-to-segment').addEventListener('click', () => {
    var segmentIndex = document.getElementById('segment-list').value;
    if (segmentIndex >= 0 && segmentIndex < segments.length) {
        player.currentTime(segments[segmentIndex].time);
    }
});

// Updates the segment selection list
function updateSegmentList(segments) {
    var segmentList = document.getElementById('segment-list');
    segmentList.innerHTML = '';
    segments.forEach((segment, index) => {
        var option = document.createElement('option');
        option.value = index;
        option.text = `${segment.label} (${segment.time} s)`;
        segmentList.appendChild(option);
    });
}

// Initial update of segment list
updateSegmentList(segments);
