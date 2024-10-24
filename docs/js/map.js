
const PARAMS = {
    USER_CIRCLE: {
        color: 'black',
        // fillColor: '#5F5F5F',
        fillColor: '#CDCDFF',
        fillOpacity: 1,
        radius: 5, // 初期半径
        className: 'userCircle',
        dashArray: '4 10'
    },
    GROWTH_RATIO: 0.4,
    CELL_CIRCLE_PALLETE: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD700'],
    CELL_CIRCLE_COUNT: 300,
}
const RANDOMIZER = {
    lat: (base_lat) => base_lat + (Math.random() - 0.5) * 0.003,
    lng: (base_lng) => base_lng + (Math.random() - 0.5) * 0.003,
    // radius: () => Math.random() * 15 - 3,
    radius: () => Math.abs(generateNormalRandom(3, 1.5)),
    color: () => PARAMS.CELL_CIRCLE_PALLETE[Math.floor(Math.random() * PARAMS.CELL_CIRCLE_PALLETE.length)],
}

// 正規分布に従った乱数を生成する関数
function generateNormalRandom(mean, stdDev) {
    // Box-Muller変換を使用して正規分布の乱数を生成
    let u1 = Math.random(); // 0.0から1.0の間の乱数
    let u2 = Math.random(); // 0.0から1.0の間の乱数
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2); // 正規分布の変数
    return z0 * stdDev + mean; // 平均と標準偏差を適用
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
    navigator.geolocation.getCurrentPosition(main, null, {
        enableHighAccuracy: true
    });
}

function main(position) {
    const init_lat = position.coords.latitude
    const init_lng = position.coords.longitude

    // 地図の初期設定
    const map = createMap('map').setView([init_lat, init_lng]); // 東京の中心座標

    // ユーザーの円を作成
    const userCircle = L.circle([init_lat, init_lng], PARAMS.USER_CIRCLE).addTo(map);

    // ランダムな円を追加
    const circles = [];
    for (var i = 0; i < PARAMS.CELL_CIRCLE_COUNT; i++) {
        let circle = createRandomCircle(init_lat, init_lng)
        circle.addTo(map)
        circles.push(circle);
    }

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
                userCircle.setRadius(userCircle.getRadius() + circle.getRadius() * PARAMS.GROWTH_RATIO); // ユーザーの円を大きくする
                map.removeLayer(circle); // 細胞の円を地図から削除
                circles.splice(index, 1); // 配列から削除

                document.getElementById('score-alert').innerText = 'スコア:' + Math.round(userCircle.getRadius() * 10)
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
