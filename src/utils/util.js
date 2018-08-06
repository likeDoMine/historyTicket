import AMap from 'AMap'
class Singer{
    constructor({id,name,mid}) {
        this.id=id;
        this.mid=mid;
        this.name=name;
        this.avatar = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${mid}.jpg?max_age=2592000`;
    }
}
//得到城市数据
const redetailSingleData = (list)=>{
    return list;
    const HOT_NAME = '热门';
    const HOT_SINGER_LEN = 10;
    let map = {
        hot: {
            title: HOT_NAME,
            items: []
        },
        other: {
            title: '其他',
            items: []
        }
    };

    for (let [index,item] of Array.entries(list)) {
//                   热门
        if (index < HOT_SINGER_LEN) {
            map.hot.items.push(new Singer({
                id: item.Fsinger_id,
                name: item.Fsinger_name,
                mid: item.Fsinger_mid
            }));
        }
//                  a-z
        if (!map[item.Findex] && /[a-zA-Z]/.test(item.Findex)) {
            map[item.Findex] = {
                title: item.Findex,
                items: []
            }
        }
        if (/[a-zA-Z]/.test(item.Findex)) {
            map[item.Findex].items.push(new Singer({
                id: item.Fsinger_id,
                name: item.Fsinger_name,
                mid: item.Fsinger_mid
            }));
        } else {
            map.other.items.push(new Singer({
                id: item.Fsinger_id,
                name: item.Fsinger_name,
                mid: item.Fsinger_mid
            }))
        }
    }
    let ret = [];
    for (let key in map) {
        let val = map[key];
        if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
        }
    }
    ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
    });
    //console.log("redetailSingleData",map);
    return [map.hot, ...ret, map.other];
}

//得到大小写数据
const shortcutListData = (list)=>{
    let List = ["定","热"];
    let ListArry = list.map(group => group.name.substr(0, 1));
    return List.concat(ListArry);
}

const getData = (el,name,val)=>{
    const prefix = 'data-'
    if (val){
        return el.setAttribute(prefix + name,val)
    }
    return el.getAttribute(prefix + name)
}
const getLocation  =  ()=>{
    var mapObj = new AMap.Map('iCenter'),geolocation='', promise='';
    //console.log("mapObj",mapObj);
    return promise =  new Promise ((resolve,reject)=>{
            mapObj.plugin('AMap.Geolocation', function () {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 5000,          //超过10秒后停止定位，默认：无穷大
                    maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                    convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    showButton: true,        //显示定位按钮，默认：true
                    buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                });

                mapObj.addControl(geolocation);
                // console.log("geolocation", geolocation.getCurrentPosition);

                    geolocation.getCurrentPosition();
                    AMap.event.addListener(geolocation, 'complete', (success)=>{
                        // console.log("success------",success);
                        resolve({
                            code:1,
                            data: {
                                lng:success.position.lng,
                                lat: success.position.lat
                            }
                        });
                    });//返回定位信息
                    AMap.event.addListener(geolocation, 'error', (error)=>{
                        reject({
                            code:0,
                            data:"0004"
                        })
                    });
            });

    });
}
const baseUtil = {
    get: function (prop, needTime, notneedFrom) {
        var  val = localStorage.getItem(prop);
        val = (val == "null" || val == "undefined" || val == "none") ? '' : val ? val : "";

        if((val[0]=="{"&&val[val.length-1]=="}")||(val[0]=="["&&val[val.length-1]=="]")){
            return JSON.parse(val);
        }

        return val;
    },
    set: function (prop, value, timeout) {
        var key2 = prop;
        if (typeof (value) == "object") {
            localStorage.removeItem(key2);
            localStorage.setItem(key2, JSON.stringify(value));
        } else {
            localStorage.removeItem(key2);
            localStorage.setItem(key2, value);
        }
        if (timeout) {
            localStorage.setItem(key2 + "_OutTime", Date.today().addMilliseconds(timeout).localTimeStr());
        }
    },
    getSession:function(prop,needTime,notneedFrom){
        var key1 = prop ,val = sessionStorage.getItem(key1);
        val = (val == "null" || val == "undefined" || val == "none") ? '' : val ? val : "";

        if ((val[0] == "{" && val[val.length - 1] == "}") || (val[0] == "[" && val[val.length - 1] == "]")){
            return JSON.parse(val);
        }
        return val;
    },
    setSession:function(prop,value,timeout,notneedFrom){
        var key2 = prop;
        if (typeof (value) == "object"){
            sessionStorage.removeItem(key2);
            sessionStorage.setItem(key2,JSON.stringify(value));
        } else {
            sessionStorage.removeItem(key2);
            sessionStorage.setItem(key2,value);
        }
    },
}

export {
    redetailSingleData,
    shortcutListData,
    getData,
    getLocation,
    baseUtil
}
