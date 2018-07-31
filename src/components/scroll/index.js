import React from 'react';
import  BScroll from 'better-scroll';
import PropTypes from 'prop-types';
/*import Styles from './index.less'*/
class Scroll extends React.Component{
    constructor(props){
        super(props);
    }
    componentDidMount(){
        setTimeout(()=>{
            this._initScroll();
        },20)
        window.addEventListener('resize',() =>{
            this.refresh();
        })
    }

    componentWillUpdate(){
        this.refresh()
    }

    componentDidUpdate(){
        this.refresh()
    }

    render(){
        return <div ref="wrapper"  className={this.props.class||""}>
            {this.props.children}
        </div>
    }

    _initScroll(){
        let wrapper = this.refs.wrapper,_self =  this;

        this.scroll = new BScroll(wrapper,{
                scrollY: true,
                click: false,
                probeType:3,
                momentumLimitDistance:1
            });

        this.scroll.on('scroll',(pos) =>{
                _self.props.scrollFun && _self.props.scrollFun(pos)
            })
        this.scroll.on('scrollEnd',(pos) =>{
            _self.props.scrollFun && _self.props.scrollFun(pos,'end')
        })

    }
    scrollToElement(){
        this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments)
    }

    //刷新scroll
    refresh(){
        this.scroll && this.scroll.refresh()
    }

}

//props过来定义规范
Scroll.propsType = {
    probeType: PropTypes.number,
    click: PropTypes.bool,
    listenScroll:PropTypes.bool ,
    data: PropTypes.array,
    pullup: PropTypes.bool,
    beforeScroll: PropTypes.bool,
    refreshDelay: PropTypes.number
}

Scroll.defaultProps = {
    probeType: 1,
    click: true,
    listenScroll: false,
    data: null,
    pullup: true,
    beforeScroll: false,
    refreshDelay: 20
}

export default Scroll;
