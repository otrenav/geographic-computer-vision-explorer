
var LAT, LNG, HEADING, FOV, PITCH, LIST = [];

var getOptions = function() {
    LAT = $('#form-lat').val();
    LNG = $('#form-lng').val();
    HEADING = $('#form-heading').val();
    FOV = $('#form-fov').val();
    PITCH = $('#form-pitch').val();
    if (allOptions()) {
        updateImage();
    }
};

var buildUrl = function() {
    url = 'https://maps.googleapis.com/maps/api/streetview?&size=1280x720';
    url += '&key=AIzaSyDVAV7aIAwvXjeDNlb4XxFzeUiGuqgCBtc';
    url += `&location=${LAT},${LNG}`;
    url += `&heading=${HEADING}`;
    url += `&fov=${FOV}`;
    url += `&pitch=${PITCH}`;
    console.log(url);
    return url;
};

var updateImage = function() {
    // printOptions();
    $('#gsv-image').attr("src", buildUrl());
};

var allOptions = function() {
    if (LAT && LNG && HEADING && FOV && PITCH) {
        return true;
    }
    return false;
};

var addToList = function() {
    LIST.push(currentOptions());
    $('#list').val(JSON.stringify(LIST));
};

var currentOptions = function() {
    return { lat: LAT, lng: LNG, heading: HEADING, fov: FOV, pitch: PITCH };
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
