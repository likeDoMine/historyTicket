import React from 'react';
import  BScroll from 'better-scroll';
import PropTypes from 'prop-types';
/*import Styles from './index.less'*/
class Scroll extends React.Component{
    constructor(props){
        super(props);
    }
    componentDidMount(){
        this._initScroll();
        window.addEventListener('resize',() =>{
            this.refresh();
        })
    }

    componentWillUpdate(){
      //  this.refresh()
    }

    componentDidUpdate(){
        //this.refresh()
    }

    render(){
        return <div ref="wrapper"  className={this.props.class}>
            {this.props.children}
        </div>
    }

    _initScroll(){
        let wrapper = this.refs.wrapper,_self =  this;
        this.scroll = new BScroll(wrapper,{
            scrollY: true,
            click: true,
            probeType:2
        });

        this.scroll.on('scroll',(pos) =>{
            console.log("----------------pos------------------", pos);
           // _self.props.scrollFun && _self.props.scrollFun(pos)
        })
    }

    scrollToElement(){
        this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments)
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