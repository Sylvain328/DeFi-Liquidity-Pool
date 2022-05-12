import React from 'react';

export default class Header extends React.Component {

    state = {price: 0}

    componentDidMount = async () => {
        // Get the price of 1 HWT token
        const price = await this.props.requestManager.getHwtTokenUsdValue(this.props.hwtTokenAddress);
        this.setState({price: price});
    }

    render(){
        return(
            <div className="Header">
                <div className="sign">
                    Hell<span className="fast-flicker">o</span>_World Protoc<span className="flicker">o</span>l
                </div>
                <div className='HeaderInfo'>
                    <div className='HwtConversion'>
                        <span>1 HWT</span>
                        <span>{this.state.price} USD</span>
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
