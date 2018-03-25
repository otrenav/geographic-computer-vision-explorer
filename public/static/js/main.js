
/* jshint esversion: 6 */

var DATA = [
    ['Name', 0, 19.433387, -99.133041, 0, 0, 120, 'Comment'],
    [null, null, null, null, null, null, null, null]
];
var LABELS, NAME, GROUP, LAT, LNG, HEADING, PITCH, FOV, COMMENT;
var KEY = 'AIzaSyCbz1HhLFdtBKwDmhd68sWmLa-38r9j6Mo';
var CURRENT_OBSERVATION = 0;
var N_OBSERVATIONS = 0;

var GOOGLE_STREET_VIEW_API = (
    'https://maps.googleapis.com/maps/api/streetview?&size=1280x720&key=' + KEY
);
var GOOGLE_VISION_API = (
    'https://vision.googleapis.com/v1/images:annotate?key=' + KEY
);
var GOOGLE_STREET_VIEW_HISTORICAL_API_PART_1 = (
    'https://maps.googleapis.com/maps/api/js/' +
        'GeoPhotoService.SingleImageSearch?' +
        'pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d'
);
var GOOGLE_STREET_VIEW_HISTORICAL_API_PART_2 = (
    '!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!' +
        '4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=_xdc_._v2mub5'
);

var getOptions = function() {
    LABELS = [];
    $('#clasification-table').html('');
    NAME = $('#form-name').val();
    GROUP = $('#form-group').val();
    LAT = $('#form-lat').val();
    LNG = $('#form-lng').val();
    HEADING = $('#form-heading').val();
    PITCH = $('#form-pitch').val();
    FOV = $('#form-fov').val();
    COMMENT = $('#form-comment').val();
    if (CURRENT_OBSERVATION == DATA.length - 1) {
        insertEmptyObservation();
    }
    updateDataForCurrentObservation();
    updateDataTable();
    if (allOptions()) {
        updateImage();
    }
};

var insertEmptyObservation = function() {
    DATA.push([null, null, null, null, null, null, null, null]);
};

var updateDataForCurrentObservation = function() {
    DATA[CURRENT_OBSERVATION] = [
        NAME, GROUP, LAT, LNG, HEADING, PITCH, FOV, COMMENT
    ];
};

var googleStreetViewImageURI = function() {
    var url = GOOGLE_STREET_VIEW_API;
    url += `&location=${LAT},${LNG}`;
    url += `&heading=${HEADING}`;
    url += `&pitch=${PITCH}`;
    url += `&fov=${FOV}`;
    return url;
};

// var googleStreetViewHistoricalURI = function() {
//     var url = GOOGLE_STREET_VIEW_HISTORICAL_API_PART_1;
//     url += LAT + '!4d' + LNG;
//     url += GOOGLE_STREET_VIEW_HISTORICAL_API_PART_2;
//     console.log('----------');
//     console.log(url);
//     console.log('----------');
//     return (url);
// };

var updateImage = function() {
    var imageURI = googleStreetViewImageURI();
    $('#gsv-image').attr('src', imageURI);
};

var allOptions = function() {
    if (LAT && LNG && HEADING && PITCH && FOV) {
        return true;
    }
    return false;
};

