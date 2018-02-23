
var LABELS, LAT, LNG, HEADING, FOV, PITCH, LIST = [];
var KEY = 'AIzaSyCbz1HhLFdtBKwDmhd68sWmLa-38r9j6Mo';

var GOOGLE_STREET_VIEW_API = (
    'https://maps.googleapis.com/maps/api/streetview?&size=1280x720&key=' + KEY
);
var GOOGLE_VISION_API = (
    'https://vision.googleapis.com/v1/images:annotate?key=' + KEY
);

var getOptions = function() {
    LABELS = [];
    $('#table').html('');
    LAT = $('#form-lat').val();
    LNG = $('#form-lng').val();
    HEADING = $('#form-heading').val();
    FOV = $('#form-fov').val();
    PITCH = $('#form-pitch').val();
    if (allOptions()) {
        updateImage();
    }
};

var googleStreetViewImageURI = function() {
    var url = GOOGLE_STREET_VIEW_API;
    url += `&location=${LAT},${LNG}`;
    url += `&heading=${HEADING}`;
    url += `&fov=${FOV}`;
    url += `&pitch=${PITCH}`;
    return url;
};

var updateImage = function() {
    var imageURI = googleStreetViewImageURI();
    // console.log('---------');
    // console.log('Image URI');
    // console.log(imageURI);
    // printOptions();
    $('#gsv-image').attr('src', imageURI);
};

var allOptions = function() {
    if (LAT && LNG && HEADING && FOV && PITCH) {
        return true;
    }
    return false;
};

var googleVisionAPI = function(imageURI) {
    $.ajax({
        method: 'POST',
        url: GOOGLE_VISION_API,
        data: googleVisionRequest(),
        headers: { "Content-Type": "application/json" },
        success: processGoogleVisionResponse,
        processData: false,
        error: function(data, status, error) {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!');
            console.log('ERROR: Google Vision API');
            console.log(data);
            console.log(status);
            console.log(error);
        }
    });
};

var googleVisionRequest = function() {
    return JSON.stringify({
        'requests': [
            {
                'features': [
                    {
                        'type': 'LABEL_DETECTION'
                    }
                ],
                'image': {
                    'source': {
                        'imageUri': googleStreetViewImageURI()
                    }
                }
            }
        ]
    });
};

var processGoogleVisionResponse = function(resp) {
    LABELS = resp.responses[0].labelAnnotations;
    var tableHTML = (
        '<table>' +
            '<tr>' +
            '<th>Label</th>' +
            '<th>Score</th>' +
            '</tr>'
    );
    for (var i = 0; i < LABELS.length; i++) {
        tableHTML += (
            '<tr>' +
                '<td>' + LABELS[i].description + '</td>' +
                '<td>' + LABELS[i].score + '</td>' +
                '</tr>'
        );
    }
    tableHTML += '</table>';
    $('#table').html(tableHTML);
};

var addToList = function() {
    LIST.push(currentOptions());
    $('#list').val(JSON.stringify(LIST));
};

var currentOptions = function() {
    var labels = [];
    for (var i = 0; i < LABELS.length; i++) {
        labels.push({
            label: LABELS[i].description,
            score: LABELS[i].score
        });
    }
    return {
        lat: LAT,
        lng: LNG,
        heading: HEADING,
        fov: FOV,
        pitch: PITCH,
        labels: labels
    };
};

var download = function() {
    var data = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(LIST));
    var a = document.createElement('a');
    a.setAttribute('download', 'images.json');
    a.setAttribute('href', data);
    a.click();
};

var printOptions = function() {
    console.log('------------');
    console.log(LAT);
    console.log(LNG);
    console.log(HEADING);
    console.log(FOV);
    console.log(PITCH);
    console.log('------------');
};

var init = function() {
    $('input').on('input', getOptions);
    getOptions();
};

init();
