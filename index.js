var segments = [
    { time: 0, label: 'Intro' },
    { time: 60, label: 'Chapter 1' },
    // Add more segments as needed
];

var player = videojs('my-video', {
    controls: true,
    fluid: true,
    html5: {
        vhs: {
            overrideNative: true
        }
    }
}, function () {
    var player = this;

    player.src({
        src: 'https://cdn.bitmovin.com/content/assets/art-of-motion_drm/mpds/11331.mpd',
        type: 'application/dash+xml',
        keySystems: {
            'com.widevine.alpha': 'https://cwip-shaka-proxy.appspot.com/no_auth',
        }
    });



    var progressHolder = player.controlBar.progressControl.el();
    var tooltip = document.createElement('div');
    tooltip.className = 'segment-tooltip';
    progressHolder.appendChild(tooltip);

    player.on('loadedmetadata', function () {
        addMarkers(segments);
    });

    progressHolder.addEventListener('mousemove', function (e) {
        var rect = progressHolder.getBoundingClientRect();
        var percent = (e.pageX - rect.left) / rect.width;
        var time = percent * player.duration();
        var nearestSegment = findNearestSegment(time, segments);
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


    progressHolder.addEventListener('mouseout', function () {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = 0;
    });

    player.scrollToSegment = function (segmentIndex) {
        console.log("Attempting to scroll to segment:", segmentIndex); // Debugging
        if (segmentIndex >= 0 && segmentIndex < segments.length) {
            var segment = segments[segmentIndex];
            console.log("Found segment, jumping to time:", segment.time); // Debugging
            player.currentTime(segment.time);
        } else {
            console.log("Invalid segment index:", segmentIndex); // Debugging
        }
    };
});

function addMarkers(segments) {
    var progressHolder = player.controlBar.progressControl.el();

    segments.forEach(function (segment) {
        var marker = document.createElement('div');
        marker.className = 'segment-marker';
        var positionPercent = (segment.time / player.duration()) * 100;
        marker.style.left = positionPercent + '%';

        var tooltip = document.createElement('span');
        tooltip.className = 'segment-tooltip';
        tooltip.textContent = segment.label;
        marker.appendChild(tooltip);

        marker.onclick = function () {
            player.currentTime(segment.time);
        };

        progressHolder.appendChild(marker);
    });
}


function findNearestSegment(time, segments) {
    for (let i = 0; i < segments.length; i++) {
        let start = segments[i].time;
        let end = i < segments.length - 1 ? segments[i + 1].time : player.duration();
        if (time >= start && time < end) {
            return segments[i];
        }
    }
    return null;
}

document.getElementById('add-segment').addEventListener('click', function () {
    var time = document.getElementById('segment-time').value;
    var label = document.getElementById('segment-label').value;
    if (time && label) {
        segments.push({ time: parseInt(time), label: label });
        addMarkers([segments[segments.length - 1]]);
        updateSegmentList();
    }
});

document.getElementById('jump-to-segment').addEventListener('click', function () {
    var segmentIndex = document.getElementById('segment-list').value;
    player.scrollToSegment(segmentIndex);
});

function updateSegmentList() {
    var segmentList = document.getElementById('segment-list');
    segmentList.innerHTML = '';
    segments.forEach(function (segment, index) {
        var option = document.createElement('option');
        option.value = index;
        option.text = segment.label + ' (' + segment.time + ' s)';
        segmentList.appendChild(option);
    });
}

updateSegmentList();
