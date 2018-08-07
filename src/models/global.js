import { query, queryM,location,getLocationCity } from '../services/global'
import {baseUtil} from "../utils/util";
import { Toast } from 'antd-mobile';

var globalAct = {};
export default globalAct = {

  namespace: 'globalAct',

  state: {
      text:"第一",
      point:baseUtil.getSession("locationPoint")||'',   //当前定位的坐标,默认为空
      currentCity:baseUtil.getSession("jqmp_currentCity")||"",   //默认城市
      doorList:'' , //首页门票的列表
      currPage:1,   //门票的分页初始页
      pageNum:20,   //每一页20条数据
      totalPage:10,  //门票分页的总页数
      SelectBarData:baseUtil.getSession("jqmp_currentCity")||{
          cityName:'',
          cityNo:'',
          "all":{
              activeIndex:0,
              parentIndex: false,
              data:[]
          },
          'zlpx':{
              activeIndex:0,
              parentIndex: false,
              data:[
                  {cityNo:'1', cityName:'智能排序'},
                  {cityNo:'2', cityName:'由近到远'},
              ]
          }
      }
  },

  subscriptions: {
    setup({ dispatch, history }) {

    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
        let initData =  yield call(queryM, payload);
        //console.log("initData",initData);
        yield put({
            type: 'save',
            data: initData.data
        });
    },
    //获取所有的门票景点
    *getPoints({payload}, {call,put, select}){
      /**
       *1.首次定位，会根据定位的情况去获取对应的城市编码，并设置编码 current， status为false初始化数据， true，表示已经根据定位修改过了
       */
      const {currentCity} = yield select(_=>_.globalAct);
      let {postData} =  payload;
      /**
       *请求的参数
       */
      postData = Object.assign({},postData,{cityNo:currentCity.cityNo});
      var {data} =  yield  call(query,{payload:postData});



     /* if(data.pubResponse.code === '0000') {
        Toast.info('ok', 2);*/
        yield put({
          type:'setDoorList',
          data: data
        })
     /* } else {
        Toast.info('error', 2);
      }*/

    },
    *getLocation({ payload }, { call, put }){
        //全局默认开启定位
        var getLocation =  yield call(location);//获取坐标定位之后
        //console.log("2--------------getLocation");
        yield put({
            type:'setPoint',
            data: getLocation
        })
    },

    *getInit({payload}, { call, put, select}){
        //初始化首页数据
        /**
         * 首先要验证定位，是否存在已经定位的数据,
         * 1、先处理定期成功
         *      定位成功则去获取对应的城市编码(城市编码存在一个初始值，默认为成都。没有改变过)
         *      得到对应的城市城市编码，去获取对应的景区门票列表
         */
        let {currPoint,currentCity,pageNum,currPage } = yield select(_=>_.globalAct),getLocation;
        if(!currPoint){
            getLocation =  yield call(location);//获取坐标定位之后
            currPoint = Object.assign({}, getLocation);
            //如果初始化进来，就直接去设置point
            yield put({
                type:'setPoint',
                data: currPoint
            })
        }
        //得到了对应的坐标，就去获取对应的城市,判断是否设置过，如果设置过，则就不需要在去初始化。直接取值，否则就需要去设置城市
        //console.log(currentCity,"currentCity");
        if(!currentCity){
          //  console.log("currentCity",currentCity);
            let lng =  getLocation&&getLocation.data["lng"],
                lat =  getLocation&&getLocation.data["lat"];
            //设置对应的城市
            var getLocationCityData = yield call(getLocationCity,{longitude:lng,latitude:lat});
            //设置一下当前的城市
            yield  put({
                type:'setCurrentCity',
                data:{
                    type:false,
                    data:getLocationCityData.data
                }
            })
        }
      //  return;
        yield  put({
            type:'getPoints',
            payload: {
                postData:{
                    sortType: "1",
                    longitude: currPoint.data&&currPoint.data.lng||"",
                    latitude: currPoint.data&&currPoint.data.lat||"",
                    key:'',
                    pageNo: currPage,
                    pageSize:pageNum,
                    cityNo:'all'    //这里到时候要改
                }
            },
        })
    },

    *getSelectBarData({payload},{call, put}){
       // console.log("SelectBarData",payload);
        let {SelectBarData} = payload;
        yield put({
            type:'setCurrentCity',
            data:{
                type:true,
                data:SelectBarData
            }

        })
    }

  },

  reducers: {
    save(state, action) {
      return { ...state};
    },
      //设置当前的定位点
    setPoint(state,action){
        baseUtil.setSession("locationPoint", action.data);
        return  {
            ...state,
            point: action.data
        }
    },
    //设置获取当前的城市
    setCurrentCity(state, action){
       // console.log("action---------",action.data.type);
        //接口回来的数据设置
        if(!action.data.type){
            state.SelectBarData["all"].data = action.data.data.body.childrens;
            state.SelectBarData["cityName"] = action.data.data.body.cityName;
            state.SelectBarData["cityNo"] = action.data.data.body.cityNo;
            baseUtil.setSession("jqmp_currentCity",state.SelectBarData);
            return  {
                ...state
            }
        }
        //主动设置SelectBarData
        state.SelectBarData = action.data.data;
        baseUtil.setSession("jqmp_currentCity",state.SelectBarData);
        return  {
            ...state
        }
    },

    setDoorList(state, action){

        //这里需要验证doorList是否存在，如果存在了就需要push数据

        if(state.doorList&&state.doorList.length){
            state.doorList = state.doorList.concat(action.data.body.data);

        }else{
            state.doorList = action.data.body.data
        }

        return {
            ...state,
            currPage:action.data.body.pageNum,   //门票的分页初始页
            totalPage:action.data.body.pages,  //门票分页的总页数
        }
    }
  },

};
