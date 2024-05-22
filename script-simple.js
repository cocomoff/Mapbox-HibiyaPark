// restricted token
mapboxgl.accessToken = 'pk.eyJ1IjoiY29jb21vZmYiLCJhIjoiY2x3aDQ2eW9jMDg3ZjJxbnlvaXp2eXZxeSJ9.1SkTQq6ZJ7ZEubkiQpjMew'

function ourRound(value, digit) {
    return Math.round(value * digit) / digit
}

const MAP_NOW_INIT = [139.755812, 35.6736998];
const vis_center = MAP_NOW_INIT
const map_now = MAP_NOW_INIT

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v8',
    center: vis_center,
    zoom: 17
});

// polyline (path)
var paths_geojson = {
    "type": "FeatureCollection",
    "features": []
};


// Map
var map_data = {
    "type": "FeatureCollection",
    "features": []
};

function initialize_all() {
    // remove paths
    clear_routes()

    // reset map
    map.flyTo({ "center": vis_center, "zoom": 17 });
}


function clear_routes() {
    // remove paths
    paths_geojson.features = [];
    map.getSource("line").setData(paths_geojson)
}


function onGeolocate(pos) {
    console.log(pos.coords);
    map_now[0] = pos.coords.longitude
    map_now[1] = pos.coords.latitude
    map.flyTo({ "center": map_now, "zoom": 17 });
}


function setupDataSources() {
    // サイズ調整
    map.resize();

    // 
    map.addSource('map_data', {
        "type": "geojson",
        "data": map_data
    });

    // Rpark
    map.addLayer({
        'id': 'rpark-road',
        'type': 'line',
        'source': 'map_data',
        // 'source-layer': 'rpark',
        'paint': {
            'line-width': 2,
            'line-color': '#333333'
        }
    });
    map.addLayer({
        'id': 'rpark-point',
        'type': 'circle',
        'source': 'map_data',
        // 'source-layer': 'rpark',
        'paint': {
            'circle-radius': 4,
            'circle-color': '#333333'
        }
    });
}

function read_json_data() {
    fetch("./data.json")
        .then(res => res.json())
        .then(json => {
            console.log(json)
            for (let e of json["edges"]) {
                console.log(`${e[0]} ${e[1]} -- ${e[2]} ${e[3]}`)
                map_data["features"].push({
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [e[1], e[0]],
                            [e[3], e[2]]
                        ]
                    }
                })
            }
            map.getSource("map_data").setData(map_data)
        })
        .catch(err => console.err(err))
}

map.on('load', function () {
    map.resize()

    // read JSON data
    read_json_data()

    // データ
    setupDataSources()

    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: false
    })

    // 位置情報
    map.addControl(geolocate);
    geolocate.on("geolocate", onGeolocate)
    
    // mapbox originalの現在地トラッキングを地図読み込み時にONにする
    // geolocate.trigger();

    // map click event to check (lng, lat)
    map.on('contextmenu', e => {
        const digit = 100000;
        const lat = ourRound(e.lngLat.lat, digit);
        const lng = ourRound(e.lngLat.lng, digit);
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<span style="color: red;">${lng}, ${lat}</span>`)
            .addTo(map);
    });
});