import React from 'react';

export default class Header extends React.Component {

    render(){
        return(
            <div className="Header">
                <div className="sign">
                    Hell<span className="fast-flicker">o</span>_World Protoc<span className="flicker">o</span>l
                </div>
                <div className='HeaderInfo'>
                    <div className='HwtConversion'>
                        <span>1 HWT</span>
                        <span>{this.props.hwtPrice} USD</span>
                    </div>
                    <div className='AccountData'>
                        <div>{this.props.account}</div>
                        <div className={`OwnerStatus ${this.props.isOwner ? "" : "HideComponent"}`}>owner</div>      
                    </div>
                </div>
            </div>
        )
    }
}