var googleVisionAPI = function(imageURI) {
    $.ajax({
        method: 'POST',
        url: GOOGLE_VISION_API,
        data: googleVisionRequest(),
        headers: { 'Content-Type': 'application/json' },
        success: processGoogleVisionResponse,
        processData: false,
        error: function(data, status, error) {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!');
            console.log('ERROR: Google Vision API');
            console.log(data);
            console.log(status);
            console.log(error);
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!');
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
    $('#clasification-table').html(tableHTML);
};

// var googleStreetViewHistoricalAPI = function(lng, lat) {
//     $.ajax({
//         method: 'GET',
//         url: googleStreetViewHistoricalURI(lng, lat),
//         // data: googleVisionRequest(),
//         headers: {
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Origin': '*'
//         },
//         success: processGoogleStreetViewHistoricalResponse,
//         processData: false,
//         error: function(data, status, error) {
//             console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
//             console.log('ERROR: Google Street View Historical');
//             console.log(data);
//             console.log(status);
//             console.log(error);
//             console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
//         }
//     });
// };

// var processGoogleStreetViewHistoricalResponse = function(resp) {
//     console.log('0000000000000');
//     console.log(resp);
//     console.log('0000000000000');
// };

var download = function() {
    var data = 'data:text/plain;charset=utf-8,' + encodeURIComponent(
        Papa.unparse({
            fields: [
                'Name', 'Group', 'Latitude', 'Longitude',
                'Heading', 'Pitch', 'FOV', 'Comment'
            ],
            data: DATA
        })
    );
    var a = document.createElement('a');
    a.setAttribute('download', 'images.csv');
    a.setAttribute('href', data);
    a.click();
};

var uploadInit = function() {
    $("#file-upload").change(function() {
        Papa.parse($(this).prop('files')[0], {
	        config: { header: true },
            error: function(err, file, inputElem, reason) {
                console.log('Input file error:');
                console.log(err);
                console.log(reason);
            },
	        complete: parseCSVUpload
        });
    });
};

var parseCSVUpload = function(results) {
    var data = results.data;
    DATA = [];
    for (var i = 1; i < data.length - 1; i++) {
        DATA.push([
            data[i][0],
            data[i][1],
            data[i][2],
            data[i][3],
            data[i][4] ? data[i][4] : 0,
            data[i][5] ? data[i][5] : 0,
            data[i][6] ? data[i][6] : 120,
            data[i][7]
        ]);
    }
    updateDataTable();
};

var observationTableHTML = function() {
    N_OBSERVATIONS += 1;
    return `
        <th><button onclick='deleteObservation(${N_OBSERVATIONS - 1})'>Delete</button></th>
        <th>${NAME}</th>
        <th>${GROUP}</th>
        <th>${LAT}</th>
        <th>${LNG}</th>
        <th>${HEADING}</th>
        <th>${PITCH}</th>
        <th>${FOV}</th>
        <th>${COMMENT}</th>
    `;
};

var addCurrentObservationToTable = function() {
    $('#data-table tr:nth-child(' + CURRENT_OBSERVATION + 1 + ')').html(
        observationTableHTML()
    );
};

var updateDataTable = function() {
    var d;
    var rows = `
        <tr>
            <th>#</th>
            <th>Name</th>
            <th>Group</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Heading</th>
            <th>Pitch</th>
            <th>FOV</th>
            <th>Comment</th>
            <th>Delete</th>
        </tr>
    `;
    for (var i = 0; i < DATA.length; i++) {
        rows += '<tr>';
        rows += `<td>${i + 1}</td>`;
        for (var j = 0; j < DATA[i].length; j++) {
            d = DATA[i][j] != null ? DATA[i][j] : '';
            rows += `<td onclick='selectObservation(${i})'>${d}</td>`;
        }
        rows += `<td><span onclick='deleteObservation(${i})'>X</span></td>`;
        rows += '</tr>';
    }
    rows += '<tr>';
    $('#data-table').html(rows);
};

var deleteObservation = function(i) {
    DATA.splice(i, 1);
    updateDataTable();
    CURRENT_OBSERVATION = null;
};

var selectObservation = function(i) {
    CURRENT_OBSERVATION = i;
    $('#clasification-table').html('');
    $('#form-name').val(DATA[i][0]);
    $('#form-group').val(DATA[i][1]);
    $('#form-lat').val(DATA[i][2]);
    $('#form-lng').val(DATA[i][3]);
    $('#form-heading').val(DATA[i][4]);
    $('#form-pitch').val(DATA[i][5]);
    $('#form-fov').val(DATA[i][6]);
    $('#form-comment').val(DATA[i][7]);
    getOptions();
};

var init = function() {
    $('input').on('input', getOptions);
    updateDataTable();
    getOptions();
    uploadInit();
};

init();
