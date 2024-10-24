
const PARAMS = {
    USER_CIRCLE: {
        color: 'white',
        fillColor: '#5F5F5F',
        fillOpacity: 1,
        radius: 15 // 初期半径
    },

    CELL_CIRCLE_PALLETE: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD700'],

    CELL_CIRCLE_COUNT: 80,
}
const RANDOMIZER = {
    lat: (base_lat) => base_lat + (Math.random() - 0.5) * 0.009,
    lng: (base_lng) => base_lng + (Math.random() - 0.5) * 0.009,
    radius: () => Math.random() * 10 + 5,
    color: () => PARAMS.CELL_CIRCLE_PALLETE[Math.floor(Math.random() * PARAMS.CELL_CIRCLE_PALLETE.length)],
}

// ランダムな位置に円を配置する関数
function createRandomCircle(base_lat, base_lng) {
    const lat = RANDOMIZER.lat(base_lat); // 緯度をランダムに調整
    const lng = RANDOMIZER.lng(base_lng); // 経度をランダムに調整
    const radius = RANDOMIZER.radius(); // 半径をランダムに設定
    const color = RANDOMIZER.color()

    const circle = L.circle([lat, lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.9,
        radius: radius
    })

    return circle;
}

function createMap(id) {
    const map_config = {
        center: [35.6802117, 139.7576692],
        zoom: 18,
        zoomControl: false,
        zoomAnimation: false,
        preferCanvas: true,
        maxNativeZoom: 20,
        maxZoom: 20
    }

    const map = L.map(id, map_config)
    const tile_url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const layer_option = {
        attribution: '<a href="https://openstreetmap.org">OpenStreetMap</a>',
        zoom: 18
    }
    L.tileLayer(tile_url, layer_option).addTo(map)
    return map
}

function init() {
    navigator.geolocation.getCurrentPosition(main);
}

function main(position) {
    const init_lat = position.coords.latitude
    const init_lng = position.coords.longitude

    // 地図の初期設定
    const map = createMap('map').setView([init_lat, init_lng]); // 東京の中心座標

    // 10個のランダムな円を追加
    const circles = [];
    for (var i = 0; i < PARAMS.CELL_CIRCLE_COUNT; i++) {
        let circle = createRandomCircle(init_lat, init_lng)
        circle.addTo(map)
        circles.push(circle);
    }

    // ユーザーの円を作成
    const userCircle = L.circle([init_lat, init_lng], PARAMS.USER_CIRCLE).addTo(map);

    // ユーザーの現在位置を取得して円に触れたかどうかを検知する関数
    function checkUserPosition(position) {
        const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
        userCircle.setLatLng(userLatLng); // ユーザーの円を現在位置に更新

        // function is_eatable(circle) {
        //     // その円がユーザーの円と重なっていればtrue
        //     const distance = userLatLng.distanceTo(circle.getLatLng());
        //     const userRadius = userCircle.getRadius()
        //     return (distance <= userRadius && userRadius > circle.getRadius())
        // }

        function is_eatable(circle) {
            // その円がユーザーの円と触れていればtrue
            const distance = userLatLng.distanceTo(circle.getLatLng());
            return (distance <= userCircle.getRadius() + circle.getRadius())
        }

        circles.forEach(function (circle, index) {
            if (is_eatable(circle)) {
                console.log('eat')
                // ユーザーの円が細胞の円より大きい場合、細胞の円を取り込む
                userCircle.setRadius(userCircle.getRadius() + circle.getRadius() * 0.5); // ユーザーの円を大きくする
                map.removeLayer(circle); // 細胞の円を地図から削除
                circles.splice(index, 1); // 配列から削除
            }
        });
    }

    // ユーザーの現在位置を取得
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(checkUserPosition);
    } else {
        alert('Geolocationはこのブラウザではサポートされていません。');
    }
}

document.addEventListener("DOMContentLoaded", init);
