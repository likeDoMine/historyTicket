import React from 'react'
import ClassNames from 'classnames'
import Styles from './index.less'
import Header from '../../components/header'
import Scroll from '../../components/demo/index'
import Router from 'umi/router'
import Tab from '../../components/tab'
import OrderItem from "./component/orderItem"
import {connect} from 'dva'
import { baseUtil } from "../../utils/util";
import Request from "../../utils/request";
import { Modal} from 'antd-mobile';
const prompt = Modal.alert;

@connect(({orderList,loading})=>({
    orderList,
    loading
}))
export default class TicketOrder extends React.Component{
    constructor(props){
        super(props);
        let userToken =  Router.location.query.opid;
        let activeIndex =  baseUtil.getSession("jqmp_activeIndex")?parseInt(baseUtil.getSession("jqmp_activeIndex")):0,
            state_Session =  activeIndex === 1 ? "sell_succeed":activeIndex===2&&"consume_succeed"||"";
        this.state = {
            activeIndex:activeIndex,
            state:state_Session,
            userToken: baseUtil.get("cdqcp_opid")||userToken
        }
    }
    //这里就执行分页的查询过程
    getOrderList(){
        let { pageNum,pages} =  this.props.orderList
        //console.log("pageNum",pageNum,pages);
        //console.log("this.state.state",this.state.state);
        if(pageNum == pages){
            return;
        }
        pageNum++;
        //这里表示要重新去请求数据了
        let  userToken = baseUtil.get("cdqcp_opid");
        //默认初始化为全部
        this.props.dispatch({
            type:'orderList/fetch',
            payload:{
                tag: true,
                postData:{
                    userToken:userToken,
                    state:this.state.state,
                    pageNum: pageNum,
                    pageSize:"10"
                }
            }
        })
    }

    chooseItem(item){
       Router.push(`/ticketOrderDetail?orderNum=${item.orderNo}`)
    }

    btnClick(item,flag){
        //console.log("item", item);
       // return;
        let  {orderList} =  this.props.orderList,_this =  this;
        if(flag === "pay"){
            Request(`/config/payhref?_p_from=${baseUtil.get("cdqcp_channel") ||""}&type=${baseUtil.getSession("channelTokenName")||""}`,{
                method: "get",
            }).then(function(result){
                if (result.payHref){
                    var from = result["channelCode"]||baseUtil.get("cdqcp_channel");
                    var obj={
                        businessNo:item.orderNo,//订单号
                        userToken:_this.state.userToken,//用户标识
                        from:baseUtil.get("cdqcp_channel"),
                        opid:baseUtil.get("cdqcp_opid"),
                        wxcode: baseUtil.get("cdqcp_wxopenId"),
                        channelName: from,
                        wxOpenId:baseUtil.get("cdqcp_wxopenId"),
                        orderNum:item.orderNo,
                        manualBackUrl:encodeURIComponent(window.location.origin+"/mtTicket/#/orderList/[from,wxcode,opid]"),
                        backUrl:encodeURIComponent(window.location.origin+`/mtTicket/#/ticketOrderDetail/[orderNum,opid,from]`)
                    };
                    var href = result["payHref"] + '/index.html?';
                    href=href+Object.keys(obj).map(function (key) {
                        return key+"="+obj[key]
                    }).join("&");
                   // console.log("payHref", href);
                    window.location.href =  href;
                }
            })
        }

        if(flag === "delete"){
            prompt('', <div className={Styles["doubleModelContent"]}>你确定要删除该笔订单吗?</div>, [
                { text: <span className={Styles["confirm_7c"]}>确定</span>, onPress: () => {this.props.dispatch({
                        type:'orderList/deleteSinleOrder',
                        payload:{
                            state:this.state.state,
                            postData:{
                                orderNo:item.orderNo,
                                userToken: this.state.userToken
                            }
                        }
                    })}, style:'' },
                { text: <span className={Styles["confirm_0d"]}>再想想</span>, onPress: () => console.log('ok') },
            ])
        }

    }

    renderTab(index){
        let {orderList, pageNum, pages} = this.props.orderList;
       // console.log("pageNum",pageNum, pages);
        return <div className={ClassNames(Styles['scroll-content'],Styles["defaultHeight"])}>
            {orderList.length&&<Scroll needMore={orderList.length && true || false}
                     currPage={pageNum}
                     totalPage={pages}
                     nomoreTxt={true}
                     loadMoreData={this.getOrderList.bind(this)}>
                    <ul className={Styles[ "orderList" ]}>
                        {
                            orderList.length && orderList.map((item, index) => {
                                return <OrderItem key={"item" + index} item={item}
                                                  ClickItem={this.chooseItem.bind(this)}
                                                  btnClick={this.btnClick.bind(this)}></OrderItem>
                            }) || null
                        }
                    </ul>
            </Scroll>||<div className={Styles['search-nothing-content']}>
                <div
                    className={ClassNames(Styles["searchContentIcon"],{
                        [Styles["noData"]]:false,
                        [Styles["noSearch"]]:false,
                        [Styles["noOrderList"]]: true
                    })}></div>
                <div className={Styles['search-nothing-font']}>
                    暂无订单
                </div>
            </div>
            }
        </div>
    }

    changeTab(index){
        let state =  index === 1 ? "sell_succeed":index===2&&"consume_succeed"||""
        this.setState({
            "activeIndex": index,
             state: state
        }, ()=>{
            //这里表示要重新去请求数据了
            let  userToken = baseUtil.get("cdqcp_opid");
            baseUtil.setSession("jqmp_activeIndex", index)
            //默认初始化为全部
            this.props.dispatch({
                type:'orderList/fetch',
                payload:{
                    tag: false,
                    postData:{
                        userToken:userToken,
                        state:state,
                        pageNum: "1",
                        pageSize:"10"
                    }
                }
            })
        });

    }

    goHomeOrderList(){
        "iOS" == baseUtil.get("cdqcp_channel") || "Android" == baseUtil.get("cdqcp_channel") ? window.location.href = "##backToVC=1" : window.location.href="/orders/allorders";
       // window.location.href="/orders/allorders"
    }

    render(){
        let {orderList} =  this.props.orderList;

        return <div className={Styles["ticketOrder-Main"]}>
            <Header
                mode="common"
                leftContent={ <i className={Styles["headerleftIconWhite"]}></i>}
                leftClick={this.goHomeOrderList.bind(this)}
            >
                <div style={{"textAlign":'center','color':'#fff'}}>景区门票订单</div>
            </Header>
            <Tab
              activeIndex={this.state.activeIndex}
              changeTab={this.changeTab.bind(this)}
              headers={["全部","待使用","已使用"]}
              renderTab={this.renderTab.bind(this)}
            ></Tab>
        </div>
    }
}
